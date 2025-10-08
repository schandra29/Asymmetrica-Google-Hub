# Williams Optimizer - Benchmark Validation Plan

**Document Type**: Performance Validation Plan
**Status**: Design Phase
**Created**: October 3, 2025
**Author**: Agent Charlie (Claude Sonnet 4.5)
**Goal**: Empirically validate 1.5x-7.5x efficiency claims in Rust

---

## Validation Objective

**Claim**: Williams Space Optimizer achieves 1.5x-7.5x memory efficiency and 34%-87% space reduction across crypto operations.

**Source**: iPermit Python implementation (29/29 tests, 100% pass rate)

**Goal**: Reproduce these results in Rust DefenseKit implementation with ±10% variance tolerance.

**Success Criteria**:
- Efficiency: 1.5x @ 100 ops, 3.2x @ 1K ops, 7.5x @ 10K ops (±10%)
- Space reduction: 34% @ 100 ops, 68% @ 1K ops, 87% @ 10K ops (±5%)
- No performance regressions in baseline crypto operations
- Memory usage validated via allocator instrumentation

---

## Benchmark Suite Structure

### Benchmark 1: Core Williams Calculations

**Target**: `WilliamsBatcher` struct performance

**Metrics**:
- Constructor latency (nanoseconds)
- Accessor latency (nanoseconds)
- Memory footprint (bytes)

**Baseline**: Python `WilliamsSpaceOptimizer` equivalent operations

**Test Cases**:
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_williams_core(c: &mut Criterion) {
    let mut group = c.benchmark_group("williams_core");

    // Constructor performance
    group.bench_function("new_100", |b| {
        b.iter(|| black_box(WilliamsBatcher::new(100)));
    });

    group.bench_function("new_1000", |b| {
        b.iter(|| black_box(WilliamsBatcher::new(1000)));
    });

    group.bench_function("new_10000", |b| {
        b.iter(|| black_box(WilliamsBatcher::new(10000)));
    });

    // Accessor performance (should be zero-cost)
    let batcher = WilliamsBatcher::new(1000);
    group.bench_function("accessors", |b| {
        b.iter(|| {
            black_box(batcher.space_bound());
            black_box(batcher.efficiency_multiplier());
            black_box(batcher.optimal_batch_size());
        });
    });

    group.finish();
}
```

**Success Criteria**:
- Constructor: < 100 ns (should be ~2 float ops)
- Accessors: < 5 ns (should inline to register reads)
- Memory: 32 bytes (4 × f64)

---

### Benchmark 2: Batch Key Generation

**Target**: `HybridKeyExchange::generate_batch()`

**Metrics**:
- Throughput (keys/second)
- Memory efficiency (measured vs theoretical)
- Allocation count (via jemalloc stats)

**Comparison**: Naive loop vs Williams-optimized

**Test Cases**:
```rust
fn bench_keygen_batch(c: &mut Criterion) {
    let mut group = c.benchmark_group("keygen_batch");

    for size in [100, 1_000, 10_000].iter() {
        // Naive baseline
        group.bench_with_input(
            BenchmarkId::new("naive", size),
            size,
            |b, &size| {
                b.iter(|| {
                    let mut keys = Vec::new();
                    for _ in 0..size {
                        keys.push(black_box(HybridKeyExchange::generate()));
                    }
                    black_box(keys);
                });
            }
        );

        // Williams-optimized
        group.bench_with_input(
            BenchmarkId::new("williams", size),
            size,
            |b, &size| {
                b.iter(|| {
                    let keys = HybridKeyExchange::generate_batch(size)
                        .collect::<Vec<_>>();
                    black_box(keys);
                });
            }
        );
    }

    group.finish();
}
```

**Success Criteria** (vs naive):
- 100 keys: ≥ 1.3x throughput (1.5x target, 10% tolerance)
- 1,000 keys: ≥ 2.9x throughput (3.2x target)
- 10,000 keys: ≥ 6.8x throughput (7.5x target)

**Memory Validation** (via jemalloc):
- 100 keys: 34% reduction (±5%)
- 1,000 keys: 68% reduction (±5%)
- 10,000 keys: 87% reduction (±5%)

---

### Benchmark 3: Batch Encryption

**Target**: `encrypt_batch()` with ChaCha20-Poly1305

**Metrics**:
- Throughput (messages/second)
- Memory usage (peak resident set size)
- Cache efficiency (L1/L2 miss rates via perf)

**Message Sizes**: 64 bytes, 1 KB, 16 KB (represent typical permit documents)

**Test Cases**:
```rust
fn bench_encryption_batch(c: &mut Criterion) {
    let mut group = c.benchmark_group("encryption_batch");
    let key = SessionKey::from_bytes(vec![0u8; 32]);

    for msg_size in [64, 1024, 16384].iter() {
        let message = vec![0u8; *msg_size];
        let messages: Vec<&[u8]> = (0..1000).map(|_| &message[..]).collect();

        // Naive
        group.bench_with_input(
            BenchmarkId::new("naive", msg_size),
            &messages,
            |b, msgs| {
                b.iter(|| {
                    let mut cts = Vec::new();
                    for msg in msgs {
                        cts.push(black_box(encrypt(msg, &key).unwrap()));
                    }
                    black_box(cts);
                });
            }
        );

        // Williams
        group.bench_with_input(
            BenchmarkId::new("williams", msg_size),
            &messages,
            |b, msgs| {
                b.iter(|| {
                    let cts = black_box(encrypt_batch(msgs, &key).unwrap());
                    black_box(cts);
                });
            }
        );
    }

    group.finish();
}
```

**Success Criteria**:
- 1,000 messages: ≥ 2.9x throughput (3.2x target)
- Memory: 68% reduction vs naive
- Cache efficiency: ≤ 10% L1 miss increase (batching trade-off)

---

### Benchmark 4: Batch Signature Verification

**Target**: `verify_batch()` with Ed25519

**Metrics**:
- Throughput (verifications/second)
- Early-abort latency (fail-fast behavior)
- Memory usage (signature buffer allocation)

**Test Cases**:
```rust
fn bench_signature_verification(c: &mut Criterion) {
    let mut group = c.benchmark_group("signature_verification");

    // Generate test signatures
    let signatures: Vec<_> = (0..1000)
        .map(|i| {
            let msg = format!("message_{}", i).into_bytes();
            let (sig, pk) = generate_test_signature(&msg);
            (msg, sig, pk)
        })
        .collect();

    let sig_refs: Vec<(&[u8], &[u8], &[u8])> = signatures
        .iter()
        .map(|(m, s, p)| (&m[..], &s[..], &p[..]))
        .collect();

    // Naive
    group.bench_function("naive_1000", |b| {
        b.iter(|| {
            for (msg, sig, pk) in &sig_refs {
                black_box(ed25519_verify(msg, sig, pk).unwrap());
            }
        });
    });

    // Williams
    group.bench_function("williams_1000", |b| {
        b.iter(|| {
            black_box(verify_batch(&sig_refs).unwrap());
        });
    });

    group.finish();
}
```

**Success Criteria**:
- 1,000 verifications: ≥ 9x throughput (10x target, peak efficiency!)
- Memory: 90% reduction
- Early-abort latency: < 1 ms (fail on first invalid signature)

---

### Benchmark 5: Handshake Batching

**Target**: `DefenseKit::batch_handshake_initiator()`

**Metrics**:
- Handshake throughput (handshakes/second)
- Latency distribution (p50, p95, p99)
- Memory usage across three regimes (Exploration/Optimization/Stabilization)

**Test Cases**:
```rust
#[tokio::main]
async fn bench_handshake_batch(c: &mut Criterion) {
    let mut group = c.benchmark_group("handshake_batch");
    group.sample_size(50); // Handshakes are slow, reduce sample size

    // Generate peer info
    let peers: Vec<PeerInfo> = (0..100)
        .map(|_| {
            let peer_keys = HybridKeyExchange::generate();
            PeerInfo {
                classical_public: *peer_keys.classical_public(),
                quantum_public: peer_keys.quantum_public(),
            }
        })
        .collect();

    let defensekit = DefenseKit::with_defaults();

    // Naive (sequential handshakes)
    group.bench_function("naive_100", |b| {
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                let mut sessions = Vec::new();
                for peer in &peers {
                    let session = defensekit.handshake_initiator(
                        &peer.classical_public,
                        &peer.quantum_public
                    ).await.unwrap();
                    sessions.push(session);
                }
                black_box(sessions);
            });
    });

    // Williams (batched)
    group.bench_function("williams_100", |b| {
        b.to_async(tokio::runtime::Runtime::new().unwrap())
            .iter(|| async {
                let sessions = defensekit.batch_handshake_initiator(&peers)
                    .await
                    .unwrap();
                black_box(sessions);
            });
    });

    group.finish();
}
```

**Success Criteria**:
- 100 handshakes: ≥ 1.3x throughput (1.5x target)
- p95 latency: < 100 ms total (validated in RegimeProbe)
- Memory: 34% reduction vs naive

---

## Memory Instrumentation

### Allocator Tracking (jemalloc)

**Setup**:
```rust
// In Cargo.toml
[dependencies]
jemallocator = "0.5"

// In lib.rs
#[global_allocator]
static ALLOC: jemallocator::Jemalloc = jemallocator::Jemalloc;
```

**Measurement**:
```rust
use jemalloc_ctl::{stats, epoch};

fn measure_memory<F>(operation: F) -> usize
where
    F: FnOnce(),
{
    // Refresh stats
    epoch::mib().unwrap().advance().unwrap();
    let allocated_before = stats::allocated::read().unwrap();

    operation();

    epoch::mib().unwrap().advance().unwrap();
    let allocated_after = stats::allocated::read().unwrap();

    allocated_after - allocated_before
}
```

**Application**:
```rust
#[test]
fn test_memory_efficiency_1000_keys() {
    // Naive
    let naive_mem = measure_memory(|| {
        let mut keys = Vec::new();
        for _ in 0..1000 {
            keys.push(HybridKeyExchange::generate());
        }
        std::mem::forget(keys); // Keep allocated
    });

    // Williams
    let williams_mem = measure_memory(|| {
        let keys = HybridKeyExchange::generate_batch(1000)
            .collect::<Vec<_>>();
        std::mem::forget(keys);
    });

    let reduction = ((naive_mem - williams_mem) as f64 / naive_mem as f64) * 100.0;
    assert!(reduction >= 63.0, "Expected ≥68% reduction, got {:.1}%", reduction);
}
```

---

## Parity Validation (Python ↔ Rust)

### Test Harness

**Python Reference** (`backend/tests/unit/test_williams_optimizer.py`):
```python
def test_efficiency_1000_ops():
    optimizer = WilliamsSpaceOptimizer()
    result = optimizer.calculate_space_bound(1000)
    assert 10.0 < result['efficiency'] < 10.2  # 10.07x validated
    assert 89.5 < result['space_reduction_percent'] < 90.5  # 90.1%
```

**Rust Equivalent**:
```rust
#[test]
fn test_parity_1000_ops() {
    let batcher = WilliamsBatcher::new(1000);

    // Python: efficiency = 10.07x
    let efficiency = batcher.efficiency_multiplier();
    assert!(efficiency > 10.0 && efficiency < 10.2,
            "Expected 10.07x, got {:.2}x", efficiency);

    // Python: space_reduction = 90.1%
    let reduction = batcher.space_reduction_percent();
    assert!(reduction > 89.5 && reduction < 90.5,
            "Expected 90.1%, got {:.1}%", reduction);
}
```

**Automated Parity Check**:
```bash
# Run Python tests, capture output
cd backend
pytest tests/unit/test_williams_optimizer.py -v > /tmp/python_results.txt

# Run Rust tests, capture output
cd DefenseKit_Final/core/defensekit
cargo test williams_parity -- --nocapture > /tmp/rust_results.txt

# Compare results (manual or scripted)
diff /tmp/python_results.txt /tmp/rust_results.txt
```

---

## Scaling Analysis

### Target Scales

| Scale | Operations | Use Case | Expected Efficiency |
|-------|------------|----------|---------------------|
| Small | 100 | Single-user test suite | 1.5x |
| Medium | 1,000 | Multi-user concurrent handshakes | 3.2x (peak: 10x) |
| Large | 10,000 | Enterprise batch processing | 7.5x |
| Extreme | 100,000 | Stress test, theoretical max | TBD (extrapolate) |

### Benchmark Configuration

```rust
fn bench_scaling(c: &mut Criterion) {
    let mut group = c.benchmark_group("williams_scaling");
    group.sample_size(20); // Reduce samples for large scales
    group.measurement_time(Duration::from_secs(30)); // Longer warmup

    for scale in [100, 1_000, 10_000, 100_000].iter() {
        group.throughput(Throughput::Elements(*scale as u64));

        group.bench_with_input(
            BenchmarkId::new("keygen", scale),
            scale,
            |b, &size| {
                b.iter(|| {
                    let keys = HybridKeyExchange::generate_batch(size)
                        .collect::<Vec<_>>();
                    black_box(keys);
                });
            }
        );
    }

    group.finish();
}
```

**Analysis**:
- Plot efficiency vs scale (logarithmic x-axis)
- Identify efficiency peak (expected ~1,000 ops)
- Validate asymptotic behavior (efficiency stabilizes ~7.5x)

---

## Regression Testing

### Baseline Crypto Performance

**Ensure Williams optimization does NOT regress baseline**:

```rust
fn bench_baseline_keygen(c: &mut Criterion) {
    let mut group = c.benchmark_group("baseline");

    // Single key generation (no batching)
    group.bench_function("single_keygen", |b| {
        b.iter(|| {
            black_box(HybridKeyExchange::generate());
        });
    });

    // Classical only
    group.bench_function("classical_keygen", |b| {
        b.iter(|| {
            black_box(ClassicalKey::generate());
        });
    });

    // Quantum only
    group.bench_function("quantum_keygen", |b| {
        b.iter(|| {
            black_box(QuantumKey::generate());
        });
    });

    group.finish();
}
```

**Success Criteria**:
- Single keygen: No slowdown (< 5% variance)
- Classical keygen: No slowdown
- Quantum keygen: No slowdown

---

## Performance Profiling

### CPU Profiling (perf)

**Linux**:
```bash
# Record CPU profile
perf record --call-graph=dwarf \
    cargo bench --bench williams_bench -- keygen_batch/williams/1000

# Analyze hotspots
perf report
```

**Flamegraph**:
```bash
cargo install flamegraph
cargo flamegraph --bench williams_bench -- --bench
```

**Expected Hotspots**:
- `HybridKeyExchange::generate()` (crypto ops dominate)
- `Vec::with_capacity()` (allocations)
- `WilliamsBatcher::new()` (should NOT be hotspot - too fast!)

### Memory Profiling (heaptrack)

**Linux**:
```bash
heaptrack cargo bench --bench williams_bench -- keygen_batch/williams/10000
heaptrack_gui heaptrack.cargo.*.zst
```

**Analysis**:
- Peak memory usage (should match Williams bound)
- Allocation count (should be reduced vs naive)
- Fragmentation (should be minimal with batching)

---

## CI/CD Integration

### Automated Benchmark Runs

**GitHub Actions** (`.github/workflows/benchmark.yml`):
```yaml
name: Williams Benchmarks

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - 'DefenseKit_Final/core/defensekit/src/williams_optimizer.rs'
      - 'DefenseKit_Final/core/defensekit/benches/williams_bench.rs'

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          profile: minimal

      - name: Run benchmarks
        run: |
          cd DefenseKit_Final/core/defensekit
          cargo bench --bench williams_bench -- --save-baseline main

      - name: Compare to baseline
        run: |
          cargo bench --bench williams_bench -- --baseline main

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: target/criterion/
```

### Performance Regression Alerts

**Criterion Configuration** (`benches/williams_bench.rs`):
```rust
fn criterion_config() -> Criterion {
    Criterion::default()
        .warm_up_time(Duration::from_secs(5))
        .measurement_time(Duration::from_secs(10))
        .sample_size(100)
        .significance_level(0.05) // 5% significance
        .noise_threshold(0.10)    // 10% noise tolerance
}
```

**Alert Thresholds**:
- Throughput regression: > 10% slower → FAIL
- Memory regression: > 5% more allocations → WARN
- Latency regression: > 10% higher p95 → FAIL

---

## Test Environment Specifications

### Hardware

**Recommended**:
- CPU: 4+ cores (for parallel benchmarks)
- RAM: 16 GB (for 100K operation tests)
- Storage: SSD (reduce I/O noise)

**Consistency**:
- Disable CPU frequency scaling: `sudo cpupower frequency-set --governor performance`
- Disable hyperthreading: Boot with `nosmt` kernel parameter
- Pin benchmarks to specific cores: `taskset -c 0-3 cargo bench`

### Software

**Rust**:
- Version: 1.75+ (stable channel)
- Profile: `release` with optimizations

**Cargo.toml**:
```toml
[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
debug = false
```

**Dependencies**:
- criterion = "0.5"
- jemallocator = "0.5"
- jemalloc-ctl = "0.5"

---

## Deliverables

### Benchmark Reports

1. **Criterion HTML Reports** (`target/criterion/report/index.html`)
   - Throughput charts (ops/sec)
   - Latency distributions (violin plots)
   - Comparison tables (naive vs Williams)

2. **Memory Profiling Reports**
   - Peak RSS (resident set size)
   - Allocation counts
   - Fragmentation analysis

3. **Flamegraphs** (`flamegraph.svg`)
   - CPU hotspot visualization
   - Call stack analysis

4. **Parity Validation Report**
   - Python vs Rust comparison
   - Variance analysis (within ±10% tolerance?)

### Success Summary

**Pass/Fail Table**:

| Benchmark | Target | Actual | Status |
|-----------|--------|--------|--------|
| 100 ops efficiency | 1.5x ± 10% | TBD | ⏳ |
| 1K ops efficiency | 3.2x ± 10% | TBD | ⏳ |
| 10K ops efficiency | 7.5x ± 10% | TBD | ⏳ |
| 100 ops space reduction | 34% ± 5% | TBD | ⏳ |
| 1K ops space reduction | 68% ± 5% | TBD | ⏳ |
| 10K ops space reduction | 87% ± 5% | TBD | ⏳ |
| No baseline regression | < 5% variance | TBD | ⏳ |

---

## Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Setup | 1 hour | Install dependencies, configure tooling |
| Baseline | 1 hour | Run naive implementations, capture baselines |
| Implementation | 3-4 hours | Implement Williams-optimized versions |
| Benchmarking | 2 hours | Run full benchmark suite |
| Profiling | 1 hour | CPU/memory profiling, flamegraph analysis |
| Validation | 1 hour | Parity testing, variance analysis |
| **Total** | **9-10 hours** | **Complete validation cycle** |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Benchmark noise (> 10%) | Medium | Pin to cores, disable freq scaling |
| Memory tracking overhead | Low | Use jemalloc stats (minimal overhead) |
| Async benchmark complexity | Medium | Use criterion's `to_async()` adapter |
| Python parity variance | Low | Accept ±10% variance (implementation differences) |

---

**Document Status**: COMPLETE - Ready for Benchmark Execution
**Next Document**: `WILLIAMS_IMPLEMENTATION_ROADMAP.md`

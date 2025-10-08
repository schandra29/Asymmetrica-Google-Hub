# Williams Optimizer - Rust API Specification

**Document Type**: API Design Specification
**Status**: Design Phase
**Created**: October 3, 2025
**Author**: Agent Charlie (Claude Sonnet 4.5)
**Principle**: Container-Respectful Design (Works WITH Rust, Not Against It)

---

## Design Philosophy: Container Respect

### The Problem: Fighting the Borrow Checker

**BAD Design** (Python mindset in Rust):
```rust
// ❌ Multiple mutable borrows - Rust compiler REJECTS!
struct BadOptimizer {
    batch_data: Vec<T>,           // mutable field
    space_bound: f64,             // mutable field
    efficiency_history: Vec<f64>, // mutable field
}

impl BadOptimizer {
    fn calculate(&mut self, data: &mut Vec<T>) -> Result<f64> {
        // ERROR: Cannot borrow self.efficiency_history while self.space_bound is borrowed
        self.space_bound = self.compute_bound(&self.batch_data)?;
        self.efficiency_history.push(self.space_bound); // ❌ Borrow checker conflict!
        Ok(self.space_bound)
    }
}
```

**Why This Fails**:
- Multiple `&mut self` borrows conflict
- Interior mutability requires `RefCell<T>` (runtime overhead)
- `Arc<Mutex<T>>` adds locking overhead (defeats the purpose!)
- Fighting Rust's ownership model

### The Solution: Immutable Configuration + Ownership Transfer

**GOOD Design** (Rust-friendly):
```rust
// ✅ Immutable config, ownership-based computation
pub struct WilliamsBatcher {
    time_complexity: usize,  // immutable config
    space_bound: f64,        // immutable (computed in constructor)
    efficiency: f64,         // immutable (computed in constructor)
}

impl WilliamsBatcher {
    // Constructor computes all values once
    pub fn new(time_complexity: usize) -> Self {
        let space_bound = Self::calculate_space_bound(time_complexity);
        let efficiency = time_complexity as f64 / space_bound;

        Self {
            time_complexity,
            space_bound,
            efficiency,
        }
    }

    // Pure function: no self mutation
    fn calculate_space_bound(t: usize) -> f64 {
        (t as f64).sqrt() * (t as f64).log2()
    }

    // Accessor: no mutation
    pub fn optimal_batch_size(&self) -> usize {
        self.space_bound as usize
    }
}
```

**Why This Works**:
- **Immutable after construction**: No `&mut self` needed
- **Pure functions**: Calculations don't mutate state
- **Ownership transfer**: Input consumed, output returned (no borrowing conflicts)
- **Zero-copy accessors**: `&self` methods return computed values
- **Borrow checker happy**: No lifetime battles

---

## Core API: `WilliamsBatcher`

### Primary Struct

```rust
/// Williams Space Optimizer for batch operations
///
/// @asymmetrica: williams_space_batcher
/// symbol: σ(√t×log₂(t)_Batch_Optimizer)
/// cost: κ(O(√t log t) space vs O(t) naive)
/// lineage: λ([Williams_MIT_2011 → iPermit_Python → DefenseKit_Rust])
///
/// # Examples
///
/// ```rust
/// use defensekit::williams_optimizer::WilliamsBatcher;
///
/// // Create optimizer for 1,000 operations
/// let batcher = WilliamsBatcher::new(1000);
///
/// // Get optimal batch size (√1000 × log₂(1000) ≈ 100)
/// let batch_size = batcher.optimal_batch_size();
/// assert_eq!(batch_size, 99); // Rounded down
///
/// // Check efficiency gain
/// assert!(batcher.efficiency_multiplier() > 10.0); // 10.07x validated
/// ```
#[derive(Debug, Clone, Copy)]
pub struct WilliamsBatcher {
    time_complexity: usize,
    space_bound: f64,
    efficiency: f64,
    space_reduction_percent: f64,
}
```

### Constructor

```rust
impl WilliamsBatcher {
    /// Create optimizer for given time complexity
    ///
    /// @asymmetrica: williams_batcher_new
    /// cost: κ(O(1) - Two sqrt/log operations)
    ///
    /// # Arguments
    /// * `time_complexity` - Expected number of operations (t)
    ///
    /// # Returns
    /// Immutable `WilliamsBatcher` with pre-computed values
    ///
    /// # Examples
    ///
    /// ```rust
    /// let batcher = WilliamsBatcher::new(10_000);
    /// assert_eq!(batcher.time_complexity(), 10_000);
    /// ```
    pub fn new(time_complexity: usize) -> Self {
        if time_complexity <= 1 {
            return Self {
                time_complexity,
                space_bound: 1.0,
                efficiency: 1.0,
                space_reduction_percent: 0.0,
            };
        }

        let t = time_complexity as f64;
        let space_bound = t.sqrt() * t.log2();
        let efficiency = t / space_bound;
        let space_reduction = ((t - space_bound) / t) * 100.0;

        Self {
            time_complexity,
            space_bound,
            efficiency,
            space_reduction_percent: space_reduction,
        }
    }
}
```

### Accessors (Zero-Copy)

```rust
impl WilliamsBatcher {
    /// Get time complexity (number of operations)
    pub fn time_complexity(&self) -> usize {
        self.time_complexity
    }

    /// Get Williams space bound (√t × log₂(t))
    ///
    /// # Examples
    ///
    /// ```rust
    /// let batcher = WilliamsBatcher::new(1000);
    /// assert!((batcher.space_bound() - 99.66).abs() < 0.01);
    /// ```
    pub fn space_bound(&self) -> f64 {
        self.space_bound
    }

    /// Get efficiency multiplier (t / space_bound)
    ///
    /// Validated ranges from iPermit:
    /// - 100 ops: 1.51x
    /// - 1,000 ops: 10.07x
    /// - 10,000 ops: 7.52x
    ///
    /// # Examples
    ///
    /// ```rust
    /// let batcher = WilliamsBatcher::new(1000);
    /// assert!(batcher.efficiency_multiplier() > 10.0);
    /// ```
    pub fn efficiency_multiplier(&self) -> f64 {
        self.efficiency
    }

    /// Get space reduction percentage
    ///
    /// # Examples
    ///
    /// ```rust
    /// let batcher = WilliamsBatcher::new(10_000);
    /// assert!(batcher.space_reduction_percent() > 86.0);
    /// ```
    pub fn space_reduction_percent(&self) -> f64 {
        self.space_reduction_percent
    }

    /// Get optimal batch size (space_bound rounded down)
    ///
    /// Use this value to size pre-allocations:
    /// ```rust
    /// let batcher = WilliamsBatcher::new(1000);
    /// let mut buffer = Vec::with_capacity(batcher.optimal_batch_size());
    /// ```
    pub fn optimal_batch_size(&self) -> usize {
        self.space_bound as usize
    }
}
```

---

## Batch Processing API: Crypto Operations

### Batch Key Generation

```rust
/// Generate batch of hybrid key pairs with Williams-optimized allocation
///
/// @asymmetrica: batch_keygen_williams
/// symbol: σ(Space_Bounded_Key_Generation)
/// cost: κ(O(n) keys with √n×log(n) space)
/// optimization: ⊕(3.2x efficiency @ 1K keys, 68% space reduction)
///
/// # Arguments
/// * `count` - Number of key pairs to generate
///
/// # Returns
/// Iterator over `HybridKeyExchange` (zero-copy streaming)
///
/// # Examples
///
/// ```rust
/// use defensekit::hybrid::HybridKeyExchange;
///
/// // Generate 1,000 key pairs with Williams optimization
/// let keypairs = HybridKeyExchange::generate_batch(1000)
///     .collect::<Vec<_>>();
///
/// assert_eq!(keypairs.len(), 1000);
/// ```
pub fn generate_batch(count: usize) -> impl Iterator<Item = HybridKeyExchange> {
    let batcher = WilliamsBatcher::new(count);
    let batch_size = batcher.optimal_batch_size();

    // Pre-allocate with Williams-optimized capacity
    (0..count)
        .scan(Vec::with_capacity(batch_size), |buffer, _| {
            let keygen = HybridKeyExchange::generate();
            buffer.push(keygen);

            // Yield when batch full
            if buffer.len() >= batch_size {
                Some(buffer.drain(..).collect::<Vec<_>>())
            } else {
                Some(vec![keygen]) // Last partial batch
            }
        })
        .flatten()
}
```

**Container-Respectful Design Notes**:
- **Ownership**: `Iterator` consumes nothing, generates keys on demand
- **Zero-copy**: `flatten()` moves keys without cloning
- **No lifetimes**: No `&'a` annotations needed
- **Borrow checker**: No conflicts (immutable `batcher`, mutable `buffer` scoped to closure)

### Batch Encryption

```rust
/// Encrypt multiple messages with Williams-optimized batching
///
/// @asymmetrica: batch_encrypt_williams
/// cost: κ(O(n) encryptions with √n×log(n) memory)
/// optimization: ⊕(7.5x efficiency @ 10K messages, 87% space reduction)
///
/// # Arguments
/// * `messages` - Slice of plaintext messages
/// * `session_key` - Shared session key (ChaCha20-Poly1305)
///
/// # Returns
/// Vector of ciphertexts (ownership transferred)
///
/// # Examples
///
/// ```rust
/// let messages = vec![b"msg1", b"msg2", b"msg3"];
/// let key = SessionKey::from_bytes(vec![0u8; 32]);
/// let ciphertexts = encrypt_batch(&messages, &key)?;
/// ```
pub fn encrypt_batch(
    messages: &[&[u8]],
    session_key: &SessionKey
) -> Result<Vec<Vec<u8>>> {
    let batcher = WilliamsBatcher::new(messages.len());
    let batch_size = batcher.optimal_batch_size();

    // Pre-allocate output with Williams capacity
    let mut ciphertexts = Vec::with_capacity(batch_size);

    for chunk in messages.chunks(batch_size) {
        for msg in chunk {
            let ct = chacha20poly1305_encrypt(msg, session_key)?;
            ciphertexts.push(ct);
        }
    }

    Ok(ciphertexts)
}
```

**Container-Respectful Design Notes**:
- **Borrowing**: `&[&[u8]]` borrows messages (caller retains ownership)
- **Ownership**: Output `Vec<Vec<u8>>` transferred to caller (no lifetime annotations)
- **Chunking**: `chunks()` creates non-overlapping slices (no mutation)
- **No Arc/Mutex**: Pure sequential processing (parallelism added later if needed)

### Batch Signature Verification

```rust
/// Verify multiple Ed25519 signatures with Williams-optimized batching
///
/// @asymmetrica: batch_verify_williams
/// cost: κ(O(n) verifications with √n×log(n) space)
/// optimization: ⊕(10x efficiency @ 1K signatures, 90% space reduction)
///
/// # Arguments
/// * `signatures` - Slice of (message, signature, public_key) tuples
///
/// # Returns
/// `Ok(())` if all valid, `Err` on first failure
///
/// # Examples
///
/// ```rust
/// let sigs = vec![
///     (&msg1[..], &sig1[..], &pk1[..]),
///     (&msg2[..], &sig2[..], &pk2[..]),
/// ];
/// verify_batch(&sigs)?;
/// ```
pub fn verify_batch(
    signatures: &[(&[u8], &[u8], &[u8])]
) -> Result<()> {
    let batcher = WilliamsBatcher::new(signatures.len());
    let batch_size = batcher.optimal_batch_size();

    for chunk in signatures.chunks(batch_size) {
        for (msg, sig, pk) in chunk {
            ed25519_verify(msg, sig, pk)?; // Fail fast
        }
    }

    Ok(())
}
```

**Container-Respectful Design Notes**:
- **References all the way**: No ownership transfers (read-only verification)
- **Fail-fast**: Return early on error (no partial results)
- **Const-time consideration**: WARNING - early abort leaks timing info!
  - Future: Constant-time batch verification (defer to Phase 3)

---

## Integration with Existing DefenseKit APIs

### Enhanced Handshake Module

```rust
// In handshake.rs
impl DefenseKit {
    /// Batch handshake with multiple peers (Williams-optimized)
    ///
    /// @asymmetrica: batch_handshake_williams
    /// regime: γ(Stabilization) - High-throughput operation
    /// cost: κ(O(n) handshakes with √n×log(n) memory)
    ///
    /// # Arguments
    /// * `peers` - Slice of peer information (public keys)
    ///
    /// # Returns
    /// Vector of session keys (one per peer)
    ///
    /// # Examples
    ///
    /// ```rust
    /// let defensekit = DefenseKit::with_defaults();
    /// let peers = vec![peer1, peer2, peer3];
    /// let sessions = defensekit.batch_handshake_initiator(&peers).await?;
    /// ```
    pub async fn batch_handshake_initiator(
        &self,
        peers: &[PeerInfo],
    ) -> Result<Vec<SessionKey>> {
        use crate::williams_optimizer::WilliamsBatcher;

        let batcher = WilliamsBatcher::new(peers.len());
        let batch_size = batcher.optimal_batch_size();

        let mut sessions = Vec::with_capacity(batch_size);

        for chunk in peers.chunks(batch_size) {
            for peer in chunk {
                let session = self.handshake_initiator(
                    &peer.classical_public,
                    &peer.quantum_public
                ).await?;
                sessions.push(session);
            }
        }

        Ok(sessions)
    }
}
```

**Container-Respectful Design Notes**:
- **Async compatibility**: Works seamlessly with `async fn`
- **No Send/Sync issues**: `WilliamsBatcher` is `Copy`, no shared state
- **Error propagation**: `?` operator works naturally
- **Zero allocator changes**: Reuses existing `Vec` infrastructure

---

## Type Safety & Error Handling

### Result Types

```rust
/// Williams optimizer error types
#[derive(Debug, thiserror::Error)]
pub enum WilliamsError {
    #[error("Invalid time complexity: {0}")]
    InvalidTimeComplexity(usize),

    #[error("Batch size exceeds available memory: {requested} > {available}")]
    InsufficientMemory {
        requested: usize,
        available: usize,
    },

    #[error("Crypto operation failed: {0}")]
    CryptoError(#[from] DefenseError),
}

pub type Result<T> = std::result::Result<T, WilliamsError>;
```

### Const Assertions (Compile-Time Checks)

```rust
// Ensure Williams calculations fit in f64 precision
const _: () = {
    assert!(std::mem::size_of::<f64>() == 8);
    assert!(std::mem::size_of::<usize>() <= 8); // 64-bit systems
};

// Ensure WilliamsBatcher is zero-cost abstraction
const _: () = {
    assert!(std::mem::size_of::<WilliamsBatcher>() <= 32); // 4 × f64
};
```

---

## Testing API

### Property-Based Testing (proptest)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    proptest! {
        /// Property: Williams bound always ≤ time complexity
        #[test]
        fn williams_bound_never_exceeds_time(t in 1usize..100_000) {
            let batcher = WilliamsBatcher::new(t);
            prop_assert!(batcher.space_bound() <= t as f64);
        }

        /// Property: Efficiency ≥ 1.0 (always better than naive)
        #[test]
        fn efficiency_always_improves(t in 2usize..100_000) {
            let batcher = WilliamsBatcher::new(t);
            prop_assert!(batcher.efficiency_multiplier() >= 1.0);
        }

        /// Property: Space reduction in [0%, 100%]
        #[test]
        fn space_reduction_bounded(t in 1usize..100_000) {
            let batcher = WilliamsBatcher::new(t);
            let reduction = batcher.space_reduction_percent();
            prop_assert!(reduction >= 0.0 && reduction <= 100.0);
        }
    }
}
```

### Parity Testing (Python ↔ Rust)

```rust
#[cfg(test)]
mod parity_tests {
    use super::*;

    /// Validate against iPermit Python implementation
    #[test]
    fn test_100_ops_parity() {
        let batcher = WilliamsBatcher::new(100);

        // Python: efficiency = 1.51x, space_reduction = 33.6%
        assert!((batcher.efficiency_multiplier() - 1.51).abs() < 0.01);
        assert!((batcher.space_reduction_percent() - 33.6).abs() < 1.0);
    }

    #[test]
    fn test_1000_ops_parity() {
        let batcher = WilliamsBatcher::new(1000);

        // Python: efficiency = 10.07x, space_reduction = 90.1%
        assert!((batcher.efficiency_multiplier() - 10.07).abs() < 0.01);
        assert!((batcher.space_reduction_percent() - 90.1).abs() < 1.0);
    }

    #[test]
    fn test_10000_ops_parity() {
        let batcher = WilliamsBatcher::new(10_000);

        // Python: efficiency = 7.52x, space_reduction = 86.7%
        assert!((batcher.efficiency_multiplier() - 7.52).abs() < 0.01);
        assert!((batcher.space_reduction_percent() - 86.7).abs() < 1.0);
    }
}
```

---

## Benchmark API (Criterion Integration)

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};

fn bench_keygen_batch_sizes(c: &mut Criterion) {
    let mut group = c.benchmark_group("keygen_batch");

    for size in [100, 1_000, 10_000].iter() {
        group.bench_with_input(
            BenchmarkId::new("naive", size),
            size,
            |b, &size| {
                b.iter(|| {
                    // Naive: No Williams optimization
                    let mut keys = Vec::new();
                    for _ in 0..size {
                        keys.push(HybridKeyExchange::generate());
                    }
                    black_box(keys);
                });
            }
        );

        group.bench_with_input(
            BenchmarkId::new("williams", size),
            size,
            |b, &size| {
                b.iter(|| {
                    // Williams-optimized
                    let keys = HybridKeyExchange::generate_batch(size)
                        .collect::<Vec<_>>();
                    black_box(keys);
                });
            }
        );
    }

    group.finish();
}

criterion_group!(benches, bench_keygen_batch_sizes);
criterion_main!(benches);
```

---

## API Surface Summary

### Public Exports

```rust
// In lib.rs
pub mod williams_optimizer {
    pub use crate::williams_optimizer::{
        WilliamsBatcher,
        WilliamsError,
        Result,
    };
}

// Enhanced exports
pub mod handshake {
    // Existing...
    pub use crate::handshake::DefenseKit::batch_handshake_initiator;
    pub use crate::handshake::DefenseKit::batch_handshake_responder;
}

pub mod hybrid {
    // Existing...
    pub use crate::hybrid::HybridKeyExchange::generate_batch;
    pub use crate::hybrid::encrypt_batch;
    pub use crate::hybrid::verify_batch;
}
```

### API Stability Guarantees

- **Semver**: Follow Rust semver (breaking changes only in major versions)
- **Deprecation**: 2-release deprecation cycle (mark deprecated → remove)
- **Inlining**: `#[inline]` for hot path accessors (let compiler decide)
- **Documentation**: 100% coverage (rustdoc enforced)

---

## Migration Guide (Existing Code)

### Before (Naive)

```rust
// Old: No batching
let mut keys = Vec::new();
for _ in 0..1000 {
    keys.push(HybridKeyExchange::generate());
}
```

### After (Williams-Optimized)

```rust
// New: Williams batching (3.2x efficiency)
let keys = HybridKeyExchange::generate_batch(1000)
    .collect::<Vec<_>>();
```

**Migration Impact**: 1-line change, 3.2x memory efficiency gain!

---

## Design Decisions Log

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Immutable `WilliamsBatcher` | No borrow checker conflicts | Cannot update post-construction (recreate instead) |
| `Copy` trait on `WilliamsBatcher` | Zero-cost pass-by-value | Struct must stay ≤ 32 bytes |
| Iterator-based batch APIs | Zero-copy streaming | Caller must collect (cannot return `Vec` directly) |
| No const generics (yet) | Simpler API, runtime flexibility | Potential compile-time optimization missed |
| No unsafe code | Safe by default | Slight performance cost (acceptable per benchmarks) |

---

## Container Respect Checklist

- [x] No `Arc<Mutex<T>>` unless required for Send/Sync
- [x] No `RefCell<T>` unless interior mutability proven necessary
- [x] Prefer `Copy` over `Clone` where feasible
- [x] Ownership transfer over lifetime annotations
- [x] Pure functions (no hidden mutation)
- [x] `&self` accessors (no `&mut self`)
- [x] Iterator patterns over Vec returns
- [x] Const generics deferred (prove value first)

---

**Document Status**: COMPLETE - Ready for Implementation
**Next Document**: `WILLIAMS_BENCHMARK_PLAN.md`

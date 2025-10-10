# Performance Gates Validation Rules

**Purpose:** Ensure components meet performance requirements and don't regress

---

## Performance Requirements

### Response Time Targets

| Operation Type | Target | Maximum |
|----------------|--------|---------|
| Database query | < 50ms | < 100ms |
| API endpoint | < 200ms | < 500ms |
| Batch processing (per item) | < 10ms | < 50ms |
| File I/O | < 100ms | < 500ms |

### Throughput Targets

| Operation | Target | Minimum |
|-----------|--------|---------|
| API requests/sec | > 100 | > 50 |
| Documents processed/min | > 1000 | > 500 |
| Batch jobs/hour | > 100 | > 50 |

### Resource Limits

| Resource | Target | Maximum |
|----------|--------|---------|
| Memory per operation | < 10MB | < 50MB |
| CPU per operation | < 100ms | < 500ms |
| Disk I/O per operation | < 1MB | < 10MB |

---

## Validation Checklist

### Pre-Deployment
- [ ] Baseline performance measured
- [ ] Performance benchmarks written
- [ ] All benchmarks passing
- [ ] No performance regressions vs. baseline
- [ ] Resource usage within limits

### Continuous Monitoring
- [ ] Performance tests in CI/CD
- [ ] Automated alerts for regressions
- [ ] Regular performance audits scheduled
- [ ] Optimization opportunities tracked

---

## Benchmark Test Template

```python
"""
Performance benchmarks for [Component Name]

These tests verify performance meets requirements.
"""

import pytest
import time
from memory_profiler import profile


class TestPerformance:
    """Performance benchmark suite."""

    @pytest.mark.benchmark
    def test_response_time_small_scale(self, component):
        """
        Test response time with small dataset (100 items).

        Target: < 50ms
        Maximum: < 100ms
        """
        data = generate_test_data(100)

        start = time.perf_counter()
        result = component.process(data)
        duration = time.perf_counter() - start

        duration_ms = duration * 1000

        assert result.success == True
        assert duration_ms < 100  # Maximum
        if duration_ms > 50:  # Target
            pytest.warn(f"Performance below target: {duration_ms:.2f}ms")

    @pytest.mark.benchmark
    def test_response_time_medium_scale(self, component):
        """
        Test response time with medium dataset (1K items).

        Target: < 200ms
        Maximum: < 500ms
        """
        data = generate_test_data(1000)

        start = time.perf_counter()
        result = component.process(data)
        duration = time.perf_counter() - start

        duration_ms = duration * 1000

        assert result.success == True
        assert duration_ms < 500  # Maximum

    @pytest.mark.benchmark
    def test_response_time_large_scale(self, component):
        """
        Test response time with large dataset (10K items).

        Target: < 1000ms
        Maximum: < 2000ms
        """
        data = generate_test_data(10000)

        start = time.perf_counter()
        result = component.process(data)
        duration = time.perf_counter() - start

        duration_ms = duration * 1000

        assert result.success == True
        assert duration_ms < 2000  # Maximum

    @pytest.mark.benchmark
    def test_throughput(self, component):
        """
        Test throughput (operations per second).

        Target: > 100 ops/sec
        Minimum: > 50 ops/sec
        """
        data = generate_test_data(10)
        iterations = 100

        start = time.perf_counter()
        for _ in range(iterations):
            component.process(data)
        duration = time.perf_counter() - start

        ops_per_sec = iterations / duration

        assert ops_per_sec > 50  # Minimum
        if ops_per_sec < 100:  # Target
            pytest.warn(f"Throughput below target: {ops_per_sec:.1f} ops/sec")

    @pytest.mark.benchmark
    def test_memory_usage(self, component):
        """
        Test memory usage stays within limits.

        Target: < 10MB
        Maximum: < 50MB
        """
        import tracemalloc

        data = generate_test_data(1000)

        tracemalloc.start()
        result = component.process(data)
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        peak_mb = peak / (1024 * 1024)

        assert result.success == True
        assert peak_mb < 50  # Maximum
        if peak_mb > 10:  # Target
            pytest.warn(f"Memory usage above target: {peak_mb:.2f}MB")

    @pytest.mark.benchmark
    def test_cpu_usage(self, component):
        """
        Test CPU usage stays within limits.

        Target: < 100ms CPU time
        Maximum: < 500ms CPU time
        """
        import resource

        data = generate_test_data(1000)

        start_cpu = resource.getrusage(resource.RUSAGE_SELF).ru_utime
        result = component.process(data)
        end_cpu = resource.getrusage(resource.RUSAGE_SELF).ru_utime

        cpu_time_ms = (end_cpu - start_cpu) * 1000

        assert result.success == True
        assert cpu_time_ms < 500  # Maximum
```

---

## Performance Regression Detection

### Baseline Measurement

```bash
# Measure baseline performance
pytest tests/performance/ --benchmark-only --benchmark-save=baseline

# Store baseline in repository
git add .benchmarks/
git commit -m "chore: Add performance baseline"
```

### Regression Testing

```bash
# Compare against baseline
pytest tests/performance/ --benchmark-only --benchmark-compare=baseline

# Fail if regression > 10%
pytest tests/performance/ --benchmark-only \
  --benchmark-compare=baseline \
  --benchmark-compare-fail=mean:10%
```

### CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run Performance Tests
        run: |
          pytest tests/performance/ --benchmark-only

      - name: Check for Regressions
        run: |
          pytest tests/performance/ --benchmark-only \
            --benchmark-compare=origin/main \
            --benchmark-compare-fail=mean:10%
```

---

## Optimization Workflow

### When Performance Gates Fail:

1. **Identify Bottleneck**
   ```python
   # Profile the code
   python -m cProfile -o profile.stats script.py

   # Analyze profile
   python -m pstats profile.stats
   ```

2. **Optimize**
   - Apply optimization technique
   - Verify correctness maintained
   - Measure improvement

3. **Validate**
   - Run performance tests
   - Compare to baseline
   - Verify gates pass

4. **Document**
   - Record optimization applied
   - Document improvement
   - Update benchmarks

---

## Performance Monitoring

### Metrics to Track

```python
class PerformanceMetrics:
    """Track component performance metrics."""

    def __init__(self):
        self.response_times = []
        self.memory_usage = []
        self.error_rate = 0.0

    def record_operation(
        self,
        duration: float,
        memory: int,
        success: bool
    ):
        """Record performance metrics for an operation."""
        self.response_times.append(duration)
        self.memory_usage.append(memory)
        if not success:
            self.error_rate += 1

    def get_stats(self) -> dict:
        """Get performance statistics."""
        import statistics

        return {
            'p50_response_time': statistics.median(self.response_times),
            'p95_response_time': statistics.quantiles(self.response_times, n=20)[18],
            'p99_response_time': statistics.quantiles(self.response_times, n=100)[98],
            'mean_memory': statistics.mean(self.memory_usage),
            'error_rate': self.error_rate / len(self.response_times)
        }
```

---

## Success Criteria

### Performance Gates Pass When:

-  All response times < maximum
-  Throughput > minimum
-  Memory usage < maximum
-  No regressions > 10% vs. baseline
-  Performance tests in CI/CD passing

---

## Performance Budget

### Define Budget for Each Component

```yaml
# performance-budget.yml
components:
  williams_optimizer:
    response_time_ms: 10
    memory_mb: 1
    throughput_ops_sec: 1000

  harmonic_timer:
    response_time_ms: 1
    memory_mb: 0.1
    accuracy_variance_ms: 50
```

---

**Validation Framework Version:** 1.0
**Last Updated:** October 10, 2025
**Maintained by:** Asymmetrica R&D Lab

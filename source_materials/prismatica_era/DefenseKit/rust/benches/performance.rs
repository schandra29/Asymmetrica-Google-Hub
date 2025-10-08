//! Performance Engine Benchmarks
//! Testing 345k+ packets/second throughput

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId, Throughput};
use defensekit::performance::{PerformanceEngine, PerformanceConfig};
use tokio::runtime::Runtime;
use std::time::Duration;

fn bench_packet_throughput(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    let mut group = c.benchmark_group("packet_throughput");
    group.measurement_time(Duration::from_secs(10));
    group.sample_size(10);
    
    for packet_size in [64, 256, 1024, 4096, 16384].iter() {
        group.throughput(Throughput::Bytes(*packet_size as u64));
        group.bench_with_input(
            BenchmarkId::from_parameter(format!("{}B", packet_size)),
            packet_size,
            |b, &packet_size| {
                b.to_async(&rt).iter(|| async {
                    let config = PerformanceConfig {
                        target_pps: 345_000,
                        worker_threads: 4,
                        ..Default::default()
                    };
                    
                    let mut engine = PerformanceEngine::new(config);
                    engine.start().await.unwrap();
                    
                    // Submit batch of packets
                    for i in 0..1000 {
                        let data = vec![0u8; packet_size];
                        engine.submit_packet(
                            black_box(data),
                            format!("dest_{}", i % 10),
                            format!("session_{}", i % 100),
                        ).unwrap();
                    }
                    
                    // Let processing happen
                    tokio::time::sleep(Duration::from_millis(10)).await;
                    engine.stop().await;
                });
            },
        );
    }
    group.finish();
}

fn bench_priority_distribution(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    c.bench_function("priority_distribution", |b| {
        b.to_async(&rt).iter(|| async {
            let config = PerformanceConfig::default();
            let engine = PerformanceEngine::new(config);
            
            // Test natural distribution
            let mut emergence = 0;
            let mut precision = 0;
            let mut support = 0;
            
            for i in 0..10000 {
                let data = format!("test_data_{}", i).into_bytes();
                let priority = engine.select_priority(&data, "test_dest");
                
                match priority {
                    defensekit::performance::PacketPriority::Emergence => emergence += 1,
                    defensekit::performance::PacketPriority::Precision => precision += 1,
                    defensekit::performance::PacketPriority::Support => support += 1,
                }
            }
            
            // Verify 30/20/50 distribution
            assert!((emergence as f64 / 10000.0 - 0.3).abs() < 0.05);
            assert!((precision as f64 / 10000.0 - 0.2).abs() < 0.05);
            assert!((support as f64 / 10000.0 - 0.5).abs() < 0.05);
        });
    });
}

fn bench_concurrent_workers(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    let mut group = c.benchmark_group("concurrent_workers");
    
    for worker_count in [1, 2, 4, 8, 16].iter() {
        group.bench_with_input(
            BenchmarkId::from_parameter(worker_count),
            worker_count,
            |b, &worker_count| {
                b.to_async(&rt).iter(|| async {
                    let config = PerformanceConfig {
                        worker_threads: worker_count,
                        target_pps: 345_000,
                        ..Default::default()
                    };
                    
                    let mut engine = PerformanceEngine::new(config);
                    engine.start().await.unwrap();
                    
                    // Submit many packets
                    for i in 0..10000 {
                        let data = vec![0u8; 1024];
                        let _ = engine.submit_packet(
                            data,
                            "destination".to_string(),
                            format!("session_{}", i),
                        );
                    }
                    
                    tokio::time::sleep(Duration::from_millis(100)).await;
                    
                    let metrics = engine.get_metrics();
                    assert!(metrics.packets_processed > 0);
                    
                    engine.stop().await;
                });
            },
        );
    }
    group.finish();
}

fn bench_session_management(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    let mut group = c.benchmark_group("session_management");
    
    for session_count in [100, 1000, 10000].iter() {
        group.bench_with_input(
            BenchmarkId::from_parameter(session_count),
            session_count,
            |b, &session_count| {
                b.to_async(&rt).iter(|| async {
                    let config = PerformanceConfig::default();
                    let mut engine = PerformanceEngine::new(config);
                    engine.start().await.unwrap();
                    
                    // Create many sessions
                    for i in 0..session_count {
                        let data = vec![0u8; 256];
                        engine.submit_packet(
                            black_box(data),
                            format!("dest_{}", i % 100),
                            format!("session_{}", i),
                        ).unwrap();
                    }
                    
                    // Process packets
                    tokio::time::sleep(Duration::from_millis(50)).await;
                    
                    // Clean up old sessions
                    engine.cleanup_sessions(Duration::from_secs(60)).await;
                    
                    engine.stop().await;
                });
            },
        );
    }
    group.finish();
}

fn bench_peak_performance(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    c.bench_function("peak_345k_pps", |b| {
        b.to_async(&rt).iter(|| async {
            let config = PerformanceConfig {
                target_pps: 345_000,
                worker_threads: num_cpus::get(),
                batch_size: 1000,
                enable_cover_traffic: false, // Disable for pure throughput test
                ..Default::default()
            };
            
            let mut engine = PerformanceEngine::new(config);
            engine.start().await.unwrap();
            
            // Burst submit to reach peak
            let burst_size = 100_000;
            for i in 0..burst_size {
                let data = vec![0u8; 64]; // Small packets for max PPS
                let _ = engine.submit_packet(
                    data,
                    "peak_test".to_string(),
                    format!("burst_{}", i % 1000),
                );
            }
            
            // Let it process
            tokio::time::sleep(Duration::from_millis(500)).await;
            
            let metrics = engine.get_metrics();
            println!("Peak PPS achieved: {}", metrics.peak_pps);
            
            engine.stop().await;
        });
    });
}

criterion_group!(
    benches,
    bench_packet_throughput,
    bench_priority_distribution,
    bench_concurrent_workers,
    bench_session_management,
    bench_peak_performance
);
criterion_main!(benches);
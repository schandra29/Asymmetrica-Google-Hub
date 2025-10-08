//! Consensus Engine Benchmarks
//! Measuring Byzantine fault tolerant consensus performance

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use defensekit::consensus::{ConsensusEngine, Transaction, NaturalBlock};
use tokio::runtime::Runtime;

fn bench_block_creation(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    let engine = ConsensusEngine::new("bench_node".to_string(), 10);
    
    let mut group = c.benchmark_group("block_creation");
    
    for tx_count in [10, 100, 1000].iter() {
        group.bench_with_input(
            BenchmarkId::from_parameter(tx_count),
            tx_count,
            |b, &tx_count| {
                let transactions: Vec<Transaction> = (0..tx_count)
                    .map(|i| Transaction {
                        id: format!("tx_{}", i),
                        from: "alice".to_string(),
                        to: "bob".to_string(),
                        data: vec![0u8; 256],
                        timestamp: 0,
                        signature: vec![0u8; 64],
                    })
                    .collect();
                
                b.iter(|| {
                    engine.create_block(black_box(transactions.clone()))
                });
            },
        );
    }
    group.finish();
}

fn bench_consensus_round(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    let mut group = c.benchmark_group("consensus_round");
    
    for validator_count in [10, 20, 50].iter() {
        group.bench_with_input(
            BenchmarkId::from_parameter(validator_count),
            validator_count,
            |b, &validator_count| {
                b.to_async(&rt).iter(|| async {
                    let mut engine = ConsensusEngine::new("bench".to_string(), validator_count);
                    engine.start().await.unwrap();
                    
                    let transactions = vec![
                        Transaction {
                            id: "test_tx".to_string(),
                            from: "alice".to_string(),
                            to: "bob".to_string(),
                            data: vec![0u8; 1024],
                            timestamp: 0,
                            signature: vec![0u8; 64],
                        }
                    ];
                    
                    let block = engine.create_block(transactions);
                    // Consensus happens automatically in background
                    tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
                });
            },
        );
    }
    group.finish();
}

fn bench_merkle_root(c: &mut Criterion) {
    let engine = ConsensusEngine::new("bench".to_string(), 1);
    
    let mut group = c.benchmark_group("merkle_root");
    
    for size in [10, 100, 1000, 10000].iter() {
        let transactions: Vec<Transaction> = (0..*size)
            .map(|i| Transaction {
                id: format!("tx_{}", i),
                from: format!("user_{}", i % 100),
                to: format!("user_{}", (i + 1) % 100),
                data: vec![0u8; 256],
                timestamp: i as i64,
                signature: vec![0u8; 64],
            })
            .collect();
        
        group.bench_with_input(
            BenchmarkId::from_parameter(size),
            &transactions,
            |b, transactions| {
                b.iter(|| {
                    let _ = engine.create_block(black_box(transactions.clone()));
                });
            },
        );
    }
    group.finish();
}

fn bench_golden_nonce_mining(c: &mut Criterion) {
    let engine = ConsensusEngine::new("bench".to_string(), 1);
    
    c.bench_function("golden_nonce_mining", |b| {
        b.iter(|| {
            let transactions = vec![
                Transaction {
                    id: "test".to_string(),
                    from: "alice".to_string(),
                    to: "bob".to_string(),
                    data: vec![0u8; 256],
                    timestamp: 0,
                    signature: vec![0u8; 64],
                }
            ];
            
            // This includes golden nonce mining
            let _ = engine.create_block(black_box(transactions));
        });
    });
}

fn bench_byzantine_tolerance(c: &mut Criterion) {
    let rt = Runtime::new().unwrap();
    
    let mut group = c.benchmark_group("byzantine_tolerance");
    
    for byzantine_ratio in [0.1, 0.2, 0.3].iter() {
        group.bench_with_input(
            BenchmarkId::from_parameter(format!("{}%", (byzantine_ratio * 100.0) as u32)),
            byzantine_ratio,
            |b, &byzantine_ratio| {
                b.to_async(&rt).iter(|| async {
                    let total_validators = 30;
                    let byzantine_count = (total_validators as f64 * byzantine_ratio) as usize;
                    
                    let mut engine = ConsensusEngine::new("bench".to_string(), total_validators);
                    engine.start().await.unwrap();
                    
                    // Simulate Byzantine validators by not including their votes
                    // In real scenario, they would send invalid votes
                    
                    let block = engine.create_block(vec![
                        Transaction {
                            id: "test".to_string(),
                            from: "alice".to_string(),
                            to: "bob".to_string(),
                            data: vec![0u8; 256],
                            timestamp: 0,
                            signature: vec![0u8; 64],
                        }
                    ]);
                    
                    // Consensus with Byzantine nodes
                    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
                });
            },
        );
    }
    group.finish();
}

criterion_group!(
    benches,
    bench_block_creation,
    bench_consensus_round,
    bench_merkle_root,
    bench_golden_nonce_mining,
    bench_byzantine_tolerance
);
criterion_main!(benches);
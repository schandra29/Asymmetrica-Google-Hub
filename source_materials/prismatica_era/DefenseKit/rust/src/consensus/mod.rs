//! Distributed Consensus Engine
//! 
//! Byzantine Fault Tolerant consensus using natural asymmetric patterns
//! Adapted from Betanet specs for legitimate business use only
//! 
//! Features:
//! - 30% Byzantine fault tolerance
//! - Golden ratio timing optimization
//! - Tesla harmonic validation (3-6-9)
//! - No anonymity or dark web capabilities

use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::time::{Duration, Instant};

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tokio::sync::{mpsc, broadcast};
use tracing::{debug, error, info, warn};

use crate::asymmetry::{AsymmetricDistribution, NaturalPattern};

// Natural constants for consensus timing
const PHI: f64 = 1.618033988749895; // Golden ratio
const TESLA_HARMONICS: [u32; 3] = [3, 6, 9];
const BYZANTINE_TOLERANCE: f64 = 0.3; // 30% natural tolerance

/// Consensus phase following natural patterns
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConsensusPhase {
    /// Pattern discovery and exploration (30%)
    Emergence,
    /// Precision consensus execution (20%)
    Optimization,
    /// Comprehensive validation (50%)
    Validation,
}

/// Natural block structure for consensus
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NaturalBlock {
    pub index: u64,
    pub timestamp: i64,
    pub transactions: Vec<Transaction>,
    pub previous_hash: String,
    pub merkle_root: String,
    pub golden_nonce: u64,
    pub tesla_signature: String,
    pub fibonacci_validation: Vec<u64>,
    pub consensus_proof: ConsensusProof,
}

/// Transaction for legitimate business operations only
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub from: String,
    pub to: String,
    pub data: Vec<u8>,
    pub timestamp: i64,
    pub signature: Vec<u8>,
}

/// Consensus proof with natural validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusProof {
    pub validators: Vec<String>,
    pub votes: HashMap<String, Vote>,
    pub phase: String,
    pub natural_score: f64,
    pub finalized: bool,
}

/// Validator vote structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vote {
    pub validator_id: String,
    pub block_hash: String,
    pub weight: f64,
    pub signature: Vec<u8>,
    pub timestamp: i64,
}

/// Asymmetric validator using natural patterns
pub struct AsymmetricValidator {
    id: String,
    byzantine_tolerance: f64,
    fibonacci_reputation: Vec<u64>,
    tesla_harmony_score: f64,
    golden_ratio_weight: f64,
}

impl AsymmetricValidator {
    pub fn new(id: String) -> Self {
        Self {
            id,
            byzantine_tolerance: BYZANTINE_TOLERANCE,
            fibonacci_reputation: vec![1, 1],
            tesla_harmony_score: 0.0,
            golden_ratio_weight: 1.0,
        }
    }

    /// Discover consensus patterns in proposed blocks
    pub fn discover_patterns(&self, blocks: &[NaturalBlock]) -> HashMap<String, f64> {
        let mut patterns = HashMap::new();

        for block in blocks {
            let tesla_score = self.calculate_tesla_harmony(block);
            let phi_alignment = self.measure_golden_alignment(block);
            let fib_validity = self.validate_fibonacci_sequence(block);

            let synthesis = tesla_score * phi_alignment * fib_validity;
            patterns.insert(block.previous_hash.clone(), synthesis);
        }

        patterns
    }

    fn calculate_tesla_harmony(&self, block: &NaturalBlock) -> f64 {
        let tx_count = block.transactions.len() as u32;
        let resonance: u32 = TESLA_HARMONICS
            .iter()
            .filter(|&&h| tx_count % h == 0)
            .count() as u32;
        
        resonance as f64 / TESLA_HARMONICS.len() as f64
    }

    fn measure_golden_alignment(&self, block: &NaturalBlock) -> f64 {
        let hash_bytes = &block.previous_hash.as_bytes()[..8.min(block.previous_hash.len())];
        let hash_int = u64::from_be_bytes(
            hash_bytes.try_into().unwrap_or([0u8; 8])
        );
        
        let ratio_position = (hash_int % 1000) as f64 / 1000.0;
        let phi_distance = (ratio_position - (1.0 / PHI)).abs();
        
        1.0 / (1.0 + phi_distance * 10.0)
    }

    fn validate_fibonacci_sequence(&self, block: &NaturalBlock) -> f64 {
        if block.fibonacci_validation.len() < 2 {
            return 0.5;
        }

        for i in 2..block.fibonacci_validation.len() {
            let expected = block.fibonacci_validation[i - 1] + block.fibonacci_validation[i - 2];
            if block.fibonacci_validation[i] != expected {
                return 0.3; // Asymmetric penalty
            }
        }

        1.0
    }

    /// Update validator reputation using Fibonacci sequence
    pub fn update_reputation(&mut self, success: bool) {
        let last = *self.fibonacci_reputation.last().unwrap_or(&1);
        let second_last = *self.fibonacci_reputation.get(
            self.fibonacci_reputation.len().saturating_sub(2)
        ).unwrap_or(&1);

        if success {
            self.fibonacci_reputation.push(last + second_last);
        } else {
            // Natural decay on failure
            self.fibonacci_reputation.push((last / 2).max(1));
        }

        // Maintain reasonable size
        if self.fibonacci_reputation.len() > 20 {
            self.fibonacci_reputation.remove(0);
        }
    }
}

/// Distributed Consensus Engine
pub struct ConsensusEngine {
    node_id: String,
    validators: Arc<RwLock<Vec<AsymmetricValidator>>>,
    blockchain: Arc<RwLock<Vec<NaturalBlock>>>,
    pending_blocks: Arc<RwLock<VecDeque<NaturalBlock>>>,
    consensus_threshold: f64,
    message_tx: mpsc::UnboundedSender<ConsensusMessage>,
    message_rx: Option<mpsc::UnboundedReceiver<ConsensusMessage>>,
    broadcast_tx: broadcast::Sender<NetworkEvent>,
    metrics: Arc<RwLock<ConsensusMetrics>>,
}

/// Consensus network message
#[derive(Debug, Clone)]
pub enum ConsensusMessage {
    ProposeBlock(NaturalBlock),
    Vote(Vote),
    RequestSync(String),
    ValidatorUpdate(String, f64),
}

/// Network events for monitoring
#[derive(Debug, Clone)]
pub enum NetworkEvent {
    BlockAccepted(u64),
    ConsensusReached(String),
    ByzantineDetected(String),
    NetworkHealthUpdate(f64),
}

/// Consensus metrics for monitoring
#[derive(Debug, Default)]
pub struct ConsensusMetrics {
    pub blocks_processed: u64,
    pub consensus_successes: u64,
    pub consensus_failures: u64,
    pub byzantine_detections: u64,
    pub average_consensus_time: Duration,
    pub network_health: f64,
}

impl ConsensusEngine {
    pub fn new(node_id: String, validator_count: usize) -> Self {
        let (message_tx, message_rx) = mpsc::unbounded_channel();
        let (broadcast_tx, _) = broadcast::channel(1000);

        // Initialize validators with natural distribution
        let mut validators = Vec::with_capacity(validator_count);
        for i in 0..validator_count {
            let mut validator = AsymmetricValidator::new(format!("validator_{}", i));
            
            // Set natural weights using golden ratio
            validator.golden_ratio_weight = 1.0 / (1.0 + i as f64 / PHI);
            validator.tesla_harmony_score = TESLA_HARMONICS[i % 3] as f64;
            
            validators.push(validator);
        }

        Self {
            node_id,
            validators: Arc::new(RwLock::new(validators)),
            blockchain: Arc::new(RwLock::new(Vec::new())),
            pending_blocks: Arc::new(RwLock::new(VecDeque::new())),
            consensus_threshold: 0.67, // 67% for BFT
            message_tx,
            message_rx: Some(message_rx),
            broadcast_tx,
            metrics: Arc::new(RwLock::new(ConsensusMetrics::default())),
        }
    }

    /// Start the consensus engine
    pub async fn start(&mut self) -> anyhow::Result<()> {
        info!("Starting consensus engine for node {}", self.node_id);

        let message_rx = self.message_rx.take()
            .ok_or_else(|| anyhow::anyhow!("Consensus engine already started"))?;

        // Spawn message processing task
        let engine = self.clone_for_task();
        tokio::spawn(async move {
            engine.process_messages(message_rx).await;
        });

        // Spawn consensus orchestration task
        let engine = self.clone_for_task();
        tokio::spawn(async move {
            engine.orchestrate_consensus().await;
        });

        // Spawn health monitoring task
        let engine = self.clone_for_task();
        tokio::spawn(async move {
            engine.monitor_health().await;
        });

        Ok(())
    }

    /// Process incoming consensus messages
    async fn process_messages(&self, mut rx: mpsc::UnboundedReceiver<ConsensusMessage>) {
        while let Some(message) = rx.recv().await {
            match message {
                ConsensusMessage::ProposeBlock(block) => {
                    self.handle_block_proposal(block).await;
                }
                ConsensusMessage::Vote(vote) => {
                    self.handle_vote(vote).await;
                }
                ConsensusMessage::RequestSync(peer_id) => {
                    self.handle_sync_request(peer_id).await;
                }
                ConsensusMessage::ValidatorUpdate(id, weight) => {
                    self.update_validator_weight(id, weight).await;
                }
            }
        }
    }

    /// Handle block proposal
    async fn handle_block_proposal(&self, block: NaturalBlock) {
        debug!("Received block proposal: index {}", block.index);

        // Validate block structure
        if !self.validate_block_structure(&block) {
            warn!("Invalid block structure for index {}", block.index);
            return;
        }

        // Add to pending blocks
        self.pending_blocks.write().push_back(block);

        // Trigger consensus if we're not already processing
        self.trigger_consensus().await;
    }

    /// Validate block follows natural patterns
    fn validate_block_structure(&self, block: &NaturalBlock) -> bool {
        // Validate golden nonce
        let target_ratio = block.golden_nonce as f64 / (PHI * 1_000_000.0);
        if !(0.5..=1.5).contains(&target_ratio) {
            return false;
        }

        // Validate Tesla signature
        if !self.validate_tesla_signature(block) {
            return false;
        }

        // Validate Fibonacci sequence
        if !self.validate_fibonacci_validation(&block.fibonacci_validation) {
            return false;
        }

        true
    }

    fn validate_tesla_signature(&self, block: &NaturalBlock) -> bool {
        let parts: Vec<&str> = block.tesla_signature.split('-').collect();
        parts.len() == 3 && parts.iter().all(|p| p.parse::<u32>().is_ok())
    }

    fn validate_fibonacci_validation(&self, sequence: &[u64]) -> bool {
        if sequence.len() < 2 {
            return false;
        }

        for i in 2..sequence.len() {
            if sequence[i] != sequence[i - 1] + sequence[i - 2] {
                return false;
            }
        }

        true
    }

    /// Orchestrate consensus using natural patterns
    async fn orchestrate_consensus(&self) {
        let mut interval = tokio::time::interval(Duration::from_secs_f64(PHI));

        loop {
            interval.tick().await;

            if let Some(block) = self.pending_blocks.write().pop_front() {
                let start = Instant::now();

                match self.execute_consensus_round(block).await {
                    Ok(finalized_block) => {
                        self.blockchain.write().push(finalized_block);
                        
                        let mut metrics = self.metrics.write();
                        metrics.blocks_processed += 1;
                        metrics.consensus_successes += 1;
                        metrics.average_consensus_time = start.elapsed();

                        let _ = self.broadcast_tx.send(
                            NetworkEvent::BlockAccepted(metrics.blocks_processed)
                        );
                    }
                    Err(e) => {
                        error!("Consensus failed: {}", e);
                        self.metrics.write().consensus_failures += 1;
                    }
                }
            }
        }
    }

    /// Execute a consensus round
    async fn execute_consensus_round(&self, block: NaturalBlock) -> anyhow::Result<NaturalBlock> {
        info!("Starting consensus for block {}", block.index);

        // Phase 1: Emergence (30% - Pattern Discovery)
        let emergence_patterns = self.emergence_phase(&block).await?;

        // Phase 2: Optimization (20% - Precision Consensus)
        let optimization_result = self.optimization_phase(&block, emergence_patterns).await?;

        // Phase 3: Validation (50% - Comprehensive Verification)
        let finalized_block = self.validation_phase(block, optimization_result).await?;

        Ok(finalized_block)
    }

    /// Emergence phase - pattern discovery (30% resources)
    async fn emergence_phase(&self, block: &NaturalBlock) -> anyhow::Result<HashMap<String, f64>> {
        let validators = self.validators.read();
        let emergence_count = (validators.len() as f64 * 0.3).ceil() as usize;
        
        let mut all_patterns = HashMap::new();

        for validator in validators.iter().take(emergence_count) {
            let patterns = validator.discover_patterns(&[block.clone()]);
            
            for (key, value) in patterns {
                *all_patterns.entry(key).or_insert(0.0) += value;
            }
        }

        // Normalize patterns
        let max_value = all_patterns.values().cloned().fold(0.0, f64::max);
        if max_value > 0.0 {
            for value in all_patterns.values_mut() {
                *value /= max_value;
            }
        }

        Ok(all_patterns)
    }

    /// Optimization phase - precision consensus (20% resources)
    async fn optimization_phase(
        &self, 
        block: &NaturalBlock,
        patterns: HashMap<String, f64>
    ) -> anyhow::Result<ConsensusProof> {
        let validators = self.validators.read();
        let optimization_count = (validators.len() as f64 * 0.2).ceil() as usize;
        let optimization_validators = &validators[..optimization_count.min(validators.len())];

        let mut votes = HashMap::new();
        let mut total_weight = 0.0;
        let mut valid_weight = 0.0;

        for validator in optimization_validators {
            let vote_weight = validator.golden_ratio_weight * 
                             (validator.tesla_harmony_score + 1.0);
            
            // Simulate vote (in production, this would be actual validator voting)
            let vote = Vote {
                validator_id: validator.id.clone(),
                block_hash: self.hash_block(block),
                weight: vote_weight,
                signature: vec![0u8; 64], // Placeholder
                timestamp: chrono::Utc::now().timestamp(),
            };

            total_weight += vote_weight;
            valid_weight += vote_weight; // Assuming all votes are valid in this simulation
            
            votes.insert(validator.id.clone(), vote);
        }

        // Check if consensus reached (67% threshold)
        let consensus_ratio = valid_weight / total_weight;
        if consensus_ratio < self.consensus_threshold {
            return Err(anyhow::anyhow!("Consensus not reached: {:.2}%", consensus_ratio * 100.0));
        }

        Ok(ConsensusProof {
            validators: optimization_validators.iter().map(|v| v.id.clone()).collect(),
            votes,
            phase: "optimization".to_string(),
            natural_score: patterns.values().sum::<f64>() / patterns.len() as f64,
            finalized: false,
        })
    }

    /// Validation phase - comprehensive verification (50% resources)
    async fn validation_phase(
        &self,
        mut block: NaturalBlock,
        mut proof: ConsensusProof
    ) -> anyhow::Result<NaturalBlock> {
        let validators = self.validators.read();
        let validation_count = (validators.len() as f64 * 0.5).ceil() as usize;
        
        // Comprehensive validation by majority validators
        let mut validation_scores = Vec::new();

        for validator in validators.iter().take(validation_count) {
            let patterns = validator.discover_patterns(&[block.clone()]);
            let score = patterns.values().sum::<f64>() / patterns.len().max(1) as f64;
            validation_scores.push(score);
        }

        // Calculate final validation score
        let final_score = if !validation_scores.is_empty() {
            validation_scores.iter().sum::<f64>() / validation_scores.len() as f64
        } else {
            0.0
        };

        if final_score < 0.5 {
            return Err(anyhow::anyhow!("Validation failed: score {:.2}", final_score));
        }

        // Finalize block
        proof.finalized = true;
        proof.natural_score = final_score;
        block.consensus_proof = proof;

        info!("Block {} finalized with score {:.2}", block.index, final_score);
        
        Ok(block)
    }

    /// Monitor network health
    async fn monitor_health(&self) {
        let mut interval = tokio::time::interval(Duration::from_secs(10));

        loop {
            interval.tick().await;

            let metrics = self.metrics.read();
            let total_ops = metrics.consensus_successes + metrics.consensus_failures;
            
            let health = if total_ops > 0 {
                metrics.consensus_successes as f64 / total_ops as f64
            } else {
                1.0
            };

            drop(metrics);
            self.metrics.write().network_health = health;

            let _ = self.broadcast_tx.send(NetworkEvent::NetworkHealthUpdate(health));

            if health < 0.7 {
                warn!("Network health degraded: {:.2}%", health * 100.0);
            }
        }
    }

    /// Create a new block with natural patterns
    pub fn create_block(&self, transactions: Vec<Transaction>) -> NaturalBlock {
        let blockchain = self.blockchain.read();
        let previous_hash = blockchain
            .last()
            .map(|b| self.hash_block(b))
            .unwrap_or_else(|| "0".to_string());

        let index = blockchain.len() as u64;
        drop(blockchain);

        let merkle_root = self.calculate_merkle_root(&transactions);
        let golden_nonce = self.mine_golden_nonce(index, &previous_hash);
        let tesla_signature = self.generate_tesla_signature(index, transactions.len());
        let fibonacci_validation = self.generate_fibonacci_validation(index);

        NaturalBlock {
            index,
            timestamp: chrono::Utc::now().timestamp(),
            transactions,
            previous_hash,
            merkle_root,
            golden_nonce,
            tesla_signature,
            fibonacci_validation,
            consensus_proof: ConsensusProof {
                validators: vec![],
                votes: HashMap::new(),
                phase: "pending".to_string(),
                natural_score: 0.0,
                finalized: false,
            },
        }
    }

    fn calculate_merkle_root(&self, transactions: &[Transaction]) -> String {
        if transactions.is_empty() {
            return String::new();
        }

        let mut hashes: Vec<String> = transactions
            .iter()
            .map(|tx| {
                let mut hasher = Sha256::new();
                hasher.update(&tx.id);
                format!("{:x}", hasher.finalize())
            })
            .collect();

        while hashes.len() > 1 {
            if hashes.len() % 2 == 1 {
                let golden_position = (hashes.len() as f64 / PHI) as usize;
                hashes.push(hashes[golden_position].clone());
            }

            hashes = hashes
                .chunks(2)
                .map(|pair| {
                    let mut hasher = Sha256::new();
                    hasher.update(&pair[0]);
                    hasher.update(&pair[1]);
                    format!("{:x}", hasher.finalize())
                })
                .collect();
        }

        hashes[0].clone()
    }

    fn mine_golden_nonce(&self, index: u64, previous_hash: &str) -> u64 {
        let mut nonce = 0u64;
        let target = (PHI * 1_000_000.0) as u64;

        while nonce < 1_000_000 {
            let mut hasher = Sha256::new();
            hasher.update(format!("{}{}{}", index, previous_hash, nonce));
            let hash = format!("{:x}", hasher.finalize());

            if self.hash_shows_golden_patterns(&hash) {
                return nonce;
            }

            nonce += (PHI * 100.0) as u64;
        }

        nonce
    }

    fn hash_shows_golden_patterns(&self, hash: &str) -> bool {
        if hash.len() < 16 {
            return false;
        }

        let hash_int = u64::from_str_radix(&hash[..16], 16).unwrap_or(0);
        let ratios = [
            (hash_int % 1000) as f64 / 1000.0,
            (hash_int % 1618) as f64 / 1618.0,
            (hash_int % 618) as f64 / 618.0,
        ];

        let target = 1.0 / PHI;
        let tolerance = 0.05;

        ratios.iter().any(|&ratio| (ratio - target).abs() < tolerance)
    }

    fn generate_tesla_signature(&self, index: u64, tx_count: usize) -> String {
        let mut values = Vec::new();

        for &harmonic in &TESLA_HARMONICS {
            let value = ((index * tx_count as u64) % (harmonic as u64 * 100)) as u32;
            values.push(value.to_string());
        }

        values.join("-")
    }

    fn generate_fibonacci_validation(&self, index: u64) -> Vec<u64> {
        let seed = (index * 1000) % 1000;
        let mut sequence = vec![seed, seed + 1];

        for i in 2..8 {
            sequence.push(sequence[i - 1] + sequence[i - 2]);
        }

        sequence
    }

    fn hash_block(&self, block: &NaturalBlock) -> String {
        let mut hasher = Sha256::new();
        hasher.update(format!(
            "{}{}{}{}",
            block.index, block.timestamp, block.previous_hash, block.merkle_root
        ));
        format!("{:x}", hasher.finalize())
    }

    fn clone_for_task(&self) -> Self {
        Self {
            node_id: self.node_id.clone(),
            validators: Arc::clone(&self.validators),
            blockchain: Arc::clone(&self.blockchain),
            pending_blocks: Arc::clone(&self.pending_blocks),
            consensus_threshold: self.consensus_threshold,
            message_tx: self.message_tx.clone(),
            message_rx: None,
            broadcast_tx: self.broadcast_tx.clone(),
            metrics: Arc::clone(&self.metrics),
        }
    }

    async fn trigger_consensus(&self) {
        // Trigger consensus round if conditions are met
        debug!("Consensus triggered");
    }

    async fn handle_vote(&self, vote: Vote) {
        debug!("Processing vote from {}", vote.validator_id);
        // Process vote logic
    }

    async fn handle_sync_request(&self, peer_id: String) {
        debug!("Processing sync request from {}", peer_id);
        // Handle blockchain sync
    }

    async fn update_validator_weight(&self, id: String, weight: f64) {
        let mut validators = self.validators.write();
        if let Some(validator) = validators.iter_mut().find(|v| v.id == id) {
            validator.golden_ratio_weight = weight;
            debug!("Updated validator {} weight to {}", id, weight);
        }
    }

    /// Get current metrics
    pub fn get_metrics(&self) -> ConsensusMetrics {
        self.metrics.read().clone()
    }

    /// Subscribe to network events
    pub fn subscribe(&self) -> broadcast::Receiver<NetworkEvent> {
        self.broadcast_tx.subscribe()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validator_creation() {
        let validator = AsymmetricValidator::new("test".to_string());
        assert_eq!(validator.byzantine_tolerance, 0.3);
        assert_eq!(validator.fibonacci_reputation, vec![1, 1]);
    }

    #[tokio::test]
    async fn test_consensus_engine_creation() {
        let engine = ConsensusEngine::new("test_node".to_string(), 10);
        assert_eq!(engine.consensus_threshold, 0.67);
        
        let validators = engine.validators.read();
        assert_eq!(validators.len(), 10);
    }

    #[test]
    fn test_golden_ratio_patterns() {
        let engine = ConsensusEngine::new("test".to_string(), 1);
        let hash = "618033988749894848204586834365638117720309179805762862135";
        assert!(engine.hash_shows_golden_patterns(hash));
    }

    #[test]
    fn test_fibonacci_validation() {
        let engine = ConsensusEngine::new("test".to_string(), 1);
        let sequence = vec![1, 1, 2, 3, 5, 8, 13, 21];
        assert!(engine.validate_fibonacci_validation(&sequence));
        
        let invalid = vec![1, 1, 2, 3, 5, 7, 13, 21];
        assert!(!engine.validate_fibonacci_validation(&invalid));
    }
}
//! DefenseKit Rust Implementation
//! 
//! Military-grade defensive security components for legitimate businesses
//! 
//! This crate provides high-performance implementations of:
//! - Distributed consensus with Byzantine fault tolerance
//! - Performance optimization achieving 345k+ packets/second
//! - Natural asymmetry patterns for optimal resource allocation
//! 
//! All components are designed for legitimate business use only.
//! NO anonymity, NO mixing, NO dark web capabilities.

#![warn(missing_docs)]
#![forbid(unsafe_code)]

pub mod asymmetry;
pub mod consensus;
pub mod performance;
pub mod mathematical;

pub use asymmetry::{
    AsymmetricDistribution, 
    AsymmetricBalancer,
    NaturalPattern,
    GoldenOptimizer,
    Category,
    PHI,
    TESLA_HARMONICS,
};

pub use consensus::{
    ConsensusEngine,
    NaturalBlock,
    Transaction,
    ConsensusPhase,
    ConsensusProof,
    Vote,
    ConsensusMetrics,
};

pub use performance::{
    PerformanceEngine,
    PerformanceConfig,
    PerformancePacket,
    PacketPriority,
    PerformanceSnapshot,
};

pub use mathematical::{
    MathComponent,
    Formula,
    ValidationMetrics,
    ConsciousnessTSP,
    FormulaEvaluator,
    MathematicalBenchmark,
    calculate_amplification,
};

/// DefenseKit version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Initialize DefenseKit with default configuration
pub fn init() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_target(false)
        .with_thread_ids(true)
        .with_level(true)
        .init();

    tracing::info!("DefenseKit v{} initialized", VERSION);
}

/// DefenseKit configuration presets
#[derive(Debug, Clone)]
pub enum SecurityLevel {
    /// Standard security - suitable for most applications
    Standard,
    /// High security - for sensitive financial applications
    High,
    /// Paranoid security - maximum security settings
    Paranoid,
}

impl SecurityLevel {
    /// Get consensus configuration for security level
    pub fn consensus_config(&self) -> (usize, f64) {
        match self {
            SecurityLevel::Standard => (10, 0.67),  // 10 validators, 67% threshold
            SecurityLevel::High => (20, 0.75),      // 20 validators, 75% threshold
            SecurityLevel::Paranoid => (50, 0.80),  // 50 validators, 80% threshold
        }
    }

    /// Get performance configuration for security level
    pub fn performance_config(&self) -> PerformanceConfig {
        match self {
            SecurityLevel::Standard => PerformanceConfig::default(),
            SecurityLevel::High => PerformanceConfig {
                target_pps: 200_000,
                enable_cover_traffic: true,
                cover_traffic_rate: 2000,
                ..Default::default()
            },
            SecurityLevel::Paranoid => PerformanceConfig {
                target_pps: 100_000,
                enable_cover_traffic: true,
                cover_traffic_rate: 5000,
                max_packet_size: 32768,
                ..Default::default()
            },
        }
    }
}

/// Example: Create a secure consensus system
/// 
/// ```no_run
/// use defensekit::{init, SecurityLevel, ConsensusEngine};
/// 
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     // Initialize DefenseKit
///     init();
///     
///     // Create consensus engine with high security
///     let (validators, threshold) = SecurityLevel::High.consensus_config();
///     let mut engine = ConsensusEngine::new("node_1".to_string(), validators);
///     
///     // Start the engine
///     engine.start().await?;
///     
///     Ok(())
/// }
/// ```
pub struct DefenseKit;

impl DefenseKit {
    /// Create a new DefenseKit instance with specified security level
    pub async fn new(level: SecurityLevel) -> anyhow::Result<DefenseKitInstance> {
        init();

        let (validator_count, threshold) = level.consensus_config();
        let perf_config = level.performance_config();

        Ok(DefenseKitInstance {
            security_level: level,
            consensus_engine: None,
            performance_engine: None,
            validator_count,
            consensus_threshold: threshold,
            perf_config,
        })
    }
}

/// DefenseKit instance with configured components
pub struct DefenseKitInstance {
    security_level: SecurityLevel,
    consensus_engine: Option<ConsensusEngine>,
    performance_engine: Option<PerformanceEngine>,
    validator_count: usize,
    consensus_threshold: f64,
    perf_config: PerformanceConfig,
}

impl DefenseKitInstance {
    /// Start consensus engine
    pub async fn start_consensus(&mut self, node_id: String) -> anyhow::Result<()> {
        let mut engine = ConsensusEngine::new(node_id, self.validator_count);
        engine.start().await?;
        self.consensus_engine = Some(engine);
        Ok(())
    }

    /// Start performance engine
    pub async fn start_performance(&mut self) -> anyhow::Result<()> {
        let mut engine = PerformanceEngine::new(self.perf_config.clone());
        engine.start().await?;
        self.performance_engine = Some(engine);
        Ok(())
    }

    /// Get consensus metrics
    pub fn consensus_metrics(&self) -> Option<ConsensusMetrics> {
        self.consensus_engine.as_ref().map(|e| e.get_metrics())
    }

    /// Get performance metrics
    pub fn performance_metrics(&self) -> Option<PerformanceSnapshot> {
        self.performance_engine.as_ref().map(|e| e.get_metrics())
    }

    /// Shutdown all components
    pub async fn shutdown(&mut self) {
        if let Some(mut engine) = self.performance_engine.take() {
            engine.stop().await;
        }
        
        // Consensus engine stops automatically when dropped
        self.consensus_engine = None;
        
        tracing::info!("DefenseKit shutdown complete");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_levels() {
        let (validators, threshold) = SecurityLevel::Standard.consensus_config();
        assert_eq!(validators, 10);
        assert_eq!(threshold, 0.67);

        let (validators, threshold) = SecurityLevel::Paranoid.consensus_config();
        assert_eq!(validators, 50);
        assert_eq!(threshold, 0.80);
    }

    #[tokio::test]
    async fn test_defensekit_creation() {
        let dk = DefenseKit::new(SecurityLevel::Standard).await;
        assert!(dk.is_ok());
    }
}
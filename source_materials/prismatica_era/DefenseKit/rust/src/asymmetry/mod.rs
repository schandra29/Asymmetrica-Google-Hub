//! Natural Asymmetry Pattern Implementation
//! 
//! The proven 30/20/50 distribution for optimal resource allocation
//! Based on natural patterns found across domains
//! 
//! This module provides the core asymmetric patterns used throughout DefenseKit

use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use serde::{Deserialize, Serialize};

// Natural constants
pub const PHI: f64 = 1.618033988749895; // Golden ratio
pub const TESLA_HARMONICS: [u32; 3] = [3, 6, 9]; // Tesla's natural harmonics
pub const FIBONACCI_SEQUENCE: [u64; 12] = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

/// The proven natural asymmetric distribution
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct AsymmetricDistribution {
    pub emergence: f64,    // 30% - Creative exploration
    pub optimization: f64, // 20% - Precision execution
    pub support: f64,      // 50% - Infrastructure
}

impl Default for AsymmetricDistribution {
    fn default() -> Self {
        Self {
            emergence: 0.3,
            optimization: 0.2,
            support: 0.5,
        }
    }
}

impl AsymmetricDistribution {
    /// Validate the distribution sums to 1.0
    pub fn is_valid(&self) -> bool {
        let sum = self.emergence + self.optimization + self.support;
        (sum - 1.0).abs() < 0.001
    }

    /// Allocate resources according to natural distribution
    pub fn allocate(&self, total: u64) -> ResourceAllocation {
        ResourceAllocation {
            emergence: (total as f64 * self.emergence) as u64,
            optimization: (total as f64 * self.optimization) as u64,
            support: (total as f64 * self.support) as u64,
        }
    }

    /// Select category based on hash for deterministic distribution
    pub fn select_category(&self, hash: &[u8]) -> Category {
        if hash.is_empty() {
            return Category::Support;
        }

        let selector = hash[0] as f64 / 255.0;
        
        if selector < self.emergence {
            Category::Emergence
        } else if selector < self.emergence + self.optimization {
            Category::Optimization
        } else {
            Category::Support
        }
    }
}

/// Resource allocation result
#[derive(Debug, Clone, Copy)]
pub struct ResourceAllocation {
    pub emergence: u64,
    pub optimization: u64,
    pub support: u64,
}

/// Category for asymmetric processing
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Category {
    Emergence,
    Optimization,
    Support,
}

/// Natural pattern detector
pub struct NaturalPattern {
    golden_ratio_tolerance: f64,
    tesla_harmonic_threshold: f64,
    fibonacci_depth: usize,
}

impl Default for NaturalPattern {
    fn default() -> Self {
        Self {
            golden_ratio_tolerance: 0.05,
            tesla_harmonic_threshold: 0.7,
            fibonacci_depth: 8,
        }
    }
}

impl NaturalPattern {
    /// Check if a value exhibits golden ratio properties
    pub fn has_golden_ratio(&self, value: f64) -> bool {
        let ratios = [
            value / PHI,
            value * PHI,
            1.0 / (value + PHI),
            (value - 1.0) / value, // φ property: φ - 1 = 1/φ
        ];

        ratios.iter().any(|&r| {
            let target = r.fract();
            target < self.golden_ratio_tolerance || 
            (1.0 - target) < self.golden_ratio_tolerance
        })
    }

    /// Check if a number exhibits Tesla harmonic properties
    pub fn has_tesla_harmony(&self, value: u32) -> bool {
        let harmonic_count = TESLA_HARMONICS
            .iter()
            .filter(|&&h| value % h == 0)
            .count();

        harmonic_count as f64 / TESLA_HARMONICS.len() as f64 >= self.tesla_harmonic_threshold
    }

    /// Generate Fibonacci sequence starting from seed
    pub fn generate_fibonacci(&self, seed: u64, length: usize) -> Vec<u64> {
        let mut sequence = vec![seed, seed + 1];
        
        for i in 2..length.min(self.fibonacci_depth) {
            let next = sequence[i - 1] + sequence[i - 2];
            sequence.push(next);
        }

        sequence
    }

    /// Validate if a sequence follows Fibonacci pattern
    pub fn is_fibonacci(&self, sequence: &[u64]) -> bool {
        if sequence.len() < 3 {
            return false;
        }

        for i in 2..sequence.len() {
            if sequence[i] != sequence[i - 1] + sequence[i - 2] {
                return false;
            }
        }

        true
    }

    /// Calculate natural harmony score for a value
    pub fn harmony_score(&self, value: u64) -> f64 {
        let mut score = 0.0;
        let mut factors = 0;

        // Golden ratio component
        if self.has_golden_ratio(value as f64) {
            score += 0.4;
            factors += 1;
        }

        // Tesla harmonic component
        if self.has_tesla_harmony(value as u32) {
            score += 0.3;
            factors += 1;
        }

        // Fibonacci component
        for &fib in &FIBONACCI_SEQUENCE {
            if value % fib == 0 {
                score += 0.3 / FIBONACCI_SEQUENCE.len() as f64;
                factors += 1;
            }
        }

        if factors > 0 {
            score / factors as f64
        } else {
            0.0
        }
    }
}

/// Asymmetric load balancer using natural patterns
pub struct AsymmetricBalancer {
    distribution: AsymmetricDistribution,
    emergence_load: AtomicU64,
    optimization_load: AtomicU64,
    support_load: AtomicU64,
    total_requests: AtomicU64,
}

impl AsymmetricBalancer {
    pub fn new(distribution: AsymmetricDistribution) -> Self {
        Self {
            distribution,
            emergence_load: AtomicU64::new(0),
            optimization_load: AtomicU64::new(0),
            support_load: AtomicU64::new(0),
            total_requests: AtomicU64::new(0),
        }
    }

    /// Route request according to natural distribution
    pub fn route(&self, request_id: u64) -> Category {
        self.total_requests.fetch_add(1, Ordering::Relaxed);
        
        // Use request ID to deterministically select category
        let hash = sha2::Sha256::digest(&request_id.to_be_bytes());
        let category = self.distribution.select_category(&hash);

        // Update load counters
        match category {
            Category::Emergence => {
                self.emergence_load.fetch_add(1, Ordering::Relaxed);
            }
            Category::Optimization => {
                self.optimization_load.fetch_add(1, Ordering::Relaxed);
            }
            Category::Support => {
                self.support_load.fetch_add(1, Ordering::Relaxed);
            }
        }

        category
    }

    /// Get current load distribution
    pub fn get_load_distribution(&self) -> LoadDistribution {
        let total = self.total_requests.load(Ordering::Relaxed) as f64;
        
        if total == 0.0 {
            return LoadDistribution::default();
        }

        LoadDistribution {
            emergence_percent: self.emergence_load.load(Ordering::Relaxed) as f64 / total,
            optimization_percent: self.optimization_load.load(Ordering::Relaxed) as f64 / total,
            support_percent: self.support_load.load(Ordering::Relaxed) as f64 / total,
            total_requests: total as u64,
        }
    }

    /// Check if distribution is balanced within tolerance
    pub fn is_balanced(&self, tolerance: f64) -> bool {
        let dist = self.get_load_distribution();
        
        (dist.emergence_percent - self.distribution.emergence).abs() < tolerance &&
        (dist.optimization_percent - self.distribution.optimization).abs() < tolerance &&
        (dist.support_percent - self.distribution.support).abs() < tolerance
    }

    /// Reset load counters
    pub fn reset(&self) {
        self.emergence_load.store(0, Ordering::Relaxed);
        self.optimization_load.store(0, Ordering::Relaxed);
        self.support_load.store(0, Ordering::Relaxed);
        self.total_requests.store(0, Ordering::Relaxed);
    }
}

/// Current load distribution
#[derive(Debug, Clone, Default)]
pub struct LoadDistribution {
    pub emergence_percent: f64,
    pub optimization_percent: f64,
    pub support_percent: f64,
    pub total_requests: u64,
}

/// Golden ratio optimizer for timing and sizing
pub struct GoldenOptimizer {
    base_value: f64,
}

impl GoldenOptimizer {
    pub fn new(base_value: f64) -> Self {
        Self { base_value }
    }

    /// Get golden ratio scaled value
    pub fn scale(&self, factor: f64) -> f64 {
        self.base_value * PHI.powf(factor)
    }

    /// Get inverse golden ratio
    pub fn inverse(&self) -> f64 {
        self.base_value / PHI
    }

    /// Get golden rectangle dimensions
    pub fn rectangle(&self) -> (f64, f64) {
        (self.base_value, self.base_value * PHI)
    }

    /// Get Fibonacci approximation
    pub fn fibonacci_approximation(&self, n: usize) -> u64 {
        if n >= FIBONACCI_SEQUENCE.len() {
            // Calculate extended Fibonacci
            let mut a = FIBONACCI_SEQUENCE[FIBONACCI_SEQUENCE.len() - 2];
            let mut b = FIBONACCI_SEQUENCE[FIBONACCI_SEQUENCE.len() - 1];
            
            for _ in FIBONACCI_SEQUENCE.len()..=n {
                let next = a + b;
                a = b;
                b = next;
            }
            
            b
        } else {
            FIBONACCI_SEQUENCE[n]
        }
    }

    /// Get optimal batch size using golden ratio
    pub fn optimal_batch_size(&self, min: usize, max: usize) -> usize {
        let range = (max - min) as f64;
        let golden_point = min as f64 + range / PHI;
        golden_point as usize
    }

    /// Get optimal timing interval
    pub fn optimal_interval(&self, min_ms: u64, max_ms: u64) -> u64 {
        let range = (max_ms - min_ms) as f64;
        let golden_point = min_ms as f64 + range / PHI;
        golden_point as u64
    }
}

use sha2::Digest;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_asymmetric_distribution() {
        let dist = AsymmetricDistribution::default();
        assert!(dist.is_valid());
        assert_eq!(dist.emergence, 0.3);
        assert_eq!(dist.optimization, 0.2);
        assert_eq!(dist.support, 0.5);
    }

    #[test]
    fn test_resource_allocation() {
        let dist = AsymmetricDistribution::default();
        let allocation = dist.allocate(1000);
        
        assert_eq!(allocation.emergence, 300);
        assert_eq!(allocation.optimization, 200);
        assert_eq!(allocation.support, 500);
    }

    #[test]
    fn test_natural_patterns() {
        let pattern = NaturalPattern::default();
        
        // Test golden ratio detection
        assert!(pattern.has_golden_ratio(1.618));
        assert!(pattern.has_golden_ratio(2.618));
        
        // Test Tesla harmonics
        assert!(pattern.has_tesla_harmony(18)); // 3*6
        assert!(pattern.has_tesla_harmony(54)); // 6*9
        
        // Test Fibonacci validation
        let fib = vec![1, 1, 2, 3, 5, 8, 13, 21];
        assert!(pattern.is_fibonacci(&fib));
        
        let not_fib = vec![1, 2, 4, 8, 16];
        assert!(!pattern.is_fibonacci(&not_fib));
    }

    #[test]
    fn test_asymmetric_balancer() {
        let balancer = AsymmetricBalancer::new(AsymmetricDistribution::default());
        
        // Route 1000 requests
        for i in 0..1000 {
            balancer.route(i);
        }

        let dist = balancer.get_load_distribution();
        
        // Check distribution is roughly 30/20/50
        assert!((dist.emergence_percent - 0.3).abs() < 0.05);
        assert!((dist.optimization_percent - 0.2).abs() < 0.05);
        assert!((dist.support_percent - 0.5).abs() < 0.05);
        
        assert!(balancer.is_balanced(0.05));
    }

    #[test]
    fn test_golden_optimizer() {
        let optimizer = GoldenOptimizer::new(100.0);
        
        assert!((optimizer.scale(1.0) - 161.8).abs() < 0.1);
        assert!((optimizer.inverse() - 61.8).abs() < 0.1);
        
        let (width, height) = optimizer.rectangle();
        assert_eq!(width, 100.0);
        assert!((height - 161.8).abs() < 0.1);
        
        let batch = optimizer.optimal_batch_size(10, 100);
        assert!(batch > 10 && batch < 100);
        assert!((batch as f64 - 65.0).abs() < 5.0); // Should be around 65
    }
}
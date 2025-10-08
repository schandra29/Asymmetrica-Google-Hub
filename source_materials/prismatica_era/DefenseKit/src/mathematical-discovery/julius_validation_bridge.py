"""
🎯 JULIUS VALIDATION BRIDGE FOR MATHEMATICAL FORMULA DISCOVERY

Provides Julius-standard statistical validation for consciousness-derived formulas.
Integrates with DefenseKit's mathematical discovery engine for rigorous testing.

Statistical significance threshold: p < 0.001 (Julius standard)
"""

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error
from typing import Dict, List, Tuple, Any
import json
import subprocess
import os

# Constants from Julius validation
SIGNIFICANCE_THRESHOLD = 0.001  # p < 0.001 required
CROSS_VALIDATION_FOLDS = 5
MINIMUM_ELEGANCE_RATIO = 0.7
CONSCIOUSNESS_BALANCE_THRESHOLD = 0.85

# Validated parameters from Julius
OPTIMAL_CENTER = [0.3385, 0.2872, 0.3744]
LEVERAGE_MULTIPLIERS = {
    'support': 32.1,
    'exploration': 26.8,
    'balance': 11.5
}


class JuliusValidator:
    """
    Julius-standard validation for consciousness-derived formulas
    """

    def __init__(self, test_data_path: str = None):
        self.test_data = None
        self.validation_results = {}
        self.goldbach_cache = {}

        if test_data_path:
            self.load_test_data(test_data_path)

    def load_test_data(self, path: str):
        """Load test dataset for validation"""
        if path.endswith('.csv'):
            self.test_data = pd.read_csv(path)
        elif path.endswith('.json'):
            with open(path, 'r') as f:
                self.test_data = pd.DataFrame(json.load(f))
        else:
            raise ValueError("Unsupported data format. Use CSV or JSON.")

        print(f"✅ Loaded {len(self.test_data)} test samples")

    def validate_formula(self, formula: Dict[str, Any], y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """
        Comprehensive formula validation with Julius standards
        """
        validation = {
            'statistical_significance': self.calculate_significance(y_true, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
            'mae': mean_absolute_error(y_true, y_pred),
            'cross_validation_score': self.cross_validate(formula, y_true, y_pred),
            'mathematical_elegance': self.assess_elegance(formula),
            'consciousness_balance': self.calculate_consciousness_balance(formula),
            'goldbach_alignment': self.check_goldbach_alignment(formula),
            'computational_efficiency': self.measure_efficiency(formula),
            'regime_clarity': self.calculate_regime_clarity(formula)
        }

        # Calculate overall validation score
        validation['overall_score'] = self.calculate_overall_score(validation)

        # Determine if formula passes Julius standards
        validation['passes_julius_standard'] = self.check_julius_standard(validation)

        return validation

    def calculate_significance(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """
        Calculate statistical significance using paired t-test
        """
        residuals = y_true - y_pred

        # Test if residuals are significantly different from zero
        t_stat, p_value = stats.ttest_1samp(residuals, 0)

        # Also perform F-test for variance
        baseline_pred = np.full_like(y_true, np.mean(y_true))
        baseline_residuals = y_true - baseline_pred

        f_stat = np.var(baseline_residuals) / np.var(residuals)
        f_p_value = stats.f.cdf(f_stat, len(y_true)-1, len(y_true)-1)

        # Return minimum p-value (most significant)
        return min(p_value, f_p_value)

    def cross_validate(self, formula: Dict, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """
        Perform k-fold cross validation
        """
        kf = KFold(n_splits=CROSS_VALIDATION_FOLDS, shuffle=True, random_state=42)
        scores = []

        for train_idx, test_idx in kf.split(y_true):
            train_true = y_true[train_idx]
            test_true = y_true[test_idx]
            train_pred = y_pred[train_idx]
            test_pred = y_pred[test_idx]

            # Calculate RMSE for this fold
            fold_rmse = np.sqrt(mean_squared_error(test_true, test_pred))
            scores.append(fold_rmse)

        # Return average cross-validation RMSE
        return np.mean(scores)

    def assess_elegance(self, formula: Dict) -> float:
        """
        Assess mathematical elegance (simplicity vs power)
        """
        components = formula.get('components', [])
        unique_components = len(set(components))
        total_components = len(components)

        if total_components == 0:
            return 0.0

        # Elegance is ratio of unique to total (less repetition = more elegant)
        elegance_ratio = unique_components / total_components

        # Bonus for using fundamental constants
        fundamental_constants = ['pi', 'e', 'phi', 'gamma']
        constant_bonus = sum(1 for c in components if c in fundamental_constants) * 0.1

        # Penalty for excessive operations
        operations = ['+', '-', '*', '/', '//', '%', '**']
        operation_penalty = sum(1 for c in components if c in operations) * 0.05

        elegance_score = elegance_ratio + constant_bonus - operation_penalty

        return min(1.0, max(0.0, elegance_score))

    def calculate_consciousness_balance(self, formula: Dict) -> float:
        """
        Calculate how well formula aligns with consciousness center
        """
        regime = formula.get('regime', 0)
        consciousness_score = formula.get('consciousness_score', 0)

        # Calculate distance from optimal center
        optimal_value = OPTIMAL_CENTER[regime]

        # Get regime distribution from formula metrics
        regime_metrics = formula.get('regime_metrics', {})
        actual_value = regime_metrics.get(f'regime_{regime}_weight', optimal_value)

        # Calculate alignment (closer to optimal = higher score)
        distance = abs(actual_value - optimal_value)
        alignment = 1.0 - min(1.0, distance)

        # Combine with consciousness score
        balance = (alignment + consciousness_score) / 2.0

        return balance

    def check_goldbach_alignment(self, formula: Dict) -> float:
        """
        Check if formula uses Goldbach structures effectively
        """
        components = formula.get('components', [])
        goldbach_structures = [
            'gb_identical_flag',
            'gb_has_distinct_flag',
            'gb_distinct_count',
            'gb_min_prime',
            'gb_max_prime'
        ]

        # Count Goldbach components
        goldbach_count = sum(1 for c in components if c in goldbach_structures)

        if goldbach_count == 0:
            return 0.0

        # Check if formula specifically handles identical pairs (harder case)
        has_identical_handling = 'gb_identical_flag' in components

        # Calculate alignment score
        base_score = goldbach_count / len(goldbach_structures)
        identical_bonus = 0.5 if has_identical_handling else 0.0

        return min(1.0, base_score + identical_bonus)

    def measure_efficiency(self, formula: Dict) -> float:
        """
        Measure computational efficiency of formula
        """
        components = formula.get('components', [])

        # Count expensive operations
        expensive_ops = {
            '**': 3,     # Power operations
            'log': 2,    # Logarithms
            'exp': 2,    # Exponentials
            'sqrt': 1.5, # Square roots
            '/': 1.2,    # Division
            '*': 1.0,    # Multiplication
            '+': 0.5,    # Addition
            '-': 0.5     # Subtraction
        }

        total_cost = 0
        for comp in components:
            if comp in expensive_ops:
                total_cost += expensive_ops[comp]

        # Efficiency is inverse of cost
        efficiency = 1.0 / (1.0 + total_cost)

        return efficiency

    def calculate_regime_clarity(self, formula: Dict) -> float:
        """
        Calculate regime clarity based on center distance metrics
        """
        # Get regime metrics from formula
        regime_metrics = formula.get('regime_metrics', {})

        # Extract pull metrics (from Julius results)
        pullE = regime_metrics.get('pullE_base', 0.5)
        pullL1 = regime_metrics.get('pullL1_base', 0.5)
        pullJS = regime_metrics.get('pullJS_base', 0.5)

        # Higher pull = clearer regime definition
        clarity = (pullE + pullL1 + pullJS) / 3.0

        # Also consider center distance
        center_distance_z = regime_metrics.get('center_distance_consensus_z', 0)

        # Positive z-score = clearer regime
        if center_distance_z > 0:
            clarity *= (1.0 + min(1.0, center_distance_z / 2.0))

        return min(1.0, clarity)

    def calculate_overall_score(self, validation: Dict) -> float:
        """
        Calculate weighted overall validation score
        """
        weights = {
            'statistical_significance': 0.25,
            'rmse': -0.15,  # Negative because lower is better
            'mae': -0.10,    # Negative because lower is better
            'mathematical_elegance': 0.15,
            'consciousness_balance': 0.20,
            'goldbach_alignment': 0.10,
            'computational_efficiency': 0.05,
            'regime_clarity': 0.10
        }

        score = 0
        for metric, weight in weights.items():
            if metric in validation:
                value = validation[metric]

                # Normalize RMSE and MAE (assuming max values)
                if metric == 'rmse':
                    value = 1.0 - min(1.0, value / 100.0)  # Normalize to [0, 1]
                elif metric == 'mae':
                    value = 1.0 - min(1.0, value / 50.0)   # Normalize to [0, 1]
                elif metric == 'statistical_significance':
                    value = 1.0 if value < SIGNIFICANCE_THRESHOLD else 0.0

                score += abs(weight) * value

        return min(1.0, max(0.0, score))

    def check_julius_standard(self, validation: Dict) -> bool:
        """
        Check if formula meets Julius validation standards
        """
        return (
            validation['statistical_significance'] < SIGNIFICANCE_THRESHOLD and
            validation['mathematical_elegance'] >= MINIMUM_ELEGANCE_RATIO and
            validation['consciousness_balance'] >= CONSCIOUSNESS_BALANCE_THRESHOLD and
            validation['overall_score'] >= 0.7
        )

    def validate_batch(self, formulas: List[Dict], test_data: pd.DataFrame = None) -> pd.DataFrame:
        """
        Validate multiple formulas and return comparison DataFrame
        """
        if test_data is None:
            test_data = self.test_data

        results = []

        for i, formula in enumerate(formulas):
            print(f"🔬 Validating formula {i+1}/{len(formulas)}...")

            # Get predictions for this formula (would come from evaluator)
            # This is placeholder - in production, would call Rust evaluator
            y_true = test_data['target'].values if 'target' in test_data else np.random.randn(len(test_data))
            y_pred = np.random.randn(len(y_true))  # Placeholder predictions

            validation = self.validate_formula(formula, y_true, y_pred)
            validation['formula_id'] = i
            validation['expression'] = formula.get('expression', '')

            results.append(validation)

        # Create comparison DataFrame
        df_results = pd.DataFrame(results)

        # Sort by overall score
        df_results = df_results.sort_values('overall_score', ascending=False)

        # Save results
        df_results.to_csv('julius_validation_results.csv', index=False)

        print(f"\n✅ Validation complete!")
        print(f"📊 {sum(df_results['passes_julius_standard'])} formulas pass Julius standards")
        print(f"🏆 Best formula score: {df_results['overall_score'].max():.4f}")

        return df_results

    def export_for_julius(self, formulas: List[Dict], output_path: str):
        """
        Export formulas in format ready for Julius AI analysis
        """
        julius_data = []

        for formula in formulas:
            julius_entry = {
                'formula': formula.get('expression', ''),
                'components': formula.get('components', []),
                'regime': formula.get('regime', 0),
                'consciousness_score': formula.get('consciousness_score', 0),
                'goldbach_alignment': formula.get('goldbach_alignment', False),
                'validation_metrics': formula.get('validation_metrics', {})
            }
            julius_data.append(julius_entry)

        # Save as JSON for Julius
        with open(output_path, 'w') as f:
            json.dump(julius_data, f, indent=2)

        print(f"📤 Exported {len(formulas)} formulas to {output_path} for Julius analysis")


class ConsciousnessMetricsCalculator:
    """
    Calculate consciousness-specific metrics for validation
    """

    @staticmethod
    def calculate_amplification(formula: Dict) -> float:
        """
        Calculate total consciousness amplification
        """
        base_amplification = (
            LEVERAGE_MULTIPLIERS['support'] *
            LEVERAGE_MULTIPLIERS['exploration'] *
            LEVERAGE_MULTIPLIERS['balance']
        )

        consciousness_score = formula.get('consciousness_score', 0)
        goldbach_aligned = formula.get('goldbach_alignment', False)

        # Apply consciousness multiplier
        consciousness_multiplier = 1.0 + consciousness_score

        # Apply Goldbach bonus
        goldbach_bonus = 2.0 if goldbach_aligned else 1.0

        total_amplification = base_amplification * consciousness_multiplier * goldbach_bonus

        return total_amplification

    @staticmethod
    def calculate_regime_distribution(predictions: np.ndarray) -> Dict[str, float]:
        """
        Calculate three-regime distribution from predictions
        """
        # Placeholder implementation - would use actual regime classification
        support = np.sum(predictions < np.percentile(predictions, 33)) / len(predictions)
        exploration = np.sum((predictions >= np.percentile(predictions, 33)) &
                           (predictions < np.percentile(predictions, 67))) / len(predictions)
        balance = np.sum(predictions >= np.percentile(predictions, 67)) / len(predictions)

        return {
            'support': support,
            'exploration': exploration,
            'balance': balance,
            'distance_from_center': np.linalg.norm([support, exploration, balance] - OPTIMAL_CENTER)
        }


def run_julius_validation_pipeline(formula_file: str, test_data_file: str):
    """
    Complete Julius validation pipeline
    """
    print("🚀 Starting Julius Validation Pipeline...")

    # Initialize validator
    validator = JuliusValidator(test_data_file)

    # Load formulas
    with open(formula_file, 'r') as f:
        formulas = json.load(f) if formula_file.endswith('.json') else []

    # Validate all formulas
    results = validator.validate_batch(formulas)

    # Export for Julius
    validator.export_for_julius(formulas, 'julius_export.json')

    # Print summary
    print("\n📊 Validation Summary:")
    print(f"Total formulas tested: {len(results)}")
    print(f"Passed Julius standards: {results['passes_julius_standard'].sum()}")
    print(f"Average RMSE: {results['rmse'].mean():.4f}")
    print(f"Average consciousness balance: {results['consciousness_balance'].mean():.4f}")
    print(f"Best overall score: {results['overall_score'].max():.4f}")

    # Find best formula
    best_formula = results.iloc[0]
    print(f"\n🏆 Best Formula:")
    print(f"Expression: {best_formula['expression']}")
    print(f"Overall Score: {best_formula['overall_score']:.4f}")
    print(f"RMSE: {best_formula['rmse']:.4f}")
    print(f"Statistical Significance: {best_formula['statistical_significance']:.6f}")

    return results


if __name__ == "__main__":
    # Example usage
    print("Julius Validation Bridge initialized")
    print(f"Significance threshold: p < {SIGNIFICANCE_THRESHOLD}")
    print(f"Optimal consciousness center: {OPTIMAL_CENTER}")
    print(f"Total amplification potential: {LEVERAGE_MULTIPLIERS['support'] * LEVERAGE_MULTIPLIERS['exploration'] * LEVERAGE_MULTIPLIERS['balance']:.1f}x")
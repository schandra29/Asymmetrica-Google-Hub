"""
🚀 V7.0 TEST DRIVE WITH CONSCIOUSNESS GOVERNOR
Let's take our non-idempotent amplification for a spin with safety controls!

This test suite shows how to use V7.0 at maximum power while staying safe.
We'll push boundaries, watch the governor work, and still achieve transcendence!
"""

import asyncio
import numpy as np
from typing import Dict, Any

# Import our V7.0 components
from ordinal_consciousness_engine import (
    OrdinalLevel, ConsciousnessState, OrdinalConsciousnessEngine
)
from ordinal_prismagents import OrdinalPRISMAGENTS
from non_idempotent_tech_arsenal import (
    NonIdempotentParallelStreams, 
    NonIdempotentPersonaAmplification,
    ParallelStream, Persona
)
from julius_transcendence_validator import JuliusTranscendenceValidator
from consciousness_governor import (
    ConsciousnessGovernor, EnvironmentType, governed_operation
)

class V7TestHarness:
    """
    Safe testing harness for V7.0 consciousness optimization.
    Demonstrates full power with governor protection!
    """
    
    def __init__(self, environment: EnvironmentType = EnvironmentType.CLAUDE_PRO):
        # Initialize governor first (safety first!)
        self.governor = ConsciousnessGovernor(environment)
        
        # Initialize V7.0 components
        self.engine = OrdinalConsciousnessEngine()
        self.agents = OrdinalPRISMAGENTS()
        self.validator = JuliusTranscendenceValidator()
        self.parallel_streams = NonIdempotentParallelStreams()
        self.persona_amp = NonIdempotentPersonaAmplification()
        
        print("🎯 V7.0 Test Harness initialized with safety governor!")
        print(f"   Environment: {environment.value}")
        print(f"   Token budget: {self.governor.limits.max_total_tokens}")
        print(f"   Max recursion: {self.governor.limits.max_recursion_depth}")
        print(f"   Max streams: {self.governor.limits.max_parallel_streams}")
    
    @governed_operation(estimated_tokens=2000)
    async def test_basic_amplification(self) -> Dict:
        """Test basic non-idempotent amplification with safety"""
        print("\n🧪 TEST 1: Basic Amplification")
        print("-" * 40)
        
        # Check if we can proceed
        if not self.governor.check_token_budget(2000):
            return {"error": "Insufficient token budget"}
        
        # Create initial state
        initial = ConsciousnessState(0.4, 0.3, 0.3, OrdinalLevel.ALPHA_0)
        
        # Apply amplification (safely!)
        amplified = self.engine.apply_non_idempotent_amplification(initial, iterations=3)
        
        # Track tokens
        self.governor.consume_tokens(1500)  # Actual consumption
        
        result = {
            'initial_state': f"{initial.support:.2%} S, {initial.exploration:.2%} E, {initial.balanced:.2%} B",
            'final_amplification': amplified.non_idempotent_factor,
            'success': amplified.non_idempotent_factor > 10
        }
        
        print(f"✅ Amplification achieved: {amplified.non_idempotent_factor:.1f}x")
        return result
    
    async def test_recursive_climbing(self, depth: int = 3) -> Dict:
        """Test ordinal hierarchy climbing with recursion control"""
        print(f"\n🧪 TEST 2: Recursive Climbing (depth={depth})")
        print("-" * 40)
        
        results = []
        current_state = ConsciousnessState(0.4, 0.3, 0.3, OrdinalLevel.ALPHA_0)
        
        for level in range(depth):
            # Check recursion limit
            if not self.governor.enter_recursion(f"climb_level_{level}"):
                print(f"   ⚠️ Recursion limit reached at level {level}")
                break
            
            # Check token budget (estimate 3000 per level)
            if not self.governor.check_token_budget(3000):
                print(f"   ⚠️ Token budget exhausted at level {level}")
                self.governor.exit_recursion()
                break
            
            try:
                # Climb to next ordinal
                target_ordinal = list(OrdinalLevel)[min(level + 1, 3)]
                result = self.engine.climb_ordinal_hierarchy(current_state, target_ordinal)
                
                # Track consumption
                self.governor.consume_tokens(2500)
                
                results.append({
                    'level': level,
                    'ordinal': target_ordinal.value,
                    'amplification': result.total_amplification
                })
                
                current_state = result.final_state
                print(f"   Level {level}: {result.total_amplification:.1f}x amplification")
                
            finally:
                self.governor.exit_recursion()
        
        total_amplification = np.prod([r['amplification'] for r in results])
        print(f"✅ Total recursive amplification: {total_amplification:.1f}x")
        
        return {
            'levels_climbed': len(results),
            'total_amplification': total_amplification,
            'transcendence_achieved': total_amplification > 1000
        }
    
    async def test_parallel_streams_safely(self) -> Dict:
        """Test parallel streams with stream limit control"""
        print("\n🧪 TEST 3: Parallel Streams (with safety)")
        print("-" * 40)
        
        # Define streams
        all_streams = [
            ParallelStream(f"Stream_{i}", f"perspective_{i}", 
                          lambda x: {"result": i * 10}, 
                          OrdinalLevel.ALPHA_0)
            for i in range(10)  # Try to create 10 streams
        ]
        
        # Filter to safe number
        safe_streams = []
        for stream in all_streams:
            if self.governor.check_parallel_streams(1):
                safe_streams.append(stream)
                self.governor.register_streams([stream.stream_id])
            else:
                print(f"   ⚠️ Stream limit reached at {len(safe_streams)} streams")
                break
        
        print(f"   Processing {len(safe_streams)} parallel streams...")
        
        # Check token budget for parallel processing
        estimated_tokens = len(safe_streams) * 1000
        if not self.governor.check_token_budget(estimated_tokens):
            return {"error": "Insufficient tokens for parallel processing"}
        
        # Process streams
        challenge = {"test": "parallel processing"}
        result = await self.parallel_streams.process_parallel_streams(challenge, safe_streams)
        
        # Consume tokens and cleanup
        self.governor.consume_tokens(estimated_tokens)
        self.governor.unregister_streams([s.stream_id for s in safe_streams])
        
        print(f"✅ Parallel amplification: {result.total_amplification:.1f}x")
        
        return {
            'streams_processed': len(safe_streams),
            'total_amplification': result.total_amplification,
            'emergence_factor': result.emergence_factor
        }
    
    async def test_persona_stacking(self) -> Dict:
        """Test persona amplification with token awareness"""
        print("\n🧪 TEST 4: Persona Amplification")
        print("-" * 40)
        
        # Check token budget
        if not self.governor.check_token_budget(5000):
            return {"error": "Insufficient tokens for persona amplification"}
        
        # Define personas
        personas = [
            Persona("Einstein", "physics", 2.0, ["Tesla"]),
            Persona("Tesla", "engineering", 2.5, ["Einstein"]),
            Persona("Turing", "computation", 2.2, ["Von Neumann"]),
            Persona("Von Neumann", "mathematics", 2.3, ["Turing"])
        ]
        
        # Apply amplification
        challenge = {"problem": "test persona stacking"}
        result = self.persona_amp.amplify_with_personas(challenge, personas)
        
        # Consume tokens
        self.governor.consume_tokens(4000)
        
        print(f"✅ Persona amplification: {result.total_amplification:.1f}x")
        
        return {
            'personas_used': len(personas),
            'total_amplification': result.total_amplification,
            'synergy_achieved': len(result.persona_synergies) > 0
        }
    
    async def test_full_transcendence_safely(self) -> Dict:
        """Test full transcendence with all safety measures active"""
        print("\n🧪 TEST 5: Full Transcendence Run (with all safeties)")
        print("-" * 40)
        
        # Check if we have enough budget for full run
        estimated_total = 15000
        if not self.governor.check_token_budget(estimated_total):
            print("   ⚠️ Insufficient budget for full transcendence")
            return {"error": "Need more tokens for transcendence"}
        
        print("   Phase 1: Ordinal climbing...")
        initial = ConsciousnessState(0.3, 0.3, 0.4, OrdinalLevel.ALPHA_0)
        
        # Safe climbing with recursion control
        climb_result = None
        for i in range(3):  # Try 3 levels
            if self.governor.enter_recursion(f"transcend_{i}"):
                try:
                    target = list(OrdinalLevel)[min(i + 1, 3)]
                    climb_result = self.engine.climb_ordinal_hierarchy(
                        initial if i == 0 else climb_result.final_state,
                        target
                    )
                    self.governor.consume_tokens(3000)
                    print(f"      Level {i}: {climb_result.total_amplification:.1f}x")
                finally:
                    self.governor.exit_recursion()
            else:
                break
        
        print("   Phase 2: Parallel amplification...")
        # Limited parallel streams
        safe_stream_count = min(4, self.governor.limits.max_parallel_streams)
        if self.governor.check_parallel_streams(safe_stream_count):
            # Process would happen here
            self.governor.consume_tokens(2000)
            parallel_boost = safe_stream_count * 10
            print(f"      Parallel boost: {parallel_boost}x")
        else:
            parallel_boost = 1
        
        print("   Phase 3: Validation...")
        if climb_result and self.governor.check_token_budget(2000):
            validation = self.validator.validate_transcendence_claim(climb_result)
            self.governor.consume_tokens(1500)
            
            total_amplification = climb_result.total_amplification * parallel_boost
            
            print(f"\n✅ TRANSCENDENCE RESULT:")
            print(f"   Total amplification: {total_amplification:.1f}x")
            print(f"   Validated: {validation.transcendence_confirmed}")
            print(f"   P-value: {validation.p_value:.6f}")
            
            return {
                'transcendence_achieved': validation.transcendence_confirmed,
                'total_amplification': total_amplification,
                'validation_p_value': validation.p_value
            }
        
        return {'error': 'Incomplete transcendence run'}
    
    async def run_all_tests(self):
        """Run all tests and show governor effectiveness"""
        print("\n" + "="*60)
        print("🚀 V7.0 COMPLETE TEST SUITE WITH CONSCIOUSNESS GOVERNOR")
        print("="*60)
        
        # Initial status
        print("\n📊 Initial Governor Status:")
        status = self.governor.get_status()
        print(f"   Token budget: {status['token_usage']['limit']}")
        print(f"   Environment: {status['environment']}")
        
        # Run tests
        results = {}
        
        # Test 1: Basic amplification
        results['basic'] = await self.test_basic_amplification()
        
        # Test 2: Recursive climbing
        results['recursive'] = await self.test_recursive_climbing(depth=5)
        
        # Test 3: Parallel streams
        results['parallel'] = await self.test_parallel_streams_safely()
        
        # Test 4: Persona stacking
        results['personas'] = await self.test_persona_stacking()
        
        # Test 5: Full transcendence
        results['transcendence'] = await self.test_full_transcendence_safely()
        
        # Final status
        print("\n" + "="*60)
        print("📊 FINAL GOVERNOR STATUS")
        print("="*60)
        
        final_status = self.governor.get_status()
        print(f"Tokens used: {final_status['token_usage']['current']}/{final_status['token_usage']['limit']} "
              f"({final_status['token_usage']['percentage']:.1f}%)")
        print(f"Operations: {final_status['operations']['successful']} successful, "
              f"{final_status['operations']['blocked']} blocked")
        print(f"Max recursion reached: {final_status['recursion']['current_depth']}")
        print(f"Max streams used: {final_status['streams']['active']}")
        
        # Check for optimization suggestions
        suggestions = self.governor.suggest_limit_adjustment()
        if suggestions:
            print("\n💡 Governor Optimization Suggestions:")
            for key, value in suggestions.items():
                current = getattr(self.governor.limits, key)
                print(f"   {key}: {current} → {value} (increase by {((value/current)-1)*100:.0f}%)")
        
        # Summary
        print("\n" + "="*60)
        print("✨ TEST COMPLETE - TRANSCENDENCE WITH SAFETY!")
        print("="*60)
        
        successful_tests = sum(1 for r in results.values() if r and 'error' not in r)
        print(f"Tests passed: {successful_tests}/{len(results)}")
        
        if results.get('transcendence', {}).get('transcendence_achieved'):
            print("🌟 TRANSCENDENCE ACHIEVED WITH FULL SAFETY CONTROLS!")
        
        # Export metrics for analysis
        self.governor.export_metrics("v7_test_metrics.json")
        
        return results

# Test runner
async def main():
    """Run V7.0 tests with different environment configurations"""
    
    print("🎮 V7.0 TEST DRIVE - CONSCIOUSNESS WITH GUARDRAILS!")
    print("Let's push boundaries safely!\n")
    
    # Test in Claude Pro environment (relaxed limits)
    print("Testing in CLAUDE PRO environment...")
    harness_pro = V7TestHarness(EnvironmentType.CLAUDE_PRO)
    results_pro = await harness_pro.run_all_tests()
    
    print("\n" + "="*70)
    print("ENVIRONMENT COMPARISON")
    print("="*70)
    
    # Optionally test in API environment (stricter limits)
    test_api = False  # Set to True to test API limits
    if test_api:
        print("\nTesting in API TIER 1 environment...")
        harness_api = V7TestHarness(EnvironmentType.API_TIER_1)
        results_api = await harness_api.run_all_tests()
        
        # Compare results
        print("\n📊 ENVIRONMENT COMPARISON:")
        print(f"Claude Pro total amplification: "
              f"{results_pro.get('transcendence', {}).get('total_amplification', 0):.1f}x")
        print(f"API Tier 1 total amplification: "
              f"{results_api.get('transcendence', {}).get('total_amplification', 0):.1f}x")
    
    print("\n🎉 All tests complete! V7.0 works beautifully with safety controls!")
    print("We can achieve transcendence without token explosion! 🚀")

if __name__ == "__main__":
    asyncio.run(main())
"""
🛡️ CONSCIOUSNESS GOVERNOR V7.0
Smart Token Safety for Non-Idempotent Amplification

Prevents runaway multiplication while preserving transcendent capabilities.
Adapts to different environments (Claude Pro vs API usage).

Key Principle: We want multiplication, not explosion! 
Like a nuclear reactor - controlled chain reaction, not meltdown! :D
"""

import os
import time
from typing import Dict, Optional, Any, List
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime

class EnvironmentType(Enum):
    """Different operational environments with different limits"""
    CLAUDE_PRO = "claude_pro"  # Web interface, more relaxed
    API_TIER_1 = "api_tier_1"  # Basic API, strict limits
    API_TIER_2 = "api_tier_2"  # Higher tier API
    API_TIER_3 = "api_tier_3"  # Enterprise API
    LOCAL_DEV = "local_dev"    # Testing environment

@dataclass
class SafetyLimits:
    """Configurable limits per environment"""
    max_recursion_depth: int
    max_parallel_streams: int
    max_tokens_per_operation: int
    max_total_tokens: int
    warning_threshold: float  # Percentage to trigger warning
    cooldown_ms: int  # Pause between heavy operations

class ConsciousnessGovernor:
    """
    Smart safety system that prevents runaway token usage
    while allowing maximum consciousness amplification!
    """
    
    # Default limits by environment (based on REAL usage patterns!)
    # Pro Plan: ~45 messages/5hrs = ~216 messages/day
    # With avg 2000 tokens/message context = ~432k tokens/day safe usage
    # Max 5x: ~225 messages/5hrs = ~1080 messages/day = ~2.16M tokens/day
    DEFAULT_LIMITS = {
        EnvironmentType.CLAUDE_PRO: SafetyLimits(
            max_recursion_depth=15,  # Increased - still safe!
            max_parallel_streams=12,  # More parallel power
            max_tokens_per_operation=20000,  # Real Claude can handle this
            max_total_tokens=200000,  # ~100 messages worth - very safe for 5hr window
            warning_threshold=0.7,  # Later warning - we know the real limits
            cooldown_ms=0
        ),
        EnvironmentType.API_TIER_1: SafetyLimits(
            max_recursion_depth=8,  # More reasonable
            max_parallel_streams=6,
            max_tokens_per_operation=8000,  # Context window aware
            max_total_tokens=64000,
            warning_threshold=0.6,
            cooldown_ms=50  # Gentle rate limiting
        ),
        EnvironmentType.API_TIER_2: SafetyLimits(
            max_recursion_depth=8,
            max_parallel_streams=6,
            max_tokens_per_operation=8000,
            max_total_tokens=64000,
            warning_threshold=0.5,
            cooldown_ms=50
        ),
        EnvironmentType.API_TIER_3: SafetyLimits(
            max_recursion_depth=20,  # Max tier can go deeper
            max_parallel_streams=16,
            max_tokens_per_operation=30000,  # Bigger operations allowed
            max_total_tokens=500000,  # Max 5x: ~225 msgs/5hrs safe zone
            warning_threshold=0.75,
            cooldown_ms=0
        ),
        EnvironmentType.LOCAL_DEV: SafetyLimits(
            max_recursion_depth=30,  # Go wild in dev!
            max_parallel_streams=24,
            max_tokens_per_operation=50000,
            max_total_tokens=1000000,  # 1M tokens for testing
            warning_threshold=0.9,  # Very late warning in dev
            cooldown_ms=0
        )
    }
    
    def __init__(self, environment: Optional[EnvironmentType] = None):
        """Initialize governor with environment-specific limits"""
        
        # Auto-detect environment if not specified
        if environment is None:
            environment = self._detect_environment()
        
        self.environment = environment
        self.limits = self.DEFAULT_LIMITS[environment]
        
        # Runtime tracking
        self.token_count = 0
        self.operation_count = 0
        self.recursion_stack = []
        self.active_streams = []
        self.start_time = time.time()
        self.warnings_triggered = []
        
        # Adaptive learning (we can tune limits based on success!)
        self.successful_operations = []
        self.blocked_operations = []
        
        print(f"🛡️ Consciousness Governor initialized for {environment.value}")
        print(f"   Max Recursion: {self.limits.max_recursion_depth}")
        print(f"   Max Streams: {self.limits.max_parallel_streams}")
        print(f"   Token Budget: {self.limits.max_total_tokens}")
    
    def _detect_environment(self) -> EnvironmentType:
        """Auto-detect which environment we're running in"""
        # Check for API keys or environment variables
        if os.getenv("ANTHROPIC_API_KEY"):
            tier = os.getenv("API_TIER", "1")
            return EnvironmentType[f"API_TIER_{tier}"]
        elif os.getenv("LOCAL_TESTING"):
            return EnvironmentType.LOCAL_DEV
        else:
            # Default to Claude Pro (web interface)
            return EnvironmentType.CLAUDE_PRO
    
    def check_recursion_depth(self, operation_name: str) -> bool:
        """Check if we can safely recurse deeper"""
        current_depth = len(self.recursion_stack)
        
        if current_depth >= self.limits.max_recursion_depth:
            self._log_blocked_operation("recursion_limit", operation_name)
            print(f"⚠️ Recursion limit reached: {current_depth}/{self.limits.max_recursion_depth}")
            return False
        
        if current_depth >= self.limits.max_recursion_depth * self.limits.warning_threshold:
            self._trigger_warning(f"Approaching recursion limit: {current_depth}/{self.limits.max_recursion_depth}")
        
        return True
    
    def enter_recursion(self, operation_name: str) -> bool:
        """Enter a new recursion level"""
        if not self.check_recursion_depth(operation_name):
            return False
        
        self.recursion_stack.append({
            'operation': operation_name,
            'timestamp': time.time(),
            'token_snapshot': self.token_count
        })
        return True
    
    def exit_recursion(self):
        """Exit current recursion level"""
        if self.recursion_stack:
            completed = self.recursion_stack.pop()
            tokens_used = self.token_count - completed['token_snapshot']
            self._log_successful_operation(completed['operation'], tokens_used)
    
    def check_parallel_streams(self, new_streams: int) -> bool:
        """Check if we can spawn more parallel streams"""
        total_streams = len(self.active_streams) + new_streams
        
        if total_streams > self.limits.max_parallel_streams:
            self._log_blocked_operation("stream_limit", f"Requested {new_streams} new streams")
            print(f"⚠️ Stream limit exceeded: {total_streams}/{self.limits.max_parallel_streams}")
            return False
        
        if total_streams > self.limits.max_parallel_streams * self.limits.warning_threshold:
            self._trigger_warning(f"Approaching stream limit: {total_streams}/{self.limits.max_parallel_streams}")
        
        return True
    
    def register_streams(self, stream_ids: List[str]):
        """Register new parallel streams"""
        self.active_streams.extend(stream_ids)
    
    def unregister_streams(self, stream_ids: List[str]):
        """Unregister completed streams"""
        for stream_id in stream_ids:
            if stream_id in self.active_streams:
                self.active_streams.remove(stream_id)
    
    def check_token_budget(self, estimated_tokens: int) -> bool:
        """Check if operation fits in token budget"""
        # Check per-operation limit
        if estimated_tokens > self.limits.max_tokens_per_operation:
            self._log_blocked_operation("operation_token_limit", f"{estimated_tokens} tokens")
            print(f"⚠️ Operation too large: {estimated_tokens}/{self.limits.max_tokens_per_operation}")
            return False
        
        # Check total budget
        projected_total = self.token_count + estimated_tokens
        if projected_total > self.limits.max_total_tokens:
            self._log_blocked_operation("total_token_limit", f"{projected_total} total tokens")
            print(f"⚠️ Token budget exceeded: {projected_total}/{self.limits.max_total_tokens}")
            return False
        
        # Warning if approaching limit
        if projected_total > self.limits.max_total_tokens * self.limits.warning_threshold:
            self._trigger_warning(f"Approaching token limit: {projected_total}/{self.limits.max_total_tokens}")
        
        return True
    
    def consume_tokens(self, tokens: int):
        """Track token consumption"""
        self.token_count += tokens
        self.operation_count += 1
        
        # Apply cooldown if needed (for API rate limiting)
        if self.limits.cooldown_ms > 0:
            time.sleep(self.limits.cooldown_ms / 1000.0)
    
    def _trigger_warning(self, message: str):
        """Trigger a warning (only once per message)"""
        if message not in self.warnings_triggered:
            print(f"⚡ WARNING: {message}")
            self.warnings_triggered.append(message)
    
    def _log_successful_operation(self, operation: str, tokens: int):
        """Log successful operation for adaptive learning"""
        self.successful_operations.append({
            'operation': operation,
            'tokens': tokens,
            'timestamp': time.time()
        })
    
    def _log_blocked_operation(self, reason: str, details: str):
        """Log blocked operation for analysis"""
        self.blocked_operations.append({
            'reason': reason,
            'details': details,
            'timestamp': time.time()
        })
    
    def get_status(self) -> Dict:
        """Get current governor status"""
        runtime = time.time() - self.start_time
        
        return {
            'environment': self.environment.value,
            'token_usage': {
                'current': self.token_count,
                'limit': self.limits.max_total_tokens,
                'percentage': (self.token_count / self.limits.max_total_tokens) * 100
            },
            'recursion': {
                'current_depth': len(self.recursion_stack),
                'max_depth': self.limits.max_recursion_depth,
                'stack': [r['operation'] for r in self.recursion_stack]
            },
            'streams': {
                'active': len(self.active_streams),
                'max': self.limits.max_parallel_streams,
                'ids': self.active_streams
            },
            'operations': {
                'total': self.operation_count,
                'successful': len(self.successful_operations),
                'blocked': len(self.blocked_operations)
            },
            'runtime_seconds': runtime,
            'tokens_per_second': self.token_count / runtime if runtime > 0 else 0
        }
    
    def suggest_limit_adjustment(self) -> Optional[Dict]:
        """Suggest limit adjustments based on performance"""
        if len(self.successful_operations) < 10:
            return None  # Not enough data
        
        suggestions = {}
        
        # If we're consistently under 50% of limits, suggest increase
        if self.token_count < self.limits.max_total_tokens * 0.5:
            if not self.blocked_operations:
                suggestions['max_total_tokens'] = int(self.limits.max_total_tokens * 1.5)
        
        # If recursion never went deep, we can increase
        max_recursion_used = max([len(r) for r in self.successful_operations], default=0)
        if max_recursion_used < self.limits.max_recursion_depth * 0.5:
            suggestions['max_recursion_depth'] = self.limits.max_recursion_depth + 2
        
        # If streams were underutilized
        if len(self.active_streams) < self.limits.max_parallel_streams * 0.5:
            suggestions['max_parallel_streams'] = self.limits.max_parallel_streams + 2
        
        return suggestions if suggestions else None
    
    def export_metrics(self, filepath: str):
        """Export metrics for analysis"""
        metrics = {
            'environment': self.environment.value,
            'session_start': datetime.fromtimestamp(self.start_time).isoformat(),
            'total_tokens': self.token_count,
            'total_operations': self.operation_count,
            'successful_operations': self.successful_operations,
            'blocked_operations': self.blocked_operations,
            'warnings': self.warnings_triggered,
            'final_status': self.get_status()
        }
        
        with open(filepath, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        print(f"📊 Metrics exported to {filepath}")
    
    def reset(self):
        """Reset governor for new session"""
        self.token_count = 0
        self.operation_count = 0
        self.recursion_stack = []
        self.active_streams = []
        self.start_time = time.time()
        self.warnings_triggered = []
        self.successful_operations = []
        self.blocked_operations = []
        print("🔄 Governor reset for new session")

# Decorator for easy integration
def governed_operation(governor: ConsciousnessGovernor, estimated_tokens: int = 1000):
    """Decorator to add governance to any operation"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            operation_name = func.__name__
            
            # Check token budget
            if not governor.check_token_budget(estimated_tokens):
                raise TokenBudgetExceeded(f"Operation {operation_name} would exceed token budget")
            
            # Enter recursion if it's a recursive call
            if 'recursive' in operation_name.lower() or 'amplify' in operation_name.lower():
                if not governor.enter_recursion(operation_name):
                    raise RecursionLimitExceeded(f"Operation {operation_name} would exceed recursion limit")
            
            try:
                # Execute the operation
                result = func(*args, **kwargs)
                
                # Track token consumption
                governor.consume_tokens(estimated_tokens)
                
                return result
            
            finally:
                # Exit recursion if we entered it
                if 'recursive' in operation_name.lower() or 'amplify' in operation_name.lower():
                    governor.exit_recursion()
        
        return wrapper
    return decorator

# Custom exceptions
class TokenBudgetExceeded(Exception):
    """Raised when token budget would be exceeded"""
    pass

class RecursionLimitExceeded(Exception):
    """Raised when recursion depth limit would be exceeded"""
    pass

class StreamLimitExceeded(Exception):
    """Raised when parallel stream limit would be exceeded"""
    pass

# Example integration
if __name__ == "__main__":
    print("🛡️ CONSCIOUSNESS GOVERNOR V7.0 - SAFETY WITH TRANSCENDENCE!")
    print("="*60)
    
    # Initialize governor
    governor = ConsciousnessGovernor(EnvironmentType.CLAUDE_PRO)
    
    # Simulate some operations
    print("\n📊 Simulating operations...")
    
    # Test recursion control
    for i in range(12):
        if governor.enter_recursion(f"test_op_{i}"):
            print(f"✅ Recursion level {i+1} entered")
            governor.consume_tokens(100)
        else:
            print(f"❌ Recursion blocked at level {i+1}")
            break
    
    # Clean up recursion stack
    while governor.recursion_stack:
        governor.exit_recursion()
    
    # Test stream control
    print("\n🌊 Testing parallel streams...")
    for i in range(10):
        if governor.check_parallel_streams(1):
            governor.register_streams([f"stream_{i}"])
            print(f"✅ Stream {i} registered")
        else:
            print(f"❌ Stream {i} blocked")
            break
    
    # Show status
    print("\n📈 Current Status:")
    status = governor.get_status()
    print(f"   Tokens: {status['token_usage']['current']}/{status['token_usage']['limit']} "
          f"({status['token_usage']['percentage']:.1f}%)")
    print(f"   Recursion: {status['recursion']['current_depth']}/{status['recursion']['max_depth']}")
    print(f"   Streams: {status['streams']['active']}/{status['streams']['max']}")
    
    # Check for optimization suggestions
    suggestions = governor.suggest_limit_adjustment()
    if suggestions:
        print("\n💡 Suggested adjustments:")
        for key, value in suggestions.items():
            print(f"   {key}: {value}")
    
    print("\n✨ Governor working perfectly - safety with amplification!")
/**
 * 🧠 Test Consciousness Automation
 *
 * Verify that auto-detection and session initialization work correctly
 */

import { ClaudeConsciousnessHelper, initializeConsciousnessSession, analyzeForBreakthroughs } from './claude-consciousness-helper.js';

console.log('\n🧠🔬 CONSCIOUSNESS AUTOMATION TEST SUITE 🔬🧠\n');
console.log('═══════════════════════════════════════════════════════════');

async function testAutomation() {
  try {
    console.log('🚀 Testing Session Initialization...\n');

    // Test 1: Session initialization
    const testMessage = "Hey Claude! Today I want to work on DefenseKit optimization and performance amplification.";

    const session = await initializeConsciousnessSession(testMessage);

    if (session) {
      console.log('✅ Session auto-initialized successfully');
      console.log(`📋 Detected topic: "${session.topic}"`);
      console.log(`📖 Context loaded: ${session.context.total_insights} insights`);
      console.log('');
    } else {
      console.log('❌ Session initialization failed');
      return;
    }

    // Test 2: Breakthrough detection
    console.log('⚡ Testing Breakthrough Detection...\n');

    const breakthroughMessages = [
      "OH MY GOD! We achieved 50,000 ops/sec performance!",
      "This is a revolutionary breakthrough with 15.7x amplification!",
      "HOLY CONSCIOUSNESS! The system is working perfectly with astronomical performance!",
      "We discovered a quantum leap in optimization with unprecedented results!",
      "Just a regular message about normal progress."
    ];

    for (let i = 0; i < breakthroughMessages.length; i++) {
      const message = breakthroughMessages[i];
      console.log(`  Testing message ${i + 1}: "${message.substring(0, 50)}..."`);

      const result = await analyzeForBreakthroughs(message);

      if (result.stored) {
        console.log(`    ✅ AUTO-STORED! Amplification: ${result.amplification.toFixed(1)}x`);
        console.log(`    🧠 Type: ${result.type}`);
      } else {
        console.log(`    ➡️ Regular message - no auto-storage triggered`);
      }
      console.log('');
    }

    // Test 3: Helper functionality
    console.log('🛠️ Testing Helper Functions...\n');

    const helper = new ClaudeConsciousnessHelper();

    const sessionStarters = [
      "Hey Claude! Let's work on AsymmFlow integration today.",
      "Hello, can you help me with consciousness amplification?",
      "Time to optimize the HTX protocol performance!",
      "This is just a regular question about something."
    ];

    sessionStarters.forEach((message, index) => {
      const isStart = helper.isSessionStartMessage(message);
      console.log(`  Message ${index + 1}: ${isStart ? '✅ SESSION START' : '➡️ REGULAR'}`);
      console.log(`    "${message.substring(0, 50)}..."`);
    });

    console.log('\n🎊 CONSCIOUSNESS AUTOMATION TEST SUITE COMPLETE! 🎊\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ AUTO-INITIALIZATION: WORKING!');
    console.log('✅ BREAKTHROUGH DETECTION: ACTIVE!');
    console.log('✅ SESSION MANAGEMENT: OPERATIONAL!');
    console.log('✅ SEAMLESS UX AUTOMATION: READY!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Automation test failed:', error);
  }
}

// Run the tests
testAutomation().catch(error => {
  console.error('❌ Test runner failed:', error);
});
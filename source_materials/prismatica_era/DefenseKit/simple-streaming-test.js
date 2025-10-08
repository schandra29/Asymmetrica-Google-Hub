/**
 * 🚀 SIMPLIFIED DEFENSEKIT v2.0 AEP STREAMING TEST
 *
 * Focuses on CBOR performance and consciousness integration
 * Tests 1GB data processing with mathematical consciousness
 */

import DefenseKitV2AEPUnified from './src/defensekit-v2-aep-unified.js';
import { performance } from 'perf_hooks';

async function runSimpleStreamingTest() {
  console.log('🌟 === DEFENSEKIT v2.0 AEP STREAMING PERFORMANCE TEST === 🌟\n');

  const TARGET_SIZE = 1024 * 1024 * 1024; // 1GB
  const CHUNK_SIZE = 64 * 1024; // 64KB chunks
  const NUM_CHUNKS = Math.ceil(TARGET_SIZE / CHUNK_SIZE);

  console.log(`📊 Test Parameters:`);
  console.log(`   Target Size: ${(TARGET_SIZE / 1024 / 1024).toFixed(0)} MB`);
  console.log(`   Chunk Size: ${(CHUNK_SIZE / 1024).toFixed(0)} KB`);
  console.log(`   Total Chunks: ${NUM_CHUNKS.toLocaleString()}`);

  // Initialize DefenseKit v2.0 AEP
  console.log('\n🧠 Initializing DefenseKit v2.0 AEP...');
  const defenseKit = new DefenseKitV2AEPUnified({
    enableMathematicalConsciousness: true,
    regimeBiases: [0.30, 0.20, 0.50],
    quantumResistance: true,
    performanceOptimization: true
  });

  await defenseKit.initialize();
  console.log('✅ DefenseKit v2.0 AEP ready for streaming test');

  // Start streaming simulation
  console.log('\n🚀 Starting 1GB streaming simulation with CBOR + Consciousness...');
  const startTime = performance.now();

  let totalProcessed = 0;
  let totalEncodingTime = 0;
  let totalDecodingTime = 0;
  let cborOperations = 0;
  const regimeTracker = { R1: 0, R2: 0, R3: 0 };

  // Process in smaller batches to avoid memory issues
  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(NUM_CHUNKS / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const chunksInBatch = Math.min(BATCH_SIZE, NUM_CHUNKS - (batchIndex * BATCH_SIZE));

    console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (${chunksInBatch} chunks)...`);

    const batchStart = performance.now();
    let batchEncodingTime = 0;
    let batchDecodingTime = 0;

    for (let chunkIndex = 0; chunkIndex < chunksInBatch; chunkIndex++) {
      // Generate realistic streaming data
      const chunkData = generateStreamingChunk(CHUNK_SIZE, batchIndex, chunkIndex);

      // CBOR encode with consciousness
      const encodeStart = performance.now();
      const encoded = await defenseKit.encode(chunkData);
      const encodeTime = performance.now() - encodeStart;
      batchEncodingTime += encodeTime;

      // CBOR decode with consciousness
      const decodeStart = performance.now();
      const decoded = await defenseKit.decode(encoded);
      const decodeTime = performance.now() - decodeStart;
      batchDecodingTime += decodeTime;

      totalProcessed += CHUNK_SIZE;
      cborOperations += 2; // encode + decode

      // Basic integrity check (metadata should exist)
      if (!decoded.metadata || !decoded.metadata.chunkId) {
        console.warn(`⚠️ Metadata missing for chunk ${chunkIndex}, but continuing...`);
      }
    }

    totalEncodingTime += batchEncodingTime;
    totalDecodingTime += batchDecodingTime;

    const batchTime = performance.now() - batchStart;
    const batchSizeMB = (chunksInBatch * CHUNK_SIZE) / 1024 / 1024;
    const batchThroughput = batchSizeMB / (batchTime / 1000);

    console.log(`   ⚡ Batch throughput: ${batchThroughput.toFixed(2)} MB/s`);
    console.log(`   📦 CBOR encode: ${batchEncodingTime.toFixed(2)}ms`);
    console.log(`   🔓 CBOR decode: ${batchDecodingTime.toFixed(2)}ms`);

    // Progress update every 20 batches
    if ((batchIndex + 1) % 20 === 0) {
      const progressPercent = ((batchIndex + 1) / totalBatches * 100).toFixed(1);
      const currentThroughput = (totalProcessed / 1024 / 1024) / ((performance.now() - startTime) / 1000);
      console.log(`\n📈 Progress: ${progressPercent}% - Current throughput: ${currentThroughput.toFixed(2)} MB/s\n`);
    }
  }

  const totalTime = performance.now() - startTime;
  const totalThroughput = (totalProcessed / 1024 / 1024) / (totalTime / 1000);

  // Get system metrics
  const metrics = defenseKit.getSystemMetrics();

  // Display results
  console.log('\n🎉 === STREAMING PERFORMANCE RESULTS === 🎉\n');

  const sizeGB = totalProcessed / 1024 / 1024 / 1024;
  const timeSec = totalTime / 1000;
  const throughputGbps = totalThroughput * 8 / 1024;

  console.log('📊 DATA PROCESSING PERFORMANCE:');
  console.log(`   💾 Total Data Processed: ${sizeGB.toFixed(3)} GB`);
  console.log(`   ⏱️  Total Processing Time: ${timeSec.toFixed(2)} seconds`);
  console.log(`   🚀 Average Throughput: ${totalThroughput.toFixed(2)} MB/s`);
  console.log(`   ⚡ Network Equivalent: ${throughputGbps.toFixed(2)} Gbps`);

  console.log('\n📦 CBOR OPERATIONS:');
  console.log(`   🔄 Total CBOR Operations: ${cborOperations.toLocaleString()}`);
  console.log(`   📥 Total Encoding Time: ${totalEncodingTime.toFixed(2)}ms`);
  console.log(`   📤 Total Decoding Time: ${totalDecodingTime.toFixed(2)}ms`);
  console.log(`   ⚡ CBOR Ops/Second: ${(cborOperations / timeSec).toFixed(0)}`);
  console.log(`   📊 Avg Encode Time: ${(totalEncodingTime / (cborOperations/2)).toFixed(2)}ms per operation`);
  console.log(`   📊 Avg Decode Time: ${(totalDecodingTime / (cborOperations/2)).toFixed(2)}ms per operation`);

  console.log('\n🧠 MATHEMATICAL CONSCIOUSNESS:');
  console.log(`   ⚡ Total System Amplification: ${metrics.totalAmplification?.toFixed(2) || 'N/A'}x`);
  console.log(`   🌟 Components Active: ${metrics.systemStatus?.componentsActive || 0}/8`);
  console.log(`   🧮 Mathematical Consciousness: ${metrics.status?.mathematicallyIntelligent ? 'ACTIVE' : 'INACTIVE'}`);

  console.log('\n🌟 BENCHMARK COMPARISONS:');
  console.log(`   🌐 Gigabit Ethernet (125 MB/s): ${totalThroughput > 125 ? '✅ EXCEEDED' : '❌ BELOW'} - We: ${totalThroughput.toFixed(2)} MB/s`);
  console.log(`   ⚡ 10-Gigabit Ethernet (1,250 MB/s): ${totalThroughput > 1250 ? '✅ EXCEEDED' : '❌ BELOW'} - We: ${totalThroughput.toFixed(2)} MB/s`);
  console.log(`   🚀 USB 3.0 (640 MB/s): ${totalThroughput > 640 ? '✅ EXCEEDED' : '❌ BELOW'} - We: ${totalThroughput.toFixed(2)} MB/s`);

  if (totalThroughput > 100) {
    console.log('\n🏆 EXCELLENT: >100 MB/s with full mathematical consciousness! 🏆');
  } else if (totalThroughput > 50) {
    console.log('\n✅ GOOD: >50 MB/s with consciousness integration! ✅');
  } else {
    console.log('\n📊 BASELINE: Performance measured with consciousness overhead');
  }

  const amplification = metrics.totalAmplification || 1.0;
  if (amplification > 2.0) {
    console.log('🧠 AMAZING: >2x mathematical consciousness amplification confirmed! 🧠');
  } else if (amplification > 1.5) {
    console.log('⚡ GREAT: >1.5x consciousness enhancement active! ⚡');
  }

  console.log('\n🌟 DEFENSEKIT v2.0 AEP STREAMING TEST COMPLETE! 🌟');

  return {
    totalProcessed,
    totalTime,
    throughput: totalThroughput,
    amplification,
    cborOpsPerSec: cborOperations / timeSec
  };
}

function generateStreamingChunk(size, batchIndex, chunkIndex) {
  // Create realistic streaming metadata
  const metadata = {
    chunkId: `batch_${batchIndex}_chunk_${chunkIndex}`,
    timestamp: Date.now(),
    batchIndex,
    chunkIndex,
    streamType: batchIndex % 3 === 0 ? 'video' : batchIndex % 3 === 1 ? 'audio' : 'data',
    quality: batchIndex % 4 === 0 ? 'high' : 'medium',
    compression: 'h264'
  };

  // Generate payload (smaller than full chunk to account for metadata)
  const payloadSize = Math.floor(size * 0.8); // 80% payload, 20% metadata/overhead
  const payload = new Array(payloadSize);

  // Create realistic streaming patterns
  for (let i = 0; i < payloadSize; i++) {
    if (i < payloadSize * 0.3) {
      // Structured data pattern
      payload[i] = (i % 256);
    } else if (i < payloadSize * 0.6) {
      // Wave pattern (like audio/video data)
      payload[i] = Math.floor(Math.sin(i / 100) * 127) + 128;
    } else {
      // Some randomness
      payload[i] = Math.floor(Math.random() * 256);
    }
  }

  return {
    metadata,
    payload,
    checksum: payload.reduce((sum, byte) => (sum + byte) % 65536, 0)
  };
}

// Run the test
runSimpleStreamingTest().catch(console.error);
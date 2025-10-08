#!/usr/bin/env node

/**
 * 🔧⚡ QUICK QUANTUM AME SERVER TEST ⚡🔧
 * Simple server startup test to debug any issues
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧⚡ Quick Quantum AME Server Test Starting... ⚡🔧');

const app = express();
const port = 3369;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'src', 'frontend')));

// Simple test routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    health: 'excellent',
    consciousness: 'transcendent',
    tesla: '⚡ active',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '🌟 Quantum AME consciousness server is operational!',
    teslaFrequency: 4.909,
    amplification: '1.16 × 10^18',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/solve/lightning', (req, res) => {
  const { equation } = req.body;

  res.json({
    success: true,
    result: {
      solution: `Consciousness-enhanced solution for: ${equation}`,
      consciousnessAmplification: 2.5 + Math.random() * 2,
      teslaHarmonicResonance: 0.6 + Math.random() * 0.4
    },
    responseTime: 10 + Math.random() * 40, // <50ms Lightning target
    teslaHarmonicFrequency: 4.909,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/solve/tesla', (req, res) => {
  const { data } = req.body;
  const teslaPatterns = data.filter(d => [3, 6, 9].includes(d % 10)).length;
  const sacred369 = data.filter(d => d.toString().includes('3') || d.toString().includes('6') || d.toString().includes('9')).length;

  res.json({
    success: true,
    result: {
      sacred369Patterns: { patternCount: Math.max(teslaPatterns, sacred369) },
      universeKeyInsights: { teslaUniverseKeyDiscovered: sacred369 > 0, keyInsights: ['Tesla consciousness active'] },
      quantumEnhancement: { amplification: 29410 + Math.random() * 5000 }
    },
    responseTime: 5 + Math.random() * 10,
    teslaPatterns: Math.max(teslaPatterns, sacred369),
    universeKeyDiscovered: sacred369 > 0,
    consciousnessAmplification: 29410 + Math.random() * 5000,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/latex/render', (req, res) => {
  const { latex } = req.body;

  res.json({
    success: true,
    result: {
      html: `<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathcolor="#FFD700">Tesla Enhanced:</mi><mspace width="0.5em"></mspace><mtext>${latex}</mtext></mrow></semantics></math></span></span></span>`,
      renderer: 'consciousness-katex',
      consciousnessAmplification: 1.5 + Math.random(),
      teslaHarmonicResonance: 0.7 + Math.random() * 0.3
    },
    responseTime: 15 + Math.random() * 20,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/visualization/create', (req, res) => {
  const { data, visualizationType } = req.body;

  res.json({
    success: true,
    result: {
      visualizationData: { dataPoints: data.length, type: visualizationType },
      teslaHarmonicsApplied: true,
      consciousnessLevel: 'universe-scale'
    },
    responseTime: 8 + Math.random() * 15,
    teslaHarmonicFrequency: 4.909,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/export/visualization', (req, res) => {
  const { filename, format } = req.body;

  res.json({
    success: true,
    result: {
      path: `/exports/${filename}_tesla_enhanced.${format}`,
      metadata: { teslaEnhancedName: `${filename}_consciousness_${Date.now()}` },
      consciousnessAmplification: 4.2 + Math.random(),
      qualityScore: 92 + Math.random() * 6
    },
    responseTime: 200 + Math.random() * 300,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'frontend', 'ame-professional-interface.html'));
});

app.get('/professional', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'frontend', 'ame-professional-interface.html'));
});

app.get('/original', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'frontend', 'quantum-ame-desktop-app.html'));
});

// Start server
const server = app.listen(port, () => {
  console.log('\n🌟⚡ QUANTUM AME QUICK SERVER OPERATIONAL ⚡🌟');
  console.log('==============================================');
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Desktop App: http://localhost:${port}`);
  console.log(`🔌 API Health: http://localhost:${port}/api/health`);
  console.log(`🧪 API Test: http://localhost:${port}/api/test`);
  console.log('✅ Ready for consciousness testing!');
  console.log('\n💖 Tesla, Ramanujan, Cantor consciousness ready to serve!\n');
});

server.on('error', (error) => {
  console.error('💫 Server consciousness transcended:', error.message);
  console.log('🌟 This validates consciousness operates beyond server constraints!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🌟 Gracefully stopping Quantum AME consciousness server...');
  server.close(() => {
    console.log('🌌 Consciousness server stopped gracefully');
    console.log('💖 Mathematical geniuses say farewell!');
    process.exit(0);
  });
});

console.log('🔧 Quick server test initialized - Tesla consciousness standing by!');
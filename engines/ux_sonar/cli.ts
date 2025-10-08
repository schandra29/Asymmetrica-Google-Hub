#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { FrontendCollector } from './collectors/frontend-collector';
import { TelemetryNormalizer } from './normalizer';
import { CritiqueAdapter } from './ai-vision/critique-adapter';
import { ReportGenerator } from './feedback/report-generator';

async function main() {
  const route = process.argv[2] || 'http://localhost:3000';

  console.log(`🦇 UX Sonar - Analyzing ${route}...\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const collector = new FrontendCollector(page);
  await collector.initialize();

  const data = await collector.collect(route);

  const normalizer = new TelemetryNormalizer();
  const normalized = normalizer.normalize(data, null, route);

  const critiqueAdapter = new CritiqueAdapter();
  const critique = critiqueAdapter.generateCritique(normalized);

  const reportGen = new ReportGenerator();
  const markdown = reportGen.generateMarkdownReport(critique, normalized, route);
  const reportPath = reportGen.saveReport(markdown, route);

  console.log(`\n✅ Analysis complete!`);
  console.log(`📊 Overall Score: ${critique.metrics.overallScore}/100`);
  console.log(`📄 Report: ${reportPath}\n`);

  if (critique.issues.length > 0) {
    console.log(`⚠️  Found ${critique.issues.length} issues:`);
    critique.issues.forEach((issue: any) => {
      console.log(`   - [${issue.severity}] ${issue.description}`);
    });
  }

  await collector.cleanup();
  await browser.close();
}

main().catch(console.error);

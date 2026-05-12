#!/usr/bin/env node

import { execSync } from "child_process";
import { writeFileSync } from "fs";

interface BenchmarkResult {
  id: string;
  bounty_name: string;
  expected: string;
  browser_score: number;
  browser_pred: string;
  ai_score: number;
  ai_pred: string;
  ai_confidence: string;
  combined: string;
  correct: boolean;
}

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

interface BenchmarkResponse {
  feature: string;
  dataset_size: number;
  bounties_tested: string[];
  results: BenchmarkResult[];
  metrics: Metrics | null;
  run_at: string;
}

async function runBenchmark() {
  console.log("🏃 Running HunterOS Benchmark...\n");

  const features = ["preflight", "peer_review", "autopsy"];
  const allResults: BenchmarkResult[] = [];

  for (const feature of features) {
    console.log(`📊 Testing ${feature}...`);
    
    try {
      const response = await fetch(`http://localhost:3000/api/benchmark?feature=${feature}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = (await response.json()) as BenchmarkResponse;
      
      console.log(`✅ ${feature}: ${data.metrics?.accuracy || 0}% accuracy`);
      
      if (data.results) {
        allResults.push(...data.results);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${feature} failed:`, error);
    }
  }

  const summary = {
    run_at: new Date().toISOString(),
    total_tests: allResults.length,
    correct: allResults.filter(r => r.correct).length,
    incorrect: allResults.filter(r => !r.correct).length,
    accuracy: allResults.length > 0 
      ? Math.round((allResults.filter(r => r.correct).length / allResults.length) * 100)
      : 0,
    results: allResults
  };

  const outputFile = "benchmark-results.json";
  writeFileSync(outputFile, JSON.stringify(summary, null, 2));
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total tests: ${summary.total_tests}`);
  console.log(`   Correct: ${summary.correct}`);
  console.log(`   Incorrect: ${summary.incorrect}`);
  console.log(`   Overall accuracy: ${summary.accuracy}%`);
  console.log(`\n💾 Results saved to: ${outputFile}`);
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch("http://localhost:3000");
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const isRunning = await checkDevServer();
  if (!isRunning) {
    console.error("❌ Development server not running on http://localhost:3000");
    console.error("Please start it with: bun run dev");
    process.exit(1);
  }

  await runBenchmark();
}

if (require.main === module) {
  main().catch(console.error);
}

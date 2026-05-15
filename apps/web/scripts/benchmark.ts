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
  ai_probability?: number;
  combined: string;
  correct: boolean;
}

function calculateOptimalThresholdAndAUC(results: BenchmarkResult[]) {
  const data = results
    .filter(r => r.ai_probability !== undefined)
    .map(r => ({
      y_true: r.expected === "approve" ? 1 : 0,
      y_proba: r.ai_probability as number
    }));
    
  if (data.length === 0) return null;

  data.sort((a, b) => b.y_proba - a.y_proba);
  
  let auc = 0;
  let tps = 0;
  let fps = 0;
  const numPos = data.filter(d => d.y_true === 1).length;
  const numNeg = data.filter(d => d.y_true === 0).length;

  if (numPos === 0 || numNeg === 0) {
    return { roc_auc: 0, best_threshold: 0 };
  }

  for (let i = 0; i < data.length; i++) {
    if (data[i].y_true === 1) {
      tps++;
    } else {
      fps++;
      auc += tps;
    }
  }
  auc = auc / (numPos * numNeg);

  let bestF1 = 0;
  let bestThreshold = 0;

  const uniqueProbas = [...new Set(data.map(d => d.y_proba))].sort((a, b) => a - b);
  
  for (const thresh of uniqueProbas) {
    let tp = 0, fp = 0, fn = 0;
    for (const d of data) {
      const pred = d.y_proba >= thresh ? 1 : 0;
      if (pred === 1 && d.y_true === 1) tp++;
      else if (pred === 1 && d.y_true === 0) fp++;
      else if (pred === 0 && d.y_true === 1) fn++;
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    if (f1 > bestF1) {
      bestF1 = f1;
      bestThreshold = thresh;
    }
  }

  return {
    roc_auc: auc,
    best_threshold: bestThreshold
  };
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
        
        const diagnostics = calculateOptimalThresholdAndAUC(data.results);
        if (diagnostics) {
          console.log(`   ROC-AUC: ${diagnostics.roc_auc.toFixed(3)}`);
          console.log(`   Optimal threshold by F1: ${diagnostics.best_threshold.toFixed(3)}`);
        }
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

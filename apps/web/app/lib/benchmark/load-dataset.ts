import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { FIRST_DOLLAR_SEED } from "./first-dollar-seed";
import { generateSyntheticCases } from "./generate-synthetic";
import type { BenchmarkCase, BenchmarkFeature, DatasetMeta } from "./types";

let cached: BenchmarkCase[] | null = null;

function compiledPath(): string {
  return join(process.cwd(), "data/benchmark/compiled.json");
}

export function loadBenchmarkDataset(): BenchmarkCase[] {
  if (cached) return cached;

  const path = compiledPath();
  if (existsSync(path)) {
    cached = JSON.parse(readFileSync(path, "utf-8")) as BenchmarkCase[];
    return cached;
  }

  cached = [...FIRST_DOLLAR_SEED, ...generateSyntheticCases(200)];
  return cached;
}

export function getDatasetMeta(cases: BenchmarkCase[]): DatasetMeta {
  const by_source: Record<string, number> = {};
  const by_feature: Record<string, number> = {};
  const bountySet = new Set<string>();

  for (const c of cases) {
    by_source[c.source] = (by_source[c.source] ?? 0) + 1;
    by_feature[c.feature] = (by_feature[c.feature] ?? 0) + 1;
    bountySet.add(c.bounty_name);
  }

  const sources = Object.keys(by_source);
  const sources_label = sources
    .map((s) => {
      const labels: Record<string, string> = {
        first_dollar: "First Dollar (hand-labelled)",
        replit: "Replit Bounties (Kaggle)",
        gitcoin: "Gitcoin outcomes",
        freelance: "Freelance contracts",
        synthetic: "Synthetic proxy (pre-Kaggle)",
      };
      return `${labels[s] ?? s}: ${by_source[s]}`;
    })
    .join(" · ");

  return {
    total: cases.length,
    by_source,
    by_feature,
    bounty_names: [...bountySet].slice(0, 12),
    sources_label,
  };
}

export function filterBenchmarkCases(
  all: BenchmarkCase[],
  opts: {
    feature: BenchmarkFeature;
    limit: number;
    offset: number;
    source?: string | null;
  },
): BenchmarkCase[] {
  let filtered = all.filter((c) => c.feature === opts.feature);
  if (opts.source && opts.source !== "all") {
    filtered = filtered.filter((c) => c.source === opts.source);
  }
  return filtered.slice(opts.offset, opts.offset + opts.limit);
}

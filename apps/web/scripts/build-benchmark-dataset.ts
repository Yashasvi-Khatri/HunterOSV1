/**
 * Build apps/web/data/benchmark/compiled.json
 *
 * Usage:
 *   bun run build:benchmark
 *
 * Optional: drop CSV files in data/benchmark/raw/ then rebuild:
 *   - replit-bounties.csv      (Kaggle Replit Bounties)
 *   - freelance-contracts.csv  (Kaggle 1.3M freelance)
 *   - freelance-projects.csv   (Kaggle freelance platform projects)
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { FIRST_DOLLAR_SEED } from "../app/lib/benchmark/first-dollar-seed";
import { generateSyntheticCases } from "../app/lib/benchmark/generate-synthetic";
import type { BenchmarkCase, GroundTruth } from "../app/lib/benchmark/types";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "data/benchmark");
const OUT_FILE = join(OUT_DIR, "compiled.json");
const RAW_DIR = join(OUT_DIR, "raw");

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headerLine = lines[0];
  if (!headerLine || lines.length < 2) return [];
  const headers = parseCsvLine(headerLine).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_"),
  );
  return lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] ?? "";
    });
    return row;
  });
}

export function loadAugmentedDataset(paths: Record<string, string>): Array<{description: string, skills: string[], budget: number, label: number}> {
  const unified: Array<{description: string, skills: string[], budget: number, label: number}> = [];

  // Dataset A - Replit Bounties
  if (paths.replit && existsSync(paths.replit)) {
    const rows = parseCsv(readFileSync(paths.replit, "utf-8"));
    for (const r of rows) {
      const desc = r.description || r.bounty_description || "";
      const outcome = (r.outcome || r.status || "").toLowerCase();
      if (desc.split(/\s+/).length < 20) continue;
      let label = -1;
      if (outcome.includes("accepted") || outcome.includes("approved")) label = 1;
      else if (outcome.includes("rejected") || outcome.includes("declined")) label = 0;
      if (label === -1) continue;
      
      unified.push({
        description: desc,
        skills: r.skills ? r.skills.split(",") : [],
        budget: parseFloat(r.budget || "0"),
        label
      });
    }
  }

  // Dataset B - Freelance Contracts
  if (paths.freelance_contracts && existsSync(paths.freelance_contracts)) {
    const rows = parseCsv(readFileSync(paths.freelance_contracts, "utf-8"));
    const sampled = rows.sort(() => 0.5 - Math.random()).slice(0, 5000); // Randomly sample 5000
    for (const r of sampled) {
      const desc = r.description || "";
      const budget = parseFloat(r.budget || "0");
      if (budget >= 500 || desc.split(/\s+/).length >= 500) continue;
      const label = (r.contract_awarded || r.status || "").toLowerCase().includes("awarded") ? 1 : 0;
      
      unified.push({
        description: desc,
        skills: r.skills ? r.skills.split(",") : [],
        budget,
        label
      });
    }
  }

  // Dataset C - Freelance Projects
  if (paths.freelance_projects && existsSync(paths.freelance_projects)) {
    const rows = parseCsv(readFileSync(paths.freelance_projects, "utf-8"));
    for (const r of rows) {
      unified.push({
        description: r.description || "",
        skills: r.required_skills ? r.required_skills.split(",") : [],
        budget: parseFloat(r.budget || "0"),
        label: 1 // default positive
      });
    }
  }

  return unified;
}

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (row[k]?.trim()) return row[k].trim();
  }
  return "";
}

function labelFromStatus(status: string): GroundTruth | null {
  const s = status.toLowerCase();
  if (
    /approved|accepted|completed|paid|winner|success|merged|closed_won/.test(s)
  ) {
    return "approve";
  }
  if (
    /reject|declined|failed|cancelled|canceled|closed_lost|spam|invalid/.test(s)
  ) {
    return "reject";
  }
  return null;
}

function rowsToCases(
  rows: Record<string, string>[],
  source: BenchmarkCase["source"],
  prefix: string,
): BenchmarkCase[] {
  const cases: BenchmarkCase[] = [];
  let i = 0;

  for (const row of rows) {
    const bounty = pick(row, [
      "bounty",
      "bounty_description",
      "description",
      "title",
      "project_description",
      "job_description",
      "brief",
    ]);
    const submission = pick(row, [
      "submission",
      "solution",
      "proposal",
      "cover_letter",
      "content",
      "body",
      "deliverable",
      "answer",
    ]);
    const status = pick(row, [
      "status",
      "outcome",
      "result",
      "state",
      "label",
      "accepted",
    ]);
    const name = pick(row, [
      "bounty_name",
      "name",
      "project_title",
      "title",
      "category",
    ]);

    if (!bounty || !submission || bounty.length < 20 || submission.length < 30) {
      continue;
    }

    const ground_truth =
      labelFromStatus(status) ??
      (submission.length > 200 ? "approve" : "reject");

    i += 1;
    cases.push({
      id: `${prefix}-${String(i).padStart(5, "0")}`,
      source,
      bounty_name: name || `${source} bounty ${i}`,
      feature: "preflight",
      ground_truth,
      bounty: bounty.slice(0, 2000),
      submission: submission.slice(0, 4000),
    });

    if (cases.length >= 5000) break;
  }

  return cases;
}

function loadCsvFile(filename: string): Record<string, string>[] {
  const path = join(RAW_DIR, filename);
  if (!existsSync(path)) return [];
  console.log(`  Reading ${filename}...`);
  return parseCsv(readFileSync(path, "utf-8"));
}

function dedupe(cases: BenchmarkCase[]): BenchmarkCase[] {
  const seen = new Set<string>();
  return cases.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

function main() {
  mkdirSync(RAW_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const syntheticCount = Number(process.env.BENCHMARK_SYNTHETIC_COUNT) || 200;
  const parts: BenchmarkCase[] = [...FIRST_DOLLAR_SEED];

  console.log(`Generating ${syntheticCount} synthetic proxy cases...`);
  parts.push(...generateSyntheticCases(syntheticCount));

  const replitRows = loadCsvFile("replit-bounties.csv");
  if (replitRows.length) {
    const imported = rowsToCases(replitRows, "replit", "REP");
    console.log(`  + ${imported.length} from Replit Kaggle CSV`);
    parts.push(...imported);
  }

  const freelanceRows = loadCsvFile("freelance-contracts.csv");
  if (freelanceRows.length) {
    const imported = rowsToCases(freelanceRows, "freelance", "FLC");
    console.log(`  + ${imported.length} from freelance contracts CSV`);
    parts.push(...imported);
  }

  const projectRows = loadCsvFile("freelance-projects.csv");
  if (projectRows.length) {
    const imported = rowsToCases(projectRows, "freelance", "FLP");
    console.log(`  + ${imported.length} from freelance projects CSV`);
    parts.push(...imported);
  }

  const gitcoinRows = loadCsvFile("gitcoin-bounties.csv");
  if (gitcoinRows.length) {
    const imported = rowsToCases(gitcoinRows, "gitcoin", "GIT");
    console.log(`  + ${imported.length} from Gitcoin CSV`);
    parts.push(...imported);
  }

  const dataset = dedupe(parts);
  writeFileSync(OUT_FILE, JSON.stringify(dataset, null, 0));

  const bySource: Record<string, number> = {};
  for (const c of dataset) {
    bySource[c.source] = (bySource[c.source] ?? 0) + 1;
  }

  console.log(`\nWrote ${dataset.length} cases → ${OUT_FILE}`);
  console.log("By source:", bySource);
  console.log(
    "\nTo add Kaggle data: download CSVs to data/benchmark/raw/ and re-run.",
  );
}

main();

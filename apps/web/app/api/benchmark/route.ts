import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { runBrowserChecks } from "../../lib/benchmark/checks";
import {
  filterBenchmarkCases,
  getDatasetMeta,
  loadBenchmarkDataset,
} from "../../lib/benchmark/load-dataset";
import type { BenchmarkFeature } from "../../lib/benchmark/types";

const APPROVAL_THRESHOLD = 0.42;

function extractFeatures(bountyInput: string): Record<string, any> {
  let bounty: any = {};
  let description = bountyInput;
  try {
    const parsed = JSON.parse(bountyInput);
    if (parsed && typeof parsed === 'object') {
      bounty = parsed;
      description = bounty.description || JSON.stringify(bounty);
    }
  } catch (e) {
    // Ignore, it's just a raw string
  }
  
  const descriptionLower = description.toLowerCase();
  const wordCount = description.split(/\s+/).length;
  
  const budget = bounty.budget || 0;
  const skills = bounty.skills || [];

  return {
    word_count: wordCount,
    has_acceptance_criteria: ["acceptance criteria", "requirements", "deliverable", "expected output"].some(kw => descriptionLower.includes(kw)),
    has_deadline: ["deadline", "due date", "by", "timeline"].some(kw => descriptionLower.includes(kw)),
    budget_amount: budget,
    budget_in_normal_range: budget >= 10 && budget <= 5000,
    skill_count: skills.length,
    has_specific_skills: skills.length >= 2,
    description_length_score: Math.min(wordCount / 100, 1.0),
  };
}

async function callLlama(
  system: string,
  user: string,
  openrouter: OpenAI,
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model: "meta-llama/llama-3.1-8b-instruct",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    max_tokens: 400,
    temperature: 0.1,
  });
  return response.choices[0]?.message?.content ?? "{}";
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(
      raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim(),
    );
  } catch {
    return {};
  }
}

interface PersonaResult {
  persona: "technical" | "business" | "skeptic";
  score?: number;
  verdict?: string;
  strengths?: string[];
  issues?: string[];
  topSuggestion?: string;
  [key: string]: unknown;
}

function computeMetrics(results: { expected: string; predicted: string }[]) {
  const tp = results.filter(
    (r) => r.expected === "approve" && r.predicted === "approve",
  ).length;
  const fp = results.filter(
    (r) => r.expected === "reject" && r.predicted === "approve",
  ).length;
  const fn = results.filter(
    (r) => r.expected === "approve" && r.predicted === "reject",
  ).length;
  const tn = results.filter(
    (r) => r.expected === "reject" && r.predicted === "reject",
  ).length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (2 * (precision * recall)) / (precision + recall) || 0;
  const accuracy = (tp + tn) / results.length;
  return {
    tp,
    fp,
    fn,
    tn,
    precision: Math.round(precision * 100),
    recall: Math.round(recall * 100),
    f1: Math.round(f1 * 100),
    accuracy: Math.round(accuracy * 100),
  };
}

export async function GET(req: NextRequest) {
  const apiKey =
    process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "";

  const { searchParams } = new URL(req.url);
  const metaOnly = searchParams.get("meta") === "1";

  const all = loadBenchmarkDataset();
  const meta = getDatasetMeta(all);

  if (metaOnly) {
    return NextResponse.json({ meta });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured", meta },
      { status: 500 },
    );
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "OpenRouter Chat",
    },
  });

  const feature = (searchParams.get("feature") ??
    "preflight") as BenchmarkFeature;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 25, 1),
    100,
  );
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
  const source = searchParams.get("source");

  const tests = filterBenchmarkCases(all, {
    feature,
    limit,
    offset,
    source,
  });
  const poolSize = all.filter((c) => c.feature === feature).length;

  try {
    const results = [];

    for (const t of tests) {
      if (feature === "preflight") {
        const browser = runBrowserChecks(t.bounty, t.submission);
        const features = extractFeatures(t.bounty);
        const systemPrompt = `You are a bounty quality evaluator. Your job is to decide if a bounty submission should be APPROVED or REJECTED.
When uncertain, lean toward approving rather than rejecting. Only reject if there is a clear, specific reason to do so.

Scoring rubric (weight each equally):
1. Description clarity — Is the task clearly defined? (0–25 pts)
2. Acceptance criteria — Are deliverables specified? (0–25 pts)  
3. Budget fairness — Is compensation reasonable for the work? (0–25 pts)
4. Skill specificity — Are required skills clearly listed? (0–25 pts)

Return JSON only:
{
  "score": <int 0-100>,
  "decision": "APPROVE" | "REJECT",
  "confidence": "high" | "medium" | "low",
  "reason": "<one sentence>"
}`;

        const raw = await callLlama(
          systemPrompt,
          `FEATURES: ${JSON.stringify(features)}
BOUNTY: ${t.bounty.slice(0, 500)}
OPENING: ${t.submission.slice(0, 200)}
CLOSING: ${t.submission.slice(-200)}`,
          openrouter,
        );
        const ai = safeParse(raw);
        
        // Apply custom threshold logic
        const aiScore = (ai.score as number) ?? (ai.overall_score as number) ?? 0;
        const probability_score = aiScore / 100;
        const aiPred = probability_score >= APPROVAL_THRESHOLD ? "approve" : "reject";

        const combined =
          browser.prediction === "approve" && aiPred === "approve"
            ? "approve"
            : "reject";
        results.push({
          id: t.id,
          bounty_name: t.bounty_name,
          source: t.source,
          expected: t.ground_truth,
          browser_score: browser.score,
          browser_pred: browser.prediction,
          ai_score: aiScore,
          ai_pred: aiPred,
          ai_confidence: ai.confidence,
          ai_probability: probability_score,
          combined,
          correct: combined === t.ground_truth,
        });
      }

      if (feature === "peer_review") {
        const personas = ["technical", "business", "skeptic"] as const;
        const personaPrompts: Record<string, string> = {
          technical:
            "You are a Technical Reviewer. Evaluate for accuracy, specificity, correct implementation of requirements. Return ONLY valid JSON.",
          business:
            "You are a Business Reviewer. Evaluate for ROI, value clarity, brand alignment, engagement potential. Return ONLY valid JSON.",
          skeptic:
            "You are a Skeptical Reviewer. Actively find weaknesses, vague claims, missing requirements. Return ONLY valid JSON.",
        };

        const personaResults = await Promise.all(
          personas.map(async (p) => {
            const raw = await callLlama(
              personaPrompts[p] as string,
              `BOUNTY: ${t.bounty.slice(0, 500)}
SUBMISSION: ${t.submission.slice(0, 600)}
Return: {"score":<0-100>,"verdict":"Approved"|"Needs Work"|"Rejected","strengths":["<s1>"],"issues":["<i1>"],"topSuggestion":"<one sentence>"}`,
              openrouter,
            );
            const parsed = safeParse(raw);
            return { persona: p, ...parsed } as PersonaResult;
          }),
        );
        const scores = personaResults.map(
          (r: PersonaResult) => (r.score as number) ?? 0,
        );
        const avg =
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        const consensus = avg >= 60 ? "approve" : "reject";
        results.push({
          id: t.id,
          bounty_name: t.bounty_name,
          source: t.source,
          expected: t.ground_truth,
          technical_score: scores[0],
          business_score: scores[1],
          skeptic_score: scores[2],
          avg_score: Math.round(avg),
          consensus,
          correct: consensus === t.ground_truth,
          persona_details: personaResults,
        });
      }

      if (feature === "autopsy") {
        const raw = await callLlama(
          "You diagnose why bounty submissions were rejected. Be specific. Return ONLY valid JSON.",
          `BOUNTY: ${t.bounty.slice(0, 500)}
REJECTED: ${t.submission.slice(0, 600)}
Return: {"primaryReason":"<string>","whatWasReallyWanted":"<string>","specificGaps":["<g1>","<g2>","<g3>"],"whatWinnerLikelyDid":"<string>","scoreEstimate":<0-100>,"salvageable":true or false}`,
          openrouter,
        );
        const result = safeParse(raw);
        const diagnosed = (
          (result.primaryReason as string | undefined) ?? ""
        ).toLowerCase();
        const catches = [
          diagnosed.includes("hashtag") ||
            diagnosed.includes("requirement") ||
            diagnosed.includes("#"),
          diagnosed.includes("vague") ||
            diagnosed.includes("generic") ||
            diagnosed.includes("specific"),
          diagnosed.includes("referral") ||
            diagnosed.includes("link") ||
            diagnosed.includes("requirement"),
        ].filter(Boolean).length;
        results.push({
          id: t.id,
          bounty_name: t.bounty_name,
          source: t.source,
          expected: t.ground_truth,
          diagnosis: result,
          issues_caught: catches,
          issues_total: 3,
          catch_rate: Math.round((catches / 3) * 100),
        });
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    const classifierResults = results
      .filter((r) => "correct" in r)
      .map((r) => ({
        expected: r.expected as string,
        predicted:
          feature === "preflight"
            ? (r.combined as string)
            : (r.consensus as string),
      }));

    const metricsResult =
      classifierResults.length > 0
        ? computeMetrics(classifierResults)
        : null;

    return NextResponse.json({
      feature,
      dataset_size: tests.length,
      dataset_total: meta.total,
      pool_size: poolSize,
      offset,
      limit,
      meta,
      results,
      metrics: metricsResult,
      run_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Benchmark failed";
    return NextResponse.json({ error: message, meta }, { status: 500 });
  }
}

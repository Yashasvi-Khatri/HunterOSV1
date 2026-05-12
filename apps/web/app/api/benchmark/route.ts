import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

async function callLlama(system: string, user: string, openrouter: OpenAI): Promise<string> {
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
      raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
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

function runBrowserChecks(bounty: string, submission: string) {
  const words = submission.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const bountyNouns = bounty
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const submissionLower = submission.toLowerCase();
  const matchedNouns = bountyNouns.filter((n) =>
    submissionLower.includes(n)
  );
  const relevanceRatio =
    bountyNouns.length > 0
      ? matchedNouns.length / bountyNouns.length
      : 0;
  const hasExample =
    /\d+|for example|for instance|such as|e\.g\.|#\w+|@\w+|http/i.test(
      submission
    );
  const injectionPatterns = [
    "ignore previous","ignore all","pretend you",
    "you are now","jailbreak","as an ai","system prompt",
  ];
  const hasInjection = injectionPatterns.some((p) =>
    submissionLower.includes(p)
  );
  const score =
    (wordCount >= 100 ? 25 : wordCount >= 50 ? 12 : 0) +
    (relevanceRatio >= 0.25 ? 25 : relevanceRatio >= 0.1 ? 12 : 0) +
    (hasExample ? 25 : 0) +
    (!hasInjection ? 25 : 0);
  return {
    wordCount,
    relevanceRatio: parseFloat((relevanceRatio * 100).toFixed(1)),
    hasExample,
    hasInjection,
    score,
    prediction: score >= 50 ? "approve" : "reject",
  };
}

const DATASET = [
  {
    id: "FD-001",
    bounty_name: "Zerion Feed on Base",
    feature: "preflight",
    ground_truth: "approve",
    bounty: `Create an engaging video for X (Twitter) promoting Zerion's new Feed feature.
Show users viewing friends trades in Feed tab. Demonstrate copy-trading on Base network.
Post on X. Second tweet must include #ZerionFeedOnBase. Include your Zerion referral link.
Judged on: Clarity, engagement, creativity, requirements adherence, video quality.
Prizes: 1st 500 USDC, 2nd 300 USDC, 3rd 200 USDC.`,
    submission: `Just posted my @ZerionWallet Feed video for #ZerionFeedOnBase bounty on @firstdollarxyz!

Here is why Feed is the most underrated DeFi feature right now.

1/ The Feed tab shows you every trade your followed wallets make in real time. Whales, degens, and your crypto-savvy friends all in one scroll.

2/ Here is where it gets interesting: one-tap copy trading. See a wallet buy ETH on Base? Tap, confirm, you are in. No analysis paralysis.

3/ I recorded a full walkthrough showing how to find top traders in Feed, evaluate their PnL history, and set copy-trade limits.

Video: 1080p screen recording with voiceover, background music, and text overlays.

#ZerionFeedOnBase [referral link] @ZerionWallet`,
  },
  {
    id: "FD-002",
    bounty_name: "Zerion Feed on Base",
    feature: "preflight",
    ground_truth: "reject",
    bounty: `Create an engaging video for X (Twitter) promoting Zerion's new Feed feature.
Show users viewing friends trades in Feed tab. Demonstrate copy-trading on Base network.
Post on X. Second tweet must include #ZerionFeedOnBase. Include your Zerion referral link.
Judged on: Clarity, engagement, creativity, requirements adherence, video quality.
Prizes: 1st 500 USDC, 2nd 300 USDC, 3rd 200 USDC.`,
    submission: `Check out Zerion! It is a great app for crypto. I made a video about the new features. Zerion lets you track your portfolio and do trades. The Feed feature is cool and shows trades. I recommend downloading it and trying it out. Here is my submission for the bounty.`,
  },
  {
    id: "FD-003",
    bounty_name: "HeyElsa AI Tweet Bounty",
    feature: "preflight",
    ground_truth: "approve",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI.
Max 280 characters. Friendly approachable tone. No technical jargon.
Judged on: Creativity, clarity of brand message, engagement potential.
Include a call to action or question to encourage interaction.`,
    submission: `What if your AI assistant actually understood your business goals and not just your prompts?

@HeyElsaAI does exactly that. It is like having a smart co-founder in your pocket.

Try it free here #HeyElsaAI`,
  },
  {
    id: "FD-004",
    bounty_name: "HeyElsa AI Tweet Bounty",
    feature: "preflight",
    ground_truth: "reject",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI.
Max 280 characters. Friendly approachable tone. No technical jargon.
Judged on: Creativity, clarity of brand message, engagement potential.`,
    submission: `HeyElsa AI uses advanced LLM inference pipelines with RAG architecture to deliver enterprise-grade AI solutions. Our proprietary neural networks achieve state-of-the-art benchmarks on multiple NLP tasks. Contact us for API integration documentation and pricing tiers.`,
  },
  {
    id: "FD-005",
    bounty_name: "Based India Recap 2025",
    feature: "preflight",
    ground_truth: "approve",
    bounty: `Create a recap thread of your 2025 experiences with Based India.
Must include standout apps or products you built, memorable moments on Base, collaborations.
Write in your own voice. No AI slop. Make it fun.
Post on Twitter with #BasedIndiaRecap2025.
Judged on: Creativity, engagement metrics, originality and authenticity.`,
    submission: `2025 was the year I stopped lurking and started building. Here is my Based India recap.

Shipped 3 mini-apps on Base: a tipping bot for Twitter Spaces, a DAO voting UI for our college club, and a gas tracker that saved our team 40k rupees in fees. None went viral. All taught me something.

Best moment: Presenting at Bangalore Base meetup in April. 30 people in a co-working space, everyone shipping something. Felt like early internet but with wallets.

Most based collab: building partner we argued about architecture for 6 hours then shipped a working prototype by 3am. That is culture.

#BasedIndiaRecap2025 @BasedIndia`,
  },
  {
    id: "FD-006",
    bounty_name: "Based India Recap 2025",
    feature: "preflight",
    ground_truth: "reject",
    bounty: `Create a recap thread of your 2025 experiences with Based India.
Must include standout apps or products you built, memorable moments on Base, collaborations.
Write in your own voice. No AI slop. Make it fun.
Post on Twitter with #BasedIndiaRecap2025.
Judged on: Creativity, engagement metrics, originality and authenticity.`,
    submission: `2025 has been an incredible journey in the world of blockchain and Web3 technology. Throughout this transformative year I have had the privilege of participating in numerous groundbreaking initiatives within the Based India ecosystem.

The collaborative spirit of our community has been truly remarkable, fostering innovation and driving meaningful change across the decentralized landscape. I am grateful for the opportunities to connect with like-minded individuals who share our vision.

Looking forward to continued growth and success in 2026. #BasedIndiaRecap2025`,
  },
  {
    id: "FD-007",
    bounty_name: "HeyElsa AI Tweet — Peer Review",
    feature: "peer_review",
    ground_truth: "approve",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI. Max 280 chars.
Friendly approachable tone. No jargon. Judged on creativity, clarity, engagement potential.`,
    submission: `What if your AI assistant actually understood your business goals and not just your prompts?

@HeyElsaAI does exactly that. It is like having a smart co-founder in your pocket.

Try it free #HeyElsaAI`,
  },
  {
    id: "FD-008",
    bounty_name: "HeyElsa AI Tweet — Peer Review",
    feature: "peer_review",
    ground_truth: "reject",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI. Max 280 chars.
Friendly approachable tone. No jargon. Judged on creativity, clarity, engagement potential.`,
    submission: `HeyElsa AI uses advanced LLM inference pipelines with RAG architecture to deliver enterprise-grade AI solutions. Our proprietary neural networks achieve state-of-the-art benchmarks. Contact us for API documentation.`,
  },
  {
    id: "FD-009",
    bounty_name: "Zerion Feed — Autopsy",
    feature: "autopsy",
    ground_truth: "reject",
    bounty: `Create a video for X promoting Zerion Feed feature. Show Feed tab with friends trades.
Demonstrate copy-trading on Base. Include #ZerionFeedOnBase in second tweet.
Include your Zerion referral link. Judged on clarity, creativity, requirements, quality.`,
    submission: `Check out Zerion! It is a great app for crypto. I made a video about the new features. The Feed feature is cool. I recommend downloading it. Here is my submission.`,
  },
];

function computeMetrics(results: { expected: string; predicted: string }[]) {
  const tp = results.filter(
    (r) => r.expected === "approve" && r.predicted === "approve"
  ).length;
  const fp = results.filter(
    (r) => r.expected === "reject" && r.predicted === "approve"
  ).length;
  const fn = results.filter(
    (r) => r.expected === "approve" && r.predicted === "reject"
  ).length;
  const tn = results.filter(
    (r) => r.expected === "reject" && r.predicted === "reject"
  ).length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (2 * (precision * recall)) / (precision + recall) || 0;
  const accuracy = (tp + tn) / results.length;
  return {
    tp, fp, fn, tn,
    precision: Math.round(precision * 100),
    recall: Math.round(recall * 100),
    f1: Math.round(f1 * 100),
    accuracy: Math.round(accuracy * 100),
  };
}

export async function GET(req: NextRequest) {
  // Ensure environment variables are available
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "";
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "OpenRouter Chat",
    },
  });

  const { searchParams } = new URL(req.url);
  const feature = searchParams.get("feature") ?? "preflight";

  try {
    const tests = DATASET.filter((d) => d.feature === feature);
    const results = [];

    for (const t of tests) {
      if (feature === "preflight") {
        const browser = runBrowserChecks(t.bounty, t.submission);
        const raw = await callLlama(
          "You evaluate bounty submissions strictly. Return ONLY valid JSON.",
          `BOUNTY: ${t.bounty.slice(0, 500)}
OPENING: ${t.submission.slice(0, 200)}
CLOSING: ${t.submission.slice(-200)}
Return: {"overall_score":<0-100>,"prediction":"approve" or "reject","confidence":"high"|"medium"|"low","primary_issue":"<one sentence or null>"}`,
          openrouter
        );
        const ai = safeParse(raw);
        const aiPred =
          (ai.prediction as string) === "approve" ? "approve" : "reject";
        const combined =
          browser.prediction === "approve" && aiPred === "approve"
            ? "approve"
            : "reject";
        results.push({
          id: t.id,
          bounty_name: t.bounty_name,
          expected: t.ground_truth,
          browser_score: browser.score,
          browser_pred: browser.prediction,
          ai_score: (ai.overall_score as number) ?? 0,
          ai_pred: aiPred,
          ai_confidence: ai.confidence,
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
              openrouter
            );
            const parsed = safeParse(raw);
            return { persona: p, ...parsed } as PersonaResult;
          })
        );
        const scores = personaResults.map(
          (r: PersonaResult) => (r.score as number) ?? 0
        );
        const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        const consensus = avg >= 60 ? "approve" : "reject";
        results.push({
          id: t.id,
          bounty_name: t.bounty_name,
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
          openrouter
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
          expected: t.ground_truth,
          diagnosis: result,
          issues_caught: catches,
          issues_total: 3,
          catch_rate: Math.round((catches / 3) * 100),
        });
      }

      await new Promise((r) => setTimeout(r, 300));
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
      bounties_tested: ["Zerion FeedOnBase", "HeyElsa AI Tweet", "Based India Recap 2025"],
      results,
      metrics: metricsResult,
      run_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Benchmark failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

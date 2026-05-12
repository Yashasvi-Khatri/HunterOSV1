import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

async function callLlama(
  systemPrompt: string,
  userPrompt: string,
  openrouter: OpenAI
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model: "meta-llama/llama-3.1-8b-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });
  return response.choices[0]?.message?.content ?? "";
}

function safeParseJSON(text: string): Record<string, unknown> {
  try {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return { error: "Failed to parse response", raw: text };
  }
}

async function handlePreflight(payload: {
  bounty: string;
  submission: string;
}, openrouter: OpenAI) {
  const { bounty, submission } = payload;
  const safeBounty = bounty ?? "";
  const safeSubmission = submission ?? "";
  const systemPrompt = `You are a submission quality reviewer.
Evaluate ONLY the opening sentence and closing sentence of the submission.
Return ONLY valid JSON with no markdown, no explanation.`;
  const userPrompt = `BOUNTY: ${safeBounty.slice(0, 500)}

SUBMISSION OPENING (first 200 chars): ${safeSubmission.slice(0, 200)}
SUBMISSION CLOSING (last 200 chars): ${safeSubmission.slice(-200)}

Return this exact JSON:
{
  "opening": { "pass": true or false, "reason": "one sentence why" },
  "closing": { "pass": true or false, "reason": "one sentence why" },
  "overall_impression": "one sentence summary"
}`;
  const result = await callLlama(systemPrompt as string, userPrompt as string, openrouter);
  return safeParseJSON(result);
}

const PERSONA_PROMPTS: Record<string, string> = {
  technical: `You are a strict Technical Reviewer.
Evaluate submissions for accuracy, depth, specificity, and correctness.
You care about: correct terminology, concrete details, methodology.
Return ONLY valid JSON with no markdown.`,
  business: `You are a Business Value Reviewer.
Evaluate submissions for ROI clarity, value proposition, and business impact.
You care about: clear outcomes, measurable results, persuasiveness.
Return ONLY valid JSON with no markdown.`,
  skeptic: `You are a Skeptical Reviewer who actively looks for weaknesses.
Find holes, unsupported claims, vague statements, missed requirements.
Return ONLY valid JSON with no markdown.`,
};

async function handlePeerReview(payload: {
  bounty: string;
  submission: string;
  persona: "technical" | "business" | "skeptic";
}, openrouter: OpenAI) {
  const { bounty, submission, persona } = payload;
  const safeBounty = bounty ?? "";
  const safeSubmission = submission ?? "";
  const systemPrompt =
    PERSONA_PROMPTS[persona] ?? PERSONA_PROMPTS.technical;
  const userPrompt = `BOUNTY DESCRIPTION:
${safeBounty.slice(0, 600)}

SUBMISSION:
${safeSubmission.slice(0, 800)}

Return this exact JSON:
{
  "score": <number 0-100>,
  "verdict": "<Approved | Needs Work | Rejected>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "issues": ["<issue 1>", "<issue 2>"],
  "topSuggestion": "<the single most important thing to fix>"
}`;
  const result = await callLlama(systemPrompt as string, userPrompt as string, openrouter);
  return safeParseJSON(result);
}

async function handleAutopsy(payload: {
  bounty: string;
  rejected: string;
  winning?: string;
}, openrouter: OpenAI) {
  const { bounty, rejected, winning } = payload;
  const safeBounty = bounty ?? "";
  const safeRejected = rejected ?? "";
  const systemPrompt = `You are an expert submission coach who diagnoses
why bounty submissions get rejected. Be direct, specific, and constructive.
Return ONLY valid JSON with no markdown, no preamble.`;
  const safeWinning = winning ?? "";
  const winningContext = safeWinning.length > 0
    ? `WINNING SUBMISSION (for comparison):\n${safeWinning.slice(0, 600)}` 
    : `No winning submission provided. Infer what a winning submission
would have done based on the bounty requirements alone.`;
  const userPrompt = `BOUNTY DESCRIPTION:
${safeBounty.slice(0, 600)}

REJECTED SUBMISSION:
${safeRejected.slice(0, 800)}

${winningContext}

Return this exact JSON:
{
  "primaryReason": "<main reason this was rejected>",
  "whatWasReallyWanted": "<what the bounty poster actually wanted>",
  "specificGaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "whatWinnerLikelyDid": "<what winning submission did differently>",
  "lessons": ["<lesson 1>", "<lesson 2>", "<lesson 3>"],
  "scoreEstimate": <number 0-100>,
  "salvageable": <true or false>
}`;
  const result = await callLlama(systemPrompt as string, userPrompt as string, openrouter);
  return safeParseJSON(result);
}

async function handleRecommend(payload: { task: string }, openrouter: OpenAI) {
  const { task } = payload;
  const safeTask = task ?? "";
  const { AVAILABLE_MODELS } = await import("../../lib/models");
  const modelList = AVAILABLE_MODELS.map((m) => m.id).join("\n");
  const systemPrompt = `You are an AI model selector.
Given a task description, recommend the best 3 models.
Return ONLY valid JSON with no markdown.`;
  const userPrompt = `TASK: "${safeTask}"

AVAILABLE MODELS:
${modelList}

Return this exact JSON:
{
  "recommendations": [
    { "model": "<model-id>", "reason": "<one sentence>", "strengthScore": <1-10> },
    { "model": "<model-id>", "reason": "<one sentence>", "strengthScore": <1-10> },
    { "model": "<model-id>", "reason": "<one sentence>", "strengthScore": <1-10> }
  ]
}`;
  const result = await callLlama(systemPrompt as string, userPrompt as string, openrouter);
  return safeParseJSON(result);
}

export async function POST(req: NextRequest) {
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

  try {
    const body = (await req.json()) as {
      feature: string;
      payload: Record<string, unknown>;
    };
    const { feature, payload } = body;
    if (!feature || !payload) {
      return NextResponse.json(
        { error: "feature and payload are required" },
        { status: 400 }
      );
    }
    let result: Record<string, unknown>;
    switch (feature) {
      case "preflight_ai":
        result = await handlePreflight(
          payload as { bounty: string; submission: string },
          openrouter
        );
        break;
      case "peer_review":
        result = await handlePeerReview(
          payload as {
            bounty: string;
            submission: string;
            persona: "technical" | "business" | "skeptic";
          },
          openrouter
        );
        break;
      case "autopsy":
        result = await handleAutopsy(
          payload as { bounty: string; rejected: string; winning?: string },
          openrouter
        );
        break;
      case "recommend":
        result = await handleRecommend(payload as { task: string }, openrouter);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown feature: ${feature}` },
          { status: 400 }
        );
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/bounty] Error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

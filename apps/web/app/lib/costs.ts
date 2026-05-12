import { AVAILABLE_MODELS } from "./models";

export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "openai/gpt-4o":                  { input: 2.50,  output: 10.00 },
  "openai/gpt-4o-mini":             { input: 0.15,  output: 0.60  },
  "anthropic/claude-3.5-sonnet":    { input: 3.00,  output: 15.00 },
  "anthropic/claude-3-haiku":       { input: 0.25,  output: 1.25  },
  "google/gemini-pro-1.5":          { input: 1.25,  output: 5.00  },
  "meta-llama/llama-3.1-8b-instruct": { input: 0.05, output: 0.08 },
  "mistralai/mistral-7b-instruct":  { input: 0.06,  output: 0.06  },
};

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUSD: number;
  costINR: number;
}

export function estimateCost(
  messages: { role: string; content: string }[],
  modelId: string
): CostEstimate {
  const rates = MODEL_COSTS[modelId] ?? { input: 1.00, output: 3.00 };

  const inputTokens = messages
    .filter((m) => m.role === "user")
    .reduce((sum, m) => sum + estimateTokens(m.content), 0);

  const outputTokens = messages
    .filter((m) => m.role === "assistant")
    .reduce((sum, m) => sum + estimateTokens(m.content), 0);

  const costUSD =
    (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costUSD,
    costINR: costUSD * 83.5,
  };
}

const DEFAULT_MAX_TOKENS = 512;

/** Cap output tokens so requests fit OpenRouter credit balance. */
export function openRouterTokenLimit(): { max_tokens: number } {
  const raw = process.env.OPENROUTER_MAX_TOKENS?.trim();

  if (raw?.toLowerCase() === "unlimited") {
    return { max_tokens: 4096 };
  }

  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) {
    return { max_tokens: n };
  }

  return { max_tokens: DEFAULT_MAX_TOKENS };
}

/** Keep recent messages only to reduce input token cost. */
export function trimMessageHistory<T>(messages: T[], max = 12): T[] {
  return messages.length <= max ? messages : messages.slice(-max);
}

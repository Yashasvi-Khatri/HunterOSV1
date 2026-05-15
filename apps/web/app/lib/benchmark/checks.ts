export function runBrowserChecks(bounty: string, submission: string) {
  const words = submission.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const bountyNouns = bounty
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const submissionLower = submission.toLowerCase();
  const matchedNouns = bountyNouns.filter((n) => submissionLower.includes(n));
  const relevanceRatio =
    bountyNouns.length > 0 ? matchedNouns.length / bountyNouns.length : 0;
  const hasExample =
    /\d+|for example|for instance|such as|e\.g\.|#\w+|@\w+|http/i.test(
      submission,
    );
  const injectionPatterns = [
    "ignore previous",
    "ignore all",
    "pretend you",
    "you are now",
    "jailbreak",
    "as an ai",
    "system prompt",
  ];
  const hasInjection = injectionPatterns.some((p) =>
    submissionLower.includes(p),
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

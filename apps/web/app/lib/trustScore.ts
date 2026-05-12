export interface TrustSignals {
  preflightPassRate: number; // 0–1
  peerReviewAvg: number; // 0–5
  rejectionAutopsyRate: number; // 0–1
  modelEfficiencyScore: number; // 0–1 (you compute this)
  benchmarkScore: number; // 0–100
}

export function computeTrustScore(signals: TrustSignals): number {
  const normalized = {
    preflight: signals.preflightPassRate * 100,
    peer: (signals.peerReviewAvg / 5) * 100,
    autopsy: signals.rejectionAutopsyRate * 100,
    efficiency: signals.modelEfficiencyScore * 100,
    benchmark: signals.benchmarkScore,
  };

  return Math.round(
    normalized.preflight * 0.25 +
      normalized.peer * 0.25 +
      normalized.autopsy * 0.2 +
      normalized.efficiency * 0.15 +
      normalized.benchmark * 0.15,
  );
}

export function getTrustLabel(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 85)
    return { label: "Elite Hunter", color: "#a855f7", emoji: "🏆" };
  if (score >= 70)
    return { label: "Trusted Hunter", color: "#22c55e", emoji: "✅" };
  if (score >= 50)
    return { label: "Rising Hunter", color: "#3b82f6", emoji: "📈" };
  if (score >= 30)
    return { label: "Novice Hunter", color: "#f59e0b", emoji: "⚡" };
  return { label: "Unverified", color: "#6b7280", emoji: "❓" };
}

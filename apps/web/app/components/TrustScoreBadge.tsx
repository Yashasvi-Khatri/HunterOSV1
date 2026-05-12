"use client";
import { getTrustLabel } from "../lib/trustScore";

export function TrustScoreBadge({ score }: { score: number }) {
  const { label, color, emoji } = getTrustLabel(score);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{ borderColor: color, background: `${color}15` }}
    >
      <span>{emoji}</span>
      <span className="text-xs font-bold" style={{ color }}>
        {score}/100
      </span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

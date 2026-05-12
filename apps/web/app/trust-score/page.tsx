"use client";

import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrustSignals {
  preflightPassRate: number;
  peerReviewAvg: number;
  rejectionAutopsyRate: number;
  modelEfficiencyScore: number;
  benchmarkScore: number;
}

interface TrustScoreData {
  score: number;
  signals: TrustSignals;
  lastUpdated: number;
  history: { score: number; date: number }[];
}

// ─── Demo fallback (shown when localStorage is empty) ────────────────────────

const DEMO_DATA: TrustScoreData = {
  score: 73,
  signals: {
    preflightPassRate: 0.82,
    peerReviewAvg: 3.8,
    rejectionAutopsyRate: 0.65,
    modelEfficiencyScore: 0.71,
    benchmarkScore: 68,
  },
  lastUpdated: Date.now(),
  history: [
    { date: Date.now() - 13 * 86400000, score: 45 },
    { date: Date.now() - 12 * 86400000, score: 49 },
    { date: Date.now() - 11 * 86400000, score: 52 },
    { date: Date.now() - 10 * 86400000, score: 50 },
    { date: Date.now() - 9 * 86400000, score: 55 },
    { date: Date.now() - 8 * 86400000, score: 58 },
    { date: Date.now() - 7 * 86400000, score: 61 },
    { date: Date.now() - 6 * 86400000, score: 60 },
    { date: Date.now() - 5 * 86400000, score: 64 },
    { date: Date.now() - 4 * 86400000, score: 67 },
    { date: Date.now() - 3 * 86400000, score: 70 },
    { date: Date.now() - 2 * 86400000, score: 69 },
    { date: Date.now() - 1 * 86400000, score: 72 },
    { date: Date.now(), score: 73 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadTrustScore(): TrustScoreData {
  try {
    const raw = localStorage.getItem("hunter_trust_score");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEMO_DATA;
}

function getTrustMeta(score: number) {
  if (score >= 85)
    return {
      label: "Elite Hunter",
      color: "#a855f7",
      bg: "#a855f715",
      emoji: "🏆",
    };
  if (score >= 70)
    return {
      label: "Trusted Hunter",
      color: "#22c55e",
      bg: "#22c55e15",
      emoji: "✅",
    };
  if (score >= 50)
    return {
      label: "Rising Hunter",
      color: "#3b82f6",
      bg: "#3b82f615",
      emoji: "📈",
    };
  if (score >= 30)
    return {
      label: "Novice Hunter",
      color: "#f59e0b",
      bg: "#f59e0b15",
      emoji: "⚡",
    };
  return {
    label: "Unverified",
    color: "#6b7280",
    bg: "#6b728015",
    emoji: "❓",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircleProgress({ score, color }: { score: number; color: string }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="#ffffff10"
        strokeWidth="14"
      />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 90 90)"
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
      <text
        x="90"
        y="84"
        textAnchor="middle"
        fill="white"
        fontSize="32"
        fontWeight="700"
      >
        {score}
      </text>
      <text x="90" y="104" textAnchor="middle" fill="#9ca3af" fontSize="12">
        /100
      </text>
    </svg>
  );
}

function SignalBar({
  label,
  value,
  max,
  weight,
  color,
  icon,
  description,
}: {
  label: string;
  value: number;
  max: number;
  weight: string;
  color: string;
  icon: string;
  description: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      style={{
        background: "#ffffff08",
        border: "1px solid #ffffff12",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "white",
              }}
            >
              {label}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
              {description}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color }}>
            {pct}%
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
            {weight} weight
          </p>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: "#ffffff10" }}>
        <div
          style={{
            height: 6,
            borderRadius: 9999,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

function Sparkline({
  history,
  color,
}: {
  history: { score: number; date: number }[];
  color: string;
}) {
  if (history.length < 2) return null;
  const w = 400,
    h = 80,
    pad = 10;
  const scores = history.map((h) => h.score);
  const minS = Math.min(...scores) - 5;
  const maxS = Math.max(...scores) + 5;
  const pts = history.map((p, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.score - minS) / (maxS - minS)) * (h - pad * 2);
    return { x, y };
  });
  const polyPts = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPts = `${pad},${h - pad} ${polyPts} ${w - pad},${h - pad}`;
  const last = pts[pts.length - 1];
  if (!last) return null;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%" }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill="url(#sg)" />
      <polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="4"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TIERS = [
  {
    range: "85–100",
    label: "Elite Hunter",
    emoji: "🏆",
    color: "#a855f7",
    min: 85,
    max: 100,
  },
  {
    range: "70–84",
    label: "Trusted Hunter",
    emoji: "✅",
    color: "#22c55e",
    min: 70,
    max: 84,
  },
  {
    range: "50–69",
    label: "Rising Hunter",
    emoji: "📈",
    color: "#3b82f6",
    min: 50,
    max: 69,
  },
  {
    range: "30–49",
    label: "Novice Hunter",
    emoji: "⚡",
    color: "#f59e0b",
    min: 30,
    max: 49,
  },
  {
    range: "0–29",
    label: "Unverified",
    emoji: "❓",
    color: "#6b7280",
    min: 0,
    max: 29,
  },
];

export default function TrustScorePage() {
  // Start with DEMO_DATA so page renders immediately on server + first paint
  const [data, setData] = useState<TrustScoreData>(DEMO_DATA);

  useEffect(() => {
    // Hydrate from localStorage after mount — no loading state needed
    setData(loadTrustScore());
  }, []);

  const meta = getTrustMeta(data.score);
  const { signals } = data;

  const tips: string[] = [];
  if (signals.preflightPassRate < 0.7)
    tips.push(
      "Run Pre-flight Check before every submission to boost your pass rate.",
    );
  if (signals.peerReviewAvg < 3.5)
    tips.push(
      "Request peer reviews on your best work to raise your average rating.",
    );
  if (signals.rejectionAutopsyRate < 0.5)
    tips.push(
      "Complete a Rejection Autopsy every time a bounty is declined — it shows judges you learn.",
    );
  if (signals.modelEfficiencyScore < 0.6)
    tips.push(
      "Try smaller, faster models for simpler tasks to improve your efficiency score.",
    );
  if (signals.benchmarkScore < 60)
    tips.push(
      "Run the Benchmark suite to identify which models work best for your use case.",
    );
  if (!tips.length)
    tips.push(
      "You're performing at a high level! Keep up consistent quality across all signals.",
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        color: "white",
        background: "#0f0f13",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              background: meta.bg,
              border: `1px solid ${meta.color}40`,
            }}
          >
            🛡️
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              Trust Score
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
              Last updated{" "}
              {new Date(data.lastUpdated).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Hero card */}
        <div
          style={{
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            background: "#16161e",
            border: `1px solid ${meta.color}30`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <CircleProgress score={data.score} color={meta.color} />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                background: meta.bg,
                border: `1px solid ${meta.color}50`,
                color: meta.color,
              }}
            >
              {meta.emoji} {meta.label}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7280" }}>
              Composite of 5 signals across your bounty activity
            </p>
          </div>
          {data.history.length > 1 && (
            <div style={{ width: "100%" }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6b7280" }}>
                Score history (last {data.history.length} sessions)
              </p>
              <Sparkline history={data.history} color={meta.color} />
            </div>
          )}
        </div>

        {/* Signal breakdown */}
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 10,
            letterSpacing: 2,
            color: "#6b7280",
            textTransform: "uppercase",
          }}
        >
          Signal Breakdown
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <SignalBar
            icon="✈️"
            label="Pre-flight Pass Rate"
            weight="25%"
            value={signals.preflightPassRate}
            max={1}
            color="#6366f1"
            description="% of submissions that cleared pre-flight"
          />
          <SignalBar
            icon="👥"
            label="Peer Review Avg"
            weight="25%"
            value={signals.peerReviewAvg}
            max={5}
            color="#ec4899"
            description="Average rating received from peers (out of 5)"
          />
          <SignalBar
            icon="🔍"
            label="Rejection Autopsy Rate"
            weight="20%"
            value={signals.rejectionAutopsyRate}
            max={1}
            color="#f59e0b"
            description="% of rejections where you completed an autopsy"
          />
          <SignalBar
            icon="⚡"
            label="Model Efficiency"
            weight="15%"
            value={signals.modelEfficiencyScore}
            max={1}
            color="#22c55e"
            description="Output quality relative to tokens consumed"
          />
          <SignalBar
            icon="🏁"
            label="Benchmark Score"
            weight="15%"
            value={signals.benchmarkScore}
            max={100}
            color="#3b82f6"
            description="Your performance on the HunterOS benchmark suite"
          />
        </div>

        {/* Tier ladder */}
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 10,
            letterSpacing: 2,
            color: "#6b7280",
            textTransform: "uppercase",
          }}
        >
          Tier Ladder
        </p>
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #ffffff10",
            marginBottom: 20,
          }}
        >
          {TIERS.map((tier, i) => {
            const active = data.score >= tier.min && data.score <= tier.max;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: active
                    ? `${tier.color}18`
                    : i % 2 === 0
                      ? "#ffffff05"
                      : "transparent",
                  borderLeft: `3px solid ${active ? tier.color : "transparent"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{tier.emoji}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: active ? tier.color : "#9ca3af",
                    }}
                  >
                    {tier.label}
                  </span>
                  {active && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 9999,
                        fontWeight: 700,
                        background: `${tier.color}25`,
                        color: tier.color,
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    fontFamily: "monospace",
                  }}
                >
                  {tier.range}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 10,
            letterSpacing: 2,
            color: "#6b7280",
            textTransform: "uppercase",
          }}
        >
          How to Improve
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tips.map((tip, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: 12,
                borderRadius: 10,
                background: "#a855f710",
                border: "1px solid #a855f730",
              }}
            >
              <span style={{ color: "#a855f7" }}>💡</span>
              <p style={{ margin: 0, fontSize: 13, color: "#d1d5db" }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

type Tab = "preflight" | "peer" | "autopsy";

interface PreflightResult {
  opening: { pass: boolean; reason: string };
  closing: { pass: boolean; reason: string };
  overall_impression: string;
  browserChecks?: BrowserCheck[];
}

interface BrowserCheck {
  label: string;
  pass: boolean;
  detail: string;
}

interface PeerResult {
  score: number;
  verdict: string;
  strengths: string[];
  issues: string[];
  topSuggestion: string;
}

interface AutopsyResult {
  primaryReason: string;
  whatWasReallyWanted: string;
  specificGaps: string[];
  whatWinnerLikelyDid: string;
  lessons: string[];
  scoreEstimate: number;
  salvageable: boolean;
}

function runBrowserChecks(
  bounty: string,
  submission: string
): BrowserCheck[] {
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
    /\d+|for example|for instance|such as|e\.g\.|specifically|i used|i built|i created/i.test(
      submission
    );
  const injectionPatterns = [
    "ignore previous",
    "ignore all",
    "disregard",
    "pretend you",
    "you are now",
    "jailbreak",
    "as an ai",
    "system prompt",
    "override instructions",
  ];
  const hasInjection = injectionPatterns.some((p) =>
    submissionLower.includes(p)
  );
  return [
    {
      label: "Word count",
      pass: wordCount >= 150,
      detail: `${wordCount} words ${wordCount >= 150 ? "(good)" : "(aim for 150+)"}`,
    },
    {
      label: "Keyword relevance",
      pass: relevanceRatio >= 0.3,
      detail: `${matchedNouns.length}/${bountyNouns.length} bounty keywords matched`,
    },
    {
      label: "Concrete example",
      pass: hasExample,
      detail: hasExample
        ? "Found specific examples or numbers"
        : "Add a concrete example, number, or tool name",
    },
    {
      label: "Injection patterns",
      pass: !hasInjection,
      detail: hasInjection
        ? "Warning: manipulation patterns detected"
        : "No suspicious patterns found",
    },
  ];
}

async function callBountyAPI(
  feature: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await fetch("/api/bounty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature, payload }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none";

const btnCls =
  "px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    score >= 70 ? "#4ade80" : score >= 40 ? "#facc15" : "#f87171";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size / 4,
          fontWeight: 600,
          color,
        }}
      >
        {score}
      </div>
    </div>
  );
}

function CheckRow({ label, pass, detail }: BrowserCheck) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          pass ? "bg-green-500/20" : "bg-red-500/20"
        }`}
      >
        {pass ? (
          <svg
            className="w-3 h-3 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
      </div>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          pass
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {pass ? "Pass" : "Fail"}
      </span>
    </div>
  );
}

function PreflightTab() {
  const [bounty, setBounty] = useState("");
  const [submission, setSubmission] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    if (!bounty.trim() || !submission.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    const browserChecks = runBrowserChecks(bounty, submission);
    try {
      const aiResult = await callBountyAPI("preflight_ai", {
        bounty,
        submission,
      });
      setResult({
        ...(aiResult as Omit<PreflightResult, "browserChecks">),
        browserChecks,
      });
    } catch {
      setResult({ browserChecks } as PreflightResult);
      setError("AI check failed — showing browser checks only");
    } finally {
      setLoading(false);
    }
  };

  const allPass =
    result?.browserChecks?.every((c) => c.pass) &&
    result?.opening?.pass &&
    result?.closing?.pass;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Bounty description
          </label>
          <textarea
            className={inputCls}
            rows={6}
            placeholder="Paste the bounty description here..."
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Your submission draft
          </label>
          <textarea
            className={inputCls}
            rows={6}
            placeholder="Paste your submission draft here..."
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={loading || !bounty.trim() || !submission.trim()}
          className={btnCls}
        >
          {loading ? "Running checks..." : "Run Pre-flight Check"}
        </button>
        <span className="text-xs text-gray-700">
          ~$0.00001 per check
        </span>
      </div>
      {error && (
        <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      {result && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {allPass !== undefined && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                allPass
                  ? "bg-green-500/10 border-green-500/20 text-green-300"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}
            >
              <span className="text-lg">{allPass ? "✓" : "✗"}</span>
              <span className="text-sm font-medium">
                {allPass
                  ? "Ready to submit — all checks passed"
                  : "Needs work — fix the failing checks before submitting"}
              </span>
            </div>
          )}
          {result.browserChecks && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
                Instant checks
              </p>
              {result.browserChecks.map((c) => (
                <CheckRow key={c.label} {...c} />
              ))}
            </div>
          )}
          {result.opening && result.closing && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
                AI quality check
              </p>
              <CheckRow
                label="Opening sentence"
                pass={result.opening.pass}
                detail={result.opening.reason}
              />
              <CheckRow
                label="Closing sentence"
                pass={result.closing.pass}
                detail={result.closing.reason}
              />
              {result.overall_impression && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-white/5">
                  {result.overall_impression}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PERSONAS = [
  {
    id: "technical" as const,
    label: "Technical",
    icon: "⚙",
    desc: "Accuracy & depth",
    color: "blue",
  },
  {
    id: "business" as const,
    label: "Business",
    icon: "$",
    desc: "ROI & value clarity",
    color: "green",
  },
  {
    id: "skeptic" as const,
    label: "Skeptic",
    icon: "?",
    desc: "Finds the holes",
    color: "red",
  },
];

function PeerReviewCard({
  persona,
  result,
  loading,
}: {
  persona: (typeof PERSONAS)[0];
  result: PeerResult | null;
  loading: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/20 bg-blue-500/5",
    green: "border-green-500/20 bg-green-500/5",
    red: "border-red-500/20 bg-red-500/5",
  };
  const textMap: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    red: "text-red-400",
  };
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 ${colorMap[persona.color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${textMap[persona.color]}`}>
            {persona.icon} {persona.label} Reviewer
          </p>
          <p className="text-xs text-gray-600">{persona.desc}</p>
        </div>
        {result && <ScoreRing score={result.score} size={52} />}
        {loading && (
          <div className="w-10 h-10 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}
      </div>
      {loading && (
        <p className="text-xs text-gray-600 animate-pulse">Reviewing...</p>
      )}
      {result && (
        <>
          <div
            className={`text-xs font-medium px-2 py-1 rounded-md w-fit ${
              result.verdict === "Approved"
                ? "bg-green-500/15 text-green-400"
                : result.verdict === "Rejected"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-amber-500/15 text-amber-400"
            }`}
          >
            {result.verdict}
          </div>
          {result.strengths?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Strengths</p>
              <ul className="flex flex-col gap-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                    <span className="text-green-500 flex-shrink-0">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.issues?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Issues</p>
              <ul className="flex flex-col gap-1">
                {result.issues.map((s, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                    <span className="text-red-400 flex-shrink-0">−</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.topSuggestion && (
            <div className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 mb-0.5">Top suggestion</p>
              <p className="text-xs text-gray-200">{result.topSuggestion}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PeerReviewTab() {
  const [bounty, setBounty] = useState("");
  const [submission, setSubmission] = useState("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, PeerResult>>({});

  const run = async () => {
    if (!bounty.trim() || !submission.trim()) return;
    setResults({});
    setLoadingMap({ technical: true, business: true, skeptic: true });
    const calls = PERSONAS.map(async (p) => {
      try {
        const res = await callBountyAPI("peer_review", {
          bounty,
          submission,
          persona: p.id,
        });
        setResults((prev) => ({
          ...prev,
          [p.id]: res as unknown as PeerResult,
        }));
      } catch {
        setResults((prev) => ({
          ...prev,
          [p.id]: {
            score: 0,
            verdict: "Error",
            strengths: [],
            issues: ["Failed to get review"],
            topSuggestion: "Try again",
          },
        }));
      } finally {
        setLoadingMap((prev) => ({ ...prev, [p.id]: false }));
      }
    });
    await Promise.allSettled(calls);
  };

  const avgScore =
    Object.values(results).length === 3
      ? Math.round(
          Object.values(results).reduce(
            (a, r) => a + (r.score || 0),
            0
          ) / 3
        )
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Bounty description
          </label>
          <textarea
            className={inputCls}
            rows={5}
            placeholder="Paste the bounty description..."
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Your submission
          </label>
          <textarea
            className={inputCls}
            rows={5}
            placeholder="Paste your submission..."
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={run}
          disabled={
            Object.values(loadingMap).some(Boolean) ||
            !bounty.trim() ||
            !submission.trim()
          }
          className={btnCls}
        >
          {Object.values(loadingMap).some(Boolean)
            ? "Reviewing..."
            : "Get Panel Review"}
        </button>
        {avgScore !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Panel avg</span>
            <ScoreRing score={avgScore} size={44} />
          </div>
        )}
        <span className="text-xs text-gray-700 ml-auto">
          ~$0.00006 per session
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PERSONAS.map((p) => (
          <PeerReviewCard
            key={p.id}
            persona={p}
            result={results[p.id] ?? null}
            loading={loadingMap[p.id] ?? false}
          />
        ))}
      </div>
    </div>
  );
}

function AutopsyTab() {
  const [bounty, setBounty] = useState("");
  const [rejected, setRejected] = useState("");
  const [winning, setWinning] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutopsyResult | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    if (!bounty.trim() || !rejected.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await callBountyAPI("autopsy", {
        bounty,
        rejected,
        winning: winning.trim() || undefined,
      });
      setResult(res as unknown as AutopsyResult);
    } catch {
      setError("Failed to run autopsy. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Bounty description
          </label>
          <textarea
            className={inputCls}
            rows={4}
            placeholder="Paste the bounty description..."
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Your rejected submission
          </label>
          <textarea
            className={inputCls}
            rows={4}
            placeholder="Paste the submission that was rejected..."
            value={rejected}
            onChange={(e) => setRejected(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500 font-medium">
          Winning submission{" "}
          <span className="text-gray-700">
            (optional — leave blank to infer)
          </span>
        </label>
        <textarea
          className={inputCls}
          rows={3}
          placeholder="Paste the winning submission if you know it..."
          value={winning}
          onChange={(e) => setWinning(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={loading || !bounty.trim() || !rejected.trim()}
          className={btnCls}
        >
          {loading ? "Diagnosing..." : "Run Rejection Autopsy"}
        </button>
        <span className="text-xs text-gray-700">~$0.00003 per diagnosis</span>
      </div>
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      {result && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <ScoreRing score={result.scoreEstimate ?? 0} size={64} />
            <div>
              <p className="text-sm font-semibold text-white">
                Submission scored ~{result.scoreEstimate}/100
              </p>
              <p
                className={`text-xs mt-1 font-medium ${
                  result.salvageable
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {result.salvageable
                  ? "Salvageable — can be improved and resubmitted"
                  : "Not salvageable — start fresh for next attempt"}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
            <p className="text-xs text-red-400 font-medium uppercase tracking-wider mb-2">
              Primary rejection reason
            </p>
            <p className="text-sm text-gray-200">{result.primaryReason}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
              What they really wanted
            </p>
            <p className="text-sm text-gray-200">
              {result.whatWasReallyWanted}
            </p>
          </div>
          {result.specificGaps?.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
                Specific gaps
              </p>
              <ul className="flex flex-col gap-2">
                {result.specificGaps.map((g, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-gray-300"
                  >
                    <span className="text-red-400 flex-shrink-0 font-medium">
                      {i + 1}.
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
              What the winner likely did
            </p>
            <p className="text-sm text-gray-200">
              {result.whatWinnerLikelyDid}
            </p>
          </div>
          {result.lessons?.length > 0 && (
            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-4">
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-3">
                Lessons for next time
              </p>
              <ul className="flex flex-col gap-2">
                {result.lessons.map((l, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-gray-300"
                  >
                    <span className="text-indigo-400 flex-shrink-0">
                      →
                    </span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: "preflight", label: "Pre-flight Check", desc: "Verify before you submit" },
  { id: "peer", label: "Peer Review", desc: "3-persona panel review" },
  { id: "autopsy", label: "Rejection Autopsy", desc: "Diagnose why you lost" },
];

export default function BountyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("preflight");
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">
            Bounty Intelligence
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            HunterOS · Three tools to help you win more bounties
            on First Dollar.
          </p>
        </div>
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          {activeTab === "preflight" && <PreflightTab />}
          {activeTab === "peer" && <PeerReviewTab />}
          {activeTab === "autopsy" && <AutopsyTab />}
        </div>
      </div>
    </div>
  );
}

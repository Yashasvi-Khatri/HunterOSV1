"use client";

import { useState } from "react";
import Link from "next/link";

type Feature = "preflight" | "peer_review" | "autopsy";

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

interface BenchmarkResponse {
  feature: Feature;
  dataset_size: number;
  bounties_tested: string[];
  results: Record<string, unknown>[];
  metrics: Metrics | null;
  run_at: string;
}

const FEATURES: { id: Feature; label: string; desc: string }[] = [
  { id: "preflight",   label: "Pre-flight Check",      desc: "Browser + AI combined classifier" },
  { id: "peer_review", label: "Peer Review Simulator",  desc: "3-persona consensus accuracy" },
  { id: "autopsy",     label: "Rejection Autopsy",      desc: "Issue-catch rate on real rejections" },
];

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/10">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-semibold text-white">{value}</span>
      {sub && <span className="text-xs text-gray-600">{sub}</span>}
    </div>
  );
}

function ConfusionMatrix({ m }: { m: Metrics }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        Confusion matrix
      </p>
      <div className="grid grid-cols-2 gap-2 max-w-xs">
        {[
          { label: "True Positives",  val: m.tp, color: "text-green-400"  },
          { label: "False Positives", val: m.fp, color: "text-red-400"    },
          { label: "False Negatives", val: m.fn, color: "text-amber-400"  },
          { label: "True Negatives",  val: m.tn, color: "text-green-400"  },
        ].map((cell) => (
          <div key={cell.label}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 border border-white/8">
            <span className={`text-2xl font-bold ${cell.color}`}>{cell.val}</span>
            <span className="text-[10px] text-gray-600 text-center mt-1">{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultRow({ result, feature }: { result: Record<string, unknown>; feature: Feature }) {
  const [open, setOpen] = useState(false);
  const isCorrect = result.correct as boolean | undefined;
  const catchRate = result.catch_rate as number | undefined;

  const statusColor = isCorrect === true
    ? "text-green-400 bg-green-500/10 border-green-500/20"
    : isCorrect === false
    ? "text-red-400 bg-red-500/10 border-red-500/20"
    : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>
          {isCorrect === true ? "Correct" : isCorrect === false ? "Wrong" : `${catchRate ?? 0}% caught`}
        </span>
        <span className="text-sm text-white font-medium flex-1">
          {result.id as string}
        </span>
        <span className="text-xs text-gray-600">{result.bounty_name as string}</span>
        {feature === "preflight" && (
          <span className="text-xs text-gray-500">
            Browser {result.browser_score as number}/100 · AI {result.ai_score as number}/100
          </span>
        )}
        {feature === "peer_review" && (
          <span className="text-xs text-gray-500">
            Avg {result.avg_score as number}/100
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function BenchmarkPage() {
  const [activeFeature, setActiveFeature] = useState<Feature>("preflight");
  const [loading, setLoading]             = useState(false);
  const [data, setData]                   = useState<BenchmarkResponse | null>(null);
  const [error, setError]                 = useState("");
  const [ranAt, setRanAt]                 = useState("");

  const runBenchmark = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/benchmark?feature=${activeFeature}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = (await res.json()) as BenchmarkResponse;
      setData(json);
      setRanAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Benchmark failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Benchmark Results
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Real First Dollar bounty submissions · Human-labelled ground truth
            </p>
          </div>
          <Link href="/"
            className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
            Back to chat
          </Link>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Dataset
          </p>
          <p className="text-sm text-gray-300">
            9 submissions from 3 real First Dollar bounties —
            <span className="text-white"> Zerion FeedOnBase</span>,
            <span className="text-white"> HeyElsa AI Tweet</span>,
            <span className="text-white"> Based India Recap 2025</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Ground truth labels assigned from published judging criteria. Not cherry-picked.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              onClick={() => { setActiveFeature(f.id); setData(null); setError(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFeature === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/8"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={runBenchmark}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Running benchmark..." : "Run Benchmark"}
          </button>
          {ranAt && !loading && (
            <span className="text-xs text-gray-600">Last run: {ranAt}</span>
          )}
          <span className="text-xs text-gray-700 ml-auto">
            ~$0.00005 per full run · Uses Llama 3.1 8B
          </span>
        </div>

        {loading && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Running {FEATURES.find(f => f.id === activeFeature)?.label} benchmark...
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Calling Llama 3.1 8B on each test case. Takes 20–40 seconds.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-6 animate-fade-in">

            {data.metrics && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard label="Accuracy"  value={`${data.metrics.accuracy}%`}  sub="overall correct" />
                  <MetricCard label="Precision" value={`${data.metrics.precision}%`} sub="of approvals correct" />
                  <MetricCard label="Recall"    value={`${data.metrics.recall}%`}    sub="good submissions found" />
                  <MetricCard label="F1 Score"  value={`${data.metrics.f1}%`}        sub="harmonic mean" />
                </div>
                <ConfusionMatrix m={data.metrics} />
              </>
            )}

            {activeFeature === "autopsy" && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Autopsy methodology
                </p>
                <p className="text-sm text-gray-400">
                  Autopsy is qualitative — we measure issue-catch rate:
                  how many of known rejection reasons the AI diagnosis identifies.
                  A 100% catch rate means all rejection reasons were surfaced.
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Per-test results — click to expand
              </p>
              <div className="flex flex-col gap-2">
                {data.results.map((r) => (
                  <ResultRow
                    key={r.id as string}
                    result={r}
                    feature={activeFeature}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                How to cite this in your pitch
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                "We validated HunterOS on {data.dataset_size} manually labelled submissions
                from {data.bounties_tested.join(", ")} bounties on First Dollar.
                {data.metrics
                  ? ` Our ${FEATURES.find(f => f.id === activeFeature)?.label} achieved
                    ${data.metrics.accuracy}% accuracy and ${data.metrics.precision}% precision.`
                  : ""}
                Ground truth was assigned from published judging criteria, not cherry-picked."
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

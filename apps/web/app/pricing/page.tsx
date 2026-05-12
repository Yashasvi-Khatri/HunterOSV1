"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type BillingCycle = "monthly" | "annual";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN").format(amount);
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const annualDiscountMultiplier = 0.8; // 20% off

  const proPrice = useMemo(() => {
    const base = 499;
    if (cycle === "monthly")
      return { monthlyEquivalent: base, billed: "billed monthly" };
    return {
      monthlyEquivalent: Math.round(base * annualDiscountMultiplier),
      billed: "billed annually",
    };
  }, [cycle]);

  const teamPrice = useMemo(() => {
    const base = 1999;
    if (cycle === "monthly")
      return { monthlyEquivalent: base, billed: "billed monthly" };
    return {
      monthlyEquivalent: Math.round(base * annualDiscountMultiplier),
      billed: "billed annually",
    };
  }, [cycle]);

  const highlightRing =
    "border border-transparent bg-gradient-to-r from-indigo-500/50 via-purple-500/30 to-pink-500/40";

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Simple pricing for HunterOS
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Choose Free now, upgrade when you need more.
            </p>
          </div>

          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to HunterOS
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                cycle === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                cycle === "annual"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Annual <span className="text-indigo-300 font-medium">-20%</span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-7">
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">Free</div>
              <div className="text-xs text-gray-400">No credit card</div>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <div className="text-4xl font-semibold">$0</div>
              <div className="pb-1 text-sm text-gray-400">forever</div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-300">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                3 models
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-300">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                20 messages/day
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-300">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                No export
              </li>
            </ul>

            <Link
              href="/"
              className="mt-7 block w-full text-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className={`rounded-2xl p-7 ${highlightRing}`}>
            <div className="relative rounded-2xl bg-gray-950/40 border border-white/10 p-7 -mx-7 -mb-7 -mt-7">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">Pro</div>
                <div className="text-xs text-indigo-300 font-medium">
                  Most popular
                </div>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <div className="text-4xl font-semibold">
                  ₹{formatINR(proPrice.monthlyEquivalent)}
                </div>
                <div className="pb-1 text-sm text-gray-400">/mo</div>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {proPrice.billed}
              </div>

              <ul className="mt-6 space-y-3 text-sm text-gray-200">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-200">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  All 400+ models
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-200">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  Unlimited usage
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-200">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  PDF export + compare mode
                </li>
              </ul>

              <button
                disabled
                className="mt-7 block w-full text-center px-4 py-2 rounded-xl bg-white/10 text-white/60 font-medium cursor-not-allowed"
                title="Upgrade flow not configured yet"
              >
                Upgrade to Pro
              </button>
              <div className="mt-2 text-center text-xs text-gray-500">
                Upgrade will be enabled soon.
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-7">
            <div className="flex items-center justify-between">
              <div className="text-white font-medium">Team</div>
              <div className="text-xs text-gray-400">For organizations</div>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <div className="text-4xl font-semibold">
                ₹{formatINR(teamPrice.monthlyEquivalent)}
              </div>
              <div className="pb-1 text-sm text-gray-400">/mo</div>
            </div>
            <div className="mt-1 text-xs text-gray-400">{teamPrice.billed}</div>

            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-200">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Everything in Pro
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-200">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                API access
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-200">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                Priority support
              </li>
            </ul>

            <button
              disabled
              className="mt-7 block w-full text-center px-4 py-2 rounded-xl bg-white/10 text-white/60 font-medium cursor-not-allowed"
              title="Upgrade flow not configured yet"
            >
              Upgrade to Team
            </button>
            <div className="mt-2 text-center text-xs text-gray-500">
              Contact sales to enable Team plans.
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-gray-500">
          HunterOS · Operating system for bounty hunters ·
          Powered by OpenRouter
        </div>
      </div>
    </div>
  );
}

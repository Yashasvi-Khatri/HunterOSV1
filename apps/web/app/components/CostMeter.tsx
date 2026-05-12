"use client";

import type { CostEstimate } from "../lib/costs";

interface CostMeterProps {
  estimate: CostEstimate;
  isStreaming?: boolean;
}

export function CostMeter({ estimate, isStreaming }: CostMeterProps) {
  const { totalTokens, costUSD, costINR } = estimate;

  return (
    <div className="cost-bar">
      <span className={`flex items-center gap-1.5 ${isStreaming ? "text-indigo-400" : ""}`}>
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            isStreaming ? "bg-indigo-400 animate-pulse-soft" : "bg-gray-700"
          }`}
        />
        {totalTokens.toLocaleString()} tokens
      </span>
      <span className="sep">·</span>
      <span>
        <span>Cost </span>
        <span className="val">
          ${costUSD.toFixed(4)}
        </span>
      </span>
      <span className="sep">·</span>
      <span>
        <span>≈ </span>
        <span className="val">
          ₹{costINR.toFixed(3)}
        </span>
      </span>
      <span className="ml-auto text-[10px]">
        HunterOS · Powered by OpenRouter
      </span>
    </div>
  );
}

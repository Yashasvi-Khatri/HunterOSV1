"use client";

import { useState } from "react";
import { AVAILABLE_MODELS, type AIModel } from "../lib/models";

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "bg-emerald-500/20 text-emerald-400",
  Anthropic: "bg-orange-500/20 text-orange-400",
  Google: "bg-blue-500/20 text-blue-400",
  Meta: "bg-indigo-500/20 text-indigo-400",
  Mistral: "bg-purple-500/20 text-purple-400",
};

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const current = AVAILABLE_MODELS.find((m) => m.id === selectedModel) ?? AVAILABLE_MODELS[0]!;

  const grouped = AVAILABLE_MODELS.reduce<Record<string, AIModel[]>>((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider]!.push(model);
    return acc;
  }, {});

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-all"
      >
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            PROVIDER_COLORS[current.provider] ?? "bg-gray-500/20 text-gray-400"
          }`}
        >
          {current.provider}
        </span>
        <span className="font-medium">{current.name}</span>
        {current.free && (
          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">free</span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-20 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {Object.entries(grouped).map(([provider, models]) => (
              <div key={provider}>
                <div className="px-3 py-2 bg-white/5 border-b border-white/5">
                  <span
                    className={`text-xs font-semibold ${
                      PROVIDER_COLORS[provider] ?? "text-gray-400"
                    }`}
                  >
                    {provider}
                  </span>
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${
                      selectedModel === model.id ? "bg-indigo-600/20" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{model.name}</span>
                        {model.free && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            free
                          </span>
                        )}
                        {selectedModel === model.id && (
                          <svg className="w-3.5 h-3.5 text-indigo-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

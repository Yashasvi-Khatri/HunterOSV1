"use client";

import { useMemo } from "react";
import { PROMPT_TEMPLATES } from "../../lib/templates";

export function TemplateBar({
  systemPrompt,
  onChangeSystemPrompt,
  containerClassName,
}: {
  systemPrompt: string;
  onChangeSystemPrompt: (prompt: string) => void;
  containerClassName?: string;
}) {
  const selectedTemplateId = useMemo(() => {
    const normalized = systemPrompt.trim();
    if (!normalized) return "custom";

    const match = PROMPT_TEMPLATES.find((t) => t.prompt.trim() === normalized);
    return match?.id ?? "custom";
  }, [systemPrompt]);

  return (
    <div className={containerClassName ?? "mt-3"}>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onChangeSystemPrompt("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            selectedTemplateId === "custom"
              ? "border-indigo-500/60 bg-indigo-600/20 text-indigo-200"
              : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10"
          }`}
        >
          Custom
        </button>

        {PROMPT_TEMPLATES.map((t) => {
          const active = selectedTemplateId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeSystemPrompt(t.prompt)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                active
                  ? "border-indigo-500/60 bg-indigo-600/20 text-indigo-200"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10"
              }`}
              title={t.label}
            >
              <span aria-hidden="true" className="mr-2">
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


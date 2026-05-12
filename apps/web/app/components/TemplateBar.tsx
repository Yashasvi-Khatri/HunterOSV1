"use client";

import { PROMPT_TEMPLATES } from "../lib/templates";

interface TemplateBarProps {
  systemPrompt: string;
  onChangeSystemPrompt: (prompt: string) => void;
  containerClassName?: string;
}

export function TemplateBar({ 
  systemPrompt, 
  onChangeSystemPrompt, 
  containerClassName = "" 
}: TemplateBarProps) {
  const activeTemplateId = PROMPT_TEMPLATES.find(t => t.prompt === systemPrompt)?.id || "";

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pills-row flex-1 min-w-0 ${containerClassName}`}>
      {PROMPT_TEMPLATES.map((t) => {
        const isActive = activeTemplateId === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChangeSystemPrompt(t.prompt)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-indigo-600 text-white border border-indigo-500"
                : "bg-white/5 text-gray-400 border border-white/8 hover:border-white/20 hover:text-gray-200 hover:bg-white/8"
            }`}
          >
            <span className="text-sm leading-none">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

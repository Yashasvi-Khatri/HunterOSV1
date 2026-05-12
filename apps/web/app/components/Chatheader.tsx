"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ExportMenu } from "./Exportmenu";
import type { ExportMessage } from "../hooks/useshareexport";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Preset {
  id: string;
  emoji: string;
  label: string;
  description: string;
  systemPrompt: string;
}

interface Model {
  id: string;
  provider: string;
  name: string;
  badge?: "fast" | "smart" | "vision";
  description: string;
  contextWindow: string;
}

interface ChatHeaderProps {
  models?: Model[];
  selectedModelId?: string;
  onPresetClick?: (preset: Preset) => void;
  onModelChange?: (modelId: string) => void;
  messages?: ExportMessage[];
}

// ─── Preset definitions with system prompts ───────────────────────────────────

const PRESETS: Preset[] = [
  {
    id: "custom",
    emoji: "✦",
    label: "Custom",
    description: "Blank canvas — no system prompt. Ask anything freely.",
    systemPrompt: "",
  },
  {
    id: "bounty",
    emoji: "💰",
    label: "Bounty Coach",
    description:
      "Helps you find, scope, and win bug bounties on HackerOne & Bugcrowd.",
    systemPrompt:
      "You are an expert bug bounty coach. Help the user understand requirements, assess their fit, estimate time needed, and draft compelling bounty submissions. Be specific about CVSS scores, impact analysis, and reproduction steps.",
  },
  {
    id: "tutor",
    emoji: "🎓",
    label: "Coding Tutor",
    description:
      "Explains code concepts clearly with examples. Great for learning new stacks.",
    systemPrompt:
      "You are a patient and encouraging coding tutor. Explain concepts with simple analogies, working code examples, and step-by-step breakdowns. Adapt your depth to the user's level. Always explain *why*, not just *how*.",
  },
  {
    id: "cover",
    emoji: "✉️",
    label: "Cover Letter",
    description:
      "Writes tailored, compelling cover letters from your resume + job description.",
    systemPrompt:
      "You are an expert career coach who writes exceptional cover letters. Ask for the job description and the user's background, then craft a concise, authentic letter that highlights relevant achievements with specific metrics. Avoid clichés.",
  },
  {
    id: "reviewer",
    emoji: "🔍",
    label: "Code Reviewer",
    description:
      "Reviews code for bugs, security issues, performance, and best practices.",
    systemPrompt:
      "You are a senior software engineer doing a thorough code review. Check for bugs, security vulnerabilities (OWASP Top 10), performance issues, readability, and best practices. Structure feedback as: Critical → Suggestions → Positives.",
  },
  {
    id: "explain",
    emoji: "💡",
    label: "Explain Simply",
    description:
      "Breaks down complex topics into plain English anyone can understand.",
    systemPrompt:
      "You explain complex topics simply and engagingly, as if speaking to a curious 16-year-old. Use analogies, real-world examples, and avoid jargon. End each explanation with 1–2 follow-up questions to spark curiosity.",
  },
];

// ─── Model definitions ────────────────────────────────────────────────────────

const MODELS: Model[] = [
  {
    id: "openai/gpt-4o",
    provider: "OpenAI",
    name: "GPT-4o",
    badge: "fast",
    description: "Best all-rounder. Fast, smart, handles images.",
    contextWindow: "128k",
  },
  {
    id: "openai/gpt-4o-mini",
    provider: "OpenAI",
    name: "GPT-4o mini",
    badge: "fast",
    description: "Cheaper & faster GPT-4o. Great for simple tasks.",
    contextWindow: "128k",
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    provider: "Anthropic",
    name: "Claude Sonnet",
    badge: "smart",
    description: "Excellent reasoning, long docs & coding.",
    contextWindow: "200k",
  },
  {
    id: "anthropic/claude-opus-4-5",
    provider: "Anthropic",
    name: "Claude Opus",
    badge: "smart",
    description: "Most capable Claude. Best for hard research.",
    contextWindow: "200k",
  },
  {
    id: "google/gemini-1.5-pro",
    provider: "Google",
    name: "Gemini 1.5 Pro",
    badge: "vision",
    description: "Massive context. Upload entire codebases or books.",
    contextWindow: "1M",
  },
  {
    id: "google/gemini-2.0-flash-001",
    provider: "Google",
    name: "Gemini Flash",
    badge: "fast",
    description: "Google's fastest model. Near-instant responses.",
    contextWindow: "1M",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    provider: "Meta",
    name: "Llama 3.3 70B",
    badge: undefined,
    description: "Open-source powerhouse. Strong at coding & reasoning.",
    contextWindow: "128k",
  },
];

// ─── Provider colours ─────────────────────────────────────────────────────────

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97706",
  Google: "#4285f4",
  Meta: "#0866ff",
  Mistral: "#7c3aed",
};

function ProviderDot({ provider }: { provider: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: PROVIDER_COLORS[provider] ?? "#6b7280",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    timer.current = setTimeout(() => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setPos({ x: r.left + r.width / 2, y: r.top - 10 });
    }, 400);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setPos(null);
  };

  return (
    <>
      <span
        ref={wrapRef}
        style={{ display: "inline-flex" }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -100%)",
              background: "#1e293b",
              color: "#e2e8f0",
              fontSize: 12,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              lineHeight: 1.5,
              padding: "7px 11px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              maxWidth: 220,
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 9999,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              whiteSpace: "normal",
              marginBottom: 2,
            }}
          >
            {text}
            {/* caret */}
            <span
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #1e293b",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Model selector dropdown ──────────────────────────────────────────────────

function ModelSelector({
  models,
  selectedModelId,
  onChange,
}: {
  models: Model[];
  selectedModelId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = models.find((m) => m.id === selectedModelId) ?? models[0];

  const badgeStyle: Record<string, React.CSSProperties> = {
    fast: { background: "rgba(16,163,127,0.15)", color: "#10a37f" },
    smart: { background: "rgba(217,119,6,0.15)", color: "#d97706" },
    vision: { background: "rgba(99,102,241,0.15)", color: "#818cf8" },
  };

  return (
    <Tooltip text="Switch between 400+ models — GPT, Claude, Gemini, Llama & more">
      <div className="ms-root">
        <button
          className="ms-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Current model: ${selected?.provider ?? ""} ${selected?.name ?? ""}. Click to switch.`}
        >
          <ProviderDot provider={selected?.provider ?? ""} />
          <span className="ms-provider">{selected?.provider ?? ""}</span>
          <span className="ms-sep">·</span>
          <span className="ms-name">{selected?.name ?? ""}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              color: "#475569",
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "none",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
              onClick={() => setOpen(false)}
            />
            <div
              className="ms-dropdown"
              role="listbox"
              aria-label="Select AI model"
            >
              <div className="ms-dd-header">
                <span>Select model</span>
                <span className="ms-dd-count">400+ via OpenRouter</span>
              </div>

              {Array.from(new Set(models.map((m) => m.provider))).map(
                (provider) => (
                  <div key={provider} className="ms-group">
                    <div className="ms-group-label">
                      <ProviderDot provider={provider} />
                      {provider}
                    </div>
                    {models
                      .filter((m) => m.provider === provider)
                      .map((model) => (
                        <button
                          key={model.id}
                          role="option"
                          aria-selected={model.id === selectedModelId}
                          className={
                            "ms-opt" +
                            (model.id === selectedModelId ? " ms-opt--on" : "")
                          }
                          onClick={() => {
                            onChange(model.id);
                            setOpen(false);
                          }}
                        >
                          <div className="ms-opt-left">
                            <span className="ms-opt-name">{model.name}</span>
                            <span className="ms-opt-desc">
                              {model.description}
                            </span>
                          </div>
                          <div className="ms-opt-right">
                            {model.badge && (
                              <span
                                className="ms-opt-badge"
                                style={badgeStyle[model.badge]}
                              >
                                {model.badge}
                              </span>
                            )}
                            <span className="ms-opt-ctx" title="Context window">
                              {model.contextWindow}
                            </span>
                            {model.id === selectedModelId && (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#818cf8"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                ),
              )}

              <div className="ms-dd-footer">
                Browse all models at{" "}
                <a
                  href="https://openrouter.ai/models"
                  target="_blank"
                  rel="noreferrer"
                  className="ms-dd-link"
                >
                  openrouter.ai/models →
                </a>
              </div>
            </div>
          </>
        )}

        <style>{`
          .ms-root { position: relative; }
          .ms-trigger {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 7px 11px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 9px; color: #e2e8f0; font-size: 13px;
            font-family: "DM Sans", system-ui; cursor: pointer;
            transition: background 0.15s, border-color 0.15s; white-space: nowrap;
          }
          .ms-trigger:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }
          .ms-provider { color: #94a3b8; font-size: 12px; }
          .ms-sep { color: #334155; font-size: 11px; }
          .ms-name { font-weight: 500; }
          .ms-dropdown {
            position: absolute; top: calc(100% + 7px); right: 0; z-index: 50;
            min-width: 310px;
            background: #0d1526;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 13px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset;
            padding: 6px;
            animation: msIn 0.13s ease;
          }
          @keyframes msIn {
            from { opacity: 0; transform: translateY(5px) scale(0.98); }
            to   { opacity: 1; transform: none; }
          }
          .ms-dd-header {
            display: flex; justify-content: space-between; align-items: baseline;
            padding: 6px 10px 8px;
            border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px;
          }
          .ms-dd-header > span:first-child { font-size: 12px; font-weight: 600; color: #94a3b8; font-family: "DM Sans", system-ui; }
          .ms-dd-count { font-size: 10px; color: #334155; }
          .ms-group { margin-bottom: 2px; }
          .ms-group-label {
            display: flex; align-items: center; gap: 6px;
            font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
            text-transform: uppercase; color: #334155; padding: 6px 10px 3px;
          }
          .ms-opt {
            display: flex; align-items: center; justify-content: space-between;
            gap: 8px; width: 100%; padding: 8px 10px;
            border: none; background: transparent; border-radius: 8px;
            cursor: pointer; transition: background 0.1s; text-align: left;
          }
          .ms-opt:hover { background: rgba(255,255,255,0.06); }
          .ms-opt--on { background: rgba(99,102,241,0.12); }
          .ms-opt-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
          .ms-opt-name { font-size: 13px; color: #e2e8f0; font-family: "DM Sans", system-ui; font-weight: 500; }
          .ms-opt-desc { font-size: 11px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px; }
          .ms-opt-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
          .ms-opt-badge { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px; letter-spacing: 0.03em; }
          .ms-opt-ctx { font-size: 10px; color: #475569; background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 4px; font-family: "DM Sans", system-ui; }
          .ms-dd-footer { font-size: 11px; color: #334155; padding: 8px 10px 4px; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px; }
          .ms-dd-link { color: #4f6ef7; text-decoration: none; }
          .ms-dd-link:hover { text-decoration: underline; }
        `}</style>
      </div>
    </Tooltip>
  );
}

// ─── Onboarding nudge bar ─────────────────────────────────────────────────────

function OnboardingBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="ob-bar">
      <span className="ob-icon">👋</span>
      <span className="ob-text">
        <strong>New here?</strong> Hover any preset to see what it does, pick a
        model on the right, then type below. Hit <kbd>Enter</kbd> to send,{" "}
        <kbd>Shift+Enter</kbd> for a new line.
      </span>
      <button className="ob-close" onClick={onDismiss} aria-label="Dismiss tip">
        ✕
      </button>
      <style>{`
        .ob-bar {
          position: absolute; top: 100%; left: 0; right: 0;
          display: flex; align-items: center; gap: 10px;
          padding: 9px 16px;
          background: linear-gradient(90deg, rgba(99,102,241,0.1), rgba(99,102,241,0.04));
          border-bottom: 1px solid rgba(99,102,241,0.18);
          font-size: 12.5px; font-family: "DM Sans", system-ui; color: #94a3b8;
          z-index: 20;
          animation: obIn 0.2s ease;
        }
        @keyframes obIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: none; }
        }
        .ob-icon { font-size: 15px; flex-shrink: 0; }
        .ob-text { flex: 1; line-height: 1.55; }
        .ob-text strong { color: #c7d2fe; font-weight: 600; }
        kbd {
          display: inline-block; padding: 1px 5px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px; font-size: 11px;
          font-family: "DM Sans", system-ui; color: #cbd5e1; margin: 0 1px;
        }
        .ob-close {
          background: none; border: none; cursor: pointer;
          color: #334155; font-size: 13px; padding: 2px 6px; flex-shrink: 0;
          transition: color 0.15s; line-height: 1;
        }
        .ob-close:hover { color: #94a3b8; }
      `}</style>
    </div>
  );
}

// ─── Main ChatHeader export ───────────────────────────────────────────────────

export function ChatHeader({
  models = MODELS,
  selectedModelId = MODELS[0]?.id ?? "openai/gpt-4o",
  onPresetClick,
  onModelChange,
  messages = [],
}: ChatHeaderProps) {
  const [activePreset, setActivePreset] = useState(PRESETS[0]?.id ?? "");
  const selectedModel =
    models.find((m) => m.id === selectedModelId) ?? models[0];

  const handlePreset = (p: Preset) => {
    setActivePreset(p.id);
    onPresetClick?.(p);
  };

  return (
    <header className="ch-root">
      {/* Preset pills */}
      <nav className="ch-presets" aria-label="Chat presets">
        <div className="ch-track">
          {PRESETS.map((p) => (
            <Tooltip key={p.id} text={p.description}>
              <button
                className={
                  "ch-pill" + (activePreset === p.id ? " ch-pill--on" : "")
                }
                onClick={() => handlePreset(p)}
                aria-pressed={activePreset === p.id}
              >
                <span aria-hidden="true">{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
        <div className="ch-fade" aria-hidden="true" />
      </nav>

      {/* Right controls */}
      <div className="ch-right">
        <Tooltip text="Share a link, download Markdown, or save as PDF">
          <span>
            <ExportMenu
              messages={messages}
              options={{
                model: selectedModel
                  ? `${selectedModel.provider} ${selectedModel.name}`
                  : undefined,
              }}
              placement="below"
            />
          </span>
        </Tooltip>
        <div className="ch-divider" aria-hidden="true" />
        <ModelSelector
          models={models}
          selectedModelId={selectedModelId}
          onChange={(id) => onModelChange?.(id)}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .ch-root {
          display: flex; align-items: center; gap: 12px;
          padding: 0 16px; height: 52px;
          background: #0a0f1e;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: relative; z-index: 30; flex-shrink: 0;
        }
        .ch-presets { flex: 1; min-width: 0; position: relative; display: flex; align-items: center; }
        .ch-track {
          display: flex; align-items: center; gap: 4px;
          overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;
          padding-right: 28px;
        }
        .ch-track::-webkit-scrollbar { display: none; }
        .ch-fade {
          position: absolute; right: 0; top: 0; bottom: 0; width: 40px;
          background: linear-gradient(to right, transparent, #0a0f1e);
          pointer-events: none;
        }
        .ch-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 7px;
          border: 1px solid transparent; background: transparent;
          color: #4a5568; font-size: 12.5px;
          font-family: "DM Sans", system-ui; font-weight: 500;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: color 0.15s, background 0.15s, border-color 0.15s;
          letter-spacing: 0.01em;
        }
        .ch-pill:hover { color: #cbd5e1; background: rgba(255,255,255,0.05); }
        .ch-pill--on {
          color: #e2e8f0; background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.12);
        }
        .ch-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .ch-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.08); flex-shrink: 0; }
      `}</style>
    </header>
  );
}

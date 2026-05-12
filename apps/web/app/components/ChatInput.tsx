"use client";

import { useState, useRef, useEffect } from "react";

/**
 * ChatInput — drop-in replacement for your existing message bar.
 *
 * USAGE in your page.tsx / ChatArea component:
 *
 *   import { ChatInput } from "@/components/ChatInput";
 *
 *   <ChatInput
 *     onSubmit={(text) => sendMessage(text)}
 *     isLoading={isLoading}
 *     placeholder="Message (Enter to send, Shift+Enter for newline)"
 *   />
 *
 * Slots in the action row (right side) accept your existing buttons:
 * pass them as the `actions` prop.
 */

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  /** Extra action buttons (file upload, voice, TTS, etc.) */
  actions?: React.ReactNode;
  /** Token / cost display string shown in the footer */
  footerLeft?: React.ReactNode;
  /** e.g. "Powered by OpenRouter · 400+ models" */
  footerRight?: React.ReactNode;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = "Message (Enter to send, Shift+Enter for newline)",
  actions,
  footerLeft,
  footerRight,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  useEffect(() => {
    resize();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className="ci-shell">
      {/* ── Floating input card ── */}
      <div className={`ci-card ${isLoading ? "ci-card--loading" : ""}`}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          aria-label="Chat message"
          className="ci-textarea"
        />

        {/* Action row */}
        <div className="ci-actions">
          {/* Left slot — custom action buttons (voice, attach, etc.) */}
          <div className="ci-actions__left">{actions}</div>

          {/* Right — send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasValue || isLoading}
            aria-label="Send message"
            className={`ci-send ${hasValue && !isLoading ? "ci-send--active" : ""}`}
          >
            {isLoading ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="ci-spinner"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Footer bar ── */}
      {(footerLeft || footerRight) && (
        <div className="ci-footer">
          <div className="ci-footer__left">{footerLeft}</div>
          <div className="ci-footer__right">{footerRight}</div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

        /* ── Outer shell — constrains width and centers ── */
        .ci-shell {
          width: 100%;
          max-width: 720px;          /* never wider than this */
          margin: 0 auto;            /* centered in whatever space is given */
          padding: 0 20px 16px;      /* breathing room left/right/bottom */
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: "DM Sans", system-ui, sans-serif;
        }

        /* ── The input card ── */
        .ci-card {
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #111827;
          border: 1.5px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .ci-card:focus-within {
          border-color: rgba(99, 102, 241, 0.55);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08),
                      0 4px 24px rgba(0, 0, 0, 0.3);
        }
        .ci-card--loading {
          opacity: 0.7;
        }

        /* ── Textarea ── */
        .ci-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: #e2e8f0;
          font-size: 14.5px;
          font-family: "DM Sans", system-ui, sans-serif;
          line-height: 1.65;
          padding: 14px 16px 8px;
          min-height: 24px;
          max-height: 180px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .ci-textarea::placeholder {
          color: #374151;
        }
        .ci-textarea:disabled {
          cursor: not-allowed;
        }

        /* ── Action row ── */
        .ci-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px 10px;
        }
        .ci-actions__left {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* ── Send button ── */
        .ci-send {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: rgba(255, 255, 255, 0.06);
          color: #374151;
          cursor: not-allowed;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s, transform 0.1s;
        }
        .ci-send--active {
          background: #6366f1;
          color: #ffffff;
          cursor: pointer;
        }
        .ci-send--active:hover {
          background: #4f46e5;
          transform: scale(1.04);
        }
        .ci-send--active:active {
          transform: scale(0.97);
        }

        /* Loading spinner animation */
        .ci-spinner {
          animation: ci-spin 1s linear infinite;
        }
        @keyframes ci-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Footer ── */
        .ci-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
          font-size: 11px;
          color: #1f2937;
          font-family: "DM Sans", system-ui, sans-serif;
        }
        .ci-footer__left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ci-footer__right {
          color: #1f2937;
        }
      `}</style>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO WIRE INTO YOUR page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. The outer chat area needs to pass its width down to the input:
 *
 *   // In your main chat layout, wrap the bottom in a div that gives
 *   // the input a centered container. The key CSS is on .ci-shell:
 *   //   max-width: 720px + margin: 0 auto
 *   // So you just need to make sure the parent div is full width:
 *
 *   <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
 *     <ChatInput
 *       onSubmit={sendMessage}
 *       isLoading={isLoading}
 *       footerLeft={
 *         <span style={{ color: "#1f2937" }}>
 *           ● {tokenCount} tokens &nbsp; Cost ${cost}
 *         </span>
 *       }
 *       footerRight={
 *         <span>Powered by OpenRouter · 400+ models</span>
 *       }
 *       actions={
 *         <>
 *           <UploadButton ... />
 *           <VoiceButton  ... />
 *         </>
 *       }
 *     />
 *   </div>
 *
 * 2. Remove your old <form> / <input> / <textarea> block entirely.
 *    ChatInput handles submit on Enter, Shift+Enter for newline,
 *    auto-resize, and the loading state.
 *
 * 3. The footer (token count + "Powered by OpenRouter") is passed
 *    as props so you keep your existing logic for computing those values.
 * ─────────────────────────────────────────────────────────────────────────────
 */

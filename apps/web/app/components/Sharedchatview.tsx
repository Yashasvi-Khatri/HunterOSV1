"use client";

import { useEffect, useState } from "react";
import {
  decodeSharePayload,
  expandSharePayload,
} from "../hooks/useshareexport";
import type { ExportMessage } from "../hooks/useshareexport";

/**
 * SharedChatView — renders a read-only conversation decoded from a ?share= URL param.
 *
 * HOW TO USE in your page.tsx:
 *
 *   "use client";
 *   import { useSearchParams } from "next/navigation";
 *   import { SharedChatView } from "@/components/SharedChatView";
 *
 *   export default function Page() {
 *     const params = useSearchParams();
 *     const shareParam = params.get("share");
 *
 *     if (shareParam) {
 *       return <SharedChatView encoded={shareParam} />;
 *     }
 *
 *     // ... your normal chat UI
 *   }
 */

interface SharedChatViewProps {
  encoded: string;
}

export function SharedChatView({ encoded }: SharedChatViewProps) {
  const [messages, setMessages] = useState<ExportMessage[]>([]);
  const [title, setTitle] = useState("Shared Chat");
  const [model, setModel] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const payload = decodeSharePayload(encoded);
    if (!payload) {
      setError(true);
      return;
    }
    setTitle(payload.title);
    setModel(payload.model);
    setMessages(expandSharePayload(payload));
  }, [encoded]);

  if (error) {
    return (
      <div className="shared-error">
        <p>⚠️ This share link is invalid or has been corrupted.</p>
        <a href="/" className="shared-error__link">
          Start a new chat →
        </a>
        <style>{`
          .shared-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 12px;
            color: #6b7280;
            font-size: 15px;
          }
          .shared-error__link {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
          }
          .shared-error__link:hover { text-decoration: underline; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="shared-view">
      {/* Header banner */}
      <div className="shared-view__banner">
        <div className="shared-view__badge">Shared conversation</div>
        <div className="shared-view__meta">
          {model && (
            <span>
              Model: <strong>{model}</strong>
            </span>
          )}
          <span>{messages.length} messages</span>
        </div>
        <a href="/" className="shared-view__cta">
          Try it yourself →
        </a>
      </div>

      {/* Title */}
      {title && title !== "Shared Chat" && (
        <h1 className="shared-view__title">{title}</h1>
      )}

      {/* Messages */}
      <div className="shared-view__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`shared-msg shared-msg--${msg.role}`}>
            <div className="shared-msg__label">
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="shared-msg__body">
              {/* Render newlines as paragraphs for readability */}
              {msg.content.split("\n\n").map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .shared-view {
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 20px 60px;
        }
        .shared-view__banner {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 13px;
        }
        .dark .shared-view__banner {
          background: #052e16;
          border-color: #166534;
        }
        .shared-view__badge {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #15803d;
          background: #dcfce7;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .dark .shared-view__badge { background: #14532d; color: #4ade80; }
        .shared-view__meta {
          display: flex;
          gap: 16px;
          color: #6b7280;
          flex: 1;
        }
        .shared-view__meta strong { color: #111827; }
        .dark .shared-view__meta strong { color: #f9fafb; }
        .shared-view__cta {
          margin-left: auto;
          font-weight: 500;
          color: #6366f1;
          text-decoration: none;
          font-size: 13px;
        }
        .shared-view__cta:hover { text-decoration: underline; }
        .shared-view__title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #111827;
        }
        .dark .shared-view__title { color: #f9fafb; }
        .shared-view__messages {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .shared-msg {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .shared-msg__label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
        }
        .shared-msg--user .shared-msg__label { color: #6366f1; }
        .shared-msg__body {
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          font-size: 14px;
          line-height: 1.7;
          color: #111827;
        }
        .dark .shared-msg__body {
          background: #1f2937;
          border-color: #374151;
          color: #d1d5db;
        }
        .shared-msg--user .shared-msg__body {
          background: #f9fafb;
        }
        .dark .shared-msg--user .shared-msg__body {
          background: #111827;
        }
        .shared-msg__body p { margin: 0 0 8px; }
        .shared-msg__body p:last-child { margin: 0; }
      `}</style>
    </div>
  );
}

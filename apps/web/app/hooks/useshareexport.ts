"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExportMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ShareExportOptions {
  title?: string;
  model?: string;
}

export type ExportFormat = "markdown" | "pdf" | "share";
export type ExportStatus =
  | "idle"
  | "copying"
  | "copied"
  | "exporting"
  | "error";

export interface UseShareExportReturn {
  status: ExportStatus;
  shareUrl: string | null;
  exportMarkdown: (
    messages: ExportMessage[],
    opts?: ShareExportOptions,
  ) => void;
  exportPDF: (messages: ExportMessage[], opts?: ShareExportOptions) => void;
  generateShareLink: (
    messages: ExportMessage[],
    opts?: ShareExportOptions,
  ) => Promise<void>;
  copyShareUrl: () => Promise<void>;
  clearShareUrl: () => void;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts?: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9\-_]/gi, "_").slice(0, 60);
}

// ─── Markdown builder ─────────────────────────────────────────────────────────

function buildMarkdown(
  messages: ExportMessage[],
  opts: ShareExportOptions = {},
): string {
  const title = opts.title ?? "Chat Export";
  const model = opts.model ?? "Unknown model";
  const exportedAt = new Date().toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  const lines: string[] = [
    `# ${title}`,
    "",
    `**Model:** ${model}  `,
    `**Exported:** ${exportedAt}  `,
    `**Messages:** ${messages.length}`,
    "",
    "---",
    "",
  ];

  for (const msg of messages) {
    const role = msg.role === "user" ? "### 👤 You" : "### 🤖 Assistant";
    const ts = msg.timestamp ? `  \`${formatTimestamp(msg.timestamp)}\`` : "";
    lines.push(`${role}${ts}`);
    lines.push("");
    lines.push(msg.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

// ─── Share link: encode conversation into URL hash ────────────────────────────
//
// We encode the messages as a compressed base64 payload in the URL hash.
// This is fully client-side — no database or server needed.
// Limit: works well for ~20-30 messages. Beyond that, URL gets very long.
//

interface SharePayload {
  v: 1;
  title: string;
  model: string;
  messages: { r: "u" | "a"; c: string; t?: number }[];
}

function encodeSharePayload(
  messages: ExportMessage[],
  opts: ShareExportOptions = {},
): string {
  const payload: SharePayload = {
    v: 1,
    title: opts.title ?? "Shared Chat",
    model: opts.model ?? "",
    messages: messages.map((m) => ({
      r: m.role === "user" ? "u" : "a",
      c: m.content,
      t: m.timestamp,
    })),
  };

  const json = JSON.stringify(payload);
  // btoa works on ASCII; we need to handle unicode
  const encoded = btoa(
    encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
  return encoded;
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = decodeURIComponent(
      Array.from(atob(encoded))
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}

export function expandSharePayload(payload: SharePayload): ExportMessage[] {
  return payload.messages.map((m) => ({
    role: m.r === "u" ? "user" : "assistant",
    content: m.c,
    timestamp: m.t,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useShareExport(): UseShareExportReturn {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Markdown export ────────────────────────────────────────────────────────

  const exportMarkdown = useCallback(
    (messages: ExportMessage[], opts: ShareExportOptions = {}) => {
      try {
        const md = buildMarkdown(messages, opts);
        const filename = sanitizeFilename(opts.title ?? "chat-export") + ".md";
        downloadFile(md, filename, "text/markdown;charset=utf-8");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Export failed");
        setStatus("error");
      }
    },
    [],
  );

  // ── PDF export via print dialog ────────────────────────────────────────────
  //
  // We create a hidden iframe with styled HTML, trigger window.print() on it,
  // then remove it. The user's browser PDF-print dialog handles the rest.
  // This works in all browsers with zero dependencies.
  //

  const exportPDF = useCallback(
    (messages: ExportMessage[], opts: ShareExportOptions = {}) => {
      const title = opts.title ?? "Chat Export";
      const model = opts.model ?? "Unknown model";
      const exportedAt = new Date().toLocaleString(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      });

      // Build styled HTML for the print frame
      const messageRows = messages
        .map((msg) => {
          const isUser = msg.role === "user";
          const label = isUser ? "You" : "Assistant";
          const ts = msg.timestamp ? formatTimestamp(msg.timestamp) : "";
          const tsHtml = ts ? `<span class="ts">${ts}</span>` : "";

          // Very basic markdown → HTML: bold, italic, inline code, code blocks
          const html = msg.content
            .replace(/```[\s\S]*?```/g, (m) => {
              const code = m
                .slice(3, m.lastIndexOf("```"))
                .replace(/^[^\n]*\n/, "");
              return `<pre><code>${escHtml(code.trim())}</code></pre>`;
            })
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/^#{1,6}\s(.+)$/gm, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");

          return `
            <div class="msg ${isUser ? "msg--user" : "msg--assistant"}">
              <div class="msg__header">
                <span class="msg__role">${label}</span>
                ${tsHtml}
              </div>
              <div class="msg__body">${html}</div>
            </div>`;
        })
        .join("");

      const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #111;
      padding: 32px 40px;
      max-width: 760px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #111;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .meta { font-size: 11px; color: #555; display: flex; gap: 16px; flex-wrap: wrap; }
    .msg { margin-bottom: 20px; page-break-inside: avoid; }
    .msg__header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .msg__role {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .msg--user .msg__role { background: #111; color: #fff; }
    .msg--assistant .msg__role { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .ts { font-size: 10px; color: #9ca3af; }
    .msg__body {
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: #fff;
    }
    .msg--user .msg__body { background: #f9fafb; }
    pre {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    code {
      background: #f3f4f6;
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 12px;
      font-family: "SF Mono", "Fira Code", monospace;
    }
    pre code { background: none; padding: 0; }
    strong { font-weight: 600; }
    @page { margin: 20mm; }
    @media print {
      body { padding: 0; }
      .msg { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escHtml(title)}</h1>
    <div class="meta">
      <span>Model: ${escHtml(model)}</span>
      <span>Exported: ${exportedAt}</span>
      <span>${messages.length} messages</span>
    </div>
  </div>
  ${messageRows}
</body>
</html>`;

      setStatus("exporting");

      // Print via hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iframeDoc) {
        setStatus("error");
        setError("Could not create print frame.");
        document.body.removeChild(iframe);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(printHTML);
      iframeDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            setStatus("idle");
          }, 1000);
        }, 300);
      };
    },
    [],
  );

  // ── Share link ─────────────────────────────────────────────────────────────

  const generateShareLink = useCallback(
    async (messages: ExportMessage[], opts: ShareExportOptions = {}) => {
      try {
        const encoded = encodeSharePayload(messages, opts);
        const base = window.location.origin + window.location.pathname;
        const url = `${base}?share=${encoded}`;
        setShareUrl(url);
        // Auto-copy to clipboard
        await navigator.clipboard.writeText(url);
        setStatus("copied");
        setTimeout(() => setStatus("idle"), 2500);
      } catch {
        // Clipboard may be denied — still set the URL so user can copy manually
        setStatus("idle");
      }
    },
    [],
  );

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    try {
      setStatus("copying");
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setError("Clipboard access denied.");
    }
  }, [shareUrl]);

  const clearShareUrl = useCallback(() => {
    setShareUrl(null);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    shareUrl,
    exportMarkdown,
    exportPDF,
    generateShareLink,
    copyShareUrl,
    clearShareUrl,
    error,
  };
}

// ─── Tiny HTML escape helper ──────────────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

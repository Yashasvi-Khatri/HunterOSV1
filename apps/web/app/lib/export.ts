import type { Message } from "./types";

export function exportChatAsPDF(
  messages: Message[],
  title: string = "Chat Export"
): void {
  // Build printable HTML
  const rows = messages
    .map((m) => {
      const role = m.role === "user" ? "You" : "Assistant";
      const bg = m.role === "user" ? "#1e1b4b" : "#111827";
      const escaped = m.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `
        <div style="margin-bottom:16px;padding:12px 16px;border-radius:8px;background:${bg};">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">${role}</div>
          <div style="font-size:14px;color:#f9fafb;line-height:1.6;white-space:pre-wrap;">${escaped}</div>
        </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 32px; background: #030712; font-family: system-ui, sans-serif; }
    h1 { font-size: 20px; color: #f9fafb; margin-bottom: 24px; font-weight: 500; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${rows}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}

export function generateShareLink(messages: Message[]): string {
  try {
    const payload = JSON.stringify(
      messages.map((m) => ({ role: m.role, content: m.content }))
    );
    const encoded = btoa(encodeURIComponent(payload));
    return `${window.location.origin}/share?c=${encoded}`;
  } catch {
    return window.location.href;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

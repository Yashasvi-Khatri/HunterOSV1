"use client";

import { useState, useRef, useEffect } from "react";
import {
  ExportMessage,
  ShareExportOptions,
  useShareExport,
} from "../hooks/useshareexport";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function MarkdownIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function PDFIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Share URL banner ─────────────────────────────────────────────────────────

interface ShareBannerProps {
  url: string;
  onCopy: () => void;
  onClose: () => void;
  copied: boolean;
}

function ShareBanner({ url, onCopy, onClose, copied }: ShareBannerProps) {
  return (
    <div className="share-banner">
      <div className="share-banner__label">Shareable link</div>
      <div className="share-banner__row">
        <input
          type="text"
          readOnly
          value={url}
          className="share-banner__input"
          onFocus={(e) => e.target.select()}
          aria-label="Share URL"
        />
        <button
          type="button"
          className={`share-banner__copy ${copied ? "share-banner__copy--done" : ""}`}
          onClick={onCopy}
          aria-label={copied ? "Copied!" : "Copy link"}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="share-banner__note">
        This link encodes the conversation in the URL — no server needed.
      </p>
      <button
        type="button"
        className="share-banner__close"
        onClick={onClose}
        aria-label="Dismiss"
      >
        ✕
      </button>

      <style>{`
        .share-banner {
          position: relative;
          padding: 12px 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          margin-bottom: 8px;
        }
        .dark .share-banner {
          background: #052e16;
          border-color: #166534;
        }
        .share-banner__label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #15803d;
          margin-bottom: 6px;
        }
        .dark .share-banner__label { color: #4ade80; }
        .share-banner__row {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .share-banner__input {
          flex: 1;
          font-size: 12px;
          padding: 6px 10px;
          border: 1px solid #d1fae5;
          border-radius: 6px;
          background: #fff;
          color: #111827;
          outline: none;
          font-family: "SF Mono", "Fira Code", monospace;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dark .share-banner__input {
          background: #1f2937;
          border-color: #166534;
          color: #d1d5db;
        }
        .share-banner__copy {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          background: #16a34a;
          color: #fff;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .share-banner__copy:hover { background: #15803d; }
        .share-banner__copy--done { background: #15803d; }
        .share-banner__note {
          font-size: 11px;
          color: #6b7280;
          margin-top: 6px;
        }
        .dark .share-banner__note { color: #9ca3af; }
        .share-banner__close {
          position: absolute;
          top: 8px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: #9ca3af;
          padding: 2px 4px;
          line-height: 1;
        }
        .share-banner__close:hover { color: #374151; }
      `}</style>
    </div>
  );
}

// ─── Export menu ─────────────────────────────────────────────────────────────

interface ExportMenuProps {
  messages: ExportMessage[];
  options?: ShareExportOptions;
  /** Place "above" or "below" the trigger button */
  placement?: "above" | "below";
  className?: string;
}

export function ExportMenu({
  messages,
  options = {},
  placement = "above",
  className = "",
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    status,
    shareUrl,
    exportMarkdown,
    exportPDF,
    generateShareLink,
    copyShareUrl,
    clearShareUrl,
  } = useShareExport();

  const isCopied = status === "copied";
  const isExporting = status === "exporting";
  const hasMessages = messages.length > 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleShare = async () => {
    setOpen(false);
    await generateShareLink(messages, options);
  };

  const handleMarkdown = () => {
    setOpen(false);
    exportMarkdown(messages, options);
  };

  const handlePDF = () => {
    setOpen(false);
    exportPDF(messages, options);
  };

  return (
    <div className={`export-wrap ${className}`} ref={menuRef}>
      {/* Share URL banner */}
      {shareUrl && (
        <ShareBanner
          url={shareUrl}
          onCopy={copyShareUrl}
          onClose={clearShareUrl}
          copied={isCopied}
        />
      )}

      {/* Trigger button */}
      <button
        type="button"
        className={`export-trigger ${open ? "export-trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        disabled={!hasMessages || isExporting}
        aria-haspopup="menu"
        aria-expanded={open}
        title={
          hasMessages ? "Export or share conversation" : "No messages to export"
        }
      >
        <ShareIcon />
        <span>Share / Export</span>
        <ChevronDownIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`export-menu ${placement === "above" ? "export-menu--above" : "export-menu--below"}`}
          role="menu"
        >
          <div className="export-menu__header">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </div>

          <button
            type="button"
            className="export-menu__item"
            role="menuitem"
            onClick={handleShare}
          >
            <span className="export-menu__icon export-menu__icon--green">
              <ShareIcon />
            </span>
            <div className="export-menu__text">
              <span className="export-menu__label">Copy share link</span>
              <span className="export-menu__desc">
                URL-encoded · no server needed
              </span>
            </div>
          </button>

          <button
            type="button"
            className="export-menu__item"
            role="menuitem"
            onClick={handleMarkdown}
          >
            <span className="export-menu__icon export-menu__icon--blue">
              <MarkdownIcon />
            </span>
            <div className="export-menu__text">
              <span className="export-menu__label">Download Markdown</span>
              <span className="export-menu__desc">
                .md file · preserves formatting
              </span>
            </div>
          </button>

          <button
            type="button"
            className="export-menu__item"
            role="menuitem"
            onClick={handlePDF}
            disabled={isExporting}
          >
            <span className="export-menu__icon export-menu__icon--red">
              <PDFIcon />
            </span>
            <div className="export-menu__text">
              <span className="export-menu__label">
                {isExporting ? "Opening print dialog…" : "Save as PDF"}
              </span>
              <span className="export-menu__desc">
                via browser print · no upload
              </span>
            </div>
          </button>
        </div>
      )}

      <style>{`
        .export-wrap {
          position: relative;
          display: inline-block;
        }
        .export-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          font-size: 13px;
          font-weight: 500;
          font-family: "DM Sans", system-ui, sans-serif;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .export-trigger:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.18);
          color: #e2e8f0;
        }
        .export-trigger--open {
          border-color: rgba(99,102,241,0.6);
          color: #e2e8f0;
          background: rgba(99,102,241,0.1);
        }
        .export-trigger:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .export-menu {
          position: absolute;
          right: 0;
          z-index: 50;
          min-width: 240px;
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 13px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset;
          padding: 6px;
          animation: exportMenuIn 0.12s ease;
        }
        .dark .export-menu {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .export-menu--above { bottom: calc(100% + 6px); }
        .export-menu--below { top: calc(100% + 6px); }
        @keyframes exportMenuIn {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .export-menu__header {
          font-size: 11px;
          color: #475569;
          padding: 4px 10px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }
        .export-menu__item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: background 0.12s;
        }
        .export-menu__item:hover:not(:disabled) { background: rgba(255,255,255,0.06); }
        .export-menu__item:disabled { opacity: 0.5; cursor: wait; }
        .export-menu__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .export-menu__icon--green { background: rgba(16,163,127,0.15); color: #10a37f; }
        .export-menu__icon--blue  { background: rgba(59,130,246,0.15);  color: #60a5fa; }
        .export-menu__icon--red   { background: rgba(239,68,68,0.15);   color: #f87171; }
        .export-menu__text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .export-menu__label {
          font-size: 13px;
          font-weight: 500;
          font-family: "DM Sans", system-ui, sans-serif;
          color: #e2e8f0;
        }
        .export-menu__desc {
          font-size: 11px;
          color: #475569;
        }
      `}</style>
    </div>
  );
}

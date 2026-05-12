"use client";

import { useRef } from "react";
import { FileAttachment } from "../lib/attachment";
import { ACCEPTED_EXTENSIONS } from "../lib/attachment";

// ─── Icons ────────────────────────────────────────────────────────────────────

function PaperclipIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PDFIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text
        x="7"
        y="19"
        style={{
          fontSize: "6px",
          fontWeight: "bold",
          fill: "currentColor",
          stroke: "none",
        }}
      >
        PDF
      </text>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

// ─── Attachment thumbnail chip ────────────────────────────────────────────────

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: FileAttachment;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="attachment-chip">
      {attachment.type === "image" && attachment.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.previewUrl}
          alt={attachment.name}
          className="attachment-chip__thumb"
        />
      ) : (
        <div className="attachment-chip__pdf-icon">
          <PDFIcon />
        </div>
      )}

      <div className="attachment-chip__info">
        <span className="attachment-chip__name" title={attachment.name}>
          {attachment.name.length > 20
            ? attachment.name.slice(0, 17) + "…"
            : attachment.name}
        </span>
        <span className="attachment-chip__size">{attachment.sizeLabel}</span>
      </div>

      <button
        type="button"
        className="attachment-chip__remove"
        onClick={() => onRemove(attachment.id)}
        aria-label={`Remove ${attachment.name}`}
      >
        <XIcon size={10} />
      </button>

      <style>{`
        .attachment-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px 6px 6px;
          background: var(--chip-bg, #f9fafb);
          border: 1px solid var(--chip-border, #e5e7eb);
          border-radius: 10px;
          min-width: 0;
          max-width: 180px;
          flex-shrink: 0;
          position: relative;
        }
        .dark .attachment-chip {
          --chip-bg: #1f2937;
          --chip-border: #374151;
        }
        .attachment-chip__thumb {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .attachment-chip__pdf-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fee2e2;
          border-radius: 6px;
          color: #ef4444;
          flex-shrink: 0;
        }
        .dark .attachment-chip__pdf-icon {
          background: #450a0a;
          color: #f87171;
        }
        .attachment-chip__info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 1px;
        }
        .attachment-chip__name {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-primary, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .attachment-chip__size {
          font-size: 11px;
          color: var(--color-text-secondary, #6b7280);
        }
        .attachment-chip__remove {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #374151;
          color: #ffffff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: background 0.15s;
        }
        .attachment-chip__remove:hover { background: #111827; }
      `}</style>
    </div>
  );
}

// ─── Upload button (paperclip) for use inside the chat input bar ──────────────

interface UploadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  hasAttachments?: boolean;
}

export function UploadButton({
  onClick,
  disabled,
  hasAttachments,
}: UploadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Attach file"
      title="Attach image or PDF"
      className={`upload-btn ${hasAttachments ? "upload-btn--active" : ""}`}
    >
      <PaperclipIcon />
      <style>{`
        .upload-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          padding: 0;
          flex-shrink: 0;
        }
        .upload-btn:hover:not(:disabled) {
          background: #f3f4f6;
          color: #111827;
        }
        .dark .upload-btn:hover:not(:disabled) {
          background: #374151;
          color: #f9fafb;
        }
        .upload-btn--active {
          color: #6366f1 !important;
          border-color: #c7d2fe;
          background: #eef2ff;
        }
        .dark .upload-btn--active {
          background: #1e1b4b;
          border-color: #3730a3;
        }
        .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </button>
  );
}

// ─── Attachment strip (rendered above the chat input) ─────────────────────────

interface AttachmentStripProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
}

export function AttachmentStrip({
  attachments,
  onRemove,
}: AttachmentStripProps) {
  if (!attachments.length) return null;

  return (
    <div className="attachment-strip">
      {attachments.map((a) => (
        <AttachmentChip key={a.id} attachment={a} onRemove={onRemove} />
      ))}
      <style>{`
        .attachment-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 0 4px;
        }
      `}</style>
    </div>
  );
}

// ─── Full drop zone (optional — use for a dedicated upload area) ──────────────

interface FileDropZoneProps {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClickUpload: () => void;
  children: React.ReactNode;
}

export function FileDropZone({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onClickUpload,
  children,
}: FileDropZoneProps) {
  return (
    <div
      className={`drop-zone ${isDragging ? "drop-zone--active" : ""}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}

      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay__inner">
            <UploadIcon />
            <p>Drop files here</p>
            <span>Images (JPEG, PNG, GIF, WebP) or PDF · max 20 MB</span>
          </div>
        </div>
      )}

      <style>{`
        .drop-zone {
          position: relative;
        }
        .drop-zone--active {
          outline: 2px dashed #6366f1;
          outline-offset: -2px;
          border-radius: 14px;
        }
        .drop-overlay {
          position: absolute;
          inset: 0;
          background: rgba(99, 102, 241, 0.06);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }
        .drop-overlay__inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #6366f1;
        }
        .drop-overlay__inner p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .drop-overlay__inner span {
          font-size: 12px;
          opacity: 0.75;
        }
      `}</style>
    </div>
  );
}

// ─── Hidden file input ────────────────────────────────────────────────────────

interface HiddenFileInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (files: FileList) => void;
}

export function HiddenFileInput({ inputRef, onChange }: HiddenFileInputProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_EXTENSIONS}
      multiple
      style={{ display: "none" }}
      aria-hidden="true"
      onChange={(e) => {
        if (e.target.files?.length) {
          onChange(e.target.files);
          // Reset so same file can be re-selected
          e.target.value = "";
        }
      }}
    />
  );
}

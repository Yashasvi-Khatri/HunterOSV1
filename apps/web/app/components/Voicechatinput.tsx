"use client";
/**
 * VoiceChatInput — full-width textarea, icon-only toolbar below.
 */
import { useState, useEffect, useRef } from "react";
import { useVoice } from "../hooks/useVoice";
import { useFileUpload } from "../hooks/useFileUpload";
import { VoiceButton } from "./Voicebutton";
import {
  UploadButton,
  AttachmentStrip,
  HiddenFileInput,
} from "./FileUploadArea";

interface VoiceChatInputProps {
  onSubmit: (
    text: string,
    attachments?: import("../lib/attachment").AttachmentPayload[],
  ) => void;
  isLoading?: boolean;
  lastAssistantMessage?: string;
  autoSpeak?: boolean;
}

export function VoiceChatInput({
  onSubmit,
  isLoading = false,
  lastAssistantMessage,
  autoSpeak: initialAutoSpeak = false,
}: VoiceChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(initialAutoSpeak);
  const prevMessageRef = useRef<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attachments,
    isDragging,
    fileInputRef,
    addFiles,
    removeAttachment,
    clearAttachments,
    openFilePicker,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    errors: fileErrors,
    clearErrors: clearFileErrors,
  } = useFileUpload();

  const {
    status,
    transcript,
    isSupported,
    isTTSSupported,
    toggleListening,
    stopListening,
    speak,
    stopSpeaking,
    error: voiceError,
  } = useVoice({
    lang: "en-US",
    onTranscript: (text) => {
      setInputValue(text);
      if (text.trim()) handleSubmit(text);
    },
  });

  useEffect(() => {
    if (
      autoSpeak &&
      isTTSSupported &&
      lastAssistantMessage &&
      lastAssistantMessage !== prevMessageRef.current &&
      !isLoading
    ) {
      prevMessageRef.current = lastAssistantMessage;
      speak(lastAssistantMessage);
    }
  }, [lastAssistantMessage, autoSpeak, isTTSSupported, isLoading, speak]);

  useEffect(() => {
    if (transcript) setInputValue(transcript);
  }, [transcript]);

  const handleSubmit = (text?: string) => {
    const value = (text ?? inputValue).trim();
    if (!value || isLoading) return;
    const attachmentPayload =
      attachments.length > 0
        ? attachments.map((a) => ({
            type: a.type,
            mime: a.mime,
            base64: a.base64,
            name: a.name,
          }))
        : undefined;
    stopListening();
    onSubmit(value, attachmentPayload);
    setInputValue("");
    clearAttachments();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  const isListening = status === "listening";
  const canSend =
    (inputValue.trim().length > 0 || attachments.length > 0) && !isLoading;

  return (
    <div className="vic-wrapper">
      {/* ── All CSS scoped under .vic-wrapper so nothing leaks out ── */}
      <style>{`
        .vic-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px 16px 14px;
          box-sizing: border-box;
        }

        /* Force dark hover on upload-btn and voice-btn inside toolbar */
        .vic-wrapper .upload-btn:hover:not(:disabled),
        .vic-wrapper .voice-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08) !important;
          color: rgba(255,255,255,0.9) !important;
        }

        /* Errors */
        .vic-wrapper .vic-error {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #f87171;
          padding: 6px 12px;
          background: rgba(239,68,68,0.08);
          border-radius: 10px;
          border: 1px solid rgba(239,68,68,0.2);
          width: 100%;
          margin: 0;
        }
        .vic-wrapper .vic-error-clear {
          font-size: 11px;
          text-decoration: underline;
          background: none;
          border: none;
          color: #f87171;
          cursor: pointer;
          margin-left: auto;
          padding: 0;
        }

        /* Listening banner */
        .vic-wrapper .vic-listening-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #f87171;
          padding: 6px 14px;
          background: rgba(239,68,68,0.08);
          border-radius: 10px;
          border: 1px solid rgba(239,68,68,0.2);
          width: 100%;
        }
        .vic-wrapper .vic-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          flex-shrink: 0;
          animation: vicDotPulse 1s ease-in-out infinite;
        }
        @keyframes vicDotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        /* Input card */
        .vic-wrapper .vic-card {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          transition: border-color 0.15s, box-shadow 0.15s;
          overflow: visible;
        }
        .vic-wrapper .vic-card:focus-within {
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.07);
        }
        .vic-wrapper .vic-card--listening {
          border-color: rgba(239,68,68,0.45) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.06) !important;
        }
        .vic-wrapper .vic-card--dragging {
          border-color: rgba(124,58,237,0.5) !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08) !important;
        }

        /* Textarea */
        .vic-wrapper .vic-textarea {
          display: block;
          width: 100%;
          box-sizing: border-box;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.87);
          padding: 14px 18px 10px;
          min-height: 52px;
          max-height: 200px;
          overflow-y: auto;
          font-family: inherit;
          border-radius: 16px 16px 0 0;
        }
        .vic-wrapper .vic-textarea::placeholder {
          color: rgba(255,255,255,0.22);
        }

        /* Divider */
        .vic-wrapper .vic-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 16px;
        }

        /* Toolbar */
        .vic-wrapper .vic-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
        }
        .vic-wrapper .vic-toolbar-left {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .vic-wrapper .vic-toolbar-right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        /* Auto-speak icon button */
        .vic-wrapper .vic-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: background 0.13s, color 0.13s;
          padding: 0;
          flex-shrink: 0;
        }
        .vic-wrapper .vic-icon-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          color: rgba(255,255,255,0.9) !important;
        }
        .vic-wrapper .vic-icon-btn--on {
          color: #818cf8 !important;
          background: rgba(99,102,241,0.12) !important;
        }
        .vic-wrapper .vic-icon-btn--on:hover {
          background: rgba(99,102,241,0.2) !important;
        }

        /* Send button */
        .vic-wrapper .vic-send-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.2);
          font-size: 12px;
          font-weight: 600;
          cursor: not-allowed;
          font-family: inherit;
          transition: all 0.15s;
          pointer-events: none;
        }
        .vic-wrapper .vic-send-btn--active {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-color: rgba(124,58,237,0.5);
          color: #fff;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 10px rgba(124,58,237,0.35);
        }
        .vic-wrapper .vic-send-btn--active:hover {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 4px 14px rgba(124,58,237,0.5);
        }
        .vic-wrapper .vic-send-btn--active:active {
          transform: scale(0.97);
        }
      `}</style>

      {/* File errors */}
      {fileErrors.length > 0 && (
        <div className="vic-error" role="alert">
          {fileErrors.map((error, i) => (
            <span key={i}>{error}</span>
          ))}
          <button
            type="button"
            onClick={clearFileErrors}
            className="vic-error-clear"
          >
            Clear
          </button>
        </div>
      )}

      {/* Voice error */}
      {voiceError && (
        <p className="vic-error" role="alert">
          {voiceError}
        </p>
      )}

      {/* Listening banner */}
      {isListening && (
        <div className="vic-listening-banner" aria-live="polite">
          <span className="vic-dot" />
          Listening… speak now, then pause to send
        </div>
      )}

      {/* Attachment chips */}
      <AttachmentStrip attachments={attachments} onRemove={removeAttachment} />

      {/* ── INPUT CARD ── */}
      <div
        className={`vic-card${isListening ? " vic-card--listening" : ""}${isDragging ? " vic-card--dragging" : ""}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Textarea — full width */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening…"
              : "Message (Enter to send, Shift+Enter for newline)"
          }
          disabled={isLoading}
          rows={1}
          aria-label="Chat message"
          className="vic-textarea"
        />

        {/* Divider */}
        <div className="vic-divider" />

        {/* ── TOOLBAR ── */}
        <div className="vic-toolbar">
          <div className="vic-toolbar-left">
            {/* Attach */}
            <UploadButton
              onClick={openFilePicker}
              disabled={isLoading}
              hasAttachments={attachments.length > 0}
            />

            {/* Voice */}
            {isSupported && (
              <VoiceButton
                status={status}
                isSupported={isSupported}
                onClick={status === "speaking" ? stopSpeaking : toggleListening}
              />
            )}

            {/* Auto-speak toggle */}
            {isTTSSupported && (
              <button
                type="button"
                onClick={() => {
                  setAutoSpeak((v) => !v);
                  if (autoSpeak) stopSpeaking();
                }}
                aria-label={
                  autoSpeak ? "Disable auto-speak" : "Enable auto-speak"
                }
                title={
                  autoSpeak
                    ? "Auto-speak on — click to disable"
                    : "Auto-speak off"
                }
                className={`vic-icon-btn${autoSpeak ? " vic-icon-btn--on" : ""}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {autoSpeak ? (
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  ) : (
                    <line x1="23" y1="9" x2="17" y2="15" />
                  )}
                </svg>
              </button>
            )}
          </div>

          {/* Send */}
          <div className="vic-toolbar-right">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!canSend}
              aria-label="Send message"
              className={`vic-send-btn${canSend ? " vic-send-btn--active" : ""}`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send
            </button>
          </div>
        </div>

        <HiddenFileInput inputRef={fileInputRef} onChange={addFiles} />
      </div>
    </div>
  );
}

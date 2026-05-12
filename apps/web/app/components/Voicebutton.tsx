"use client";

import { VoiceStatus } from "../hooks/useVoice";

interface VoiceButtonProps {
  status: VoiceStatus;
  isSupported: boolean;
  onClick: () => void;
  className?: string;
}

// Animated waveform bars shown while listening
function WaveformIcon() {
  return (
    <span className="voice-waveform" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="voice-bar"
          style={{ animationDelay: `${(i - 1) * 0.1}s` }}
        />
      ))}
      <style>{`
        .voice-waveform {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          height: 16px;
        }
        .voice-bar {
          display: block;
          width: 3px;
          border-radius: 2px;
          background: currentColor;
          animation: voiceWave 0.7s ease-in-out infinite alternate;
        }
        .voice-bar:nth-child(1) { height: 6px;  animation-delay: 0s; }
        .voice-bar:nth-child(2) { height: 12px; animation-delay: 0.1s; }
        .voice-bar:nth-child(3) { height: 16px; animation-delay: 0.2s; }
        .voice-bar:nth-child(4) { height: 10px; animation-delay: 0.15s; }
        @keyframes voiceWave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </span>
  );
}

// Mic SVG icon
function MicIcon({ muted = false }: { muted?: boolean }) {
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
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
      {muted && <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" />}
    </svg>
  );
}

// Speaker/stop icon for TTS
function SpeakerIcon() {
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
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export function VoiceButton({
  status,
  isSupported,
  onClick,
  className = "",
}: VoiceButtonProps) {
  if (!isSupported) return null;

  const isListening = status === "listening";
  const isSpeaking = status === "speaking";
  const isError = status === "error";

  const label = isListening
    ? "Stop listening"
    : isSpeaking
      ? "AI is speaking"
      : "Start voice input";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSpeaking}
      aria-label={label}
      title={label}
      className={[
        "voice-btn",
        isListening ? "voice-btn--listening" : "",
        isSpeaking ? "voice-btn--speaking" : "",
        isError ? "voice-btn--error" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isListening ? (
        <WaveformIcon />
      ) : isSpeaking ? (
        <SpeakerIcon />
      ) : (
        <MicIcon muted={isError} />
      )}

      <style>{`
        .voice-btn {
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
          transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
          padding: 0;
        }
        .voice-btn:hover:not(:disabled) {
          background: #f3f4f6;
          color: #111827;
        }
        .dark .voice-btn:hover:not(:disabled) {
          background: #374151;
          color: #f9fafb;
        }
        .voice-btn--listening {
          background: #fee2e2 !important;
          color: #ef4444 !important;
          border-color: #fca5a5 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
          animation: voicePulse 1.5s ease-in-out infinite;
        }
        .dark .voice-btn--listening {
          background: #450a0a !important;
          color: #f87171 !important;
          border-color: #991b1b !important;
        }
        .voice-btn--speaking {
          background: #eff6ff !important;
          color: #3b82f6 !important;
          border-color: #93c5fd !important;
          cursor: default;
        }
        .dark .voice-btn--speaking {
          background: #1e3a5f !important;
          color: #60a5fa !important;
          border-color: #1d4ed8 !important;
        }
        .voice-btn--error {
          color: #ef4444;
        }
        .voice-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }
          50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0.05); }
        }
      `}</style>
    </button>
  );
}

// ─── TTS toggle button (placed in AI message bubbles) ─────────────────────────

interface TTSButtonProps {
  text: string;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStop: () => void;
  className?: string;
}

export function TTSButton({
  text,
  isSpeaking,
  onSpeak,
  onStop,
  className = "",
}: TTSButtonProps) {
  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? onStop() : onSpeak(text))}
      aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
      className={["tts-btn", isSpeaking ? "tts-btn--active" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {isSpeaking ? (
        /* Stop square */
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      ) : (
        <SpeakerIcon />
      )}

      <style>{`
        .tts-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          padding: 0;
        }
        .tts-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        .dark .tts-btn:hover {
          background: #374151;
          color: #d1d5db;
        }
        .tts-btn--active {
          color: #3b82f6 !important;
        }
      `}</style>
    </button>
  );
}

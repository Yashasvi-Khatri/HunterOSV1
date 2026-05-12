"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VoiceStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface UseVoiceOptions {
  /** BCP-47 language tag for recognition, e.g. "en-US" */
  lang?: string;
  /** Called with the final transcript when recognition ends */
  onTranscript?: (text: string) => void;
  /** Called when TTS finishes speaking */
  onSpeakEnd?: () => void;
}

export interface UseVoiceReturn {
  status: VoiceStatus;
  transcript: string;
  isSupported: boolean;
  isTTSSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleListening: () => void;
  error: string | null;
}

// ─── Browser type shims ───────────────────────────────────────────────────────

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoice({
  lang = "en-US",
  onTranscript,
  onSpeakEnd,
}: UseVoiceOptions = {}): UseVoiceReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const finalTranscriptRef = useRef("");

  // ── Support detection ──────────────────────────────────────────────────────

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const isTTSSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Speech Recognition (STT) ───────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser.");
      setStatus("error");
      return;
    }

    // Cancel any ongoing TTS before listening
    window.speechSynthesis?.cancel();

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    finalTranscriptRef.current = "";

    recognition.onstart = () => {
      setStatus("listening");
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = final;
      setTranscript(final + interim);
    };

    recognition.onerror = (event: any) => {
      const msg =
        event.error === "not-allowed"
          ? "Microphone access denied. Please allow microphone permissions."
          : event.error === "no-speech"
            ? "No speech detected. Try again."
            : `Speech recognition error: ${event.error}`;
      setError(msg);
      setStatus("error");
    };

    recognition.onend = () => {
      const final = finalTranscriptRef.current.trim();
      if (final) {
        setTranscript(final);
        setStatus("processing");
        onTranscript?.(final);
      } else {
        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const toggleListening = useCallback(() => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  // ── Text-to-Speech (TTS) ───────────────────────────────────────────────────

  const speak = useCallback(
    (text: string) => {
      if (!isTTSSupported || !text.trim()) return;

      // Cancel any current speech
      window.speechSynthesis.cancel();

      // Strip markdown before speaking
      const cleaned = text
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, "code block")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/^\s*[-*+]\s/gm, "")
        .replace(/^\s*\d+\.\s/gm, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Prefer a natural-sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang &&
          lang &&
          v.lang.startsWith(lang.split("-")[0] || "en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Neural") ||
            v.name.includes("Premium") ||
            v.name.includes("Enhanced") ||
            !v.localService),
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setStatus("speaking");
      utterance.onend = () => {
        setStatus("idle");
        onSpeakEnd?.();
      };
      utterance.onerror = () => setStatus("idle");

      utteranceRef.current = utterance;

      // Chrome bug: long utterances silently stop. Resume-ping workaround.
      const resumePing = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumePing);
          return;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10_000);

      utterance.onend = () => {
        clearInterval(resumePing);
        setStatus("idle");
        onSpeakEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [isTTSSupported, lang, onSpeakEnd],
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }, []);

  return {
    status,
    transcript,
    isSupported,
    isTTSSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleListening,
    error,
  };
}

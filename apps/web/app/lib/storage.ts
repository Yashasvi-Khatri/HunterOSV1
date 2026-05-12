import type { Conversation, UserSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import type { TrustSignals } from "./trustScore";
import { computeTrustScore } from "./trustScore";

const CONVERSATIONS_KEY = "openrouter_conversations";
const SETTINGS_KEY = "openrouter_settings";

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return parsed.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

export function saveConversation(conversation: Conversation): void {
  if (typeof window === "undefined") return;
  const conversations = getConversations();
  const idx = conversations.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    conversations[idx] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function deleteConversation(id: string): void {
  if (typeof window === "undefined") return;
  const conversations = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function getSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as UserSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export interface TrustScoreData {
  score: number;
  signals: TrustSignals;
  lastUpdated: number;
  history: { score: number; date: number }[]; // for sparkline
}

export function saveTrustScore(data: TrustScoreData) {
  localStorage.setItem("hunter_trust_score", JSON.stringify(data));
}

export function loadTrustScore(): TrustScoreData | null {
  const raw = localStorage.getItem("hunter_trust_score");
  return raw ? JSON.parse(raw) : null;
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateTrustSignal(key: keyof TrustSignals, value: number) {
  const existing = loadTrustScore();
  const signals: TrustSignals = existing?.signals ?? {
    preflightPassRate: 0.5,
    peerReviewAvg: 2.5,
    rejectionAutopsyRate: 0,
    modelEfficiencyScore: 0.5,
    benchmarkScore: 50,
  };
  signals[key] = value;
  const score = computeTrustScore(signals);
  const history = existing?.history ?? [];
  saveTrustScore({
    score,
    signals,
    lastUpdated: Date.now(),
    history: [...history.slice(-29), { score, date: Date.now() }],
  });
}

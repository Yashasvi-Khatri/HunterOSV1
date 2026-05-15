import type { Conversation } from "./types";

function parseConversations(data: Conversation[]): Conversation[] {
  return data.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    messages: c.messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  }));
}

export async function fetchSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) return null;
  return res.json() as Promise<{
    defaultModel?: string;
    systemPrompt?: string;
    theme?: string;
  } | null>;
}

export async function saveSettingsClient(settings: {
  defaultModel?: string;
  systemPrompt?: string;
  theme?: string;
}) {
  await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) return [];
  const data = (await res.json()) as Conversation[];
  return parseConversations(data);
}

export async function deleteConversationClient(id: string) {
  await fetch(`/api/conversations/${id}`, { method: "DELETE" });
}

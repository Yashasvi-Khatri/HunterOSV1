export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string;
  attachments?: import("./attachment").AttachmentPayload[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  name: string;
  theme: "dark" | "light";
  defaultModel: string;
  systemPrompt: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  theme: "dark",
  defaultModel: "openai/gpt-4o",
  systemPrompt:
    "You are a helpful, knowledgeable, and friendly AI assistant. Be concise but thorough in your responses.",
};

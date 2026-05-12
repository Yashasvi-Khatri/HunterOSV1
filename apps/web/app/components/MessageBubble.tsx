"use client";

import type { Message } from "../lib/types";
import { AVAILABLE_MODELS } from "../lib/models";
import type { AttachmentPayload } from "../lib/attachment";
import { AttachmentStrip } from "./FileUploadArea";

interface MessageBubbleProps {
  message: Message;
  userName: string;
  isStreaming?: boolean;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  userName,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const modelName = message.model
    ? (AVAILABLE_MODELS.find((m) => m.id === message.model)?.name ??
      message.model)
    : null;

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
        }`}
      >
        {isUser ? (userName ? userName.charAt(0).toUpperCase() : "U") : "AI"}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{isUser ? userName || "You" : modelName || "Assistant"}</span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <AttachmentStrip
            attachments={message.attachments.map((a) => ({
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: a.name,
              type: a.type,
              mime: a.mime,
              base64: a.base64,
              sizeLabel: "", // Not needed in display
              previewUrl:
                a.type === "image"
                  ? `data:${a.mime};base64,${a.base64}`
                  : undefined,
            }))}
            onRemove={() => {}} // Read-only in message bubble
          />
        )}

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-white/5 text-gray-100 border border-white/10 rounded-tl-sm"
          }`}
        >
          {message.content}
          {isStreaming && !isUser && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-400 animate-blink rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}

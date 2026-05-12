"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, Conversation } from "../lib/types";
import { saveConversation } from "../lib/storage";
import { estimateCost, type CostEstimate } from "../lib/costs";
import type { AttachmentPayload } from "../lib/attachment";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function generateTitle(content: string): string {
  return content.length > 50 ? content.slice(0, 47) + "..." : content;
}

const ZERO_COST: CostEstimate = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  costUSD: 0,
  costINR: 0,
};

export function useChat(model: string, systemPrompt: string, userName: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<CostEstimate>(ZERO_COST);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  // Recalculate cost whenever active conversation changes
  const recalcCost = useCallback(
    (msgs: Message[], modelId: string) => {
      const estimate = estimateCost(msgs, modelId);
      setCostEstimate(estimate);
    },
    []
  );

  const loadConversations = useCallback((convs: Conversation[]) => {
    setConversations(convs);
  }, []);

  const newConversation = useCallback(() => {
    const id = generateId();
    const conv: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(id);
    setError(null);
    setCostEstimate(ZERO_COST);
    return id;
  }, [model]);

  const deleteConv = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveConversationId((prev) => (prev === id ? null : prev));
    setCostEstimate(ZERO_COST);
  }, []);

  // Update cost when switching conversations
  const handleSetActiveId = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === id);
        if (conv) recalcCost(conv.messages, conv.model);
        return prev;
      });
    },
    [recalcCost]
  );

  const sendMessage = useCallback(
    async (content: string, attachments?: AttachmentPayload[]) => {
      setError(null);
      let convId = activeConversationId;

      if (!convId) {
        convId = generateId();
        const newConv: Conversation = {
          id: convId,
          title: generateTitle(content),
          messages: [],
          model,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(convId);
      }

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
        attachments,
      };

      const asstId = generateId();
      const asstMsg: Message = {
        id: asstId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        model,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title: c.messages.length === 0 ? generateTitle(content) : c.title,
                messages: [...c.messages, userMsg, asstMsg],
                updatedAt: new Date(),
              }
            : c
        )
      );

      setIsStreaming(true);
      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const currentMsgs =
          conversations
            .find((c) => c.id === convId)
            ?.messages.map((m) => ({
              role: m.role,
              content: m.content,
              attachments: m.attachments,
            })) ?? [];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            messages: [...currentMsgs, { role: "user", content, attachments }],
            model,
            systemPrompt,
            userName,
          }),
        });

        if (!response.ok) {
          const errData = (await response.json()) as { error: string };
          throw new Error(errData.error || "API request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          const snapshot = full;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === asstId ? { ...m, content: snapshot } : m
                    ),
                  }
                : c
            )
          );
        }

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === asstId ? { ...m, content: full } : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          );
          const conv = updated.find((c) => c.id === convId);
          if (conv) {
            saveConversation(conv);
            recalcCost(conv.messages, model);
          }
          return updated;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === asstId ? { ...m, content: "Error: " + msg } : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeConversationId, conversations, model, systemPrompt, userName, recalcCost]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isStreaming,
    error,
    costEstimate,
    setActiveConversationId: handleSetActiveId,
    loadConversations,
    newConversation,
    deleteConversation: deleteConv,
    sendMessage,
    stopStreaming,
  };
}

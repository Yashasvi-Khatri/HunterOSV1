"use client";

import { useState, useCallback, useRef } from "react";
import type { AttachmentPayload } from "../lib/attachment";

interface CompareState {
  responses: string[];
  isLoading: boolean[];
  errors: (string | null)[];
  isComplete: boolean[];
}

export function useCompare() {
  const [state, setState] = useState<CompareState>({
    responses: [],
    isLoading: [],
    errors: [],
    isComplete: [],
  });

  const abortRef = useRef<AbortController | null>(null);

  const initializeState = useCallback((modelCount: number) => {
    setState({
      responses: Array(modelCount).fill(""),
      isLoading: Array(modelCount).fill(false),
      errors: Array(modelCount).fill(null),
      isComplete: Array(modelCount).fill(false),
    });
  }, []);

  const compare = useCallback(
    async (
      prompt: string,
      models: string[],
      systemPrompt?: string,
      attachments?: AttachmentPayload[]
    ) => {
      if (!prompt.trim() || !models.length) {
        return;
      }

      // Initialize state for the number of models
      initializeState(models.length);

      // Set loading state for all models
      setState((prev) => ({
        ...prev,
        isLoading: Array(models.length).fill(true),
        errors: Array(models.length).fill(null),
        isComplete: Array(models.length).fill(false),
      }));

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            prompt,
            models,
            systemPrompt,
            attachments,
          }),
        });

        if (!response.ok) {
          const errData = (await response.json()) as { error: string };
          throw new Error(errData.error || "API request failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();

        // Buffer for incomplete chunks
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines (chunks may contain multiple model responses)
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            // Parse multiplexed chunk: "index:content"
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;

            const indexStr = line.substring(0, colonIndex);
            const content = line.substring(colonIndex + 1);

            const modelIndex = parseInt(indexStr, 10);
            if (isNaN(modelIndex) || modelIndex < 0 || modelIndex >= models.length) {
              continue;
            }

            setState((prev) => {
              const newResponses = [...prev.responses];
              const newIsLoading = [...prev.isLoading];
              const newErrors = [...prev.errors];
              const newIsComplete = [...prev.isComplete];

              if (content === '[DONE]') {
                // Model finished streaming
                newIsLoading[modelIndex] = false;
                newIsComplete[modelIndex] = true;
              } else if (content.startsWith('[ERROR]')) {
                // Model encountered an error
                newIsLoading[modelIndex] = false;
                newErrors[modelIndex] = content.substring(7); // Remove '[ERROR]' prefix
              } else {
                // Regular content chunk
                newResponses[modelIndex] += content;
              }

              return {
                responses: newResponses,
                isLoading: newIsLoading,
                errors: newErrors,
                isComplete: newIsComplete,
              };
            });
          }
        }

        // Process any remaining buffer content
        if (buffer.trim()) {
          const colonIndex = buffer.indexOf(':');
          if (colonIndex !== -1) {
            const indexStr = buffer.substring(0, colonIndex);
            const content = buffer.substring(colonIndex + 1);
            const modelIndex = parseInt(indexStr, 10);

            if (!isNaN(modelIndex) && modelIndex >= 0 && modelIndex < models.length) {
              setState((prev) => {
                const newResponses = [...prev.responses];
                const newIsLoading = [...prev.isLoading];
                const newErrors = [...prev.errors];
                const newIsComplete = [...prev.isComplete];

                if (content === '[DONE]') {
                  newIsLoading[modelIndex] = false;
                  newIsComplete[modelIndex] = true;
                } else if (content.startsWith('[ERROR]')) {
                  newIsLoading[modelIndex] = false;
                  newErrors[modelIndex] = content.substring(7);
                } else {
                  newResponses[modelIndex] += content;
                }

                return {
                  responses: newResponses,
                  isLoading: newIsLoading,
                  errors: newErrors,
                  isComplete: newIsComplete,
                };
              });
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        
        const errorMsg = err instanceof Error ? err.message : "Something went wrong";
        
        // Set error for all models
        setState((prev) => ({
          ...prev,
          isLoading: Array(models.length).fill(false),
          errors: Array(models.length).fill(errorMsg),
        }));
      } finally {
        abortRef.current = null;
      }
    },
    [initializeState]
  );

  const stopComparison = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isLoading: Array(prev.isLoading.length).fill(false),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      responses: [],
      isLoading: [],
      errors: [],
      isComplete: [],
    });
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return {
    responses: state.responses,
    isLoading: state.isLoading,
    errors: state.errors,
    isComplete: state.isComplete,
    compare,
    stopComparison,
    reset,
  };
}

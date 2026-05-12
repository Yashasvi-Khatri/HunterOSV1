"use client";

import { useState } from "react";
import type { AttachmentPayload } from "../../lib/attachment";

interface PromptBarProps {
  onCompare: (
    prompt: string,
    models: string[],
    systemPrompt?: string,
    attachments?: AttachmentPayload[]
  ) => void;
  isLoading: boolean[];
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
}

export function PromptBar({
  onCompare,
  isLoading,
  selectedModels,
  onModelsChange,
}: PromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && selectedModels.length > 0) {
      onCompare(prompt.trim(), selectedModels, systemPrompt.trim() || undefined);
    }
  };

  const isAnyLoading = isLoading.some(Boolean);
  const canSubmit = prompt.trim() && selectedModels.length > 0 && !isAnyLoading;

  return (
    <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              System Prompt (optional)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter a system prompt to guide the models..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isAnyLoading}
            />
          </div>

          {/* Main Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like the models to help you with?"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isAnyLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""} selected
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnyLoading ? "Comparing..." : "Compare Models"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

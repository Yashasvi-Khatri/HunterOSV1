"use client";

import { useState, useEffect } from "react";
import { useCompare } from "../../hooks/useCompare";
import { AVAILABLE_MODELS } from "../../lib/models";
import { PromptBar } from "./PromptBar";
import { ModelColumn } from "./ModelColumn";
import type { AttachmentPayload } from "../../lib/attachment";

export function CompareView() {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    "openai/gpt-4o",
    "anthropic/claude-3.5-sonnet", 
    "google/gemini-pro-1.5"
  ]);
  
  const {
    responses,
    isLoading,
    errors,
    isComplete,
    compare,
    stopComparison,
    reset,
  } = useCompare();

  // Initialize state when component mounts
  useEffect(() => {
    // Reset state when component first mounts
    reset();
  }, [reset]);

  const handleCompare = (
    prompt: string,
    models: string[],
    systemPrompt?: string,
    attachments?: AttachmentPayload[]
  ) => {
    compare(prompt, models, systemPrompt, attachments);
  };

  const handleModelSelectionChange = (modelId: string, isSelected: boolean) => {
    if (isSelected) {
      if (selectedModels.length < 6) { // Limit to 6 models for UI space
        setSelectedModels([...selectedModels, modelId]);
      }
    } else {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    }
  };

  const handleStopComparison = () => {
    stopComparison();
  };

  const handleReset = () => {
    reset();
  };

  const isAnyLoading = isLoading.some(Boolean);
  const hasAnyResponse = responses.some(response => response.length > 0);

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header with Model Selection */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">⚡ Model Comparison</h1>
            <div className="flex items-center space-x-2">
              {isAnyLoading && (
                <button
                  onClick={handleStopComparison}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                >
                  Stop
                </button>
              )}
              {hasAnyResponse && !isAnyLoading && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Select Models to Compare ({selectedModels.length}/6)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {AVAILABLE_MODELS.map((model) => (
                <label
                  key={model.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.id)}
                    onChange={(e) => handleModelSelectionChange(model.id, e.target.checked)}
                    disabled={isAnyLoading || (!selectedModels.includes(model.id) && selectedModels.length >= 6)}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-300 truncate">
                    {model.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Bar */}
      <PromptBar
        onCompare={handleCompare}
        isLoading={isLoading}
        selectedModels={selectedModels}
        onModelsChange={setSelectedModels}
      />

      {/* Model Columns */}
      <div className="flex-1 flex overflow-hidden">
        {selectedModels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">No models selected</p>
              <p className="text-gray-500 text-sm">Select at least one model above to start comparing</p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-0 flex-1`} style={{ gridTemplateColumns: `repeat(${selectedModels.length}, 1fr)` }}>
            {selectedModels.map((modelId, index) => (
              <ModelColumn
                key={modelId}
                modelId={modelId}
                response={responses[index] || ""}
                isLoading={isLoading[index] || false}
                error={errors[index] || null}
                isComplete={isComplete[index] || false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

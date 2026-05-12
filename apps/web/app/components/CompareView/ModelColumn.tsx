"use client";

import { AVAILABLE_MODELS } from "../../lib/models";

interface ModelColumnProps {
  modelId: string;
  response: string;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
}

export function ModelColumn({
  modelId,
  response,
  isLoading,
  error,
  isComplete,
}: ModelColumnProps) {
  const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
  const modelName = model?.name || modelId;
  const provider = model?.provider || "Unknown";

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 last:border-r-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">{modelName}</h3>
            <p className="text-sm text-gray-400">{provider}</p>
          </div>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-400">Thinking</span>
              </div>
            )}
            {isComplete && !error && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-400">Done</span>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-400">Error</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error ? (
          <div className="text-red-400 text-sm">
            <p className="font-medium mb-2">Error occurred:</p>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : !response && !isLoading ? (
          <div className="text-gray-500 text-sm italic">
            Waiting for prompt...
          </div>
        ) : (
          <div className="text-gray-100 whitespace-pre-wrap text-sm leading-relaxed">
            {response || (isLoading && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-xs">Thinking...</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Info Footer */}
      <div className="border-t border-gray-800 px-4 py-2 bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{model?.contextLength ? `${model.contextLength.toLocaleString()} context` : "Unknown context"}</span>
          {model?.free && (
            <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded-full text-xs">
              Free
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

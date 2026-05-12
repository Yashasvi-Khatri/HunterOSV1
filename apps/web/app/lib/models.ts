export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextLength: number;
  free?: boolean;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable OpenAI model",
    contextLength: 128000,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast & affordable GPT-4",
    contextLength: 128000,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Excellent for reasoning & coding",
    contextLength: 200000,
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fast & efficient Claude",
    contextLength: 200000,
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "Google",
    description: "Long context Google model",
    contextLength: 1000000,
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    provider: "Meta",
    description: "Free open-source model",
    contextLength: 131072,
    free: true,
  },
  {
    id: "mistralai/mistral-7b-instruct",
    name: "Mistral 7B",
    provider: "Mistral",
    description: "Free fast open model",
    contextLength: 32768,
    free: true,
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0]!;

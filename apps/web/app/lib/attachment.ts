// ─── Attachment types shared between client + server ─────────────────────────

export type AttachmentType = "image" | "pdf";

export type SupportedImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

export type SupportedMime = SupportedImageMime | "application/pdf";

/** What the client holds before sending */
export interface FileAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  mime: SupportedMime;
  /** Base64-encoded file content (no data-URL prefix) */
  base64: string;
  /** Human-readable size, e.g. "1.2 MB" */
  sizeLabel: string;
  /** Object URL for preview thumbnails (images only) */
  previewUrl?: string;
}

/** What gets serialised into the chat message and sent to the API */
export interface AttachmentPayload {
  type: AttachmentType;
  mime: SupportedMime;
  base64: string;
  name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCEPTED_MIME_TYPES: SupportedMime[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.gif,.webp,.pdf";

/** 20 MB hard limit */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

/** Models that support vision (images + PDFs via base64) */
export const VISION_MODELS = new Set([
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "openai/gpt-4-turbo",
  "anthropic/claude-opus-4-5",
  "anthropic/claude-sonnet-4-5",
  "anthropic/claude-haiku-4-5",
  "anthropic/claude-3-5-sonnet-20241022",
  "anthropic/claude-3-5-haiku-20241022",
  "anthropic/claude-3-opus-20240229",
  "google/gemini-pro-vision",
  "google/gemini-1.5-pro",
  "google/gemini-1.5-flash",
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.2-11b-vision-instruct",
  "meta-llama/llama-3.2-90b-vision-instruct",
  "mistralai/pixtral-12b",
  "qwen/qwen-vl-plus",
]);

export function modelSupportsVision(modelId: string): boolean {
  if (VISION_MODELS.has(modelId)) return true;
  // Also catch any model with "vision" in its id
  return modelId.toLowerCase().includes("vision");
}

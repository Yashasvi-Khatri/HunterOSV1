import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AttachmentPayload, modelSupportsVision } from "../../lib/attachment";

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: AttachmentPayload[];
}

interface RequestBody {
  messages: IncomingMessage[];
  model: string;
  systemPrompt?: string;
}

// ─── Build a single message's content array ───────────────────────────────────
//
// OpenRouter follows the OpenAI vision spec:
//   text   → { type: "text", text: "..." }
//   image  → { type: "image_url", image_url: { url: "data:<mime>;base64,<data>" } }
//   pdf    → { type: "text", text: "[PDF: <filename>]\n<extracted or summarised>" }
//              OR use the document block format if the model supports it.
//
// For PDFs we embed them as base64 document blocks (Anthropic format) for
// Claude models and fall back to a data-URL image approach for GPT/Gemini
// because they don't have a native PDF block type yet.
//

function buildContentArray(
  text: string,
  attachments: AttachmentPayload[] = [],
  model: string,
): OpenAI.ChatCompletionContentPart[] {
  const parts: OpenAI.ChatCompletionContentPart[] = [];

  // Attachments first so the model sees context before the question
  for (const att of attachments) {
    if (att.type === "image") {
      parts.push({
        type: "image_url",
        image_url: {
          url: `data:${att.mime};base64,${att.base64}`,
          detail: "auto",
        },
      } as OpenAI.ChatCompletionContentPart);
    } else if (att.type === "pdf") {
      const isClaudeModel = model.toLowerCase().startsWith("anthropic/");

      if (isClaudeModel) {
        // Anthropic document block (passed through OpenRouter's Claude routing)
        parts.push({
          type: "document" as never, // OpenAI SDK doesn't type this, but OR passes it through
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: att.base64,
          },
        } as unknown as OpenAI.ChatCompletionContentPart);
      } else {
        // For GPT-4o / Gemini: send as a data-URL image (first page rasterised
        // in the browser) or as a text note. We use a text note here because
        // rasterisation is complex — the client should pre-convert if needed.
        parts.push({
          type: "text",
          text: `[Attached PDF: "${att.name}". The file has been included as a base64-encoded document for your analysis.]`,
        });
        // Also push the raw base64 as a URL for models that accept it
        parts.push({
          type: "image_url",
          image_url: {
            url: `data:application/pdf;base64,${att.base64}`,
          },
        } as OpenAI.ChatCompletionContentPart);
      }
    }
  }

  // Then the user's text
  if (text.trim()) {
    parts.push({ type: "text", text });
  }

  return parts;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Ensure environment variables are available
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "";
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "OpenRouter",
    },
  });

  try {
    const body: RequestBody = await req.json();
    const { messages, model, systemPrompt } = body;

    if (!messages?.length || !model) {
      return NextResponse.json(
        { error: "messages and model are required" },
        { status: 400 },
      );
    }

    // Check if any message has attachments and if the model supports vision
    const hasAttachments = messages.some(
      (msg) => msg.attachments && msg.attachments.length > 0,
    );
    if (hasAttachments && !modelSupportsVision(model)) {
      return NextResponse.json(
        {
          error: `Model ${model} does not support image input. Please use a vision-capable model like GPT-4o, Claude, or Gemini.`,
        },
        { status: 400 },
      );
    }

    // Build the full message array for OpenRouter
    const openrouterMessages: OpenAI.ChatCompletionMessageParam[] = [];

    // System prompt
    if (systemPrompt?.trim()) {
      openrouterMessages.push({ role: "system", content: systemPrompt });
    }

    // Convert each message — only user messages can carry attachments
    for (const msg of messages) {
      if (msg.role === "user" && msg.attachments?.length) {
        openrouterMessages.push({
          role: "user",
          content: buildContentArray(msg.content, msg.attachments, model),
        });
      } else {
        openrouterMessages.push({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        });
      }
    }

    // Streaming request to OpenRouter
    try {
      const stream = await openrouter.chat.completions.create({
        model,
        messages: openrouterMessages,
        stream: true,
        max_tokens: 4096,
      });

      // Pipe the stream back to the client
      const encoder = new TextEncoder();

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta?.content ?? "";
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
              // Signal end
              if (chunk.choices[0]?.finish_reason) {
                controller.close();
              }
            }
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "X-Accel-Buffering": "no",
        },
      });
    } catch (openrouterError: unknown) {
      console.error("[/api/chat] OpenRouter Error:", openrouterError);
      const message =
        openrouterError instanceof Error
          ? openrouterError.message
          : "OpenRouter API error";

      // Provide more helpful error messages for common issues
      if (message.includes("404") || message.includes("No endpoints found")) {
        return NextResponse.json(
          {
            error:
              "Model not found or doesn't support the requested features. Try a different model.",
          },
          { status: 400 },
        );
      }

      if (message.includes("401") || message.includes("Unauthorized")) {
        return NextResponse.json(
          {
            error:
              "Invalid API key. Please check your OpenRouter API key configuration.",
          },
          { status: 401 },
        );
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (err: unknown) {
    console.error("[/api/chat] Error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

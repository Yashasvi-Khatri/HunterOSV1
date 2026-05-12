import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AttachmentPayload } from "../../lib/attachment";

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
    const body: {
      prompt: string;
      models: string[];
      systemPrompt?: string;
      attachments?: AttachmentPayload[];
    } = await req.json();
    const { prompt, models, systemPrompt, attachments } = body;

    if (!prompt?.trim() || !models?.length) {
      return NextResponse.json(
        { error: "prompt and models are required" },
        { status: 400 },
      );
    }

    if (models.length > 10) {
      return NextResponse.json(
        { error: "maximum 10 models allowed for comparison" },
        { status: 400 },
      );
    }

    // Create multiplexed stream
    const encoder = new TextEncoder();
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();

    // Start all model streams simultaneously
    const modelPromises = models.map(async (model, index) => {
      try {
        const modelStream = await createModelStream(
          model,
          prompt,
          systemPrompt,
          attachments,
          openrouter,
        );

        for await (const chunk of modelStream) {
          // Prefix each chunk with model index for multiplexing
          await writer.write(encoder.encode(`${index}:${chunk}`));
        }

        // Signal completion for this model
        await writer.write(encoder.encode(`${index}:[DONE]`));
      } catch (error) {
        console.error(`Error streaming model ${model}:`, error);
        // Send error message for this model
        await writer.write(
          encoder.encode(
            `${index}:[ERROR]${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    });

    // Close stream when all models are done
    Promise.all(modelPromises)
      .then(() => {
        writer.close();
      })
      .catch((error) => {
        console.error("Error in model streaming:", error);
        writer.close();
      });

    return new NextResponse(transformStream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("[/api/compare] Error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Types matching what the client sends ────────────────────────────────────

interface CompareRequestBody {
  prompt: string;
  models: string[];
  systemPrompt?: string;
  attachments?: AttachmentPayload[];
}

// ─── Build a single message's content array (reused from chat route) ─────────

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
        // For GPT-4o / Gemini: send as a data-URL image or text note
        parts.push({
          type: "text",
          text: `[Attached PDF: "${att.name}". The file has been included as a base64-encoded document for your analysis.]`,
        });
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

// ─── Create stream for a single model ─────────────────────────────────────────

async function createModelStream(
  model: string,
  prompt: string,
  systemPrompt: string | undefined,
  attachments: AttachmentPayload[] = [],
  openrouter: OpenAI,
): Promise<AsyncIterable<string>> {
  // Build messages for OpenRouter
  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  // System prompt
  if (systemPrompt?.trim()) {
    messages.push({ role: "system", content: systemPrompt });
  }

  // User message with attachments
  messages.push({
    role: "user",
    content: buildContentArray(prompt, attachments, model),
  });

  // Create streaming request
  const stream = await openrouter.chat.completions.create({
    model,
    messages,
    stream: true,
    max_tokens: 4096,
  });

  // Convert to string chunks
  async function* stringGenerator(): AsyncIterable<string> {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        yield delta;
      }
      // Signal end
      if (chunk.choices[0]?.finish_reason) {
        break;
      }
    }
  }

  return stringGenerator();
}

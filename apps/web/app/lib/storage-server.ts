import type { Prisma } from "@prisma/client"
import { db } from "./db"
import type { Conversation, Message } from "./types"

// ── Conversations ──────────────────────────────────────────────────────────

export async function getConversationsDB(
  userId: string
): Promise<Conversation[]> {
  const rows = await db.conversation.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  })

  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    model: c.model,
    messages: c.messages.map((m) => ({
      id: m.id,
      role: m.role as Message["role"],
      content: m.content,
      timestamp: m.createdAt,
      model: m.model ?? undefined,
    })),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))
}

export async function saveConversationDB(
  userId: string,
  conversation: Conversation
): Promise<void> {
  await db.conversation.upsert({
    where: { id: conversation.id },
    create: {
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      userId,
      messages: {
        create: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          model: m.model,
          createdAt: m.timestamp,
        })),
      },
    },
    update: {
      title: conversation.title,
      updatedAt: new Date(),
      messages: {
        deleteMany: {},
        create: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          model: m.model,
          createdAt: m.timestamp,
        })),
      },
    },
  })
}

export async function deleteConversationDB(
  userId: string,
  conversationId: string
): Promise<void> {
  await db.conversation.deleteMany({
    where: { id: conversationId, userId },
  })
}

// ── Settings ───────────────────────────────────────────────────────────────

export async function getSettingsDB(userId: string) {
  return db.userSettings.findUnique({ where: { userId } })
}

export async function saveSettingsDB(
  userId: string,
  settings: { defaultModel?: string; systemPrompt?: string; theme?: string }
) {
  return db.userSettings.upsert({
    where: { userId },
    create: { userId, ...settings },
    update: settings,
  })
}

// ── BountyChecks ───────────────────────────────────────────────────────────

export async function saveBountyCheckDB(
  userId: string,
  check: {
    feature: string
    bountyName: string
    score: number
    verdict: string
    details: Prisma.InputJsonValue
  }
) {
  return db.bountyCheck.create({
    data: { userId, ...check },
  })
}

export async function getBountyChecksDB(userId: string) {
  return db.bountyCheck.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

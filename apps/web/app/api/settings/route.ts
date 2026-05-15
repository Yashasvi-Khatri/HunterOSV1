import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { getSettingsDB, saveSettingsDB } from "../../lib/storage-server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSettingsDB(session.user.id);
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const settings = await saveSettingsDB(session.user.id, {
    defaultModel: body.defaultModel,
    systemPrompt: body.systemPrompt,
    theme: body.theme,
  });

  return NextResponse.json(settings);
}

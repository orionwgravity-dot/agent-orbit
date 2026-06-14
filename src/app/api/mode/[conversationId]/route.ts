import { NextResponse } from "next/server";
import { setMode } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function POST(req: Request, ctx: RouteContext) {
  const { conversationId } = await ctx.params;
  const id = parseInt(conversationId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "id invalido" }, { status: 400 });
  }
  const body = await req.json();
  const mode = body.mode;
  if (mode !== "AI" && mode !== "HUMAN") {
    return NextResponse.json({ error: "mode debe ser 'AI' o 'HUMAN'" }, { status: 400 });
  }
  setMode(id, mode);
  return NextResponse.json({ ok: true });
}
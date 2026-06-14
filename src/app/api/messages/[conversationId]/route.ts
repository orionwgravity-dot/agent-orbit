import { NextResponse } from "next/server";
import { getMessages, insertMessage, getConversationById, enqueueOutbox } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { conversationId } = await ctx.params;
  const id = parseInt(conversationId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "id invalido" }, { status: 400 });
  }
  const messages = getMessages(id, 200);
  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: RouteContext) {
  const { conversationId } = await ctx.params;
  const id = parseInt(conversationId, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "id invalido" }, { status: 400 });
  }
  const body = await req.json();
  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "contenido vacio" }, { status: 400 });
  }
  const convo = getConversationById(id);
  if (!convo) {
    return NextResponse.json({ error: "conversacion no encontrada" }, { status: 404 });
  }
  const messageId = insertMessage(id, "human", content);
  enqueueOutbox(id, convo.phone, content);
  return NextResponse.json({ ok: true, messageId });
}
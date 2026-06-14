import OpenAI from "openai";
import type { Message } from "./db";
import { buildSystemPrompt } from "./system-prompt";
import { executeTool, toolDefinitions } from "./tools";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) throw new Error("Falta OPENROUTER_API_KEY. Ejecuta /setup.");
  _client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/oriongravity/whatsapp-ai-agent-kit",
      "X-Title": "WhatsApp AI Agent Kit",
    },
  });
  return _client;
}

const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export async function validateApiKey(): Promise<{ ok: boolean; error?: string }> {
  try {
    await getClient().models.list();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function generateReply(input: { history: Message[]; conversationId: number }): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: await buildSystemPrompt() },
    ...input.history.map((m): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  const MAX_TURNS = 5;
  let turns = 0;

  while (turns < MAX_TURNS) {
    const res = await getClient().chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
      temperature: 0.4,
    });

    const msg = res.choices[0].message;

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return msg.content ?? "";
    }

    messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });

    for (const call of msg.tool_calls) {
      if (call.type !== "function") continue;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments);
      } catch {}
      const result = await executeTool(call.function.name, args, { conversationId: input.conversationId });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    turns++;
  }

  return "Déjame un momento — vuelvo contigo enseguida.";
}
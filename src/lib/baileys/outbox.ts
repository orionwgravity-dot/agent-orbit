import type { WASocket } from "@whiskeysockets/baileys";
import { getPendingOutbox, markOutboxSent, getConversationById } from "../db";

let outboxTimer: ReturnType<typeof setInterval> | null = null;

export function startOutboxLoop(sock: WASocket): void {
  if (outboxTimer) return;
  outboxTimer = setInterval(async () => {
    const pending = getPendingOutbox(20);
    for (const item of pending) {
      const convo = getConversationById(item.conversation_id);
      const jid = convo?.jid ?? `${item.phone}@s.whatsapp.net`;
      try {
        await sock.sendMessage(jid, { text: item.content });
        markOutboxSent(item.id);
      } catch {
        // No marcar enviado; se reintentará en el siguiente tick
      }
    }
  }, 2000);
}

export function stopOutboxLoop(): void {
  if (outboxTimer) {
    clearInterval(outboxTimer);
    outboxTimer = null;
  }
}
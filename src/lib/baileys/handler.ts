import type { WASocket, BaileysEventMap } from "@whiskeysockets/baileys";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import {
  getOrCreateConversation,
  insertMessage,
  getConversationById,
  getRecentHistory,
} from "../db";
import { generateReply } from "../openrouter";
import { transcribeAudio } from "../transcribe";

export async function handleIncomingMessages(
  sock: WASocket,
  event: BaileysEventMap["messages.upsert"]
): Promise<void> {
  if (event.type !== "notify") return;

  for (const msg of event.messages) {
    if (msg.key.fromMe) continue;

    const remoteJid = msg.key.remoteJid;
    if (!remoteJid) continue;

    if (
      remoteJid.endsWith("@g.us") ||
      remoteJid.endsWith("@broadcast") ||
      remoteJid.endsWith("@newsletter")
    ) {
      continue;
    }

    if (!remoteJid.endsWith("@s.whatsapp.net") && !remoteJid.endsWith("@lid")) {
      continue;
    }

    const msgType = msg.message ? Object.keys(msg.message).find(k => !k.startsWith('contextInfo') && k !== 'extendedTextMessage') : null;
    console.log("Mensaje recibido - tipo:", msgType, "remoteJid:", remoteJid);

    let text: string | null = null;

    if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
      text =
        msg.message?.conversation ??
        msg.message?.extendedTextMessage?.text ??
        null;
    } else if (msg.message?.audioMessage || msg.message?.ptvMessage) {
      const audioMsg = msg.message?.audioMessage ?? msg.message?.ptvMessage;
      try {
        console.log("Procesando audio, mimetype:", audioMsg?.mimetype);
        const buffer: Buffer = await downloadMediaMessage(
          msg,
          "buffer",
          {}
        ) as Buffer;
        const ext = audioMsg?.mimetype?.includes("mp3") ? "mp3" : "ogg";
        const transcription = await transcribeAudio(buffer, `audio.${ext}`);
        text = `[Audio] ${transcription}`;
        console.log("Audio transcribed successfully:", text);
      } catch (err) {
        console.error("Error transcribing audio:", err);
        text = "[Audio recibido - error al transcribir]";
      }
    }

    if (!text) {
      console.log("Mensaje ignorado - sin texto o audio");
      continue;
    }

    const phone = remoteJid.split("@")[0].split(":")[0];
    const name = msg.pushName ?? undefined;

    const convo = getOrCreateConversation(phone, name, remoteJid);
    insertMessage(convo.id, "user", text);

    const fresh = getConversationById(convo.id);
    if (!fresh || fresh.mode !== "AI") continue;

    const reply = await generateReply({
      history: getRecentHistory(convo.id, 20),
      conversationId: convo.id,
    });

    if (!reply) continue;

    insertMessage(convo.id, "assistant", reply);
    await sock.sendMessage(remoteJid, { text: reply });
  }
}
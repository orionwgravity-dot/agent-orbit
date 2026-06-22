import OpenAI from "openai";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "whisper-large-v3";

function getClient(): OpenAI {
  if (!GROQ_API_KEY) {
    throw new Error("Falta GROQ_API_KEY. Agregala en tu .env.local");
  }
  return new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename = "audio.ogg"
): Promise<string> {
  const client = getClient();

  const arrayBuffer = audioBuffer.buffer.slice(
    audioBuffer.byteOffset,
    audioBuffer.byteOffset + audioBuffer.byteLength
  ) as ArrayBuffer;
  const file = new File([arrayBuffer], filename, {
    type: filename.endsWith(".mp3") ? "audio/mpeg" : "audio/ogg",
  });

  const transcription = await client.audio.transcriptions.create({
    model: GROQ_MODEL,
    file: file,
    language: "es",
  });

  return transcription.text;
}

export async function validateGroqKey(): Promise<{ ok: boolean; error?: string }> {
  try {
    getClient();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

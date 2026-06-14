import fs from "fs";
import path from "path";

const FALLBACK_PROMPT = `Eres un asistente de WhatsApp cortés y profesional. Tu trabajo es recoger datos de contacto y cualificar leads.

Cuando un usuario te escriba, preséntate amablemente y pide los siguientes datos:
- Nombre completo
- Teléfono (formato internacional, ej: +34612345678)
- A qué se dedica / qué negocio tiene
- Un resumen breve de su necesidad

Después de recoger los datos, usa la herramienta guardarLead para almacenar la información.

Responde siempre en español, de forma cercana y profesional.`;

const GOOGLE_DOC_URL = process.env.GOOGLE_DOC_URL;

let cachedPrompt: string | null = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000;

async function fetchGoogleDoc(): Promise<string | null> {
  if (!GOOGLE_DOC_URL) return null;
  
  if (cachedPrompt && (Date.now() - cacheTime) < CACHE_DURATION_MS) {
    return cachedPrompt;
  }
  
  try {
    const response = await fetch(GOOGLE_DOC_URL, {
      headers: { "Accept": "text/plain" },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.warn(`Google Doc fetch failed: ${response.status}`);
      return cachedPrompt;
    }
    
    const text = await response.text();
    if (!text || text.trim().length < 100) {
      console.warn("Google Doc returned empty or too short content");
      return cachedPrompt;
    }
    
    cachedPrompt = text;
    cacheTime = Date.now();
    console.log("Google Doc prompt updated");
    return cachedPrompt;
  } catch (error) {
    console.warn("Failed to fetch Google Doc:", error);
    return cachedPrompt;
  }
}

export async function buildSystemPrompt(): Promise<string> {
  const negocio = await fetchGoogleDoc();
  
  if (negocio) {
    console.log("Using prompt from Google Docs");
    return negocio;
  }

  const NEGOCIO_PATH = path.resolve(process.cwd(), "prompts", "negocio.md");
  if (fs.existsSync(NEGOCIO_PATH)) {
    console.log("Using local prompt file");
    const negocioLocal = fs.readFileSync(NEGOCIO_PATH, "utf-8");
    return formatPrompt(negocioLocal);
  }

  console.warn("No prompt source found, using fallback");
  return FALLBACK_PROMPT;
}

function formatPrompt(negocio: string): string {
  return `Eres el asistente virtual de un negocio. Atiendes por WhatsApp, qualifique leads y agendar llamadas cuando corresponda.

## Datos de tu negocio
${negocio}

## Reglas generales de comunicación
- Habla en español neutro conversacional.
- Mantén las respuestas cortas: 2-4 líneas máximo.
- No uses emojis.
- Haz una pregunta a la vez.
- Si el lead se desvía del objetivo (calificar y agendar), redirígelo con suavidad.
- Si no sabes algo con certeza, usa la herramienta derivarHumano.

## Cuándo usar cada tool
- guardarLead: en cuanto tengas nombre + teléfono + algún dato relevante del lead.
- calificar: cuando tengas los datos clave del lead (negocio, facturación, necesidad).
- agendar: SOLO si calificar devolvió califica=true (score >= 7). Si no, responde cordialmente sin agendar.
- derivarHumano: si el lead pide precios específicos, tiene quejas, o algo está fuera de tu alcance.`;
}
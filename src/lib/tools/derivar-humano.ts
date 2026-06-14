import type { GenericHandler } from "./index";
import { setMode } from "../db";

export const derivarHumano: GenericHandler = async (args) => {
  const { razon, conversationId } = args;

  if (!conversationId) {
    return { ok: false, message: "No se pudo derivar: falta conversationId (bug del wrapper de tools)" };
  }

  setMode(conversationId, "HUMAN");

  return {
    ok: true,
    message: "Conversación derivada a HUMAN. Razón: " + razon,
    instruccion:
      "Responde al usuario con algo como: 'Te paso con una persona del equipo, te escribe enseguida.' No respondas más en esta conversación.",
  };
};
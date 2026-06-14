import type { GenericHandler } from "./index";

export const guardarLead: GenericHandler = async (args) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.trim()) {
    return { ok: false, message: "Tool no configurada: falta GOOGLE_SHEETS_WEBHOOK_URL" };
  }

  const { nombre, telefono, negocio, facturacion, dolor } = args;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre ?? "",
        telefono: telefono ?? "",
        negocio: negocio ?? "",
        facturacion: facturacion ?? "",
        dolor: dolor ?? "",
        fecha: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      return { ok: true, message: "Lead guardado en Google Sheets" };
    }
    return { ok: false, message: "Webhook respondió " + res.status };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
};
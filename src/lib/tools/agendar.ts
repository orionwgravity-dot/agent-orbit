import type { GenericHandler } from "./index";

export const agendar: GenericHandler = async (args) => {
  const baseUrl = process.env.CAL_BOOKING_URL;
  if (!baseUrl || !baseUrl.trim()) {
    return { ok: false, message: "Tool no configurada: falta CAL_BOOKING_URL" };
  }

  const { nombre, email } = args;

  try {
    const url = new URL(baseUrl);
    url.searchParams.set("name", String(nombre));
    if (email) url.searchParams.set("email", String(email));
    return {
      ok: true,
      link: url.toString(),
      message: "Envía este link al lead para agendar: " + url.toString(),
    };
  } catch {
    return { ok: false, message: "URL de calendario inválida: " + baseUrl };
  }
};
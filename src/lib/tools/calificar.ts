import type { GenericHandler } from "./index";

export const calificar: GenericHandler = async (args) => {
  const {
    tieneNegocioActivo = false,
    facturaMasDe5kMes = false,
    dolorEncajaConPropuesta = false,
    urgenciaAlta = false,
    presupuestoConfirmado = false,
  } = args;

  let score = 0;
  if (tieneNegocioActivo) score += 3;
  if (facturaMasDe5kMes) score += 3;
  if (dolorEncajaConPropuesta) score += 2;
  if (urgenciaAlta) score += 1;
  if (presupuestoConfirmado) score += 1;

  const califica = score >= 7;

  return {
    ok: true,
    score,
    califica,
    mensaje: califica
      ? "Lead cualificado. Procede a agendar llamada."
      : "Lead NO cualificado. Responde cordialmente sin agendar.",
  };
};
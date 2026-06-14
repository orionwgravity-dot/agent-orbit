export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export type GenericHandler = (args: Record<string, unknown> & { conversationId?: number }) => Promise<Record<string, unknown>>;

export const guardarLeadDefinition: ToolDefinition = {
  type: "function",
  function: {
    name: "guardarLead",
    description: "Guarda los datos de un lead en Google Sheets cuando se tienen al menos nombre y teléfono.",
    parameters: {
      type: "object",
      properties: {
        nombre: { type: "string", description: "Nombre del lead" },
        telefono: { type: "string", description: "Teléfono del lead (formato internacional)" },
        negocio: { type: "string", description: "A qué se dedica el lead" },
        facturacion: { type: "string", description: "Rango de facturación mensual si lo ha mencionado" },
        dolor: { type: "string", description: "Dolor o necesidad principal que expressed" },
      },
      required: ["nombre", "telefono"],
    },
  },
};

export const calificarDefinition: ToolDefinition = {
  type: "function",
  function: {
    name: "calificar",
    description: "Califica un lead según criterios predefinidos para determinar si encaja con la propuesta.",
    parameters: {
      type: "object",
      properties: {
        tieneNegocioActivo: {
          type: "boolean",
          description: "El lead tiene un negocio en funcionamiento",
        },
        facturaMasDe5kMes: {
          type: "boolean",
          description: "Factura más de 5.000€ al mes",
        },
        dolorEncajaConPropuesta: {
          type: "boolean",
          description: "El problema/dolor que expresa encaja con lo que ofrece el negocio",
        },
        urgenciaAlta: {
          type: "boolean",
          description: "Muestra urgencia o necesidad inmediata",
        },
        presupuestoConfirmado: {
          type: "boolean",
          description: "Ha mencionado o confirmado que tiene presupuesto disponible",
        },
      },
      required: [],
    },
  },
};

export const agendarDefinition: ToolDefinition = {
  type: "function",
  function: {
    name: "agendar",
    description: "Genera un enlace de calendario para agendar una llamada. Solo usar si calificar devolvio califica=true.",
    parameters: {
      type: "object",
      properties: {
        nombre: { type: "string", description: "Nombre del lead" },
        email: { type: "string", description: "Email del lead (opcional)" },
      },
      required: ["nombre"],
    },
  },
};

export const derivarHumanoDefinition: ToolDefinition = {
  type: "function",
  function: {
    name: "derivarHumano",
    description: "Deriva la conversación a un humano cuando la consulta requiere atención personalizada.",
    parameters: {
      type: "object",
      properties: {
        razon: {
          type: "string",
          description: "Por qué se deriva. Útil para que el humano sepa el contexto.",
        },
      },
      required: ["razon"],
    },
  },
};

export const toolDefinitions: ToolDefinition[] = [
  guardarLeadDefinition,
  calificarDefinition,
  agendarDefinition,
  derivarHumanoDefinition,
];

const handlers: Record<string, GenericHandler> = {};

import { guardarLead } from "./guardar-lead";
import { calificar } from "./calificar";
import { agendar } from "./agendar";
import { derivarHumano } from "./derivar-humano";

handlers.guardarLead = guardarLead;
handlers.calificar = calificar;
handlers.agendar = agendar;
handlers.derivarHumano = derivarHumano;

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: { conversationId: number }
): Promise<Record<string, unknown>> {
  const handler = handlers[toolName];
  if (!handler) {
    return { ok: false, message: "Tool desconocida: " + toolName };
  }
  return handler({ ...args, conversationId: context.conversationId });
}
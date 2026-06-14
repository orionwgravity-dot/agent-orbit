# 04 — Configurar las tools

## Qué son las tools

Las tools son acciones que el agente puede ejecutar durante la conversación:

1. **guardarLead** — guarda datos en Google Sheets
2. **calificar** — puntúa el lead según criterios
3. **agendar** — genera link de calendario (Cal.com/Calendly)
4. **derivarHumano** — pasa la conversación a modo humano

## guardarLead — Google Sheets

Necesitas un Google Apps Script que reciba los datos y los escriba en una hoja.

### Paso 1: Crear el script

1. Ve a https://script.google.com
2. Nuevo proyecto
3. Pega este código:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(data.fecha),
    data.nombre,
    data.telefono,
    data.negocio,
    data.facturacion,
    data.dolor,
  ]);
  return ContentService.createTextOutput(JSON.stringify({ok: true}));
}
```

4. Despliega → Nueva implementación → App web
5. Ejecutar como: Yo
6. Acceso:Cualquier persona
7. Copiar la URL

### Paso 2: Configurar

Añade la URL en `.env.local`:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/.../exec
```

## calificar — Scoring de leads

Los pesos están en `src/lib/tools/calificar.ts`:

| Criterio | Puntos |
|---|---|
| tieneNegocioActivo | 3 |
| facturaMasDe5kMes | 3 |
| dolorEncajaConPropuesta | 2 |
| urgenciaAlta | 1 |
| presupuestoConfirmado | 1 |

Score ≥ 7 = lead cualificado → se puede agendar.

Para ajustar los pesos, edita el ficheo `src/lib/tools/calificar.ts`.

## agendar — Calendario

### Cal.com

1. Crear cuenta en cal.com
2. Crear un tipo de evento (ej: "Diagnóstico")
3. Copiar el enlace del evento

### Calendly

1. Crear cuenta en calendly.com
2. Crear un tipo de evento
3. Copiar el enlace

### Configurar

Añade la URL en `.env.local`:

```
CAL_BOOKING_URL=https://cal.com/tu-usuario/diagnostico
```

## derivarHumano

No necesita configuración. Cuando el agente la ejecuta:
1. La conversación cambia a modo HUMAN
2. El agente responde con un mensaje de despedida
3. El operador puede responder desde el panel

## Si una tool no está configurada

La tool devuelve `ok: false` con un mensaje. El agente recibe ese mensaje y reacciona sin romper el flujo.

## Siguiente paso

[Cloudflare Access](./05-cloudflare-access.md)
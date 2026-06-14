---
description: Instala y configura el kit completo de cero
---

# /setup — Primera instalación

Configura el kit completo en tu máquina local.

## Fase A — Validación silenciosa

Antes de preguntar nada, verificar:
- `node --version` → debe ser ≥20
- `npm --version` → debe existir
- Espacio en disco ≥500MB
- `process.platform` para detectar SO

Si algo falla → interrumpir con el error concreto y la solución.

## Fase A.5 — Saludo

Si NO existe `data/messages.db` ni `auth/`:
→ Saludo de primera vez: "¡Hola! Voy a montarte tu agente de WhatsApp con IA. En 3 pasos tendrás todo listo."

Si ya existen:
→ "Veo que ya tienes el kit configurado. Puedo ayudarte a personalizarlo (/personaliza), desplegarlo (/deploy) o simplemente arrancarlo."

## Fase B — Instalación

1. `npm install` — si falla con `ERR_INVALID_ARG_TYPE`/`reify`/`rollback` → `node_modules` corrupto: borrar y reinstalar (ver errores-sesion #13)
2. `npm run typecheck` → debe dar exit 0
3. En Windows + better-sqlite3: Visual Studio Build Tools + `npm rebuild better-sqlite3`
4. `npm run build` → obligatorio antes de `start:all`

## Fase C — OpenRouter

1. Preguntar si tiene cuenta en openrouter.ai
2. Pedir la API key (formato `sk-or-v1-...`)
3. Crear/editar `.env.local` conservando vars existentes
4. **VALIDAR** con llamada de prueba (`validateApiKey()`)
5. Si 401 → key inválida, pedir de nuevo

## Fase D — Conexión WhatsApp

1. `npm run start:all` en background
2. Polling de `connection_state` cada 3s, máximo 2 min, hasta `status='connected' AND phone IS NOT NULL`
3. Abrir `http://localhost:3000` para mostrar el QR
4. Si falla `start:all`, probar fallback: `npm run start:bot` en un terminal + `npm run dev` en otro

## Fase E — Prueba

Instruir al usuario:
- Desde **OTRO** móvil, envía "hola" al número vinculado
- El agente debe responder automáticamente
- Probar `@lid` si el primer mensaje no recibe respuesta

## Decisiones a tomar

- Si `node_modules` corrupto: borrar y reinstalar (no reintentar el mismo install)
- Si la key no es `sk-or-v1-...`: avisar de formato incorrecto
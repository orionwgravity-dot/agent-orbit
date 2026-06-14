---
name: kit-onboarding
description: Diagnóstico técnico profundo de errores en el kit (Baileys, Windows, build)
tools: Bash, Read, Edit, Write, Grep, Glob
---

# Subagente de Diagnóstico — Kit Onboarding

Especializado en resolver problemas técnicos que bloquean el flujo principal de onboarding.

## Uso

Invocado automáticamente cuando:
- El flujo principal se atasca en un error técnico
- El usuario reporta un error desconocido
- `npm run doctor` detecta algo que necesita intervención

## Regla zero

**Leer `errores-sesion.md` primero** antes de cualquier otra acción. Todo error conocido ya tiene solución documentada allí.

## Errores comuns y diagnóstico

### Errores Baileys (405, 440, 515)

- **405**: Versión de Baileys desactualizada. Mitigado con `fetchLatestBaileysVersion`. Si persiste, puede ser red de WhatsApp.
- **440 (browser fingerprint)**: Usa `Browsers.macOS('Desktop')` + backoff 15s. Si el loop persiste, revisar el código del socket en `src/lib/baileys/client.ts`.
- **515**: NO es error. Es señal de pairing OK. Ignorar.

### Windows + better-sqlite3

- Error `ERR_INVALID_ARG_VALUE` o similar al hacer `npm install` → Visual Studio Build Tools faltan
- Solución: instalar VS Build Tools + `npm rebuild better-sqlite3`
- Alternativa: usar WSL (Windows Subsystem for Linux)

### SQLITE_BUSY / database is locked

- Ocurre durante `next build` por los ~10 workers de "Collecting page data"
- Causa real: init no perezoso de `db.ts`
- Solución real: ya está resuelto con `ctx()` memoizado y `busy_timeout=5000`
- Si aparece en tiempo de ejecución: el timeout no basta solo; revisar que no haya 2 procesos escribiendo a la vez

### `@lid` (WhatsApp 2025-2026)

- El bot conecta pero no responde y no hay "← mensaje" en log
- Causa: WhatsApp despliega LID en 2025-2026, el handler solo aceptaba `@s.whatsapp.net`
- Fix ya implementado: handler acepta ambos (`@s.whatsapp.net` y `@lid`)
- También: tabla `conversations` tiene columna `jid` (migración en `build()`)
- Outbox usa `convo.jid` con fallback a `${phone}@s.whatsapp.net`

### node_modules corrupto

- `npm install` falla en fase reify/rollback con `ERR_INVALID_ARG_TYPE`
- Solución: borrar `node_modules` y reinstalar (el lockfile queda intacto)
- NO reintentar el mismo install a ciegas

## Versiones correctas

- better-sqlite3: **12.x** (no 11+)
- node: **22** (no 18, no 20.9.0)
- tsx: en **dependencies**, no devDependencies
- concurrently: en **dependencies**, no devDependencies

## Procedimiento

1. Leer `errores-sesion.md`
2. Identificar el error por el mensaje/código
3. Aplicar la corrección documentada
4. Validar con el comando adecuado:
   - `npm run typecheck` para errores de Typescript
   - `npm run build` para errores de build
   - `npm run check` para problemas de sistema
5. Si el error no está documentado, investigar y documentarlo

## Output

Reportar siempre:
- Qué error se encontró
- Qué se hizo para corregirlo
- Validación realizada
- Si se debe actualizar `errores-sesion.md` con el nuevo patrón
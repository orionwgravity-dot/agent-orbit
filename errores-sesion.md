# Errores de sesión — Kit WhatsApp AI Agent

Documentación de errores conocidos con su causa, corrección y patrón aprendido.

---

## Errores de build y despliegue

### #1 — `tsconfig.tsbuildinfo` rompe Nixpacks

**Qué pasó**: El build remoto murió con `create mountpoint /app/tsconfig.tsbuildinfo: not a directory`.

**Cuándo se vio**: Primer deploy a EasyPanel con Nixpacks.

**Causa**: `tsconfig.tsbuildinfo` se versionó en git. Choca con un cache mount de BuildKit en el remoto. En local no falla.

**Corrección**:
```bash
# Prevenir (ya hecho en .gitignore)
echo "*.tsbuildinfo" >> .gitignore

# Si ya se subió:
git rm --cached tsconfig.tsbuildinfo
git commit -m "remove tsconfig.tsbuildinfo from git"
git push
```

**Patrón aprendido**: Los ficheros de caché de compilación incremental nunca se versionan.

---

### #2 — `SQLITE_BUSY` / `database is locked` en `next build`

**Qué pasó**: Build fallaba con errores SQLite busy.

**Cuándo se vio**: Cada vez que se hacía `next build`.

**Causa**: `db.ts` abría la conexión al importar el módulo. Next.js en build lanza ~10 workers que importan las rutas API simultáneamente, todos intentando abrir la misma DB WAL.

**Corrección**: Init perezoso (lazy initialization) con memoización:
```ts
let _ctx: Ctx | null = null;
function ctx(): Ctx { if (!_ctx) _ctx = build(); return _ctx; }
```
`build()` solo se llama en la primera llamada real, no al importar.

**Patrón aprendido**: SQLite WAL + múltiples procesos = race condition. El timeout solo no basta (es no determinista).

---

### #3 — `tsx`/`concurrently` no encontrados en producción

**Qué pasó**: El bot no arrancaba en producción, comando no encontrado.

**Cuándo se vio**: Deploy a EasyPanel sin `--include=dev`.

**Causa**: `tsx` y `concurrently` estaban en `devDependencies`. `npm ci --omit=dev` no los instala. El `nixpacks.toml` usa `npm ci --include=dev`, pero la regla del kit es que deben estar en `dependencies`.

**Corrección**: Mover `tsx` y `concurrently` a `dependencies`.

**Patrón aprendido**: Herramientas de ejecución de scripts van en `dependencies`, no en `devDependencies`, si el proyecto tiene dos procesos (bot + web).

---

### #4 — Volúmenes `/app/data` y `/app/auth` ausentes en EasyPanel

**Qué pasó**: Cada redeploy borraba las conversaciones y obligaba a re-escanear QR.

**Cuándo se vio**: Deploy #2 en EasyPanel.

**Causa**: EasyPanel por defecto usa volúmenes efímeros. Cada `git push` recrea el contenedor desde la imagen, perdiendo `data/` y `auth/`.

**Corrección**: Configurar volúmenes persistentes ANTES del primer deploy:
- `/app/data` → SQLite y conversaciones
- `/app/auth` → Sesión de WhatsApp

**Patrón aprendido**: Todo volumen que debe sobrevivir a un redeploy se configura explícitamente antes del primer deploy.

---

### #5 — Node 18 default en Nixpacks rompe Next 16/Baileys/Tailwind 4

**Qué pasó**: Build fallaba en el remoto. Errores de módulos incompatibles.

**Cuándo se vio**: Deploy sin especificar versión de Node.

**Causa**: Nixpacks usaba Node 18 por defecto, incompatible con Next 16 y Tailwind 4.

**Corrección**: Triple defensa:
1. `engines.node ">=20.9.0"` en `package.json`
2. `.nvmrc` = `22`
3. `NIXPACKS_NODE_VERSION=22` + `nodejs_22` en `nixPkgs`

**Patrón aprendido**: Especificar versión en 3 sitios por si uno falla.

---

### #6 — better-sqlite3 no compila sin python3+gcc+gnumake

**Qué pasó**: Build fallaba en Nixpacks por falta de compilador.

**Cuándo se vio**: Deploy a EasyPanel.

**Causa**: better-sqlite3 necesita node-gyp para compilar módulos nativos. En Linux/nixpacks, faltan las toolchain.

**Corrección**: En `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs_22", "npm-10_x", "python3", "gcc", "gnumake"]
```

**Patrón aprendido**: better-sqlite3 en Linux necesita compilador C++ y python3 para node-gyp.

---

### #7 — `env-loader` no es el primer import

**Qué pasó**: `OPENROUTER_API_KEY` salía `undefined` aunque `.env.local` existía.

**Cuándo se vio**: Al arrancar `start-bot.ts`.

**Causa**: Los imports ES se hoistean. Cuando `client.ts` se importa, sus top-level imports leen `process.env` antes de que `env-loader.ts` haya ejecutado.

**Corrección**: `import './env-loader'` como PRIMERA línea de todo script que lo necesite:
```ts
// scripts/start-bot.ts
import "./env-loader"; // PRIMER import, side-effect
import pino from "pino";
import { start } from "../src/lib/baileys/client";
```

**Patrón aprendido**: El side-effect loader de env debe ser el import más reciente posible (último en hoisting, primero en ejecución).

---

## Errores de WhatsApp / Baileys

### #8 — El bot conecta pero no responde y no hay "← mensaje" en log

**Qué pasó**: Bot conectado (open) pero ante un mensaje entrante no había log ni respuesta.

**Cuándo se vio**: Uso real con números LID de WhatsApp 2025-2026.

**Causa**: El handler solo aceptaba `@s.whatsapp.net`. WhatsApp despliega `@lid` como nuevo formato. Mensajes de números lid se descartaban silenciosamente.

**Corrección**:
1. Handler acepta ambos: `remoteJid.endsWith('@s.whatsapp.net') || remoteJid.endsWith('@lid')`
2. Tabla `conversations` tiene columna `jid` (migración en `build()`)
3. Outbox usa `convo.jid` con fallback a `${phone}@s.whatsapp.net`

**Patrón aprendido**: WhatsApp está en transición a LID. Aceptar ambos formatos o se pierden mensajes en silencio.

---

### #9 — Errores Baileys: 405, 440, 515

**Qué pasó**: Codes 405, 440, 515 en `connection.update`.

**Cuándo se vio**: Varios escenarios de conexión.

**Causas y mitigaciones**:
- **405**: Versión de Baileys desactualizada → mitigado con `fetchLatestBaileysVersion()`
- **440 (browser fingerprint/connectionReplaced)**: fingerprint bloqueado → mitigado con `Browsers.macOS('Desktop')` + backoff 15s
- **515**: NO es error, es señal de pairing OK → ignorar

**Patrón aprendido**: 515 no es error. 440 necesita backoff. 405 se mitiga con version fetch.

---

### #10 — `npm install` falla en fase reify/rollback

**Qué pasó**: `ERR_INVALID_ARG_TYPE` o similar durante `npm install`.

**Cuándo se vio**: node_modules corrupto.

**Causa**: Instalación previa incompleta o corrupta.

**Corrección**:
```bash
rm -rf node_modules
npm install
```
El `package-lock.json` queda intacto, así que es seguro.

**Patrón aprendido**: No reintentar el mismo install a ciegas. Borrar y reinstalar.

---

## Errores de Next.js

### #11 — Rutas API sin `export const dynamic = 'force-dynamic'`

**Qué pasó**: Build parecía pasar pero las rutas API fallaban al tocar la DB.

**Cuándo se vio**: Runtime, al intentar acceder a conversaciones.

**Causa**: Next.js intenta evaluar las rutas en build time. Sin `force-dynamic`, Next pre-renderiza la ruta, importa `db.ts`, y falla.

**Corrección**: Añadir `export const dynamic = 'force-dynamic'` a TODAS las rutas API que toquen la DB.

**Patrón aprendido**: Toda ruta que use SQLite debe declararse dinámica explícitamente.

---

## Errores de producción

### #12 — Modelos `:free` dan 429 en producción

**Qué pasó**: El agente dejaba de responder con error 429.

**Cuándo se vio**: Uso real con modelo `openrouter/...:free`.

**Causa**: Los modelos free están saturados en producción. 2-3 conversaciones simultáneas = rate limit.

**Corrección**: Usar siempre modelos de pago:
- `openai/gpt-4o-mini` (default)
- `anthropic/claude-haiku-4-5`
- `google/gemini-2.5-flash`

**Patrón aprendido**: No usar `:free` en producción. Punto.

---

### #13 — Variables de entorno en texto plano en log de build

**Qué pasó**: La API key aparecía en texto plano en el log de build de EasyPanel.

**Cuándo se vio**: Al compartir el log de build en público.

**Causa**: EasyPanel inyecta env vars como `--build-arg`, que aparecen en el log.

**Corrección**: Si el log se comparte públicamente, rotar la API key en openrouter.ai/keys.

**Patrón aprendido**: Los logs de build pueden ser públicos. No dejar keys sensibles en env vars de build.

---

### #14 — Repo público expone la lógica del negocio

**Qué pasó**: El repo se subió a GitHub como público.

**Cuándo se vio**: Usuario configuró el repo como público.

**Causa**: El kit contiene prompts con la lógica del negocio. Si el repo es público, cualquiera puede leerlo.

**Corrección**: El repo debe ser **SIEMPRE PRIVADO**.

**Patrón aprendido**: Repos de proyectos con lógica de negocio propietaria son siempre privados.

---

### #15 — Panel sin auth expuesto a internet

**Qué pasó**: El panel se desplegó sin Cloudflare Access.

**Cuándo se vio**: Usuario desplegó a producción sin proteger.

**Causa**: El panel no tiene auth nativa. Sin Cloudflare Access, cualquiera puede acceder.

**Corrección**: Cloudflare Access con Email One-Time PIN es bloqueante antes de exponer conversaciones reales.

**Patrón aprendido**: El panel sin auth es un riesgo de privacidad. Cloudflare Access es obligatorio.

---

### #16 — El QR se muestra en `connecting` y en `qr`

**Qué pasó**: En máquinas rápidas, la transición de `qr` a `connecting` era tan rápida que el QR desaparecía de la pantalla antes de ser escaneado.

**Cuándo se vio**: Panel web en máquinas rápidas tras conectar.

**Causa**: Condición早了 en el renderizado. Solo se mostraba QR cuando `status === 'qr'`, no cuando `status === 'connecting'`.

**Corrección**: Mostrar el QR también cuando `status === 'connecting'`, siempre que haya `qr_string` disponible.

**Patrón aprendido**: La race condition real se mitiga mostrando el QR en ambos estados.
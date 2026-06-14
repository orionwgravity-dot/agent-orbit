# Guía Completa

Recorrido completo desde cero hasta producción.

---

## Fase 1 — Instalación

### Requisitos previos

- **Node.js 22** — https://nodejs.org (descargar la versión LTS)
- **OpenRouter** — https://openrouter.ai (crear cuenta gratuita)
- **WhatsApp** — un número dedicado (secundario, no personal)

### Instalación con opencode

1. Abre la carpeta del kit en opencode
2. Escribe `/setup`
3. El asistente validará tu sistema, instalará dependencias y configurará la API key de OpenRouter
4. Arrancará el bot y mostrará el QR en http://localhost:3000
5. Escanea con tu WhatsApp (Dispositivos vinculados)

### Instalación manual (CLI)

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local y añadir tu OPENROUTER_API_KEY

# Validación
npm run typecheck
npm run build

# Arrancar
npm run start:all
```

### Instalación en Windows

1. Instalar **Git for Windows** (https://git-scm.com/download/win)
2. Usar **Git Bash** para ejecutar los comandos
3. Si `npm install` falla con better-sqlite3 → instalar Visual Studio Build Tools + `npm rebuild better-sqlite3`

---

## Fase 2 — Personalizar el agente

### Qué es el system prompt

El agente usa un "system prompt" que describe tu negocio para responder de forma coherente. Está en `prompts/negocio.md`.

### Con opencode

Escribe `/personaliza`. El asistente te hará 6 preguntas sobre tu negocio y escribirá el fichero por ti.

### Cambios que require reinicio

El prompt se lee al iniciar el bot. Si cambias `prompts/negocio.md`, necesitas reiniciar:

```bash
touch data/.restart
```

O desconectar y reconnectar desde el dashboard.

---

## Fase 3 — Desplegar en producción

### Por qué necesito un VPS

El bot y el panel deben estar corriendo 24/7. Tu ordenador no puede estar encendido siempre. Un VPS es un ordenador en la nube que está siempre encendido.

### Elección: Hostinger + EasyPanel

- **Hostinger VPS** — KVM 2 (8GB RAM, 2vCPU, ~8€/mes)
- **EasyPanel** — despliegue sin Docker, con Nixpacks
- **Cloudflare Access** — protege el panel de acceso no autorizado

### Pasos con opencode

1. Escribe `/deploy`
2. El asistente te guiará por cada paso
3. Al final, tendrás tu agente funcionando 24/7

### Importante: Volúmenes persistentes

En EasyPanel, configura DOS volúmenes ANTES del primer deploy:
- `/app/data` — conversaciones y base de datos
- `/app/auth` — sesión de WhatsApp (sin esto, re-escaneas QR en cada redeploy)

### Cloudflare Access (bloqueante)

Nunca expongas el panel sin protección. Configura Cloudflare Access con Email One-Time PIN antes de meter conversaciones reales.

---

## Fase 4 — Mantenimiento

### Reiniciar el bot

```bash
touch data/.restart
```

### Ver logs

El bot usa pino como logger. Ajusta `LOG_LEVEL` en `.env.local`:
- `info` —default
- `debug` —verbose (no usar en producción)

### Diagnóstico de problemas

```bash
npm run doctor
```

Esto comprueba:
- Variables de entorno
- Dependencias instaladas
- Estado de conexión
- Procesos activos

### Consultar errores conocidos

Ver `errores-sesion.md` para los errores más comunes y sus soluciones.

---

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐
│  WhatsApp       │────▶│  Bot (Baileys)   │
│  (teléfono)     │◀────│  tsx start-bot   │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐          ┌───────▼──────┐
              │  SQLite   │          │  Next.js     │
              │  messages  │          │  Panel Web   │
              │  .db       │          │  localhost:  │
              └───────────┘          │  3000        │
                                     └──────────────┘
```

- El bot y el panel NO comparten memoria
- Se coordinan por SQLite + flag `.restart`
- Todo es polling cada 2s (sin websockets)

---

## Limitaciones conocidas

- El número debe estar conectado a WhatsApp (no WhatsApp Business Cloud)
- Los mensajes en grupos se ignoran
- Los mensajes de voz/imagen/sticker se ignoran (solo texto)
- Ratio bajo de respuestas puede activar la detección de bots de WhatsApp
- Usar número del negocio, nunca el personal
# WhatsApp AI Agent Kit

Agenté de IA conectado a WhatsApp con panel web de control.

## Qué hace

- Conecta tu número de WhatsApp por QR (vía WhatsApp Web no oficial, Baileys)
- Responde automáticamente con IA (OpenRouter + LLM de tu elección)
- Califica leads, agenda llamadas, guarda datos y deriva a un humano cuando hace falta
- Panel web tipo bandeja de entrada con modo IA / modo Humano por conversación

## Requisitos

- Node.js 22
- Un número de WhatsApp dedicado (secundario, no personal)
- Cuenta en OpenRouter (gratis para empezar)

## 3 pasos

### 1. Instalación

```bash
npm install
cp .env.example .env.local
# Editar .env.local con tu OPENROUTER_API_KEY
npm run build
```

### 2. Configuración

```bash
npm run start:all
```

Abre http://localhost:3000 y escanea el QR con WhatsApp (Dispositivos vinculados).

### 3. Personalización

Edita `prompts/negocio.md` con los datos de tu negocio. El agente leerá el prompt y responderá de forma coherente.

## Stack

- **Bot**: Baileys (WhatsApp Web no oficial)
- **IA**: OpenRouter + OpenAI SDK
- **Panel**: Next.js 16 (App Router)
- **Base de datos**: SQLite (better-sqlite3)
- **Logger**: pino
- **Deployment**: Nixpacks + EasyPanel

## Scripts

| Comando | Descripción |
|---|---|
| `npm run start:all` | Arrancar bot + panel (desarrollo) |
| `npm run start:bot` | Solo el bot |
| `npm run dev` | Solo el panel (desarrollo) |
| `npm run build` | Build de producción |
| `npm run typecheck` | Verificación TypeScript |
| `npm run check` | Diagnóstico del sistema |
| `npm run doctor` | Diagnóstico completo |
| `npm run wizard` | Setup CLI (sin opencode) |

## Onboarding con opencode

Abre la carpeta en opencode y escribe:

- `/setup` — instalación completa
- `/personaliza` — configurar el agente con datos del negocio
- `/deploy` — desplegar en Hostinger VPS 24/7

## Tarifas de mercado

Si monetizas este kit con clientes:

| Servicio | Precio orientativo |
|---|---|
| Diagnóstico inicial | 150-300€ |
| Implementación completa | 800-1.500€ |
| Mantenimiento mensual | 80-200€/mes |

## FAQ

**¿Puedo usar mi número personal?**

No recomendado. Usa un número secundario/del negocio. WhatsApp puede banear números por uso de bots no oficiales.

**¿Es seguro?**

El panel debe protegerse con Cloudflare Access. Nunca lo expongas sin auth. La sesión de WhatsApp vive en `auth/`, no en la base de datos.

**¿Qué pasa si WhatsApp actualiza su protocolo?**

 Puede que Baileys deje de funcionar temporalmente. Seguir los issues del proyecto Baileys en GitHub.

**¿Puedo personalizar las respuestas del agente?**

Sí. Edita `prompts/negocio.md`. El agente es un LLM, así que las respuestas varían (no es un bot de reglas fijas).

**¿Funciona con WhatsApp Business?**

Sí, igual que con WhatsApp personal. El número puede ser Business.

## Licencia

Exclusiva Tribu. Para uso interno de los miembros de Tribu.

## Sobre opencode

opencode es gratuito y de código abierto. https://opencode.ai

Si necesitas ayuda adicional, consulta los docs en `/docs` o visita https://oriongravity.com
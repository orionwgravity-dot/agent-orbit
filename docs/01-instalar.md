# 01 — Instalación

## Requisitos

- Node.js 22 (importante: no usar 18, falla con Next 16 y Tailwind 4)
- npm 10+
- Git (para desplegar)
- Un número de WhatsApp dedicado (secundario, no personal)

## Instalación con opencode (recomendado)

1. Abre la carpeta en opencode
2. Escribe `/setup`
3. El asistente validará tu sistema, instalará dependencias y configurará la API key
4. Arrancará el bot y mostrará el QR en http://localhost:3000
5. Escanea desde WhatsApp → Ajustes → Dispositivos vinculados

## Instalación manual

```bash
# Clonar o descargar el kit
cd whatsapp-ai-agent-kit

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local
# Obligatorio: OPENROUTER_API_KEY
# Recomendado: OPENROUTER_MODEL (default: openai/gpt-4o-mini)

# Validar TypeScript
npm run typecheck

# Build de producción (necesario antes de start:all)
npm run build

# Arrancar todo (bot + panel)
npm run start:all
```

## Windows: better-sqlite3

Si `npm install` falla con better-sqlite3:

1. Instalar **Visual Studio Build Tools** (https://visualstudio.microsoft.com/downloads → Build Tools for Visual Studio 2022)
2. En el instalador, marcar "Desarrollo de escritorio con C++"
3. Luego: `npm rebuild better-sqlite3`

Alternativa: usar **WSL** (Windows Subsystem for Linux) y seguir las instrucciones de Linux.

## Verificación

```bash
npm run check
```

Esto valida Node, npm, espacio en disco y estructura del kit.

## Siguiente paso

Una vez instalado → [Conectar WhatsApp](./02-conectar-whatsapp.md)
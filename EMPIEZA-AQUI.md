# Empieza aquí

Tu agente de WhatsApp con IA, funcionando en una tarde.

## 3 pasos

### 1. Abre la carpeta en opencode
Abre esta carpeta en opencode. Escribe `/setup` y el asistente te guiará.

### 2. Configura tu negocio
Escribe `/personaliza` para darle al agente los datos de tu negocio. El agente responderá de forma coherente, qualificando leads y agendar llamadas.

### 3. Despliega 24/7
Cuando estés listo, escribe `/deploy` para subirlo a un VPS. Tu agente seguirá funcionando aunque apagues tu ordenador.

## Fallback CLI

Si opencode no está disponible, puedes usar el asistente CLI:

```bash
npm run wizard
```

Esto ejecuta el mismo flujo de `/setup` directamente en la terminal.

## Requisitos

- Node.js 20 o superior
- Un número de WhatsApp dedicado (no tu número personal)
- Cuenta en OpenRouter (gratis para empezar)

## Nota sobre Windows

En Windows necesitas **Git for Windows** para que los scripts funcionen bien. Descárgalo de https://git-scm.com/download/win

Git Bash (incluido en Git for Windows) es la forma recomendada de ejecutar comandos en Windows.

## Próximos pasos

- `/setup` — instalación completa
- `/personaliza` — configura tu negocio
- `/deploy` — despliega en producción
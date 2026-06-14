# 08 — Coexistencia con WhatsApp normal

## El número vinculado es un "dispositivo"

Cuando escaneas el QR, WhatsApp ve el agente como un "dispositivo vinculado", igual que WhatsApp Web. Esto significa:

- Tu WhatsApp normal funciona exactamente igual
- Puedes seguir usando WhatsApp desde el teléfono
- El agente solo responde a mensajes que entran por su conexión

## Un solo número, dos contextos

```
Teléfono personal (WhatsApp normal)
  ├── Chat con Juan ✓ (tu lo lees)
  └── Chat con María ✓ (tu lo lees)

Agente (dispositivo vinculado)
  ├── Chat con lead1 ✓ (el agente responde)
  └── Chat con lead2 ✓ (el agente responde)
```

El agente y tú compartís el mismo número, pero cada uno ve conversaciones diferentes.

## Limitaciones

1. **Mensajes del propio número se ignoran**: los mensajes que entran desde el propio número vinculado se ignoran (`msg.key.fromMe = true`). Esto es por diseño para evitar loops.

2. **Grupos se ignoran**: el handler descarta mensajes de grupos (`@g.us`), newsletters (`@newsletter`) y broadcasts (`@broadcast`).

3. **Solo texto**: imágenes, audios, stickers y documentos se ignoran. Solo se procesa texto.

## Usar WhatsApp Business

Sí, funciona igual. WhatsApp Business tiene las mismas APIs de dispositivo vinculado.

## Múltiples dispositivos vinculados

Puedes tener hasta 4 dispositivos vinculados además del teléfono principal. El agente ocupa 1.

## Sesión persistente

La sesión de WhatsApp se guarda en `auth/`. Mientras `auth/` exista y el volumen sea persistente en producción, la sesión sobrevive a reinicios.

Si la sesión expira (desconexión很久), hay que re-escanear el QR.

## Buenas prácticas

- **Número dedicado**: usa un número secundario, no el personal
- **No abusar del outbound**: aunque el agente puede enviar (vía outbox), enviar mensajes a desconocidos masivamente puede causar bans
- **Responder a inbound**: el agente solo debe responder a quienes le escriben primero
- **Ratio humano/IA**: si quieres que el agenteenvíe mensajes proactivamente, asegúrate de que hay conversación previa
# 02 — Conectar WhatsApp

## Cómo funciona

El kit usa Baileys, una librería que implementa el protocolo de WhatsApp Web. Esto significa:

- No es WhatsApp Business Cloud API (eso sería oficial, de pago)
- Es un cliente no oficial, igual que WhatsApp Web
- Tu número se conecta como un "dispositivo vinculado"

## Pasos para conectar

1. Asegúrate de que el bot esté corriendo (`npm run start:all`)
2. Abre http://localhost:3000
3. Verás un código QR (se renueva cada 60 segundos)
4. En tu teléfono:
   - WhatsApp → Ajustes (o Configuración)
   - Dispositivos vinculados
   - Vincular un dispositivo
   - Escanea el QR

## El QR no aparece

- Comprueba que el bot esté corriendo sin errores
- Espera 5 segundos tras arrancar (el QR se genera tras handshake)
- Si el QR está gris/expired, recarga la página

## Error 405

WhatsApp ha rechazado la versión del cliente. Solución:
- El kit ya usa `fetchLatestBaileysVersion()` para obtener la última versión
- Si persiste, puede ser problema de red de WhatsApp; esperar e intentar de nuevo

## Error 440 (loop de reconexión)

El fingerprint del browser ha sido bloqueado. Solución:
- El kit usa `Browsers.macOS('Desktop')` como fingerprint conocido
- Si el loop persiste, revisar `src/lib/baileys/client.ts`

## Error 515 (pairing OK)

No es un error. Es la señal de que el pairing está en curso. Ignorar.

## Número conectado pero no responde

Sospechar `@lid` (WhatsApp 2025-2026):
- WhatsApp está desplegando LID como nuevo formato de identificación
- El handler ya acepta tanto `@s.whatsapp.net` como `@lid`
- Si el primer mensaje no recibe respuesta, esperar 30s y probar de nuevo

## Importante

- Usar un número secundario, no el personal
- Ratio de respuestas: al menos 1 entrante por cada saliente
- No enviar mensajes masivos a desconocidos (ban inmediato)

## Siguiente paso

[Personalizar el prompt](./03-personalizar-prompt.md)
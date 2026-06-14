# 07 — Errores comunes

## El bot conecta pero no responde

**Causa más probable**: el mensaje llegó vía `@lid` (nuevo formato WhatsApp 2025-2026).

El handler ya acepta `@lid` además de `@s.whatsapp.net`. Si el mensaje es de un número que empieza con `lid:`, debería funcionar.

Solución: esperar 30s y probar de nuevo desde otro móvil.

## QR no aparece

1. ¿El bot está corriendo? `npm run start:all`
2. ¿Hay errores en la consola?
3. Esperar 5s tras arrancar (generación de QR)
4. Recargar http://localhost:3000

## Error 405 en connection.update

WhatsApp rechazó la versión del cliente. El kit ya usa `fetchLatestBaileysVersion()` para obtener la última versión. Si persiste, esperar unos minutos.

## Error 440 en loop

Reconexiones infinitas con code 440 = browser fingerprint bloqueado.

El kit usa `Browsers.macOS('Desktop')` como fingerprint conocido. Si el loop persiste:
- Backoff de 15s entre reconexiones
- Revisar que no haya dos procesos intentando conectar con el mismo número

## `npm install` falla en reify/rollback

`ERR_INVALID_ARG_TYPE` o similar = `node_modules` corrupto.

Solución:
```bash
rm -rf node_modules
npm install
```

El `package-lock.json` queda intacto, así que es seguro.

## `SQLITE_BUSY` durante `next build`

El build de Next.js lanza ~10 workers que importan las rutas API. Si `db.ts` abre la conexión al importar, hay race condition.

El kit ya usa init perezoso (lazy initialization) para prevenirlo.

## Modelos `:free` dan 429

Los modelos free de OpenRouter están saturados en producción. Usar siempre modelos de pago:
- `openai/gpt-4o-mini`
- `anthropic/claude-haiku-4-5`
- `google/gemini-2.5-flash`

## Riesgo de ban del número

WhatsApp detecta bots no oficiales. Vectores de riesgo:
- Ratio envío/recepción < 10%
- Enviar mensajes a números no conocidos
- Patrones temporales robóticos
- Volumen alto sin pausas

Reglas:
- **Nunca** mensajes masivos a desconocidos
- **Nunca** usar el WhatsApp personal
- Ratio ≥1 entrante por cada 10 salientes
- Para outbound a escala → WhatsApp Business Cloud API oficial

## El QR caduca

El QR se renueva automáticamente cada 60 segundos. Si pasa más tiempo:
1. Recargar la página del panel
2. Aparece un nuevo QR
3. Escanea de nuevo

## Session expira

Si el bot lleva mucho tiempo apagado, WhatsApp puede cerrar la sesión. Solución: desconectar y reconnectar (genera nuevo QR).

## Logs del bot

El bot usa pino como logger. Para más detalle:

```bash
LOG_LEVEL=debug npm run start:all
```

## Siguiente paso

[Coexistencia con WhatsApp normal](./08-whatsapp-coexistence.md)
# 06 — Deploy en Hostinger

## VPS recomendado

**Hostinger KVM 2**:
- 8GB RAM
- 2vCPU
- ~8€/mes
- Ubuntu 24.04

El cuello de botella real son las vCPU (WebSocket + cifrado), no la RAM (~150MB/agente).

## Paso 1: Contratar el VPS

1. Ve a https://hostinger.com
2. Selecciona KVM 2 o superior
3. Ubuntu 24.04 como SO
4. Crear

## Paso 2: Instalar Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
systemctl enable docker
```

## Paso 3: Instalar EasyPanel

```bash
docker run --rm -it \
  -v /etc/easypanel:/etc/easypanel \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  easypanel/easypanel setup
```

Esto deja EasyPanel en `http://<IP>:3000`.

Plan Developer: GRATIS (self-hosted).

## Paso 4: Subir el código a GitHub

```bash
git init
gh repo create mi-agente-whatsapp --private --source=. --remote=origin --push
```

El repo debe ser **PRIVADO**.

## Paso 5: Crear la app en EasyPanel

1. EasyPanel → Create → App
2. Source: GitHub
3. Repository: tu-repo-privado
4. Branch: main
5. Build path: `/`
6. Builder: Nixpacks
7. Create

## Paso 6: Variables de entorno (ANTES del primer deploy)

En EasyPanel → App → Environment:
- `OPENROUTER_API_KEY` = tu key
- `OPENROUTER_MODEL` = openai/gpt-4o-mini
- `GOOGLE_SHEETS_WEBHOOK_URL` = (opcional)
- `CAL_BOOKING_URL` = (opcional)
- `LOG_LEVEL` = info

**Aviso**: Las env vars aparecen en texto plano en el log de build. Si compartes el log, **rotar la API key**.

## Paso 7: Volúmenes persistentes (CRÍTICO)

**ANTES del primer deploy**, configura:

- Volume 1: `/app/data` → persistirá SQLite y conversaciones
- Volume 2: `/app/auth` → persistirá la sesión de WhatsApp (sin esto, re-escaneas QR en cada redeploy)

Sin estos volúmenes, cada `git push` borra los datos.

## Paso 8: Deploy

Click en "Deploy" o haz `git push`.

Build time: 3-5 minutos (compila better-sqlite3 + Next.js).

## Paso 9: Escanear QR en producción

1. Abre el panel en producción (protegido por Cloudflare Access)
2. El QR aparecerá tras el primer deploy
3. Escanea desde WhatsApp
4. El agente debe responder

## Redeploy automático

Cada `git push` a main dispara un redeploy en EasyPanel.

## Nota sobre Nixpacks

Nixpacks está en modo mantenimiento. Si en 12-18 meses falla, migrar a Dockerfile (EasyPanel lo soporta).

## Siguiente paso

[Errores comunes](./07-errores-comunes.md)
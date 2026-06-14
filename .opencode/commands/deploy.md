---
description: Despliega el agente en Hostinger VPS 24/7 con EasyPanel y Cloudflare Access
---

# /deploy — Despliegue en producción

Sube el kit a un VPS para que funcione 24/7.

## Parte 0 — Verificar git

1. `git --version` y `gh auth status`
2. Si no hay repo GitHub → crear uno privado:
   - gh logueado → `gh repo create <nombre> --private --source=. --remote=origin --push`
   - gh sin login → `gh auth login`
   - sin gh → crear Personal Access Token fine-grained (Contents: RW)
3. El repo debe ser **SIEMPRE PRIVADO**

## Verificación de seguridad

Antes del primer commit:
- `git status --short`
- Verificar que NO aparecen `.env.local` / `data/` / `auth/`
- `.gitignore` ya los excluye; `.env.example` SÍ se sube

## VPS + EasyPanel

1. Contratar VPS Hostinger (recomendado KVM 2: 8GB RAM / 2vCPU / ~8€/mes)
2. Ubuntu 24.04 con Docker instalado
3. Instalar EasyPanel:
   ```bash
   docker run --rm -it \
     -v /etc/easypanel:/etc/easypanel \
     -v /var/run/docker.sock:/var/run/docker.sock:ro \
     easypanel/easypanel setup
   ```
   Queda en `http://<IP>:3000`. Plan Developer GRATIS (self-hosted).

4. En EasyPanel: Create → App → Source GitHub → Branch main → Build path `/` → Builder Nixpacks

## Volúmenes persistentes (CRÍTICO)

**ANTES de Deploy**, configurar 2 volúmenes en EasyPanel:
- `/app/data` → SQLite y conversaciones
- `/app/auth` → Sesión de WhatsApp (sin esto, re-escaneo de QR en cada redeploy)

Esta es la causa #1 de problemas en producción.

## Variables de entorno

En EasyPanel, añadir las variables de entorno:
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `GOOGLE_SHEETS_WEBHOOK_URL` (opcional)
- `CAL_BOOKING_URL` (opcional)
- `LOG_LEVEL=info`

**Aviso**: Las env vars se injectan como `--build-arg` y aparecen en texto plano en el log de build. Si compartes el log, **rotar la API key** en openrouter.ai/keys.

## Cloudflare Access (BLOQUEANTE)

Nunca desplegar sin esto. Pasos:
1. Cloudflare Zero Trust → Access → Applications → Self-hosted
2. `Application domain = panel.tu-dominio.com`
3. Policy: Allow con Include = Emails o "Emails ending in @tu-dominio.com"
4. Identity provider: **Email One-Time PIN** (recomendado, cero config)
5. Alternativa con dominio `*.easypanel.host`: Basic Auth

**Probar SIEMPRE** en incógnito con un email NO autorizado para confirmar que rechaza.

## Redeploy

`git push` a main → EasyPanel redespliega automáticamente.

## Nota sobre Nixpacks

Nixpacks está en modo mantenimiento (Railway lanzó Railpack). Si en 12-18 meses falla, migrar a Dockerfile (EasyPanel lo soporta).

## Checklist antes de decir "listo"

- [ ] Repo GitHub privado creado
- [ ] EasyPanel configurado con Nixpacks
- [ ] Volúmenes `/app/data` y `/app/auth` configurados ANTES del primer deploy
- [ ] Variables de entorno añadidas
- [ ] Cloudflare Access configurado y probado
- [ ] Probado en incógnito que拒绝 access no autorizado
- [ ] QR escaneado en producción y agente responde
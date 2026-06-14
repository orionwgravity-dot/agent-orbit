# 05 — Cloudflare Access

## Por qué es necesario

El panel web NO tiene autenticación propia (por simplicidad). Sin Cloudflare Access, cualquiera que descubra la URL podría:
- Leer todas las conversaciones
- Suplantar al operador (modo Humano)
- Borrar conversaciones

**Nunca pongas el panel en producción sin Cloudflare Access.**

## Cómo funciona

Cloudflare Access verifica la identidad del visitante antes de dejarle pasar. Usamos **Email One-Time PIN**, que:
- No necesita OAuth de Google
- El usuario introduce su email → recibe un código → lo escribe
- Cero configuración adicional

## Configuración paso a paso

### 1. Crear cuenta en Cloudflare

https://dash.cloudflare.com
- Zero Trust (no el plan normal de Cloudflare)
- El plan gratis incluye Access

### 2. Crear una aplicación

1. En Zero Trust → Access → Applications
2. Add an application → Self-hosted
3. Application domain: `panel.tu-dominio.com` (debe ser un subdominio que apunte a tu VPS)
4. Session duration: 24 hours (o lo que prefieras)

### 3. Crear la política

1. Policy name: `Panel Agente WhatsApp`
2. Action: Allow
3. Include: Emails ending in → `@tu-dominio.com`
   - O: Specific emails → tus emails personales
4. Authentication: Email One-Time PIN

### 4. Configurar el DNS

En Cloudflare:
1. DNS → Records
2. Añadir: `CNAME panel tu-vps-hostinger.com`
3. Proxy status: DNS only (o Proxied si quieres las ventajas de Cloudflare)

### 5. Probar

1. Abre `https://panel.tu-dominio.com` en modo incógnito
2. Deberías ver el PIN por email
3. Introduce el PIN
4. Si funciona, el acceso está configurado

### Alternativa: Basic Auth de EasyPanel

Si no tienes dominio, EasyPanel tiene Basic Auth integrado:
1. EasyPanel → App → Security → Basic Auth
2. Establece usuario y contraseña

Esto es menos seguro que Cloudflare Access pero funciona sin dominio.

## Comprobar que拒绝 el acceso

Siempre probar en incógnito con un email NO autorizado:
1. Abre el panel en incógnito
2. Introduce un email que NO esté en la política
3. Debe ser rechazado

## Siguiente paso

[Deploy en Hostinger](./06-deploy-hostinger.md)
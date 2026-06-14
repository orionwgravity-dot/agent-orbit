# 03 — Personalizar el prompt

## Qué es el system prompt

El system prompt es el contexto que recibe el LLM en cada conversación. Le dice:
- Quién es (el asistente del negocio)
- Datos del negocio
- Reglas de comunicación
- Cuándo usar cada herramienta

## Fichero `prompts/negocio.md`

El prompt se configura en `prompts/negocio.md`. Este fichero:
- Se lee al generar cada respuesta
- Debe tener 6 secciones H2 específicas
- Si no existe, se usa un prompt genérico de fallback

## Estructura del negocio.md

```markdown
---
nombre: Tu Negocio
actividad: Qué haces
generado: 2024-01-01T00:00:00.000Z
---

## Nombre
[Nombre del negocio]

## A qué se dedica
[Una frase]

## Propuesta de valor
[Por qué deberían elegirte]

## Preguntas de calificación al lead
[2-4 preguntas]

## Criterios de lead bueno vs malo
**BUENO:**
- [criterio]

**MALO:**
- [criterio]

## Acción cuando el lead encaja
[Link de Cal.com / derivar a humano / etc.]
```

## Con opencode

Escribe `/personaliza`. El asistente te hará 6 preguntas y escribirá el fichero.

## Cambios requieren reinicio

El prompt se carga al iniciar el bot. Para aplicar cambios:

```bash
touch data/.restart
```

O desconecta y reconnecta desde el dashboard.

## Ejemplos

En `prompts/ejemplos/` tienes 3 ejemplos completos:
- `agencia-ia.md` — agencia que vende servicios de IA
- `ecommerce.md` — tienda online de licencias
- `infoproducto.md` — vendedor de curso online

Copia el que más se parezca y personalízalo.

## Siguiente paso

[Configurar las tools](./04-configurar-tools.md)
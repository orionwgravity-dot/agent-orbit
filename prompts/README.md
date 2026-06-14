# Personalización del agente

El agente usa un **system prompt** que describe tu negocio para que la IA responda de forma coherente.

## Cómo funciona

1. El fichero `prompts/negocio.md` contiene los datos de tu negocio
2. Se inyecta en el system prompt que recibe el LLM en cada respuesta
3. Si el fichero no existe, se usa un prompt genérico de fallback

## Métodos de personalización

### /personaliza (recomendado)
Abre la carpeta en opencode y escribe `/personaliza`. El asistente te guiará paso a paso.

### Copiar un ejemplo
En la carpeta `prompts/ejemplos/` tienes 3 ejemplos completos:
- `agencia-ia.md` — agencia que vende servicios de IA
- `ecommerce.md` — tienda online de licencias de software
- `infoproducto.md` — vendedor de curso online

Copia el que más se parezca a tu caso a `prompts/negocio.md`.

### Edición manual
Crea o edita `prompts/negocio.md` con el formato indicado en `negocio.example.md`.

## Formato de negocio.md

```markdown
---
nombre: Nombre del negocio
actividad: A qué se dedica
generado: 2024-01-01T00:00:00.000Z
---

## Nombre
[Tu nombre / nombre de tu negocio]

## A qué se dedica
[Una frase describiendo tu actividad]

## Propuesta de valor
[Qué problema resuelves y por qué deberían elegirte]

## Preguntas de calificación al lead
[2-4 preguntas que harás para qualifier el lead]

## Criterios de lead bueno vs malo
**BUENO:**
- [criterio 1]
- [criterio 2]

**MALO:**
- [criterio 1]
- [criterio 2]

## Acción cuando el lead encaja
[Link de Calendly, link de pago, o "derivar a humano"]
```

## Importante

Cambiar `negocio.md` requiere **reiniciar el bot** para que surta efecto. Puedes hacerlo desde el dashboard (Desconectar) o ejecutando `touch data/.restart`.
---
description: Personaliza el prompt del agente con los datos del negocio
---

# /personaliza — Personalizar el agente

Configura los datos del negocio para que el agente IA responda de forma coherente.

## Regla: una pregunta a la vez

NUNCA preguntar las 6 preguntas de golpe. Una por una, esperando respuesta.

## Las 6 preguntas

1. **Nombre del negocio**: ¿Cómo se llama tu negocio o actividad?
2. **A qué se dedica**: ¿Qué haces exactamente? (1 frase)
3. **Propuesta de valor**: ¿Qué problema resuelves y por qué deberían elegirte a ti?
4. **Preguntas de calificación**: ¿Qué 2-4 preguntas harás para saber si un lead es bueno o malo?
5. **Criterios de lead**: ¿Qué hace que un lead sea bueno? ¿Y malo?
6. **Acción cuando encaja**: ¿Qué haces cuando un lead califica bien? (link de Cal.com, link de pago, derivar a humano...)

## Si ya existe `prompts/negocio.md`

Ofrecer 3 opciones:
1. Sobrescribir todo (empezar de cero)
2. Editar puntual (preguntar cuál sección)
3. Cancelar

## Si elige Cal.com en pregunta 6

Pedir el link (ej: `https://cal.com/usuario/diagnostico`) y guardarlo en `CAL_BOOKING_URL` en `.env.local`.

## Resumen antes de escribir

Antes de escribir el fichero, mostrar el resumen y pedir confirmación.

## Escribir el fichero

Crear `prompts/negocio.md` con frontmatter YAML:
```yaml
---
nombre: [nombre]
actividad: [actividad]
generado: [ISO timestamp]
---
```

Y las 6 secciones H2.

## Validación

Verificar que el fichero tiene las 6 secciones.

## Reiniciar el bot

Tras escribir, crear `data/.restart` o reiniciar `start:all` para que el agente cargue el nuevo prompt.

## Validación obligatoria

- El fichero debe tener las 6 secciones H2
- Si falta alguna → pedir que la complete
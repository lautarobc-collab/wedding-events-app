# CLAUDE.md — Instrucciones del proyecto

Este archivo se carga automáticamente cuando abres Claude Code en esta carpeta.
Léelo entero antes de tocar código.

## Qué estamos construyendo

Una app web de planificación de bodas y eventos (nombre provisional: **Coordina** —
propón alternativas si se te ocurre algo mejor). Sustituye una hoja de Excel de
planificación de bodas por una herramienta con interfaz propia, cuentas de usuario,
y una página pública de RSVP para los invitados.

Contexto completo de diseño, modelo de datos y alcance del MVP: lee `docs/DESIGN.md`
antes de generar ningún código. No improvises el esquema de datos — ya está decidido ahí.

## Origen del proyecto — regla de originalidad (importante)

Este proyecto nace inspirado en patrones de UX de herramientas ya existentes en el
mercado (Zola, WeddingWire, Joy, The Knot). Eso es legítimo y así es como funciona
la industria. Lo que **no** es aceptable, bajo ninguna circunstancia:

- Copiar o reproducir código fuente de esas plataformas (no tenemos acceso a él y
  sería una infracción de propiedad intelectual).
- Reproducir textos, copys o assets visuales de sus webs.
- Clonar su marca visual (logos, paletas de marca registradas, tipografías con
  licencia propietaria).

Todo el código, textos y diseño visual de este proyecto deben ser 100% originales.
Inspiración en el *concepto* de una función (por ejemplo "seating chart drag and
drop") sí; copiar su implementación, no.

## Stack técnico

- **Frontend**: Next.js (App Router) + React + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Auth + Row Level Security + Storage)
- **Despliegue**: Vercel (recomendado, tiene integración directa con Next.js)
- **Lenguaje**: TypeScript en todo el proyecto, sin excepciones

## Estructura de carpetas

```
/app                    → rutas de Next.js (App Router)
  /(dashboard)           → panel privado, requiere sesión
  /rsvp/[slug]           → página pública de RSVP, sin login
  /auth                  → login/registro
/components             → componentes de UI reutilizables
/lib                     → cliente de Supabase, utilidades, tipos
/supabase/migrations     → SQL de las tablas (ver docs/DESIGN.md)
/docs                    → documentación del proyecto (no tocar sin avisar)
```

## Convenciones de código

- Componentes funcionales, hooks de React, nada de clases.
- Formularios: validación con `zod` + `react-hook-form`.
- Nunca hardcodear las claves de Supabase — siempre desde variables de entorno
  (`.env.local`, ver `.env.example`).
- Toda tabla con datos de usuario lleva Row Level Security activada desde la
  migración que la crea — no lo dejes para después.
- Commits pequeños y descriptivos en español o inglés, da igual, pero consistentes
  dentro de una misma sesión de trabajo.

## Cómo trabajar conmigo en este proyecto

1. Antes de generar código nuevo, confirma en una frase qué vas a hacer y por qué
   archivo empiezas — no hace falta que preguntes permiso constantemente, pero sí
   que se entienda el plan.
2. Sigue el orden de fases de `docs/DESIGN.md` → Fase 1 (auth + esqueleto de evento)
   antes que Fase 2 (presupuesto), etc. No saltes fases por comodidad.
3. Si una decisión de diseño no está clara en `docs/DESIGN.md`, pregúntame en vez
   de asumir — es un boceto vivo, no una spec cerrada en piedra.
4. Cuando termines una fase, dime qué falta probar manualmente antes de seguir.

## Primer paso al abrir esto

Antes de escribir una sola línea de código, sigue `docs/SETUP.md` para:
1. Crear el repositorio en GitHub
2. Crear el proyecto de Supabase
3. Inicializar el proyecto Next.js
4. Conectar las variables de entorno

Solo después de eso empezamos con la Fase 1.

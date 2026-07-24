# Puesta en marcha

Sigue esto una sola vez, antes de pedirle nada a Claude Code. Cubre las dos
formas de trabajar que quieres probar: Claude Code en la web y en tu terminal
local. El repositorio y Supabase son los mismos para ambas — es lo que te
permite alternar entre PC y navegador sin perder nada.

## 1. Crear el repositorio en GitHub

1. Entra en github.com → botón "New repository".
2. Nombre: `wedding-events-app` (o el que prefieras).
3. Visibilidad: **Private**.
4. No marques "Add a README" — ya llevas los archivos de esta carpeta.
5. Crea el repo y copia la URL (`git@github.com:tu-usuario/wedding-events-app.git`).

Desde tu terminal, dentro de esta carpeta:

```bash
git init
git add .
git commit -m "Base del proyecto: diseño y prompt inicial"
git branch -M main
git remote add origin git@github.com:tu-usuario/wedding-events-app.git
git push -u origin main
```

Si usas HTTPS en vez de SSH, la URL del remote cambia a
`https://github.com/tu-usuario/wedding-events-app.git` — GitHub te la da
tal cual al crear el repo.

## 2. Crear el proyecto de Supabase

1. Entra en supabase.com → "New project".
2. Elige nombre, contraseña de base de datos (guárdala en un gestor de
   contraseñas, la necesitarás poco pero es tu acceso root) y región más
   cercana (Europa).
3. Cuando el proyecto esté listo, ve a **Project Settings → API** y copia:
   - `Project URL`
   - `publishable key` (antes llamada "anon public key")
4. Guárdalas — las pegarás en `.env.local` en el paso 4.

Esto vale tanto si trabajas en local como en Claude Code web: es una base de
datos en la nube, accesible desde cualquier sitio.

## 3A. Trabajar con Claude Code en la web

1. Ve a claude.ai/code.
2. Conecta tu cuenta de GitHub si no lo has hecho ya (te lo pedirá la primera
   vez).
3. Selecciona el repositorio `wedding-events-app` que acabas de crear.
4. Claude Code clona el repo en un entorno en la nube y lee `CLAUDE.md`
   automáticamente al abrir la sesión.
5. Pégale las claves de Supabase cuando te las pida (paso 4 de abajo) — en
   la web se guardan como variables de entorno de la sesión, no como archivo
   local.

## 3B. Trabajar con Claude Code en tu terminal

1. Instala Claude Code si no lo tienes: sigue la guía oficial en
   `docs.claude.com` (busca "Claude Code CLI install") — el proceso cambia de
   vez en cuando, así que mejor la fuente oficial que unas instrucciones
   fijas aquí.
2. Clona el repo (o usa esta misma carpeta si ya la tienes local):
   ```bash
   git clone git@github.com:tu-usuario/wedding-events-app.git
   cd wedding-events-app
   ```
3. Ejecuta `claude` dentro de la carpeta — carga `CLAUDE.md` igual que en la
   web.

## 4. Variables de entorno

En cualquiera de los dos modos, cuando Claude Code inicialice el proyecto
Next.js te pedirá crear `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
```

Ya hay un `.env.example` en esta carpeta con las claves vacías como
referencia — nunca subas `.env.local` a GitHub (ya está en `.gitignore`).

## 5. Primer mensaje a Claude Code

Con el repo y Supabase ya creados, el primer mensaje dentro de la sesión
(web o local) puede ser tan simple como:

> Lee CLAUDE.md y docs/DESIGN.md, y empecemos con la Fase 1.

A partir de ahí sigue el plan de fases de `docs/DESIGN.md`.

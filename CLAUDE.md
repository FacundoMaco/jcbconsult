# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Desarrollo (desde el directorio del proyecto)
pnpm run dev        # Inicia Express + Vite en localhost:3000
pnpm run build      # Build de producción (Vite)
pnpm run lint       # Type check (tsc --noEmit)
pnpm run clean      # Elimina dist/
```

**Importante:** El servidor unifica Express y Vite — no hay servidor de desarrollo separado. `pnpm run dev` ejecuta `tsx server.ts` que levanta Express con Vite como middleware.

Si `better-sqlite3` falla al iniciar, recompilar los bindings nativos:
```bash
cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && node-gyp rebuild
```

## Variables de entorno (.env)

```
WA_NUMBER=51998102756       # Número WhatsApp (SOLO aquí, nunca en frontend)
LEAD_EMAIL=...              # Email destino de leads
GMAIL_USER=...              # Cuenta Gmail para envío
GMAIL_PASS=...              # App password de Gmail
GEMINI_API_KEY=...          # Expuesto al cliente vía vite.config.ts
```

## Arquitectura

### Estructura del servidor (`server.ts`)
- Express sirve la app: en dev usa Vite como middleware; en producción sirve `dist/` con fallback SPA
- `POST /api/leads`: valida teléfono, guarda en SQLite, envía email HTML opcional, retorna `{ waUrl }` con mensaje WhatsApp pre-llenado
- La URL de WhatsApp se construye en el servidor usando `WA_NUMBER` del entorno — el cliente nunca toca el número directamente

### Frontend (`src/App.tsx` — 880 líneas, componente único)
Todo el frontend vive en un solo archivo. Secciones en orden de render:
`Navbar → Hero → CredibilityStrip → WhatYouReceive → Services → WhyIndependent → Clients → ContactSection → Footer`

Componentes adicionales en el mismo archivo:
- **`ConsultationModal`**: formulario de 8 campos (tipo, distrito, área, finalidad, nombre, teléfono, email, mensaje). Al enviar hace `POST /api/leads`, recibe `waUrl` y abre WhatsApp en nueva pestaña.
- **`FloatingCTA`**: aparece al hacer scroll 120px, abre `ConsultationModal`

### Estilos (`src/index.css`)
Tailwind v4 con variables CSS personalizadas. Tokens de marca:
- `brand-navy` (#1A2B3C), `brand-gold` (#C5A059), `brand-slate` (#F8F9FA), `brand-ivory` (#F2EDE4)
- Fuentes: Inter (sans) y Playfair Display (display)
- Animación marquee de 36s para strip de clientes

### Base de datos
SQLite local (`leads.db` en raíz). Tabla `leads` con: id, name, phone, email, property_type, district, location, area, purpose, message, created_at.

### Vite config
- Plugin Tailwind CSS v4 via `@tailwindcss/vite`
- Alias `@` apunta a la raíz del proyecto
- `GEMINI_API_KEY` expuesto como variable de entorno al cliente

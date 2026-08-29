# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs Express BCV server + Vite concurrently)
npm run dev

# Build for production
npm run build

# Run only the BCV Express server (port 3001)
npm run server
```

## Architecture

This is the **white-label template** of a single-user appointment/income management PWA for Venezuelan small businesses (doctors, barbers, spas...). Built with React + Vite + Tailwind CSS, deployed per-client on Vercel. Sold by PolitiWeb Studio.

**All client-specific customization lives in `src/config/negocio.js`** (app name, owner name, terminology paciente/cliente with grammatical gender, service catalogs, WhatsApp messages, AI assistant context, PWA colors). Per-client setup checklist: `README-TEMPLATE.md`. Never hardcode business names, service lists, or person-terminology in components — always read from `NEGOCIO`/`TERM`.

### Auth flow (`src/main.jsx`)
`AuthProvider` wraps everything. `Root` component checks `autenticado` from `useAuth()` — if false, renders `<Login />`, otherwise renders the app. Supabase Auth handles sessions (JWT persisted automatically).

### Data flow
`AppContext` loads all data on mount via `Promise.all` (pacientes, ingresos, citas) and keeps it in memory. All CRUD is async Supabase calls that also update local state optimistically. Pages consume data via `useApp()` — no per-page fetching.

### BCV exchange rate
- **Dev:** Vite proxies `/api` → Express server at `localhost:3001` (`server/index.cjs`)
- **Prod:** Vercel Serverless Function at `api/bcv/tasas.js`
- `useBcv()` hook fetches on mount and exposes `{ data, loading, error, refetch }`
- `rejectUnauthorized: false` is intentional — bcv.org.ve uses a self-signed certificate

### UI system (`src/index.css`)
Custom "Liquid Glass" design via CSS classes: `.glass-card`, `.glass-input`, `.glass-btn-primary`, `.glass-btn-icon`, `.glass-label`, `.glass-header`, `.glass-nav`. All pages use the animated mesh background (`.bg-mesh`, `.orb-1/2/3/4`) defined in Layout.

### Layout pattern
Every page uses `<PageHeader>` for symmetric headers — always `[40px left slot] [centered title] [40px right slot]`. Use `back` prop for back arrow, `action` prop for right-side button. Pages that aren't sub-pages (Dashboard, Pacientes, etc.) omit `back` and use an invisible placeholder div to preserve centering.

### Venezuela-specific conventions
- Dates always use `hoyVE()` / `toFechaVE()` from `src/lib/fecha.js` (timezone `America/Caracas`, UTC-4)
- Phone numbers: prefix selector (0412/0414/0416/0422/0424/0426) + 7 digits stored as `0414-1234567`
- Cédula: always `V-` prefix + 6–8 digits
- Currency: USD or Bs. Bs payments save `tasa_bcv` at time of registration for historical accuracy
- Payment methods that lock to USD: Efectivo USD, Zelle, PayPal

### Supabase schema
Tables: `pacientes`, `ingresos`, `citas`. `ingresos` has `tasa_bcv NUMERIC` column for historical BCV rate. `pacientes` has `ON DELETE CASCADE` so deleting a patient removes their ingresos and citas. RLS is enabled on all tables — only authenticated users can access data.

### Deployment
- Push to `master` → Vercel auto-deploys
- Env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set in Vercel dashboard
- `.env` is gitignored — never commit it

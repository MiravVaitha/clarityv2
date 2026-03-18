# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint (flat config, Next.js core web vitals + TS)
```

No test framework is configured.

## Environment Variables

Required in `.env.local`:
- `GEMINI_API_KEY` — Google Gemini API key (server-only)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)

Optional:
- `GEMINI_MODEL` / `GEMINI_FALLBACK_MODEL` — Override default Gemini models
- `DEBUG_AI` — Enable verbose AI logging

## Architecture

**ClarityCast** is a Next.js 16 App Router application (React 19, TypeScript 5, Tailwind CSS 4) that helps users organize thoughts and refine communication via AI-powered engines.

### Characters

- **Zulu** (Bear) — Clarity & decisions. Helps users think through decisions, plans, and tangled thoughts.
- **Tango** (Parrot) — Drafts & messages. Helps users craft communication for specific situations.

### AI engine

Chat-based characters (`/api/bear`, `/api/parrot`) — Stateful conversational AI with Supabase-persisted sessions and messages.

### Route groups

- `(auth)` — Login, password reset. No navbar.
- `(app)` — Protected pages: `/home`, `/account`. Legacy `/clarity` and `/communication` routes redirect to `/bear` and `/parrot`.
- `(chat)` — Protected chat pages: `/bear`, `/parrot`.

### API routes

- `/api/bear`, `/api/parrot` — Chat-based character endpoints.
- `/api/delete-account` — Account deletion (rate-limited to 3 req/min).

### Request flow & reliability

- **Server side**: Gemini API call with 20s timeout → falls back to secondary model on failure.
- **Rate limiting**: `src/proxy.ts` implements per-user sliding-window rate limiting (Next.js 16 proxy pattern). Limits vary by route (e.g., 30 req/min for AI endpoints, 3 req/min for delete-account).

### Auth & routing protection

`src/proxy.ts` also handles Supabase session refresh and redirects: unauthenticated users → `/login`, authenticated users at `/login` or `/` → `/home`.

### Data layer

- **Supabase PostgreSQL**: `sessions` and `messages` tables for bear/parrot chat persistence.
- **AI-generated session titles**: First message creates a placeholder title, then a fire-and-forget Gemini call generates a 3–6 word summary. Titles are editable inline in the session sidebar.

### Validation pattern

All API inputs and AI outputs are validated with Zod schemas. Schemas live in `lib/bearSchemas.ts` and `lib/parrotSchemas.ts`. Gemini is configured with native JSON schema output + Zod post-validation.

### Prompt engineering

Prompt builders in `lib/bearPrompts.ts` and `lib/parrotPrompts.ts` construct system/user prompts per mode. Clarity engine modes: `decision`, `plan`, `overwhelm`, `message_prep`.

### UI features

- **Home page**: Split-screen with interactive characters. Hover (desktop) or tap (mobile) shows speech bubbles and highlights CTA buttons. Mobile-only "Tap me" pills.
- **Custom cursor**: SVG cursor with page-aware color glow (amber for Bear, teal for Parrot). Hidden on touch devices. Component: `components/CustomCursor.tsx`.
- **Page transitions**: Fade overlay on route changes in chat pages. Component: `components/PageTransition.tsx`.
- **Character animations**: BearCharacter and ParrotCharacter SVG components with idle/thinking/talking states and breathing animations.
- **Themed backgrounds**: WoodsBackground (Bear) and JungleBackground (Parrot) with animated mist, leaves, vines, and firefly particles.

## Path alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

# ClarityCast – AI Thinking & Communication Companion

An AI-powered web application that helps users untangle complex thoughts and refine professional communication through two character-driven AI experiences.

🌐 **Live app:** https://clarityv2-cyan.vercel.app/
🤖 Powered by Gemini API
🎯 Built as an interactive AI product

---

## Characters

| Character | Animal | Focus |
|-----------|--------|-------|
| **Zulu** | Bear | Clarity & decisions — think through tangled thoughts, decisions, plans, and overwhelm |
| **Tango** | Parrot | Drafts & messages — craft communication tailored to your audience and tone |

---

## Features

- 🐻 **Bear (Zulu)** — Structures messy thoughts into clarity across four modes: decisions, plans, overwhelm, and message prep
- 🦜 **Tango (Parrot)** — Refines messages into clear, professional drafts for specific situations and audiences
- 💬 **Persistent chat sessions** — Conversations are saved with AI-generated titles and editable inline in the session sidebar
- 🎭 **Rive-animated characters** — Idle, thinking, and talking states with breathing animations and themed backgrounds
- 🖱️ **Custom cursor** — Page-aware colour glow (amber for Bear, teal for Parrot), hidden on touch devices
- 📱 **Responsive design** — Optimised for desktop and mobile, with mobile-specific tap interactions

---

## Tech Stack

- Next.js 16 (App Router)
- React 19, TypeScript 5
- Tailwind CSS 4
- Gemini API via `@google/genai` (primary + fallback model support)
- Supabase (PostgreSQL + SSR auth)
- Rive (`@rive-app/react-canvas`) for character animations
- Zod 4 (input and output validation)
- Vercel (deployment)

---

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MiravVaitha/clarityv2.git
cd clarityv2
npm install
```

---

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini (required)
GEMINI_API_KEY=your_api_key_here

# Optional: override default models
# GEMINI_MODEL=gemini-2.0-flash
# GEMINI_FALLBACK_MODEL=gemini-1.5-flash

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: verbose AI logging
# DEBUG_AI=true
```

`GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL` are optional — the fallback model is tried automatically if the primary times out or is unavailable.

---

### Run the development server

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

## Build

Create a production build:

```bash
npm run build
```

Start production server locally:

```bash
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── bear/           # Bear (Zulu) chat endpoint
│   │   └── parrot/         # Parrot (Tango) chat endpoint
│   ├── (auth)/             # Login, password reset — no navbar
│   ├── (app)/              # Home, account — protected
│   ├── (chat)/             # Bear, parrot chat pages — protected
│   └── layout.tsx          # Global layout
├── components/             # Shared UI components (characters, backgrounds, cursor)
├── lib/
│   ├── bearPrompts.ts      # Bear prompt builders (decision, plan, overwhelm, message_prep)
│   ├── parrotPrompts.ts    # Parrot prompt builders
│   ├── bearSchemas.ts      # Zod schemas for Bear
│   ├── parrotSchemas.ts    # Zod schemas for Parrot
│   └── supabase/           # Supabase client helpers
└── proxy.ts                # Auth middleware, session refresh, rate limiting
```

---

## Architecture Notes

- Server-side Gemini calls for secure API key usage
- **Two-layer reliability:** 20s server-side timeout with automatic model fallback (primary → fallback model)
- Per-user sliding-window rate limiting — 30 req/min for AI endpoints, 3 req/min for account deletion
- Structured JSON generation with Zod schema validation on all AI inputs and outputs
- Supabase SSR auth with automatic session refresh on every request via `proxy.ts`
- Fire-and-forget Gemini call generates session titles after the first message

---

## Deployment

Deployed on **Vercel**. Production builds deploy automatically on every push to `main`.

---

## License

Private — all rights reserved.

# ClarityCast – AI Thinking & Communication Companion

An AI-powered web application that helps users untangle complex thoughts and refine professional communication using structured reasoning and natural language generation.

> **This repository tracks the main official version of ClarityCast.**
> The live link below is the demo version and may not reflect the latest changes in this repo.

🌐 **Demo site:** https://claritycast.vercel.app/login
🤖 Powered by Gemini API
🎯 Built as an interactive AI product

---

## Features

- 🧠 **Clarity Engine** — Transforms messy thoughts into structured clarity cards (decisions, plans, reframing, next steps)
- ✍️ **Communication Engine** — Refines messages into clear, professional drafts across multiple tones and contexts
- 🔁 **Refine Flow** — Answer 3 targeted follow-up questions to sharpen AI output
- 🎨 **Animated Gradient UI** — Custom background animation with layered depth
- 📱 **Responsive Design** — Optimised for desktop and mobile
- 🧩 **Modular Architecture** — Reusable components with clean separation of concerns

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Gemini API (`gemini-2.5-flash` with `gemini-flash-lite-latest` fallback)
- Vercel (Deployment)
- Git & GitHub

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
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest
```

`GEMINI_MODEL` and `GEMINI_FALLBACK_MODEL` are optional — the defaults above will be used if omitted. The fallback model is tried automatically if the primary model times out or is unavailable.

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
│   │   ├── clarify/        # Clarity Engine route (decision, plan, overwhelm, message_prep)
│   │   └── communicate/    # Communication Engine route
│   ├── layout.tsx           # Global layout & background mount
│   └── (pages)              # Home, Clarity, Communication
├── components/
│   ├── ui/                  # shadcn components
│   └── shared components
├── lib/
│   ├── geminiClient.ts      # AI client — model selection, fallback, timeout
│   ├── api-client.ts        # Browser fetch wrapper — retries, backoff
│   ├── prompts.ts           # All AI prompt builders
│   └── schemas.ts           # Zod validation schemas
```

---

## Architecture Notes

- Server-side Gemini calls for secure API key usage
- **Two-layer reliability:** server-side model fallback (primary → fallback model) + browser-side HTTP retry with exponential backoff
- 20s per-model timeout — fails fast and falls back rather than hanging
- Structured JSON generation with Zod schema validation
- Stateless design (no database required)

---

## Deployment

Deployed on **Vercel**. Production builds deploy automatically on every push to `main`.

---

## 🚀 Roadmap

ClarityCast is actively evolving. Upcoming improvements include:

- Character-driven AI interaction (Think with Bear / Speak with Parrot)
- Reduced user friction in communication controls
- Enhanced structured output reliability
- Performance optimisations

Feedback and iteration are ongoing.

---

## License

MIT License

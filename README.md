PromptSite — Prompt‑to‑Page Demo (Next.js + NestJS + MongoDB)
PromptSite lets you describe a website in plain English and instantly see a generated preview. It ships as a single repository containing:

A Next.js App Router frontend (with shadcn/ui, Tailwind CSS, and Lucide icons)
A NestJS backend (optional) with MongoDB for persistence and optional Gemini integration for section generation
The frontend can run in two modes:

Mock mode (no backend required): quickly preview generated sections using an in‑memory store
Backend mode: call the Nest API for persistent pages backed by MongoDB (and optionally fetch section suggestions from Gemini)
Features
Prompt validation on both client and server
Dual mode:
Mock fallback with in‑memory storage (great for local demos)
Full API via NestJS + MongoDB
Prebuilt UI:
shadcn/ui components
Tailwind CSS configured with CSS variables and OKLCH color tokens
Lucide icons
Clean pages:
/ — Prompt workspace with two‑pane preview
/p/:id — Render a generated page by id
API endpoints:
POST /generate-content — Request generation and store the result
GET /fetch-content/:id — Retrieve generated content by id
Requirements
Node.js 18#43; (LTS recommended)
pnpm, npm, or yarn
For backend mode:
MongoDB (local or Atlas)
Optional: Google Gemini API key
Environment Variables
The project supports the following environment variables. You can export them in your shell for local development.

Frontend (Next.js):

NEXT_PUBLIC_NEST_API_BASE — Base URL for the Nest API (e.g., http://localhost:4000)
NEXT_PUBLIC_BASE_URL — Optional; base URL for the Next.js app
Backend (NestJS):

MONGODB_URI — Mongo connection string (e.g., mongodb://localhost:27017/promptsite)
GEMINI_API_KEY — Optional; if provided, Nest will try Gemini 1.5 Flash for JSON section suggestions
Example (bash):

# Frontend
export NEXT_PUBLIC_NEST_API_BASE=http://localhost:4000

# Backend
export MONGODB_URI="mongodb://localhost:27017/promptsite"
export GEMINI_API_KEY="your_gemini_key_here"
Note: In the v0 preview environment, .env files are not used. When running locally on your machine, you can use a .env file and a process manager (e.g., dotenv, cross-env, or Next.js/Nest built‑in env loading) as you prefer.

Getting Started (Local)
Install dependencies:

# at repository root
npm install
# or
pnpm install
Run the backend (NestJS):

# In Terminal 1
# Make sure MONGODB_URI (and optionally GEMINI_API_KEY) are set
npx nest start --watch
# Nest will listen on http://localhost:4000
Run the frontend (Next.js):

# In Terminal 2
# Make sure NEXT_PUBLIC_NEST_API_BASE is set if you want to use the backend
npx next dev -p 3000
# Next will listen on http://localhost:3000
If you do not start the backend or do not set NEXT_PUBLIC_NEST_API_BASE, the app will automatically use its mock, in‑memory generator so you can still test the flow.

How It Works
Client‑side prompt validation in components/prompt-workspace asks for at least 12 characters, 3 words, and a keyword like "landing", "blog", "bakery", etc.
When you click "Generate preview":
Mock mode: the app constructs a Page object in memory and shows a preview immediately
Backend mode: the app calls POST {NEXT_PUBLIC_NEST_API_BASE}/generate-content, which:
Validates the prompt on the server
Optionally calls Gemini to suggest JSON sections (if GEMINI_API_KEY is set)
Persists the page in MongoDB
Returns a pageId
Viewing a generated page:
In frontend mock mode: /p/:id renders using a mock fetch
In backend mode: /p/:id fetches via GET {NEXT_PUBLIC_NEST_API_BASE}/fetch-content/:id
API Reference (NestJS)
Base URL: {NEXT_PUBLIC_NEST_API_BASE}

POST /generate-content

Body:
{ "prompt": "Landing page for a bakery with hero, about, and contact" }
Response:
{
  "success": true,
  "pageId": "65f...",
  "message": "Page created. Visit /p/65f...",
  "reply": "...optional gemini raw reply...",
  "sections": [ { "key": "hero", "type": "Hero", "title": "...", "body": "..." } ]
}
GET /fetch-content/:id

Response:
{
  "id": "65f...",
  "prompt": "Landing page for ...",
  "sections": [ ... ]
}
Key Files and Folders
Frontend (Next.js, App Router):

app/layout.tsx — Root layout
app/page.tsx — Prompt workspace entry page
app/p/[id]/page.tsx — Generated page renderer
app/api/generate-content/route.ts — Frontend route handler that proxies to Nest if NEXT_PUBLIC_NEST_API_BASE is set, otherwise mocks
app/api/fetch-content/[id]/route.ts — Frontend route handler that proxies to Nest if configured
components/prompt-workspace.tsx — Main prompt UI
components/preview-page.tsx — Renders sections as Hero/About/Contact
app/globals.css — Tailwind setup and CSS vars
components/ui/* — shadcn/ui components
Backend (NestJS):

src/main.ts — Bootstrap Nest app (CORS on, port 4000 by default)
src/app.module.ts — Root module with MongooseModule
src/content/* — Content controller/service, DTO and Mongoose schemas
Shared types and helpers:

Types and lightweight mock DB utilities are included for the mock mode.
Development Tips
If you want to keep using mock mode during UI work, leave NEXT_PUBLIC_NEST_API_BASE unset and do not run Nest. You’ll get instant previews without a database.
To persist generated pages and retrieve them at /p/:id, run Nest and set NEXT_PUBLIC_NEST_API_BASE to http://localhost:4000.
Testing (NestJS)
End‑to‑end tests are scaffolded in test/*.

Run E2E tests:

# Ensure dev deps for jest/ts-jest are installed.
# Then from the root:
npx jest --config test/jest-e2e.json
Deployment
Frontend (Next.js): Deploy to Vercel
Set NEXT_PUBLIC_NEST_API_BASE in Vercel Project Settings so the frontend can reach your backend
Backend (NestJS): Deploy to your preferred host (Render, Fly.io, Railway, AWS, etc.)
Set MONGODB_URI and optionally GEMINI_API_KEY
Ensure CORS allows your frontend origin
Known Issues
If generated pages do not fetch as expected in /p/:id, double‑check your environment variable names and values. The frontend must know the backend base URL via NEXT_PUBLIC_NEST_API_BASE.
License
MIT (or your preferred license). Update this section accordingly.

Acknowledgements
Next.js App Router
NestJS
shadcn/ui
Tailwind CSS
Lucide Icons
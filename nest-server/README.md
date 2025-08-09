# NestJS Backend (PromptSite)

Endpoints:
- POST /generate-content
  - Body: { "prompt": "Landing page for bakery" }
  - Response: { "success": true, "pageId": "...", "message": "Page created. Visit /p/..." }
- GET /fetch-content/:id
  - Response: { "id": "...", "prompt": "...", "sections": [...] }

Setup:
1. cp .env.example .env
2. Set MONGODB_URI and optionally GEMINI_API_KEY
3. npm install
4. npm run start:dev

Environment:
- PORT (default 4000)
- MONGODB_URI (e.g., mongodb://localhost:27017/promptsite)
- GEMINI_API_KEY (optional; if set, service may incorporate AI replies)

Connect Next.js to Nest:
- In Next.js, set NEXT_PUBLIC_NEST_API_BASE=http://localhost:4000
- The Next.js routes /api/generate-content and /api/fetch-content/[id] will proxy automatically.

Mongo Collections:
- prompts: { prompt, reply?, pageId? }
- pages-content: { prompt, sections: [{ key, type, title?, body?, image? }] }

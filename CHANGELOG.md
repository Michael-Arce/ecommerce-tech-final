# Changelog

All notable changes to PremiumTech are documented here.

---

## [Unreleased]

### Added
- `GET /metrics` endpoint — latency p50/p95/p99, error rate, AI call counters per route
- In-memory TTL cache for `GET /brands` and `GET /categories` (5 min, invalidated on admin writes)
- `GET /ready` endpoint with live DB health check (`SELECT 1`)
- `why_matched` field in search results (`semantic` | `text` | `semantic+text`)
- Retry logic (`withRetry`) for Groq calls — retries on 5xx/ECONNRESET with exponential backoff
- `docs/DEPLOY.md` — env parity table, Vercel + Render setup, release checklist, rollback plan
- `docs/DEMO.md` — 3-minute walkthrough for evaluators
- `setup.sh` — automated local setup (deps, migrations, seed, embedding index)
- `.env.example` (frontend) and `server/env.example` with secret rotation instructions

### Fixed
- Vulnerable deps: axios 1.14→1.15.2 (SSRF), vite 8.0.3→8.0.10 (path traversal), follow-redirects→1.16.0
- `withRetry` was treating all errors without HTTP status as transient — now only retries 5xx/ECONNRESET
- Frontend CI migrated from npm to Bun (`oven-sh/setup-bun@v2`)
- `CLOUDINARY_URL` env var documented correctly (replaces individual `CLOUDINARY_*` vars)

### Changed
- `Cache-Control: public, max-age=300, stale-while-revalidate=60` on brands and categories responses

---

## [1.0.0] — AI Features Release — 2026-04-05

### Added — EPIC-A: Semantic Search
- Hybrid search endpoint `GET /api/search` — pgvector cosine similarity + tsvector full-text with RRF scoring
- `GET /api/products/:id/similar` — vector-based similar products with category fallback
- Multilingual embeddings via Cohere `embed-multilingual-v3.0` (1024 dims, EN/ES queries work)
- Embedding pipeline: `bun run index:full` / `index:changed` / `index:product --id`
- `embeddingVersion` field for incremental re-indexing
- Search UI with filter panel, empty/error states, `why_matched` badges

### Added — EPIC-B: AI Shopping Assistant
- `POST /api/assistant/chat` — SSE streaming, tool-calling loop (max 8 rounds)
- Tools: `searchProducts`, `getProductDetails`, `compareProducts`, `addToCart`, `getCartSummary`
- Groq `llama-3.3-70b-versatile` as LLM (free tier, 14,400 req/day)
- Prompt injection guard — keyword filter + unicode normalization + strike ban (3 strikes → 10 min IP ban)
- Rate limiting: 20 req/min on AI endpoints
- Chat widget UI with quick actions, action buttons, session history
- AI disclaimer visible in chat UI (EN/ES)

### Added — EPIC-C: Hardening
- GitHub Actions CI: frontend (Bun + Vitest) + backend (Bun + Vitest), badges in README
- Structured logging with `requestId` correlation per request (`X-Request-Id` header)
- Zod validation on all critical endpoints (cart, orders, addresses, users, auth, products, search, assistant)
- Explicit timeouts: Cohere 10s, Groq 30s, Cloudinary 30s
- `HEALTH_TOKEN` protection for `/health` in production
- Trust proxy + multi-origin CORS

### Added — EPIC-D: Docs & Portfolio
- README: Mermaid architecture diagram, AI Features section, known tradeoffs
- Demo credentials, HTTP collection (`api.http`)
- Portfolio updated with AI Commerce section

---

## [0.1.0] — Initial Ecommerce Release — 2025

### Added
- Product catalog with categories, brands, variants, images (Cloudinary)
- Cart persistence per user in DB
- Orders + address management
- Admin panel (products, categories, brands, orders)
- Auth — JWT access + refresh tokens, HttpOnly cookies
- i18n EN/ES with react-i18next
- Feature-Sliced Design (FSD) frontend architecture

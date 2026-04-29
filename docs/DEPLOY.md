# Deploy Guide — PremiumTech

## Services

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | Set after first deploy |
| Backend | Render | `https://ecommerce-tech-ftva.onrender.com` |
| Database | Neon (PostgreSQL + pgvector) | Neon Console |
| Images | Cloudinary | Cloudinary Console |

---

## Environment Variable Parity

Every env var must exist in both local and production. Use this table as a checklist before each release.

| Variable | Local (`server/.env`) | Render (env vars) |
|---|---|---|
| `DATABASE_URL` | ✅ | ✅ |
| `JWT_SECRET` | ✅ | ✅ |
| `JWT_REFRESH_SECRET` | ✅ | ✅ |
| `CLIENT_ORIGIN` | `http://localhost:5173,...` | Vercel prod URL |
| `CLOUDINARY_URL` | ✅ | ✅ |
| `COHERE_API_KEY` | ✅ | ✅ |
| `GROQ_API_KEY` | ✅ | ✅ |
| `HEALTH_TOKEN` | optional | ✅ recommended |
| `NODE_ENV` | `development` | `production` |
| `PORT` | `3001` | set by Render |

---

## Frontend — Vercel

### First deploy

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. **Root directory**: leave empty (repo root).
4. Vercel auto-detects `vercel.json` — no extra config needed.
5. Add environment variable: `VITE_API_URL` = `https://ecommerce-tech-ftva.onrender.com`
6. Deploy.

### Subsequent deploys

Push to `main` → Vercel deploys automatically.

### Rollback

1. Vercel Dashboard → **Deployments**.
2. Find the last working deployment → **⋯ → Promote to Production**.
3. Takes effect in ~10 seconds, no downtime.

---

## Backend — Render

### First deploy

1. Go to [render.com](https://render.com) → **New Web Service** → connect the repo.
2. **Root directory**: `server`
3. **Runtime**: Node (Bun not natively supported — Render uses Node with Bun fallback)
4. **Build command**: `bun install && bunx prisma generate && bunx prisma migrate deploy`
5. **Start command**: `bun src/index.ts`
6. **Health check path**: `/health`
7. Add all env vars from the parity table above.
8. Deploy.

### Subsequent deploys

Push to `main` → Render redeploys automatically (if auto-deploy is enabled).

Manual deploy: Render Dashboard → **Manual Deploy** → **Deploy latest commit**.

### Database migrations

Migrations run automatically in the build step (`prisma migrate deploy`). If a migration fails:

```bash
# Connect to Neon and check migration status
bunx prisma migrate status
# Resolve manually if needed, then re-trigger deploy
```

### Rollback

1. Render Dashboard → **Events** → find the last working deploy hash.
2. **Manual Deploy** → paste the commit SHA → **Deploy**.
3. If a migration was applied, you may need to manually revert it in Neon Console.

> **Note:** Render free tier spins down after 15 min of inactivity. First request after sleep takes ~10s. Upgrade to Starter ($7/mo) to avoid cold starts.

---

## Release Checklist

Run this before every production push:

### Pre-deploy

- [ ] CI is green on `main` (frontend + backend workflows)
- [ ] `bun audit` shows no HIGH vulnerabilities
- [ ] All new env vars added to Render dashboard
- [ ] `CLIENT_ORIGIN` on Render includes the current Vercel URL
- [ ] Prisma migrations tested locally (`bunx prisma migrate dev`)
- [ ] `GET /ready` returns `{ status: "ready" }` locally

### Deploy

- [ ] Push to `main` — CI runs automatically
- [ ] Vercel deploy completes without errors
- [ ] Render deploy completes without errors
- [ ] `GET /health` returns `200` on prod
- [ ] `GET /ready` returns `200` on prod

### Post-deploy smoke test

- [ ] Browse homepage — products load
- [ ] Search bar returns results
- [ ] AI assistant responds to a message
- [ ] Add to cart works (logged-in user)
- [ ] Admin panel accessible with admin credentials

---

## Rollback Plan

### Scenario 1 — Frontend regression

1. Vercel Dashboard → Deployments → find last good deploy → **Promote to Production**
2. No downtime, instant.

### Scenario 2 — Backend regression (no migration)

1. Render Dashboard → Events → find last good deploy SHA
2. Manual Deploy → that SHA
3. ~2 min redeployment time

### Scenario 3 — Backend regression (migration applied)

1. Roll back Render to previous commit (Scenario 2)
2. Open Neon Console → SQL Editor → manually revert schema changes
3. Confirm `GET /ready` returns `200` after rollback

### Scenario 4 — LLM provider down (Groq / Cohere)

- Groq down → assistant returns error SSE event, search still works (DB only)
- Cohere down → search falls back to full-text only (no vector component), results degrade gracefully
- No action needed unless outage > 1h → check [status.groq.com](https://status.groq.com) / [status.cohere.com](https://status.cohere.com)

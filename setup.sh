#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }

echo -e "\n${CYAN}PremiumTech — Local Setup${NC}"

# ── 1. Check tools ────────────────────────────────────────────────────────────
step "Checking tools"
command -v bun  >/dev/null || { echo "bun not found — install from https://bun.sh"; exit 1; }
command -v git  >/dev/null || { echo "git not found"; exit 1; }
ok "bun $(bun --version)"

# ── 2. Frontend deps ──────────────────────────────────────────────────────────
step "Installing frontend dependencies"
bun install
ok "Frontend deps installed"

# ── 3. Frontend env ───────────────────────────────────────────────────────────
step "Frontend environment"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  ok "Created .env.local from .env.example"
else
  warn ".env.local already exists — skipping"
fi

# ── 4. Backend deps ───────────────────────────────────────────────────────────
step "Installing backend dependencies"
cd server
bun install
ok "Backend deps installed"

# ── 5. Backend env ────────────────────────────────────────────────────────────
step "Backend environment"
if [ ! -f .env ]; then
  cp env.example .env
  ok "Created server/.env from env.example"
  echo ""
  warn "Fill in the following required values in server/.env before continuing:"
  warn "  DATABASE_URL   — Neon PostgreSQL connection string"
  warn "  JWT_SECRET     — run: openssl rand -base64 64"
  warn "  JWT_REFRESH_SECRET — run: openssl rand -base64 64"
  warn "  CLOUDINARY_URL — cloudinary://api_key:api_secret@cloud_name"
  warn "  COHERE_API_KEY — https://dashboard.cohere.com/api-keys"
  warn "  GROQ_API_KEY   — https://console.groq.com/keys"
  echo ""
  read -r -p "Press Enter once you've filled in server/.env to continue..."
else
  warn "server/.env already exists — skipping"
fi

# ── 6. Prisma ─────────────────────────────────────────────────────────────────
step "Generating Prisma client"
bun prisma generate
ok "Prisma client generated"

step "Running database migrations"
bun prisma migrate deploy
ok "Migrations applied"

step "Seeding database"
bun prisma db seed
ok "Database seeded"

# ── 7. Embeddings ─────────────────────────────────────────────────────────────
step "Indexing product embeddings (semantic search)"
bun run index:full
ok "Embeddings indexed"

# ── Done ──────────────────────────────────────────────────────────────────────
cd ..
echo -e "\n${GREEN}✓ Setup complete!${NC}\n"
echo "  Start frontend:  bun run dev"
echo "  Start backend:   cd server && bun run dev"
echo "  (open two terminals, or use: bun run dev & cd server && bun run dev)"

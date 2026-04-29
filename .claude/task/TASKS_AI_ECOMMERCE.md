# Plan de Tareas — AI Commerce (para Claude Code)

## 0) Epic y orden de ejecución
1. **EPIC-A:** Search semántica + recomendador (MVP)
2. **EPIC-B:** Asistente de compra con tool-calling
3. **EPIC-C:** Hardening production-grade
4. **EPIC-D:** Documentación y portfolio positioning

---

## EPIC-A — Search semántica + recomendador

### A1. Diseño técnico y decisiones
- [x] Definir provider de embeddings — Cohere `embed-multilingual-v3.0` (1024 dims).
- [x] Elegir vector store — pgvector (extensión PostgreSQL en Neon).
- [x] Definir esquema de documento de producto para embedding (title, description, category, brand).
- [x] Definir estrategia de búsqueda híbrida — keyword + vector con RRF scoring.
- [ ] Definir criterios de relevancia esperada (casos de prueba funcionales documentados).

### A2. Modelo de datos / persistencia
- [x] Crear migraciones para almacenar embedding por producto (pgvector extension + campo vector).
- [x] Agregar campos de metadatos para ranking (stock, brand, category en búsqueda).
- [x] Crear índices para búsqueda textual (full-text) y vector similarity.
- [x] Implementar versionado de embeddings (campo `embeddingVersion Int @default(0)` en schema).

### A3. Pipeline de ingest y reindex
- [x] Implementar script `index-products` para generar embeddings masivos.
- [x] Implementar modo incremental (solo productos nuevos/actualizados — `--mode=changed`).
- [x] Implementar comandos:
  - [x] `index:full`
  - [x] `index:changed`
  - [x] `index:product --id`
- [x] Persistir logs de indexación (total, éxito, fallos, duración).
- [x] Implementar retry/backoff ante errores del proveedor de embeddings.

### A4. API de búsqueda híbrida
- [x] Crear endpoint `GET /search`.
- [x] Soportar filtros (categoría, precio, marca, stock, sort).
- [x] Implementar ranking híbrido (textual + semántico con RRF).
- [x] Exponer campos de explicación de ranking (opcional: `why_matched`).
- [x] Agregar paginación y ordenamiento.
- [x] Validar inputs con schema validation (Zod).
- [x] Manejar errores y timeouts de forma consistente.

### A5. Recomendaciones
- [x] Crear endpoint `GET /products/:id/similar`.
- [x] Definir reglas de exclusión (mismo producto, sin stock).
- [x] Agregar diversificación de resultados (evitar resultados casi idénticos).
- [x] Implementar fallback si no hay embeddings (top-rated por categoría).

### A6. Frontend búsqueda inteligente
- [x] Crear UI de "búsqueda inteligente" (`search-page.tsx` + `search-bar.tsx`).
- [x] Integrar filtros + resultados híbridos (`filters-panel.tsx`, `use-catalog-filters.ts`).
- [x] Mostrar estado de carga/empty/error.
- [x] Agregar bloque "Productos similares" en PDP.
- [ ] Medir interacción de usuarios (clicks en resultados).

### A7. Calidad
- [x] Tests unitarios para ranking y utilidades de scoring (`search.test.ts`).
- [x] Tests de integración para endpoints de search/similar (`products.test.ts`).
- [ ] Dataset pequeño de pruebas de relevancia (queries esperadas → resultados esperados).
- [ ] Pruebas de performance básicas del endpoint (`p95`, throughput).

---

## EPIC-B — Asistente de compra con tool-calling

### B1. Contrato del asistente
- [x] Definir alcance funcional (recomendar, comparar, agregar al carrito, FAQ de compra).
- [x] Definir policy de respuestas (no inventar datos de catálogo/precio/stock — injection guard).
- [x] Definir idioma(s), tono y límites (Groq, multilingual, guardrails).
- [x] Definir formato de respuesta para UI (SSE streaming + acciones ejecutables).

### B2. Herramientas (tools) backend
- [x] Implementar `searchProducts(query, filters)`.
- [x] Implementar `getProductDetails(productId)`.
- [x] Implementar `compareProducts(productIds[])`.
- [x] Implementar `addToCart(productId, variantId, qty)`.
- [x] Implementar `getCartSummary(session/user)`.

### B3. Orquestador LLM
- [x] Crear servicio `assistant-orchestrator`.
- [x] Implementar ciclo tool-calling (invocación + resultados + respuesta final).
- [x] Implementar memoria corta de conversación por sesión.
- [x] Implementar guardrails de seguridad y validación de tool arguments (injection guard + strike ban).
- [x] Implementar fallback de modelo (si provider LLM no responde).

### B4. API del asistente
- [x] Crear endpoint `POST /api/assistant/chat`.
- [x] Soportar streaming de respuesta (SSE).
- [x] Agregar auth/session binding para acciones sobre carrito.
- [x] Agregar rate limiting específico para endpoints AI.
- [x] Estandarizar errores (`429`, `5xx`, timeout, provider unavailable).

### B5. UI chat en e-commerce
- [x] Crear widget de chat reutilizable (`chat-widget.tsx`).
- [x] Agregar quick actions (recomendar, comparar, presupuesto).
- [x] Mostrar acciones ejecutables (ej. "Agregar al carrito" desde el chat).
- [x] Manejar estados (typing, loading, retry).
- [x] Persistir historial corto en sesión del navegador.

### B6. Seguridad y compliance básica
- [x] Sanitizar input/output del usuario (injection-guard middleware).
- [x] Bloquear prompt injection para tools sensibles (keyword filter + unicode normalization + strike ban).
- [ ] Redactar y documentar política de datos (qué se guarda y cuánto tiempo).
- [x] Mostrar disclaimer de IA visible en la UI del chat (chat-widget.tsx línea 313 + i18n EN/ES).

### B7. Calidad
- [x] Tests unitarios del orquestador (`injection-guard.test.ts`).
- [x] Tests de integración del flujo tool-calling (`assistant.test.ts`).
- [ ] Tests E2E: usuario consulta → recibe recomendación → agrega al carrito.
- [ ] Pruebas de resiliencia ante caída del provider LLM.

---

## EPIC-C — Hardening production-grade

### C1. CI/CD
- [x] Crear workflow backend: lint + typecheck + tests (GitHub Actions, Bun).
- [x] Crear workflow frontend: lint + typecheck + tests.
- [x] Ejecutar checks en PR y push a rama principal.
- [x] Agregar badges de estado al README.
- [x] Configurar bloqueo de merge si checks fallan (branch protection en GitHub settings).

### C2. Observabilidad
- [x] Implementar logging estructurado (`logger.ts` con pino/structured logs).
- [x] Agregar middleware de correlación de requests (`requestId` UUID por request, header `X-Request-Id`).
- [x] Implementar `/health` (con token de autenticación en prod).
- [x] Implementar `/ready` (endpoint separado de readiness).
- [ ] Instrumentar métricas básicas (latencia, error rate, AI calls).
- [ ] Crear dashboard mínimo (aunque sea básico).

### C3. Seguridad
- [x] Revisar CORS y headers de seguridad (trust proxy + CORS multi-origin).
- [x] Implementar rate limiting en AI endpoints.
- [x] Validación estricta de payloads en todos los endpoints críticos (Zod en cart, orders, addresses, users, auth, products — fixed forgot-password).
- [x] Revisar manejo seguro de secrets y documentar rotación (`server/env.example` + `.env.example` con guía de rotación por provider).
- [x] Auditoría de dependencias y vulnerabilidades (`bun audit` — axios, vite, follow-redirects actualizados).

### C4. Performance
- [ ] Definir presupuesto de latencia para endpoints críticos.
- [ ] Optimizar consultas de catálogo y búsqueda.
- [x] Implementar caching en rutas de alta lectura (`lib/mem-cache.ts` — brands + categories con TTL 5min + invalidación en writes).
- [ ] Evaluar compresión y optimizaciones frontend (bundle splitting).
- [ ] Ejecutar smoke load test y guardar resultados.

### C5. Resiliencia
- [x] Timeouts explícitos hacia servicios externos (Cohere 10s, Groq 30s, Cloudinary 30s).
- [x] Circuit breaker/retry para llamadas a providers AI (`withRetry` en orchestrator — reintentos en 5xx/ECONNRESET).
- [x] Fallback funcional cuando AI no esté disponible (strike ban + injection guard).
- [x] Manejo consistente de errores de DB y red (error middleware + sanitize en prod).

### C6. Entornos
- [x] URL de producción documentada (backend en `api.http`).
- [x] Verificar y documentar paridad de variables entre local/staging/prod (`docs/DEPLOY.md`).
- [x] Documentar configuración de deploy (Vercel + Render) (`docs/DEPLOY.md`).
- [x] Crear checklist de release manual (`docs/DEPLOY.md`).
- [x] Crear rollback plan básico (`docs/DEPLOY.md` — 4 escenarios).

---

## EPIC-D — Documentación y posicionamiento (reclutador)

### D1. README principal (Ecommerce_Tech)
- [x] Agregar sección "AI Features" (búsqueda semántica + asistente).
- [x] Incluir arquitectura de alto nivel (diagrama visual — no solo texto).
- [x] Documentar endpoints de search/recommend/chat (`api.http` + README).
- [x] Agregar instrucciones de indexación de embeddings (`bun run index:full`).
- [x] Agregar "Known Tradeoffs" y próximos pasos.

### D2. Demo y DX
- [x] Añadir credenciales demo (admin/user en README).
- [x] Agregar colección de requests HTTP (`api.http` — Bruno/REST Client).
- [x] Incluir script de setup rápido para evaluadores (`setup.sh` + `.env.example` + `server/env.example`).
- [x] Crear "demo script" (pasos de 3 min para mostrar búsqueda semántica + chat).

### D3. Portfolio / narrativa
- [x] Actualizar myportfolio con sección "AI Commerce".
- [x] Enlazar producción de e-commerce.
- [x] Resumir impacto técnico en bullets claros.
- [ ] Agregar capturas o GIFs de búsqueda inteligente y chat.
- [ ] Limpiar README del frontend del chatbot (quitar template default).

---

## Backlog técnico transversal (aplicar en todos los epics)
- [x] Definir convención de commits (Conventional Commits en uso).
- [ ] Crear PR templates (`.github/PULL_REQUEST_TEMPLATE.md`).
- [ ] Definir Definition of Done por feature (formal, no solo este archivo).
- [ ] Mantener changelog de releases (`CHANGELOG.md`).
- [ ] Etiquetar issues por prioridad (`P0/P1/P2`) y tipo (`feat/fix/chore/docs`).
- [ ] Crear milestones por semana.

---

## Prioridad recomendada (si necesitas recortar)
1. A4 + A5 + A6 (search + similar + UI)
2. B2 + B3 + B4 + B5 (assistant end-to-end)
3. C1 + C2 + C3 (CI + observabilidad + seguridad mínima)
4. D1 + D3 (README + portfolio narrative)

---

## Definition of Done global
- [ ] Feature desplegada en producción.
- [x] Tests pasando en CI (frontend + backend workflows verdes).
- [ ] Telemetría mínima disponible.
- [ ] Documentación actualizada.
- [ ] Demo reproducible en < 5 minutos.

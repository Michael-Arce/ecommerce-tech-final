# Skills Plan — PremiumTech Ecommerce

> Objetivo: definir una estrategia de skills **sin solaparse** con las que ya existen en el repo.
>
> Skills actuales detectadas:
> - `.claude/skills/ecommerce-gotchas/SKILL.md`
> - `.claude/skills/ecommerce-security/SKILL.md`

---

## 1) Skills generales recomendadas (base profesional)

Estas skills son transversales para desarrollo web moderno y se combinan con tu stack (React 19 + TS + Tailwind 4 + TanStack + Express + Prisma).

### 1. frontend-design
**Para qué sirve**
- Mejorar UX/UI real (jerarquía visual, spacing, estados, responsive, accesibilidad visual).

**Cuándo cargarla**
- Landing/Home, PLP, PDP, carrito, checkout, formularios, dashboard.

**Por qué suma en este repo**
- Complementa React/Tailwind: no solo “se ve bien”, también guía decisiones de experiencia.

---

### 2. react
**Para qué sirve**
- Arquitectura de componentes, estado, hooks, composición, performance de render.

**Cuándo cargarla**
- Crear/refactorizar componentes, corregir bugs de render/estado, manejar flujos de UI complejos.

**Por qué suma en este repo**
- Encaja con React 19 + TanStack Router/Query + FSD.

---

### 3. tailwind
**Para qué sirve**
- Sistema visual consistente con utilidades (layout, spacing, responsive, variantes de componentes).

**Cuándo cargarla**
- Maquetado, refactor visual, diseño responsive, consistencia entre pantallas.

**Por qué suma en este repo**
- Tu stack ya está en Tailwind 4 + shadcn/ui, así que acelera implementación y coherencia.

---

### 4. accessibility (a11y)
**Para qué sirve**
- Navegación por teclado, foco visible, contraste, labels, aria y semántica correcta.

**Cuándo cargarla**
- Formularios, modales, navegación, tablas, menús, checkout.

**Por qué suma en este repo**
- Mejora UX, calidad percibida y reduce deuda técnica en componentes reutilizables.

---

### 5. testing (unit + integration + e2e)
**Para qué sirve**
- Asegurar que cambios no rompan funcionalidades críticas.

**Cuándo cargarla**
- Antes de mergear features de auth, carrito, checkout, búsqueda y filtros.

**Por qué suma en este repo**
- E-commerce tiene flujos sensibles; testing evita regresiones caras.

---

### 6. performance/web-performance
**Para qué sirve**
- Core Web Vitals, imágenes optimizadas, lazy loading, splitting, caching.

**Cuándo cargarla**
- Páginas con catálogos, grids grandes, PDP con assets pesados.

**Por qué suma en este repo**
- Impacta conversión y SEO directamente.

---

### 7. seo (frontend técnico)
**Para qué sirve**
- Metadata, canonical, estructura semántica, indexabilidad y rich snippets.

**Cuándo cargarla**
- PDP/PLP, blog, categorías, páginas estáticas de captación.

**Por qué suma en este repo**
- E-commerce depende de tráfico orgánico para escalar.

---

## 2) Skills específicas nuevas para mejorar este ecommerce

> Estas propuestas **evitan solaparse** con las skills existentes:
> - `ecommerce-gotchas` ya cubre bugs recurrentes e incidentes técnicos.
> - `ecommerce-security` ya cubre auth/roles/JWT/rutas sensibles.

### A. ecommerce-frontend-ux
**Enfoque**
- Patrones UX concretos para tienda: PLP, PDP, carrito, checkout y feedback al usuario.

**Qué debe incluir**
- Reglas para filtros (persistencia, reset claro, chips visibles).
- Estados loading/empty/error en búsqueda y listados.
- Reglas de CTA principal/secundario por pantalla.
- Guías para formularios (errores inline, validación progresiva, mensajes claros).
- Buenas prácticas mobile-first para navegación y compra.

**No pisa**
- No toca auth/JWT (eso queda en `ecommerce-security`).
- No toca bugs de Cloudinary/Prisma (eso queda en `ecommerce-gotchas`).

---

### B. ecommerce-performance
**Enfoque**
- Reglas de rendimiento para catálogo y páginas de conversión.

**Qué debe incluir**
- Política de imágenes (formatos, tamaños, lazy).
- Límite de peso inicial por ruta (home/PLP/PDP).
- Estrategia de prefetch/prefetch inteligente con TanStack Router.
- React Query tuning (staleTime, retry, cacheTime por tipo de dato).
- Lista de “anti-patterns” que disparan re-renders.

**No pisa**
- No reemplaza `react` ni `tailwind`; define guardrails de performance.

---

### C. ecommerce-testing
**Enfoque**
- Matriz mínima de pruebas por feature crítica.

**Qué debe incluir**
- Smoke tests por ruta crítica.
- Casos obligatorios de carrito/checkout/auth.
- Contratos básicos de API para endpoints clave.
- Reglas de test data y fixtures estables.
- Criterios de “Definition of Done” con cobertura mínima útil.

**No pisa**
- No duplica seguridad ni gotchas; valida que no reaparezcan regresiones.

---

### D. ecommerce-seo-content
**Enfoque**
- SEO aplicado a ecommerce, internacionalización EN/ES y estructura de contenido.

**Qué debe incluir**
- Plantilla de metadata por tipo de página.
- Canonical y control de duplicados por filtros.
- Reglas para breadcrumbs y schema de producto.
- Estrategia para páginas de categoría y long-tail.
- Checklist de indexación técnica antes de release.

**No pisa**
- Complementa frontend + negocio, sin duplicar security/gotchas.

---

## 3) Orden recomendado de implementación

1. `frontend-design` (si no está activa de base)
2. `accessibility`
3. `ecommerce-frontend-ux`
4. `ecommerce-performance`
5. `ecommerce-testing`
6. `ecommerce-seo-content`

---

## 4) Matriz rápida de auto-load (sugerida)

- **UI nueva / rediseño / componentes** → `frontend-design`, `react`, `tailwind`
- **Forms/checkout/login UX** → `frontend-design`, `accessibility`, `ecommerce-frontend-ux`
- **Lentitud o vitals** → `performance`, `ecommerce-performance`
- **Antes de merge de flujos críticos** → `testing`, `ecommerce-testing`
- **PDP/PLP/categorías y contenido orgánico** → `seo`, `ecommerce-seo-content`
- **Auth/roles/JWT/endpoints sensibles** → `ecommerce-security`
- **Upload/Cloudinary/Prisma/seed/incidentes repetidos** → `ecommerce-gotchas`

---

## 5) Conclusión

Tu setup actual ya es de nivel profesional porque captura conocimiento real del proyecto (`gotchas` + `security`).
La mejora óptima no es reemplazar, sino **combinar**:
- skills generales para velocidad y calidad transversal,
- skills específicas de ecommerce para contexto y decisiones de negocio.

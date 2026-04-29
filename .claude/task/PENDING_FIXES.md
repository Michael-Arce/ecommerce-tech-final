# Pending Code Quality Fixes

## 1. `req.params.id as string` — tipar handlers correctamente

**Archivos afectados:**
- `server/src/routes/addresses.ts`
- `server/src/routes/brands.ts`
- `server/src/routes/categories.ts`
- `server/src/routes/orders.ts`
- `server/src/routes/products.ts`
- `server/src/routes/users.ts`

**Problema:** Se usó `req.params.id as string` como parche para compatibilidad con `@types/express` v5.

**Fix correcto:** Tipar cada route handler con el genérico de params:
```typescript
router.patch('/:id', authenticate, async (req: Request<{ id: string }>, res, next) => {
```

---

## 2. `react-hooks/set-state-in-effect` desactivada globalmente

**Archivo:** `eslint.config.js`

**Problema:** La regla se desactivó globalmente para evitar refactorizar 3 componentes. Ahora nadie recibe el warning si introduce un setState en effect que sí está mal.

**Fix correcto:** Reactivar la regla globalmente y agregar `eslint-disable-next-line` localizado con comentario explicativo en cada caso justificado:

```typescript
// Intentional: syncs URL search param to controlled input without feedback loop
// eslint-disable-next-line react-hooks/set-state-in-effect
if (!isFocusedRef.current) setValue(currentQ)
```

**Componentes a revisar:**
- `src/features/search-products/ui/search-bar.tsx` — sync URL param → input
- `src/features/ai-assistant/ui/chat-widget.tsx` — toggle bubble visibility
- `src/widgets/category-shelf/category-shelf.tsx` — reset animación en hover

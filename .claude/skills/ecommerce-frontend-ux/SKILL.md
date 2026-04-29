---
name: ecommerce-frontend-ux
description: >
  UX patterns for PremiumTech — PLP, PDP, cart, checkout, search, feedback states.
  Trigger: Frontend work on product listing, product detail, cart, checkout, or search flows.
  Does NOT cover auth/JWT (ecommerce-security) or Cloudinary/Prisma bugs (ecommerce-gotchas).
metadata:
  author: lean
  version: "1.0"
---

## Filters — URL-First Pattern (REQUIRED)

Filters persist in URL via TanStack Router search params. Never filter state in component state only.

```tsx
// ✅ Filters in URL — shareable, back-button safe
const { brand, category, sort, page } = Route.useSearch();
const navigate = Route.useNavigate();

function applyFilter(key: string, value: string) {
  navigate({ search: (prev) => ({ ...prev, [key]: value, page: 1 }) });
}

// ❌ Filter state in useState — lost on refresh/navigation
const [brand, setBrand] = useState('');
```

## Filter UX Rules

- Show active filters as dismissable chips above the product grid
- "Limpiar filtros" button visible when any filter is active
- Filter changes trigger immediate navigation — no "Aplicar" button needed
- Always show result count after filtering: "32 productos encontrados"

## PLP Loading State

Skeleton grid, not spinner. Column count of skeleton must match the actual grid.

```tsx
// ✅ Skeleton matches layout
if (isLoading) return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// ❌ Layout jump when real content loads
if (isLoading) return <Spinner />;
```

## PDP — Add to Cart Feedback

After adding to cart:
1. Button shows loading state (disabled + spinner)
2. On success: brief "¡Agregado!" feedback (1.5s), then returns to normal
3. Cart badge updates immediately (optimistic or after mutation resolves)
4. User stays on PDP — do not navigate away

```tsx
<Button onClick={handleAdd} disabled={isPending} aria-live="polite">
  {isPending ? <Spinner /> : added ? '¡Agregado!' : 'Agregar al carrito'}
</Button>
```

## Cart UX Rules

- Quantity changes: optimistic update client-side + debounced mutation (no API call on every keystroke)
- Remove item: confirmation dialog only when removing the last item
- Empty cart state: show CTA to continue shopping, never blank space
- Price totals recalculate client-side immediately; server confirms in background

## Checkout Flow

- Multi-step with visible progress indicator (stepper)
- Each step validates before allowing next — no silent failures
- Address step: pre-fill from user profile if available
- Payment: surface specific error from payment provider, not generic "error de pago"
- Order confirmation: show order number + summary, offer "Seguir comprando" CTA

## Search UX

- Debounce 300ms before triggering query
- Empty state with suggestions: "Sin resultados para 'X'. ¿Probaste con...?"
- Highlight matching search term in results
- Clear button (×) on the search input — not only backspace
- Show query and count: "5 resultados para 'laptop'"

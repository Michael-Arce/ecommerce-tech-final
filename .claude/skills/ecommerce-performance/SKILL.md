---
name: ecommerce-performance
description: >
  Performance rules for PremiumTech — Cloudinary transforms, React Query staleTime,
  TanStack Router prefetch, bundle budgets, re-render anti-patterns.
  Trigger: Product grids, PDP with images, slow routes, React Query config, bundle size.
metadata:
  author: lean
  version: "1.0"
---

## Cloudinary Image Transforms (REQUIRED)

Never serve raw Cloudinary URLs in product grids. Always apply transforms at the URL level.

```tsx
// ✅ Transform helper
function cloudinaryUrl(publicId: string, w: number, h: number) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto/${publicId}`;
}

// Sizes by context:
// PLP card:       w=400,  h=400
// PDP hero:       w=800,  h=800
// Cart thumbnail: w=80,   h=80
// OG image:       w=1200, h=630

// ❌ Raw URL — serves original 4 MB image in an 80 px thumbnail
<img src={product.imageUrl} />
```

## React Query — staleTime by Data Type

```tsx
// Product catalog (slow-changing) — 10 minutes
useQuery({ queryKey: ['products'], staleTime: 10 * 60_000 })

// Cart (user-specific, must be fresh) — always refetch
useQuery({ queryKey: ['cart', userId], staleTime: 0 })

// Categories / Brands (near-static) — 30 minutes
useQuery({ queryKey: ['categories'], staleTime: 30 * 60_000 })

// User profile — 5 minutes
useQuery({ queryKey: ['user', userId], staleTime: 5 * 60_000 })

// Search results (query-specific) — 2 minutes
useQuery({ queryKey: ['search', q, filters], staleTime: 2 * 60_000 })
```

## TanStack Router — Prefetch on Hover

```tsx
// ✅ Prefetch route data on hover/focus — data ready before click
<Link
  to="/products/$slug"
  params={{ slug: product.slug }}
  preload="intent"
>
  {product.name}
</Link>
```

## Route Bundle Budget

| Route | Max JS budget |
|-------|---------------|
| Home | 150 KB |
| PLP | 200 KB |
| PDP | 180 KB |
| Checkout | 250 KB (payment SDKs included) |
| Admin | Lazy-loaded entirely — no budget cap |

## Pagination vs Infinite Scroll

| Use case | Strategy |
|----------|----------|
| PLP main grid | Pagination — URL-based, shareable, SEO-friendly |
| Search results | Pagination |
| Related / recommendations | "Ver más" button or infinite scroll |
| Admin tables | Always pagination |

## Re-Render Anti-Patterns

```tsx
// ❌ New object reference on every render passes React.memo
<ProductList filters={{ brand: 'apple' }} />

// ✅ Stable reference
const filters = useMemo(() => ({ brand }), [brand]);
<ProductList filters={filters} />

// ❌ Inline arrow in map — new function on every render
{products.map(p => <Card onClick={() => navigate(p.id)} />)}

// ✅ Stable handler
const handleClick = useCallback((id: string) => navigate(id), [navigate]);
{products.map(p => <Card key={p.id} id={p.id} onClick={handleClick} />)}
```

Note: React Compiler (see react-19 skill) auto-optimizes most of these. These patterns matter in non-compiled contexts or server-side code.

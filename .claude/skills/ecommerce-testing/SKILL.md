---
name: ecommerce-testing
description: >
  Minimum test matrix for PremiumTech — auth, cart, checkout, search, admin.
  Trigger: Adding or modifying auth, cart, checkout, search, product CRUD, or order flows.
  Complements the global testing skill with ecommerce-specific flow contracts.
metadata:
  author: lean
  version: "1.0"
---

## Definition of Done — Testing

A feature is NOT done until:
- [ ] Happy path tested (success case)
- [ ] Main error path tested (network error, validation, not found)
- [ ] Loading state covered
- [ ] Empty state covered (if applicable)

## Critical Flow Coverage (REQUIRED)

### Auth
- Login with valid credentials → redirects to intended page
- Login with invalid credentials → inline error shown, no redirect
- Register with duplicate email → field-level error shown
- Access protected route without token → redirect to /login
- Expired token → silent refresh, user stays logged in

### Cart
- Add product → badge and count update
- Add same product twice → increments quantity (no duplicate item)
- Remove last item → empty cart state shown
- Change quantity → total price recalculates immediately
- Cart state persists after page reload

### Checkout
- Proceed without address → validation error, blocked from next step
- Successful order creation → redirect to confirmation with order ID
- Payment failure → stays on checkout, error shown, retry available

### Search
- Query with results → products grid renders
- Query with no results → empty state with suggestions
- Active filters shown as dismissable chips
- Clear all filters → full product list returns

### Admin
- Create product → appears in product list
- Edit product → changes persist after save
- Delete product → removed from list (with confirmation before deleting)
- Upload product image → Cloudinary URL saved, preview shown

## Backend API Contract Tests (server/)

For each critical endpoint, assert 3 cases minimum:

```typescript
describe('POST /api/cart/items', () => {
  it('returns 401 without auth token', async () => { ... });
  it('returns 400 with missing productId', async () => { ... });
  it('adds item and returns updated cart', async () => { ... });
});
```

## Test Data — Factory Functions

Place factories in `src/test/factories/` (frontend) or `server/src/test/factories/` (backend):

```typescript
// ✅ Typed factory — explicit, reusable, overridable
export function makeProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'prod-1',
    name: 'Test Laptop',
    price: 999,
    stock: 10,
    slug: 'test-laptop',
    ...overrides,
  };
}

// ❌ Raw inline objects — differ across tests, go stale
const product = { id: '123', name: 'Laptop', price: 999 };
```

## What NOT to Test in This Ecommerce

- Cloudinary upload internals — mock at the HTTP level, not the SDK
- Prisma query details — test the API response shape, not the ORM call
- shadcn/ui component behavior — trust the library
- Tailwind class names appearing in the DOM

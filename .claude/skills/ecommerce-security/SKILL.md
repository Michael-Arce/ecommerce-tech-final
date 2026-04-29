---
name: ecommerce-security
description: >
  Vulnerabilidades conocidas y patrones de seguridad del proyecto PremiumTech ecommerce.
  Trigger: Cuando se toca auth, login, registro, roles, upload, JWT, o cualquier endpoint público.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Modificando rutas de auth (login, register, refresh, password)
- Agregando o modificando roles de usuario
- Revisando endpoints públicos o admin-only
- Antes de deployar cambios relacionados a autenticación

---

## Critical Patterns

### 1. Login sin rate limiting — brute force abierto

**Vulnerabilidad**: El endpoint `/api/auth/login` no tiene límite de intentos. Un atacante puede probar miles de contraseñas por segundo.

**Fix**: `express-rate-limit` en la ruta de login.

```ts
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 intentos por IP
  message: { success: false, message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, async (req, res, next) => { ... })
```

```bash
npm install express-rate-limit
```

---

### 2. Admin role por email domain — escalada de privilegios trivial

**Vulnerabilidad CRÍTICA**: Cualquier persona puede registrarse como admin usando un email `@premiumtech.com`.

```ts
// ❌ NUNCA hacer esto
role: data.email.endsWith('@premiumtech.com') ? 'admin' : 'customer'
```

**Fix**: Los admins se crean manualmente en la DB o con un script protegido. El registro siempre crea `customer`.

```ts
// ✅ Correcto
role: 'customer'
```

Para promover a admin, hacerlo directamente en la DB o con un endpoint protegido por `requireAdmin` existente.

---

### 3. JWT secrets con fallback inseguro

**Vulnerabilidad**: Si `JWT_SECRET` o `JWT_REFRESH_SECRET` no están en las env vars de Render, el servidor usa `'dev-secret'` en producción. Cualquiera que conozca el fallback puede forjar tokens.

```ts
// ❌ Peligroso en producción
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'
```

**Fix**: Fallar explícitamente si no están seteadas en producción.

```ts
// ✅ Correcto
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production')
  }
}
const JWT_SECRET         = process.env.JWT_SECRET         ?? 'dev-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'
```

**Env vars requeridas en Render**:
- `JWT_SECRET` — string largo y aleatorio (mínimo 32 chars)
- `JWT_REFRESH_SECRET` — distinto al anterior

---

### 4. Price manipulation en orders

**Vulnerabilidad CRÍTICA**: El endpoint `POST /api/orders` acepta `price` desde el cliente. Un atacante autenticado puede comprar cualquier producto a $0.01 mandando el precio que quiera.

```ts
// ❌ El servidor confía en el precio del cliente
const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
```

**Fix**: Ignorar el precio del cliente. Buscarlo en la DB por `productId`/`variantId`.

```ts
// ✅ El servidor calcula el precio real
const productIds = items.map(i => i.productId)
const products = await prisma.product.findMany({
  where: { id: { in: productIds } },
  include: { variants: true },
})

const subtotal = items.reduce((sum, item) => {
  const product = products.find(p => p.id === item.productId)
  if (!product) throw new Error(`Product ${item.productId} not found`)
  const variant = item.variantId
    ? product.variants.find(v => v.id === item.variantId)
    : null
  const price = variant?.price ?? product.price
  return sum + price * item.quantity
}, 0)
```

---

### 5. Rate limiting faltante en register y forgot-password

**Vulnerabilidad**: Sin límite en `/register`, un atacante puede crear miles de cuentas. Sin límite en `/forgot-password`, puede hacer flood de requests.

**Fix**: Aplicar `express-rate-limit` en ambas rutas.

```ts
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: { success: false, message: 'Too many accounts created, try again later' },
})

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests, try again later' },
})

router.post('/register', registerLimiter, ...)
router.post('/forgot-password', forgotPasswordLimiter, ...)
```

---

### 6. Helmet — headers de seguridad faltantes

**Vulnerabilidad**: Sin `helmet`, el servidor no envía headers de seguridad básicos (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.).

**Fix** (`app.ts`):
```ts
import helmet from 'helmet'
app.use(helmet())
```

```bash
npm install helmet
```

---

### 7. Cart merge sin límite de ítems — DoS suave

**Vulnerabilidad**: `POST /api/cart/merge` acepta un array sin límite. Un atacante puede mandar miles de ítems y generar una operación masiva en la DB.

**Fix**: Limitar el array en el schema Zod.

```ts
const items = z.array(itemSchema).max(100).parse(req.body.items)
```

---

## Checklist antes de deployar cambios de auth

- [ ] `POST /api/auth/login` tiene rate limiter (10 intentos / 15 min)
- [ ] `POST /api/auth/register` tiene rate limiter (5 / hora) y siempre crea `role: 'customer'`
- [ ] `POST /api/auth/forgot-password` tiene rate limiter (5 / 15 min)
- [ ] `POST /api/orders` calcula precios desde la DB, no del cliente
- [ ] `POST /api/cart/merge` limita array a 100 ítems
- [ ] `JWT_SECRET` y `JWT_REFRESH_SECRET` están seteadas en Render (NO usan el fallback)
- [ ] `helmet()` aplicado en app.ts
- [ ] `CLOUDINARY_URL` está seteada en Render (ver ecommerce-gotchas)
- [ ] Endpoints admin usan `requireAdmin` middleware
- [ ] No hay endpoints que expongan `passwordHash`

## Env vars requeridas en Render (backend)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Neon |
| `JWT_SECRET` | Secret para access tokens |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens |
| `CLOUDINARY_URL` | `cloudinary://KEY:SECRET@CLOUD` |
| `NODE_ENV` | `production` |

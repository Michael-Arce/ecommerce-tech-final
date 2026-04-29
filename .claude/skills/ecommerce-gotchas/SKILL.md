---
name: ecommerce-gotchas
description: >
  Bugs recurrentes y gotchas del proyecto PremiumTech ecommerce con sus fixes comprobados.
  Trigger: Cuando aparece un error de upload, Prisma migration, Cloudinary, o seed en este proyecto.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Error 500 en `/api/upload`
- Cloudinary no sube imágenes en producción (Render)
- Prisma migration falla al cambiar tipo de campo
- Seed falla con `PrismaClientValidationError` después de cambiar schema

---

## Critical Patterns

### 1. Cloudinary upload 500 en producción

**Síntoma**: `POST /api/upload → 500` en Render. Funciona local pero no en prod.

**Causa**: `CLOUDINARY_URL` no está seteada como env var en Render. Sin ella, el SDK no se inicializa y cada upload falla silenciosamente.

**Fix**:
1. Render dashboard → servicio backend → **Environment**
2. Agregar `CLOUDINARY_URL` con formato: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
3. Los valores están en Cloudinary dashboard → Settings → API Keys

**Este bug se repitió 3 veces.** Siempre verificar Render env vars ANTES de tocar código.

**Código correcto** (`server/src/routes/upload.ts`):
```ts
if (!process.env.CLOUDINARY_URL) {
  console.error('[upload] CLOUDINARY_URL is not set — image uploads will fail')
}
cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL })
```

---

### 2. axios FormData upload — `file: undefined` en multer

**Síntoma**: multer recibe `req.file === undefined`, el endpoint retorna 400.

**Causa**: `apiClient` tiene `Content-Type: application/json` por defecto. Ese header pisa el `multipart/form-data; boundary=...` que axios genera para FormData.

**Fix** (`src/shared/api/upload-api.ts`):
```ts
const response = await apiClient.post('/api/upload', form, {
  headers: { 'Content-Type': undefined },
})
```

Pasar `undefined` hace que axios borre el header default y genere el boundary correcto automáticamente.

---

### 3. Prisma — cambio de tipo de campo (ej: String → Json)

**Síntoma**:
```
Error: Changed the type of `X` on the `Y` table.
No cast exists, the column would be dropped and recreated.
```

**Causa**: Prisma no puede auto-castear entre tipos incompatibles cuando hay data en la tabla.

**Fix**:
```bash
# 1. Crear la migración SIN aplicarla
npx prisma migrate dev --create-only --name nombre_migration

# 2. Editar el SQL generado manualmente
# Ejemplo: String → Json
ALTER TABLE "Brand"
  ALTER COLUMN "tagline" TYPE JSONB
  USING jsonb_build_object('en', "tagline", 'es', "tagline");

# 3. Aplicar
npx prisma migrate dev
```

El `USING` define cómo convertir los datos existentes. Sin él, Postgres no puede castear.

---

### 4. Seed falla con `PrismaClientValidationError` después de cambiar schema

**Síntoma**:
```
PrismaClientValidationError: Argument `X`: Invalid value provided. Expected String, provided Object.
```

**Causa**: El cliente de Prisma generado no matchea el schema actualizado. Hay que regenerarlo antes de seedear.

**Fix**:
```bash
npx prisma generate   # regenerar cliente
npx prisma db seed    # recién ahí seedear
```

Siempre correr `prisma generate` después de cambiar el schema, antes de correr el seed o cualquier código que use el cliente.

---

### 5. Frontend CI falla con `npm ci` — lockfile desincronizado

**Síntoma**:
```
npm error Invalid: lock file's axios@1.14.0 does not satisfy axios@1.15.2
npm error `npm ci` can only install packages when package.json and package-lock.json are in sync
```

**Causa**: El proyecto usa Bun — `bun add` actualiza `bun.lock`, NO el `package-lock.json`. Si el workflow usa `npm ci`, falla porque el `package-lock.json` queda viejo.

**Este bug se repitió 2 veces.**

**Fix permanente** — el workflow DEBE usar Bun:
```yaml
# .github/workflows/frontend-ci.yml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest

- name: Install dependencies
  run: bun install --frozen-lockfile
```

**Reglas**:
- Siempre usar `bun add` / `bun install`, nunca `npm install` en este proyecto
- Si aparece un `package-lock.json` en el root, eliminarlo: `git rm package-lock.json`
- El workflow del frontend debe tener `oven-sh/setup-bun@v2`, no `actions/setup-node`

---

## Commands

```bash
# Verificar que Cloudinary esté configurado
echo $CLOUDINARY_URL

# Migración manual (tipo incompatible)
npx prisma migrate dev --create-only --name nombre
# → editar migration.sql con USING
npx prisma migrate dev

# Regenerar cliente y seedear
npx prisma generate && npx prisma db seed

# Ver logs de Render (desde CLI de Render si está instalado)
render logs --service <service-id>
```

## Checklist ante un 500 en `/api/upload`

1. ¿`CLOUDINARY_URL` está en Render env vars? → verificar primero
2. ¿El campo del form se llama `image`? → `form.append('image', file)`
3. ¿El `Content-Type` está en `undefined` para el request? → ver upload-api.ts
4. ¿El archivo pesa más de 5MB? → límite en multer config

---
name: ecommerce-seo-content
description: >
  SEO for PremiumTech — metadata per page type, hreflang EN/ES,
  canonical for filtered URLs, product JSON-LD, pre-launch checklist.
  Trigger: PDP, PLP, category pages, homepage, any page with organic traffic potential.
metadata:
  author: lean
  version: "1.0"
---

## Metadata by Page Type

### Homepage
```html
<title>PremiumTech — Tecnología de calidad al mejor precio</title>
<meta name="description" content="Comprá laptops, smartphones y accesorios. Envío gratis en compras mayores a $50." />
```

### PLP (Product Listing Page)
```html
<title>{Category} | PremiumTech</title>
<meta name="description" content="Explorá {count}+ productos de {category}. Filtros por marca, precio y más." />
<link rel="canonical" href="https://premiumtech.com/products?category={category}" />
```

### PDP (Product Detail Page)
```html
<title>{Product Name} — {Brand} | PremiumTech</title>
<meta name="description" content="{product.description truncated at 155 chars}" />
<link rel="canonical" href="https://premiumtech.com/products/{slug}" />
<meta property="og:image" content="{cloudinaryUrl(publicId, 1200, 630)}" />
```

## Canonical — Filtered URLs (REQUIRED)

Any filter/sort combination creates a duplicate content risk. Canonical strips all filter params except the base category.

```tsx
// ✅ Canonical based on category only, not individual filters
const canonicalUrl = category
  ? `${BASE_URL}/products?category=${category}`
  : `${BASE_URL}/products`;
// URL in browser: /products?category=laptops&brand=apple&sort=price
// Canonical:      /products?category=laptops
```

## hreflang EN/ES (REQUIRED — site has i18n)

Add in `<head>` for all pages that have both language versions:

```html
<link rel="alternate" hreflang="es" href="https://premiumtech.com/es/products/{slug}" />
<link rel="alternate" hreflang="en" href="https://premiumtech.com/en/products/{slug}" />
<link rel="alternate" hreflang="x-default" href="https://premiumtech.com/products/{slug}" />
```

## Product JSON-LD (REQUIRED for all PDPs)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{product.name}",
  "image": ["{cloudinaryUrl(product.publicId, 800, 800)}"],
  "description": "{product.description}",
  "sku": "{product.sku}",
  "brand": { "@type": "Brand", "name": "{product.brand.name}" },
  "offers": {
    "@type": "Offer",
    "url": "https://premiumtech.com/products/{product.slug}",
    "priceCurrency": "USD",
    "price": "{product.price}",
    "availability": "{product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
  }
}
</script>
```

## Breadcrumb Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://premiumtech.com" },
    { "@type": "ListItem", "position": 2, "name": "{category}", "item": "https://premiumtech.com/products?category={category}" },
    { "@type": "ListItem", "position": 3, "name": "{product.name}" }
  ]
}
</script>
```

## Pre-Launch SEO Checklist

- [ ] Unique title + description on every page type
- [ ] Canonical on all filtered/sorted URLs
- [ ] hreflang on all EN/ES pages
- [ ] Product JSON-LD on all PDPs
- [ ] Breadcrumb schema on PDP and PLP
- [ ] Images with descriptive `alt` text
- [ ] `robots.txt` allows Googlebot
- [ ] `sitemap.xml` generated and includes PDPs, categories, and homepage
- [ ] No 3xx redirect chains
- [ ] Core Web Vitals: LCP < 2.5s on PDP and PLP

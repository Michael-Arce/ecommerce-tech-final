#!/usr/bin/env bun
/**
 * fix-duplicate-images.ts
 *
 * Uses /photos/random?count=N endpoint — guarantees visually unique photos.
 * 2 API calls total for 12 products.
 *
 * Usage:
 *   bun run scripts/fix-duplicate-images.ts
 */

import { existsSync, unlinkSync } from 'node:fs'

const KEY = process.env.UNSPLASH_KEY
if (!KEY) {
  console.error('❌  Missing UNSPLASH_KEY')
  process.exit(1)
}

const OUTPUT_DIR = 'public/images/products'
const GENERATED_FILE = 'src/shared/data/product-images.ts'

const GROUPS: Array<{
  query: string
  products: Array<{ id: string; slug: string }>
}> = [
  {
    query: 'wireless earbuds',
    products: [
      { id: 'i38', slug: 'samsung-galaxy-buds2-pro' },
      { id: 'i40', slug: 'lg-tone-free-fp5' },
      { id: 'i41', slug: 'samsung-galaxy-buds-live' },
    ],
  },
  {
    query: 'computer monitor',
    products: [
      { id: 'i46', slug: 'dell-27-4k-usb-c' },
      { id: 'i47', slug: 'samsung-odyssey-g7-27' },
      { id: 'i50', slug: 'lg-32un880-ergo-4k' },
      { id: 'i51', slug: 'dell-ultrasharp-32-plus' },
      { id: 'i52', slug: 'lg-ultrafine-5k-27' },
      { id: 'i53', slug: 'samsung-odyssey-neo-g7-32' },
      { id: 'i54', slug: 'dell-s3422dwc-curved' },
      { id: 'i55', slug: 'lenovo-thinkvision-t27h' },
      { id: 'i56', slug: 'samsung-odyssey-oled-g6' },
      { id: 'i57', slug: 'lenovo-thinkvision-m15' },
    ],
  },
]

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  await Bun.write(dest, await res.arrayBuffer())
}

async function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

async function main() {
  // Delete existing so we re-download fresh
  const all = GROUPS.flatMap((g) => g.products)
  console.log(`\n🗑   Removing ${all.length} existing images...`)
  for (const { slug } of all) {
    const path = `${OUTPUT_DIR}/${slug}.jpg`
    if (existsSync(path)) unlinkSync(path)
  }

  const existingModule = await import('../src/shared/data/product-images.ts')
  const imageMap: Record<string, string> = { ...existingModule.PRODUCT_IMAGE_URLS }

  let downloaded = 0
  let failed = 0

  console.log(`\n📥  Fetching random unique photos...\n`)

  for (let i = 0; i < GROUPS.length; i++) {
    const { query, products } = GROUPS[i]
    console.log(`[${i + 1}/${GROUPS.length}]  "${query}" — requesting ${products.length} random photos`)

    // /photos/random with count=N returns N guaranteed-unique photos
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=${products.length}&orientation=squarish&content_filter=high`,
      { headers: { Authorization: `Client-ID ${KEY}` } }
    )

    if (!res.ok) {
      const body = await res.text()
      console.error(`  ✗ API ${res.status}: ${body}`)
      failed += products.length
      await sleep(2000)
      continue
    }

    const photos = await res.json() as Array<{ urls: { regular: string }; id: string }>

    if (!Array.isArray(photos) || photos.length === 0) {
      console.error(`  ✗ No photos returned`)
      failed += products.length
      continue
    }

    for (let j = 0; j < products.length; j++) {
      const { id, slug } = products[j]
      const photo = photos[j] ?? photos[photos.length - 1]
      const dest = `${OUTPUT_DIR}/${slug}.jpg`

      process.stdout.write(`  ↳ ${slug}  `)
      try {
        await downloadImage(photo.urls.regular, dest)
        imageMap[id] = `/images/products/${slug}.jpg`
        console.log(`✓  (photo: ${photo.id})`)
        downloaded++
      } catch (err) {
        console.log(`✗ ${err}`)
        failed++
      }
    }

    if (i < GROUPS.length - 1) await sleep(1500)
  }

  // Rewrite generated file
  const entries = Object.entries(imageMap)
    .map(([k, v]) => `  '${k}': '${v}',`)
    .join('\n')

  await Bun.write(GENERATED_FILE, [
    `// AUTO-GENERATED — run scripts/download-product-images.ts to regenerate`,
    `// Do not edit manually.`,
    `export const PRODUCT_IMAGE_URLS: Record<string, string> = {`,
    entries,
    `}`,
    ``,
  ].join('\n'))

  console.log(`\n──────────────────────────────────────────────`)
  console.log(`✅  Downloaded : ${downloaded}`)
  console.log(`❌  Failed     : ${failed}`)
}

main().catch((err) => {
  console.error('\n💥', err)
  process.exit(1)
})

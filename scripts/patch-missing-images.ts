#!/usr/bin/env bun
/**
 * patch-missing-images.ts
 *
 * Downloads the 26 images replaced with well-known products.
 * All queries use Apple/Samsung/Dell/Google/LG/Lenovo/Sony — maximum Unsplash coverage.
 *
 * Usage:
 *   UNSPLASH_KEY=your_access_key bun run scripts/patch-missing-images.ts
 */

import { existsSync } from 'node:fs'

const KEY = process.env.UNSPLASH_KEY
if (!KEY) {
  console.error('❌  Missing UNSPLASH_KEY environment variable')
  process.exit(1)
}

const OUTPUT_DIR = 'public/images/products'
const GENERATED_FILE = 'src/shared/data/product-images.ts'

const MISSING: Array<{ id: string; slug: string; query: string }> = [
  // Laptops
  { id: 'i7',  slug: 'dell-inspiron-16-plus',       query: 'dell laptop computer' },
  { id: 'i8',  slug: 'lenovo-legion-pro-7i',         query: 'lenovo gaming laptop' },
  { id: 'i13', slug: 'dell-precision-5570',           query: 'dell workstation laptop' },
  { id: 'i14', slug: 'lenovo-thinkpad-x1-extreme',   query: 'lenovo thinkpad laptop black' },
  { id: 'i15', slug: 'macbook-pro-14-m3',            query: 'macbook pro laptop' },
  // Smartphones
  { id: 'i23', slug: 'samsung-galaxy-s23-ultra',     query: 'samsung galaxy s23 ultra' },
  { id: 'i24', slug: 'google-pixel-8',               query: 'google pixel 8 phone' },
  { id: 'i25', slug: 'iphone-se-4',                  query: 'iphone se smartphone' },
  { id: 'i29', slug: 'samsung-galaxy-s24-fe',        query: 'samsung galaxy smartphone' },
  { id: 'i30', slug: 'google-pixel-8a',              query: 'google pixel phone android' },
  // Headphones
  { id: 'i37', slug: 'sony-inzone-buds',             query: 'sony earbuds wireless white' },
  { id: 'i38', slug: 'samsung-galaxy-buds2-pro',     query: 'wireless earbuds case' },
  { id: 'i39', slug: 'sony-wh-xb910n',               query: 'sony over ear headphones' },
  { id: 'i40', slug: 'lg-tone-free-fp5',             query: 'earbuds charging case' },
  { id: 'i41', slug: 'samsung-galaxy-buds-live',     query: 'true wireless earbuds' },
  { id: 'i42', slug: 'lenovo-legion-h500-pro',       query: 'gaming headset surround sound' },
  // Monitors
  { id: 'i46', slug: 'dell-27-4k-usb-c',            query: 'computer monitor desk' },
  { id: 'i47', slug: 'samsung-odyssey-g7-27',        query: 'curved gaming monitor' },
  { id: 'i50', slug: 'lg-32un880-ergo-4k',           query: 'monitor arm stand workspace' },
  { id: 'i51', slug: 'dell-ultrasharp-32-plus',      query: 'wide screen monitor display' },
  { id: 'i52', slug: 'lg-ultrafine-5k-27',           query: 'monitor screen display' },
  { id: 'i53', slug: 'samsung-odyssey-neo-g7-32',    query: 'gaming monitor rgb desk' },
  { id: 'i54', slug: 'dell-s3422dwc-curved',         query: 'ultrawide curved monitor' },
  { id: 'i55', slug: 'lenovo-thinkvision-t27h',      query: 'office monitor workspace' },
  { id: 'i56', slug: 'samsung-odyssey-oled-g6',      query: 'oled gaming display' },
  { id: 'i57', slug: 'lenovo-thinkvision-m15',       query: 'portable monitor laptop' },
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
  const existingModule = await import('../src/shared/data/product-images.ts')
  const imageMap: Record<string, string> = { ...existingModule.PRODUCT_IMAGE_URLS }

  let downloaded = 0
  let failed = 0

  console.log(`\n🔧  Patching ${MISSING.length} images\n`)

  for (let i = 0; i < MISSING.length; i++) {
    const { id, slug, query } = MISSING[i]
    const dest = `${OUTPUT_DIR}/${slug}.jpg`

    if (existsSync(dest)) {
      console.log(`  ⏭  ${slug} (already exists)`)
      imageMap[id] = `/images/products/${slug}.jpg`
      downloaded++
      continue
    }

    process.stdout.write(`  [${String(i + 1).padStart(2)}/${MISSING.length}]  ${slug}  `)

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish&content_filter=high`,
        { headers: { Authorization: `Client-ID ${KEY}` } }
      )

      if (!res.ok) {
        console.log(`✗ API ${res.status}`)
        failed++
        await sleep(2000)
        continue
      }

      const data = await res.json() as { results: Array<{ urls: { regular: string } }> }

      if (!data.results.length) {
        console.log(`✗ no results`)
        failed++
        await sleep(1500)
        continue
      }

      await downloadImage(data.results[0].urls.regular, dest)
      imageMap[id] = `/images/products/${slug}.jpg`
      console.log(`✓`)
      downloaded++
    } catch (err) {
      console.log(`✗ ${err}`)
      failed++
    }

    // 1.5s delay — stays well within 50 req/hour
    await sleep(1500)
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
  console.log(`📄  Updated    : ${GENERATED_FILE}`)
}

main().catch((err) => {
  console.error('\n💥', err)
  process.exit(1)
})

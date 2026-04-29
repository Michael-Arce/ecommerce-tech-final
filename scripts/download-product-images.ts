#!/usr/bin/env bun
/**
 * download-product-images.ts
 *
 * Reglas:
 *  1. Idempotencia — si public/images/products/{id}.webp existe, lo saltea
 *  2. Query único — usa el nombre completo del producto como búsqueda
 *  3. Randomize — page aleatorio (1-5) para no siempre traer el primer resultado
 *
 * Usage:
 *   bun run scripts/download-product-images.ts
 */

import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const KEY = process.env.UNSPLASH_KEY
if (!KEY) {
  console.error('❌  Missing UNSPLASH_KEY environment variable')
  process.exit(1)
}

const OUTPUT_DIR = 'public/images/products'
const GENERATED_FILE = 'src/shared/data/product-images.ts'
const DELAY_MS = 1500 // stay within 50 req/hour

// ─── Complete product map: imageId → product name ─────────────────────────────
const PRODUCTS: Array<{ id: string; name: string }> = [
  // Laptops
  { id: 'i1',  name: 'MacBook Pro 16 M3' },
  { id: 'i2',  name: 'MacBook Air 13 M3' },
  { id: 'i3',  name: 'MacBook Air 15 M3' },
  { id: 'i4',  name: 'Dell XPS 15 laptop' },
  { id: 'i5',  name: 'Dell XPS 13 laptop' },
  { id: 'i6',  name: 'Dell Inspiron 15 laptop' },
  { id: 'i7',  name: 'Dell Inspiron 16 Plus laptop' },
  { id: 'i8',  name: 'Lenovo Legion Pro 7i gaming laptop' },
  { id: 'i9',  name: 'Microsoft Surface Laptop 5' },
  { id: 'i10', name: 'Microsoft Surface Laptop Studio 2' },
  { id: 'i11', name: 'Lenovo ThinkPad X1 Carbon laptop' },
  { id: 'i12', name: 'Lenovo IdeaPad Pro 5 laptop' },
  { id: 'i13', name: 'Dell Precision 5570 workstation laptop' },
  { id: 'i14', name: 'Lenovo ThinkPad X1 Extreme laptop' },
  { id: 'i15', name: 'MacBook Pro 14 M3' },
  // Smartphones
  { id: 'i16', name: 'iPhone 15' },
  { id: 'i17', name: 'iPhone 15 Pro' },
  { id: 'i18', name: 'iPhone 15 Pro Max' },
  { id: 'i19', name: 'Samsung Galaxy S24 Ultra' },
  { id: 'i20', name: 'Samsung Galaxy S24 Plus' },
  { id: 'i21', name: 'Samsung Galaxy Z Fold 6' },
  { id: 'i22', name: 'Samsung Galaxy A55' },
  { id: 'i23', name: 'Samsung Galaxy S23 Ultra' },
  { id: 'i24', name: 'Google Pixel 8 smartphone' },
  { id: 'i25', name: 'iPhone SE smartphone' },
  { id: 'i26', name: 'Google Pixel 9 smartphone' },
  { id: 'i27', name: 'Google Pixel 9 Pro' },
  { id: 'i28', name: 'Google Pixel 9 Pro Fold' },
  { id: 'i29', name: 'Samsung Galaxy S24 FE smartphone' },
  { id: 'i30', name: 'Google Pixel 8a smartphone' },
  // Headphones
  { id: 'i31', name: 'Sony WH-1000XM5 headphones' },
  { id: 'i32', name: 'Sony WF-1000XM5 earbuds' },
  { id: 'i33', name: 'Sony WH-1000XM4 headphones' },
  { id: 'i34', name: 'Apple AirPods Pro' },
  { id: 'i35', name: 'Apple AirPods Max headphones' },
  { id: 'i36', name: 'Apple AirPods 3rd generation' },
  { id: 'i37', name: 'Sony INZONE wireless earbuds' },
  { id: 'i38', name: 'Samsung Galaxy Buds Pro earbuds' },
  { id: 'i39', name: 'Sony WH extra bass headphones' },
  { id: 'i40', name: 'LG TONE Free wireless earbuds' },
  { id: 'i41', name: 'Samsung Galaxy Buds Live earbuds' },
  { id: 'i42', name: 'Lenovo Legion gaming headset' },
  { id: 'i43', name: 'LG TONE Free earbuds white' },
  { id: 'i44', name: 'LG TONE Free earbuds black' },
  { id: 'i45', name: 'Lenovo wireless earbuds' },
  // Monitors
  { id: 'i46', name: 'Dell 27 inch 4K monitor' },
  { id: 'i47', name: 'Samsung Odyssey gaming monitor curved' },
  { id: 'i48', name: 'LG OLED 42 inch monitor' },
  { id: 'i49', name: 'Samsung Odyssey OLED ultrawide monitor' },
  { id: 'i50', name: 'LG 32 inch ergonomic 4K monitor' },
  { id: 'i51', name: 'Dell UltraSharp 32 inch 4K monitor' },
  { id: 'i52', name: 'LG UltraFine 5K display monitor' },
  { id: 'i53', name: 'Samsung Neo QLED gaming monitor 32' },
  { id: 'i54', name: 'Dell curved 34 inch ultrawide monitor' },
  { id: 'i55', name: 'Lenovo ThinkVision office monitor' },
  { id: 'i56', name: 'Samsung Odyssey OLED gaming monitor' },
  { id: 'i57', name: 'Lenovo portable monitor 15 inch' },
  { id: 'i58', name: 'Microsoft Surface Thunderbolt monitor' },
  { id: 'i59', name: 'Lenovo ThinkVision 32 inch monitor' },
  { id: 'i60', name: 'Lenovo ThinkVision 27 inch monitor' },
  // Tablets
  { id: 'i61', name: 'iPad Pro 13 M4' },
  { id: 'i62', name: 'iPad Pro 11 M4' },
  { id: 'i63', name: 'iPad Air 13 M2' },
  { id: 'i64', name: 'iPad Air 11 M2' },
  { id: 'i65', name: 'iPad mini tablet' },
  { id: 'i66', name: 'Samsung Galaxy Tab S9 Ultra' },
  { id: 'i67', name: 'Samsung Galaxy Tab S9 Plus' },
  { id: 'i68', name: 'Samsung Galaxy Tab S9 FE' },
  { id: 'i69', name: 'Microsoft Surface Pro 10 tablet' },
  { id: 'i70', name: 'Microsoft Surface Pro 9 tablet' },
  { id: 'i71', name: 'Microsoft Surface Go 4 tablet' },
  { id: 'i72', name: 'Lenovo Tab P12 Pro tablet' },
  { id: 'i73', name: 'Lenovo Yoga Tab 13 tablet' },
  { id: 'i74', name: 'ASUS Vivobook tablet laptop' },
  { id: 'i75', name: 'Samsung Galaxy Tab A9 tablet' },
  // Components
  { id: 'i76', name: 'ASUS ROG RTX 4080 graphics card' },
  { id: 'i77', name: 'ASUS TUF RTX 4070 graphics card' },
  { id: 'i78', name: 'ASUS motherboard Z790' },
  { id: 'i79', name: 'ASUS ROG motherboard gaming' },
  { id: 'i80', name: 'Corsair DDR5 RAM memory sticks' },
  { id: 'i81', name: 'Corsair DDR5 64GB RAM kit' },
  { id: 'i82', name: 'Corsair NVMe SSD storage' },
  { id: 'i83', name: 'Corsair modular power supply' },
  { id: 'i84', name: 'Corsair liquid CPU cooler' },
  { id: 'i85', name: 'Samsung 990 Pro NVMe SSD' },
  { id: 'i86', name: 'Samsung 870 EVO SSD' },
  { id: 'i87', name: 'Lenovo ThinkCentre mini PC' },
  { id: 'i88', name: 'Dell Precision workstation desktop' },
  { id: 'i89', name: 'Xbox wireless controller' },
  { id: 'i90', name: 'ASUS ROG power supply unit' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomPage(): number {
  return Math.floor(Math.random() * 5) + 1 // 1 – 5
}

async function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

async function downloadWebp(url: string, dest: string): Promise<void> {
  // Append Unsplash image API params: webp format, 600px wide, quality 85
  const webpUrl = `${url}&fm=webp&w=600&q=85`
  const res = await fetch(webpUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  await Bun.write(dest, await res.arrayBuffer())
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  // Load existing mapping
  const existingModule = await import('../src/shared/data/product-images.ts')
  const imageMap: Record<string, string> = { ...existingModule.PRODUCT_IMAGE_URLS }

  const toDownload = PRODUCTS.filter(({ id }) => !existsSync(`${OUTPUT_DIR}/${id}.webp`))
  const skipped    = PRODUCTS.length - toDownload.length

  console.log(`\n📦  ${PRODUCTS.length} products total`)
  console.log(`⏭   ${skipped} already downloaded — skipping`)
  console.log(`📥  ${toDownload.length} to download\n`)

  if (toDownload.length === 0) {
    console.log('✅  All images already exist. Nothing to do.')
    return
  }

  let downloaded = 0
  let failed = 0

  for (let i = 0; i < toDownload.length; i++) {
    const { id, name } = toDownload[i]
    const dest = `${OUTPUT_DIR}/${id}.webp`
    const page = randomPage()

    process.stdout.write(
      `[${String(i + 1).padStart(String(toDownload.length).length)}/${toDownload.length}]  ${id}  "${name}"  (page ${page})  `
    )

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos` +
        `?query=${encodeURIComponent(name)}` +
        `&per_page=1` +
        `&page=${page}` +
        `&orientation=squarish` +
        `&content_filter=high`,
        { headers: { Authorization: `Client-ID ${KEY}` } }
      )

      if (!res.ok) {
        console.log(`✗ API ${res.status}`)
        failed++
        await sleep(DELAY_MS)
        continue
      }

      const data = await res.json() as { results: Array<{ urls: { regular: string } }> }

      // If no results on this page, try page 1 as fallback
      let photo = data.results[0]
      if (!photo && page > 1) {
        const fallback = await fetch(
          `https://api.unsplash.com/search/photos` +
          `?query=${encodeURIComponent(name)}` +
          `&per_page=1&page=1&orientation=squarish&content_filter=high`,
          { headers: { Authorization: `Client-ID ${KEY}` } }
        )
        const fallbackData = await fallback.json() as { results: Array<{ urls: { regular: string } }> }
        photo = fallbackData.results[0]
      }

      if (!photo) {
        console.log('✗ no results')
        failed++
        await sleep(DELAY_MS)
        continue
      }

      await downloadWebp(photo.urls.regular, dest)
      imageMap[id] = `/images/products/${id}.webp`
      console.log('✓')
      downloaded++
    } catch (err) {
      console.log(`✗ ${err}`)
      failed++
    }

    await sleep(DELAY_MS)
  }

  // Write generated mapping
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
  console.log(`⚠️   Failed    : ${failed}`)
  console.log(`⏭   Skipped   : ${skipped}`)
  console.log(`📁  Output     : ${OUTPUT_DIR}/`)
  console.log(`📄  Generated  : ${GENERATED_FILE}`)
  if (failed > 0) {
    console.log(`\n💡  Re-run the script to retry failed items (page will randomize again).`)
  }
}

main().catch((err) => {
  console.error('\n💥', err)
  process.exit(1)
})

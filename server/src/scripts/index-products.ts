import { CohereClient } from 'cohere-ai'
import { prisma } from '../lib/prisma.js'

const EMBEDDING_VERSION = 1
const BATCH_SIZE = 96
const MAX_RETRIES = 3
const DESC_MAX_CHARS = 400

type Mode = 'full' | 'changed' | 'product'

const PRODUCT_INCLUDE = {
  brand: { select: { name: true } },
  category: { select: { name: true } },
  variants: { select: { name: true, attributes: true } },
} as const

type ProductRow = Awaited<ReturnType<typeof prisma.product.findFirst<{ include: typeof PRODUCT_INCLUDE }>>>

function buildDocument(p: NonNullable<ProductRow>): string {
  const attrs = p.variants
    .flatMap(v => Object.values(v.attributes as Record<string, string>))
    .filter(Boolean)
    .join(' ')

  return [p.name, p.brand.name, p.category.name, p.description.slice(0, DESC_MAX_CHARS), attrs]
    .filter(Boolean)
    .join(' ')
}

async function embedBatch(co: CohereClient, texts: string[]): Promise<number[][]> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await co.embed({
        texts,
        model: 'embed-multilingual-v3.0',
        inputType: 'search_document',
      })
      return res.embeddings as number[][]
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err
      const wait = Math.pow(2, attempt) * 500
      console.log(`  Retry ${attempt}/${MAX_RETRIES - 1} in ${wait}ms...`)
      await new Promise(r => setTimeout(r, wait))
    }
  }
  throw new Error('unreachable')
}

async function fetchProducts(mode: Mode, productId?: string) {
  if (mode === 'product' && productId) {
    const p = await prisma.product.findUnique({ where: { id: productId }, include: PRODUCT_INCLUDE })
    return p ? [p] : []
  }

  if (mode === 'changed') {
    return prisma.product.findMany({
      where: { isActive: true, embeddingVersion: { lt: EMBEDDING_VERSION } },
      include: PRODUCT_INCLUDE,
    })
  }

  return prisma.product.findMany({ where: { isActive: true }, include: PRODUCT_INCLUDE })
}

async function run(mode: Mode, productId?: string) {
  if (!process.env.COHERE_API_KEY) {
    console.error('❌  COHERE_API_KEY is not set')
    process.exit(1)
  }

  const co = new CohereClient({ token: process.env.COHERE_API_KEY })

  console.log(`\n🔍  Fetching products (mode: ${mode})...`)
  const products = await fetchProducts(mode, productId)

  if (products.length === 0) {
    console.log('✅  Nothing to index.')
    return { total: 0, success: 0, failed: 0 }
  }

  console.log(`📦  Found ${products.length} product(s) to index.\n`)

  const start = Date.now()
  let success = 0
  let failed = 0

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(products.length / BATCH_SIZE)

    console.log(`  Batch ${batchNum}/${totalBatches} — ${batch.length} products...`)

    try {
      const vectors = await embedBatch(co, batch.map(buildDocument))

      for (let j = 0; j < batch.length; j++) {
        const vectorStr = `[${vectors[j].join(',')}]`
        await prisma.$executeRaw`
          UPDATE "Product"
          SET    embedding = ${vectorStr}::vector,
                 "embeddingVersion" = ${EMBEDDING_VERSION}
          WHERE  id = ${batch[j].id}
        `
        success++
      }
    } catch (err) {
      console.error(`  ❌ Batch ${batchNum} failed:`, err)
      failed += batch.length
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2)
  return { total: products.length, success, failed, duration }
}

async function main() {
  const args = process.argv.slice(2)

  const getArg = (flag: string) => {
    const eq = args.find(a => a.startsWith(`--${flag}=`))
    if (eq) return eq.split('=')[1]
    const idx = args.indexOf(`--${flag}`)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const mode = (getArg('mode') ?? 'changed') as Mode
  const productId = getArg('id')

  if (!['full', 'changed', 'product'].includes(mode)) {
    console.error(`❌  Invalid mode: ${mode}. Use full | changed | product`)
    process.exit(1)
  }

  if (mode === 'product' && !productId) {
    console.error('❌  --id <productId> is required with mode=product')
    process.exit(1)
  }

  try {
    const result = await run(mode, productId)
    if (result.total > 0) {
      console.log(`\n📊  Results:`)
      console.log(`    Total:    ${result.total}`)
      console.log(`    Success:  ${result.success}`)
      console.log(`    Failed:   ${result.failed}`)
      console.log(`    Duration: ${result.duration}s`)
    }
    if (result.failed > 0) process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// simpleicons = transparent SVGs → safe to invert to white via CSS.
// worldvectorlogo / Wikipedia SVGs have opaque backgrounds → show as a square when inverted.
const LOGO_FIXES: Record<string, string | null> = {
  motorola: 'https://cdn.simpleicons.org/motorola/E1000F',
  jabra:    'https://cdn.worldvectorlogo.com/logos/jabra.svg',
  xiaomi:   'https://cdn.simpleicons.org/xiaomi/FF6900',
}

async function main() {
  for (const [slug, logoUrl] of Object.entries(LOGO_FIXES)) {
    const brand = await prisma.brand.findUnique({ where: { slug } })
    if (!brand) { console.log(`⚠ not found: ${slug}`); continue }
    await prisma.brand.update({ where: { slug }, data: { logoUrl: logoUrl ?? null } })
    console.log(`✓ ${slug} → ${logoUrl}`)
  }
  console.log('\nDone.')
}

main().catch(console.error).finally(() => prisma.$disconnect())

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// High-quality Unsplash banners — curated per brand aesthetic
const BRAND_BANNERS: Record<string, { bannerUrl: string; bgColor: string }> = {
  apple:      { bgColor: '#0a0a0a', bannerUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85' },
  samsung:    { bgColor: '#1428A0', bannerUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=85' },
  dell:       { bgColor: '#007DB8', bannerUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85' },
  sony:       { bgColor: '#111111', bannerUrl: 'https://images.unsplash.com/photo-1548921441-89c8bd86ffb7?w=800&q=85' },
  lg:         { bgColor: '#A50034', bannerUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85' },
  microsoft:  { bgColor: '#0078D4', bannerUrl: 'https://images.unsplash.com/photo-1642370324100-324b21fab3a9?w=800&q=85' },
  lenovo:     { bgColor: '#E2231A', bannerUrl: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=85' },
  bose:       { bgColor: '#1a1a1a', bannerUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85' },
  asus:       { bgColor: '#00539B', bannerUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=85' },
  google:     { bgColor: '#1a73e8', bannerUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=85' },
  corsair:    { bgColor: '#111111', bannerUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=85' },
  hp:         { bgColor: '#0096D6', bannerUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85' },
  acer:       { bgColor: '#83B81A', bannerUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85' },
  nvidia:     { bgColor: '#1a2000', bannerUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=85' },
  amd:        { bgColor: '#ED1C24', bannerUrl: 'https://images.unsplash.com/photo-1555617778-02518510b9b7?w=800&q=85' },
  intel:      { bgColor: '#0071C5', bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=85' },
  jabra:      { bgColor: '#111111', bannerUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=85' },
  benq:       { bgColor: '#C8102E', bannerUrl: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=85' },
  kingston:   { bgColor: '#9b0000', bannerUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145851?w=800&q=85' },
  seagate:    { bgColor: '#00A651', bannerUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=85' },
  sennheiser: { bgColor: '#111111', bannerUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=85' },
  motorola:   { bgColor: '#E1000F', bannerUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85' },
}

async function main() {
  console.log('Updating brand banners and colors...\n')

  for (const [slug, { bannerUrl, bgColor }] of Object.entries(BRAND_BANNERS)) {
    const brand = await prisma.brand.findUnique({ where: { slug } })
    if (!brand) { console.log(`  ⚠ not found: ${slug}`); continue }

    await prisma.brand.update({
      where: { slug },
      data: { bannerUrl, bgColor },
    })
    console.log(`  ✓ ${slug}`)
  }

  console.log('\nDone.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

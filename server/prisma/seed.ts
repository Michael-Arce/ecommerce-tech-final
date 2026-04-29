import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─── Seed data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'cat1', slug: 'laptops',     name: 'Laptops' },
  { id: 'cat2', slug: 'smartphones', name: 'Smartphones' },
  { id: 'cat3', slug: 'headphones',  name: 'Headphones' },
  { id: 'cat4', slug: 'monitors',    name: 'Monitors' },
  { id: 'cat5', slug: 'tablets',     name: 'Tablets' },
  { id: 'cat6', slug: 'components',  name: 'Components' },
]

const BRANDS = [
  { id: 'brand1',  slug: 'apple',     name: 'Apple',     tagline: { en: 'Think Different',         es: 'Pensá diferente'                }, productCount: 15, bgColor: '#000000', logoUrl: 'https://cdn.simpleicons.org/apple/000000' },
  { id: 'brand2',  slug: 'samsung',   name: 'Samsung',   tagline: { en: "Do What You Can't",       es: 'Hacé lo que no podés'           }, productCount: 14, bgColor: '#1428A0', logoUrl: 'https://cdn.simpleicons.org/samsung/1428A0' },
  { id: 'brand3',  slug: 'dell',      name: 'Dell',      tagline: { en: 'The Power To Do More',    es: 'El poder de hacer más'          }, productCount: 10, bgColor: '#007DB8', logoUrl: 'https://cdn.simpleicons.org/dell/007DB8' },
  { id: 'brand4',  slug: 'sony',      name: 'Sony',      tagline: { en: 'Make.Believe',            es: 'Soñá. Creé.'                    }, productCount: 8,  bgColor: '#000000', logoUrl: 'https://cdn.simpleicons.org/sony/000000' },
  { id: 'brand5',  slug: 'lg',        name: 'LG',        tagline: { en: "Life's Good",             es: 'La vida es buena'               }, productCount: 9,  bgColor: '#A50034', logoUrl: 'https://cdn.simpleicons.org/lg/A50034' },
  { id: 'brand6',  slug: 'microsoft', name: 'Microsoft', tagline: { en: 'Empower Every Person',    es: 'Potenciá a cada persona'        }, productCount: 8,  bgColor: '#0078D4', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
  { id: 'brand7',  slug: 'lenovo',    name: 'Lenovo',    tagline: { en: 'Smarter Technology',      es: 'Tecnología más inteligente'     }, productCount: 9,  bgColor: '#E2231A', logoUrl: 'https://cdn.simpleicons.org/lenovo/E2231A' },
  { id: 'brand8',  slug: 'bose',      name: 'Bose',      tagline: { en: 'Better Sound',            es: 'Mejor sonido'                   }, productCount: 6,  bgColor: '#1A1A1A', logoUrl: 'https://cdn.simpleicons.org/bose/000000' },
  { id: 'brand9',  slug: 'asus',      name: 'ASUS',      tagline: { en: 'In Search of Incredible', es: 'En busca de lo increíble'       }, productCount: 10, bgColor: '#00539B', logoUrl: 'https://cdn.simpleicons.org/asus/00539B' },
  { id: 'brand10', slug: 'google',    name: 'Google',    tagline: { en: 'Do More With Google',     es: 'Hacé más con Google'            }, productCount: 6,  bgColor: '#4285F4', logoUrl: 'https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' },
  { id: 'brand11', slug: 'corsair',   name: 'Corsair',   tagline: { en: 'Level Up',                es: 'Subí de nivel'                  }, productCount: 8,  bgColor: '#FFD000', logoUrl: 'https://cdn.simpleicons.org/corsair/000000' },
  { id: 'brand12', slug: 'hp',        name: 'HP',        tagline: { en: 'Keep Reinventing',        es: 'Seguí reinventando'             }, productCount: 7,  bgColor: '#0096D6', logoUrl: 'https://cdn.simpleicons.org/hp/0096D6' },
  { id: 'brand13', slug: 'acer',      name: 'Acer',      tagline: { en: 'Explore Beyond Limits',   es: 'Explorá más allá de los límites'}, productCount: 6,  bgColor: '#83B81A', logoUrl: 'https://cdn.simpleicons.org/acer/83B81A' },
  { id: 'brand14', slug: 'nvidia',    name: 'NVIDIA',    tagline: { en: 'The Way Its Meant',       es: 'Como fue diseñado'              }, productCount: 5,  bgColor: '#76B900', logoUrl: 'https://cdn.simpleicons.org/nvidia/76B900' },
  { id: 'brand15', slug: 'amd',       name: 'AMD',       tagline: { en: 'Together We Advance',     es: 'Juntos avanzamos'               }, productCount: 5,  bgColor: '#ED1C24', logoUrl: 'https://cdn.simpleicons.org/amd/ED1C24' },
  { id: 'brand16', slug: 'intel',     name: 'Intel',     tagline: { en: 'Intel Inside',            es: 'Intel adentro'                  }, productCount: 4,  bgColor: '#0071C5', logoUrl: 'https://cdn.simpleicons.org/intel/0071C5' },
  { id: 'brand17', slug: 'jabra',     name: 'Jabra',     tagline: { en: 'Sound of Life',           es: 'El sonido de la vida'           }, productCount: 4,  bgColor: '#FFD000', logoUrl: 'https://res.cloudinary.com/dwwdeoa3l/image/upload/v1776734689/brands/jabra-logo.svg' },
  { id: 'brand18', slug: 'benq',      name: 'BenQ',      tagline: { en: 'Designed for You',        es: 'Diseñado para vos'              }, productCount: 4,  bgColor: '#C8102E', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/BenQ_wordmark.svg' },
  { id: 'brand19', slug: 'kingston',  name: 'Kingston',  tagline: { en: 'Ask a Pro',               es: 'Consultá a un pro'              }, productCount: 4,  bgColor: '#E2231A', logoUrl: 'https://cdn.simpleicons.org/kingstontechnology/E2231A' },
  { id: 'brand20', slug: 'seagate',   name: 'Seagate',   tagline: { en: 'There Is No Try',         es: 'No hay intentos'                }, productCount: 3,  bgColor: '#00A651', logoUrl: 'https://cdn.simpleicons.org/seagate/00A651' },
  { id: 'brand21', slug: 'sennheiser',name: 'Sennheiser',tagline: { en: 'Hear the Difference',     es: 'Escuchá la diferencia'          }, productCount: 2,  bgColor: '#000000', logoUrl: 'https://cdn.simpleicons.org/sennheiser/000000' },
  { id: 'brand22', slug: 'motorola',  name: 'Motorola',  tagline: { en: 'Hello Moto',              es: 'Hola Moto'                      }, productCount: 1,  bgColor: '#E1000F', logoUrl: '' },
]

type ProductSeed = {
  id: string; slug: string; name: string; description: string
  price: number; compareAtPrice?: number; categoryId: string; brandId: string
  stock: number; sourceImageUrl: string
  variants: { id: string; sku: string; name: string; price: number; stock: number; attributes: Record<string, string> }[]
}

const PRODUCTS: ProductSeed[] = [

  // ══════════════════════════════════════════════════════════ LAPTOPS (cat1) ══

  {
    id: 'p1', slug: 'macbook-pro-16-m3', name: 'MacBook Pro 16" M3',
    description: 'The most powerful MacBook Pro ever with M3 Pro or M3 Max chip, up to 128GB unified memory, and all-day battery.',
    price: 2499, compareAtPrice: 2699, categoryId: 'cat1', brandId: 'brand1', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
    variants: [
      { id: 'v1a', sku: 'MBP16-M3PRO-18', name: 'M3 Pro / 18 GB', price: 2499, stock: 10, attributes: { chip: 'M3 Pro', memory: '18 GB' } },
      { id: 'v1b', sku: 'MBP16-M3MAX-36', name: 'M3 Max / 36 GB', price: 3499, stock: 5,  attributes: { chip: 'M3 Max', memory: '36 GB' } },
    ],
  },
  {
    id: 'p2', slug: 'macbook-air-13-m3', name: 'MacBook Air 13" M3',
    description: 'Strikingly thin with Apple M3 chip, 18-hour battery life, and a brilliant Liquid Retina display.',
    price: 1099, compareAtPrice: 1199, categoryId: 'cat1', brandId: 'brand1', stock: 32,
    sourceImageUrl: 'https://images.unsplash.com/photo-1484788974561-a4f307cf402f?w=800&q=85',
    variants: [
      { id: 'v2a', sku: 'MBA13-8-256',  name: '8 GB / 256 GB',  price: 1099, stock: 20, attributes: { memory: '8 GB',  storage: '256 GB' } },
      { id: 'v2b', sku: 'MBA13-16-512', name: '16 GB / 512 GB', price: 1299, stock: 12, attributes: { memory: '16 GB', storage: '512 GB' } },
    ],
  },
  {
    id: 'p3', slug: 'macbook-pro-14-m3', name: 'MacBook Pro 14" M3',
    description: 'Pro performance in a compact 14" form factor. M3 chip, Liquid Retina XDR display, and MagSafe charging.',
    price: 1999, compareAtPrice: 2199, categoryId: 'cat1', brandId: 'brand1', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=85',
    variants: [
      { id: 'v3a', sku: 'MBP14-M3-8-512',  name: 'M3 / 8 GB / 512 GB',  price: 1999, stock: 12, attributes: { chip: 'M3',     memory: '8 GB',  storage: '512 GB' } },
      { id: 'v3b', sku: 'MBP14-M3P-18-512', name: 'M3 Pro / 18 GB / 512 GB', price: 2399, stock: 8,  attributes: { chip: 'M3 Pro', memory: '18 GB', storage: '512 GB' } },
    ],
  },
  {
    id: 'p4', slug: 'dell-xps-15', name: 'Dell XPS 15',
    description: 'Premium 15.6" laptop with Intel Core i9, NVIDIA RTX 4070, and an OLED display that brings every detail to life.',
    price: 1899, compareAtPrice: 2099, categoryId: 'cat1', brandId: 'brand3', stock: 12,
    sourceImageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85',
    variants: [
      { id: 'v4a', sku: 'XPS15-I7-16', name: 'i7 / 16 GB', price: 1899, stock: 8, attributes: { cpu: 'Core i7', memory: '16 GB' } },
      { id: 'v4b', sku: 'XPS15-I9-32', name: 'i9 / 32 GB', price: 2399, stock: 4, attributes: { cpu: 'Core i9', memory: '32 GB' } },
    ],
  },
  {
    id: 'p5', slug: 'dell-xps-13', name: 'Dell XPS 13',
    description: 'The iconic ultrabook redesigned — borderless InfinityEdge display, Intel Core i7, and all-day battery in a sub-1.2kg body.',
    price: 1299, compareAtPrice: 1449, categoryId: 'cat1', brandId: 'brand3', stock: 18,
    sourceImageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85',
    variants: [
      { id: 'v5a', sku: 'XPS13-I5-16-512', name: 'i5 / 16 GB',  price: 1299, stock: 10, attributes: { cpu: 'Core i5', memory: '16 GB' } },
      { id: 'v5b', sku: 'XPS13-I7-32-1TB', name: 'i7 / 32 GB',  price: 1549, stock: 8,  attributes: { cpu: 'Core i7', memory: '32 GB' } },
    ],
  },
  {
    id: 'p6', slug: 'lenovo-thinkpad-x1', name: 'Lenovo ThinkPad X1 Carbon',
    description: 'Ultra-light business laptop with Intel vPro, 14" IPS display, and legendary ThinkPad keyboard.',
    price: 1649, categoryId: 'cat1', brandId: 'brand7', stock: 9,
    sourceImageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=85',
    variants: [
      { id: 'v6a', sku: 'X1C-I7-16', name: 'i7 / 16 GB', price: 1649, stock: 9, attributes: { cpu: 'Core i7', memory: '16 GB' } },
    ],
  },
  {
    id: 'p7', slug: 'lenovo-yoga-9i', name: 'Lenovo Yoga 9i',
    description: '2-in-1 convertible with 360° hinge, Intel Core i7, OLED touchscreen, and built-in stylus pen.',
    price: 1449, compareAtPrice: 1599, categoryId: 'cat1', brandId: 'brand7', stock: 14,
    sourceImageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=85',
    variants: [
      { id: 'v7a', sku: 'YOGA9I-I7-16', name: 'i7 / 16 GB / 512 GB', price: 1449, stock: 9, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '512 GB' } },
      { id: 'v7b', sku: 'YOGA9I-I7-32', name: 'i7 / 32 GB / 1 TB',   price: 1699, stock: 5, attributes: { cpu: 'Core i7', memory: '32 GB', storage: '1 TB' } },
    ],
  },
  {
    id: 'p8', slug: 'asus-rog-zephyrus-g14', name: 'ASUS ROG Zephyrus G14',
    description: 'AMD Ryzen 9 + NVIDIA RTX 4060 in a 14" 165Hz gaming laptop that weighs only 1.65kg.',
    price: 1799, compareAtPrice: 1999, categoryId: 'cat1', brandId: 'brand9', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=85',
    variants: [
      { id: 'v8a', sku: 'G14-R9-16-RTX4060', name: 'R9 / 16 GB / RTX 4060', price: 1799, stock: 6, attributes: { cpu: 'Ryzen 9', memory: '16 GB', gpu: 'RTX 4060' } },
      { id: 'v8b', sku: 'G14-R9-32-RTX4090', name: 'R9 / 32 GB / RTX 4090', price: 2299, stock: 4, attributes: { cpu: 'Ryzen 9', memory: '32 GB', gpu: 'RTX 4090' } },
    ],
  },
  {
    id: 'p9', slug: 'microsoft-surface-laptop-5', name: 'Microsoft Surface Laptop 5',
    description: 'Sleek aluminum body, 13.5" PixelSense touchscreen, Intel Evo platform, and fast Wi-Fi 6 in a premium ultrabook.',
    price: 1299, compareAtPrice: 1399, categoryId: 'cat1', brandId: 'brand6', stock: 11,
    sourceImageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=85',
    variants: [
      { id: 'v9a', sku: 'SL5-I5-8-256',  name: 'i5 / 8 GB / 256 GB',  price: 1299, stock: 6, attributes: { cpu: 'Core i5', memory: '8 GB',  storage: '256 GB' } },
      { id: 'v9b', sku: 'SL5-I7-16-512', name: 'i7 / 16 GB / 512 GB', price: 1599, stock: 5, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '512 GB' } },
    ],
  },
  {
    id: 'p10', slug: 'hp-spectre-x360', name: 'HP Spectre x360 14"',
    description: 'Premium 2-in-1 convertible with OLED display, Intel Core i7, Tile integration, and a sleek gem-cut design.',
    price: 1599, compareAtPrice: 1799, categoryId: 'cat1', brandId: 'brand12', stock: 8,
    sourceImageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=85',
    variants: [
      { id: 'v10a', sku: 'SPECX360-I7-16', name: 'i7 / 16 GB / 512 GB', price: 1599, stock: 5, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '512 GB' } },
      { id: 'v10b', sku: 'SPECX360-I7-32', name: 'i7 / 32 GB / 1 TB',   price: 1849, stock: 3, attributes: { cpu: 'Core i7', memory: '32 GB', storage: '1 TB' } },
    ],
  },
  {
    id: 'p11', slug: 'asus-zenbook-14', name: 'ASUS ZenBook 14 OLED',
    description: '14" OLED display, AMD Ryzen 7, ASUS ErgoSense keyboard, and NumberPad 2.0 in a CNC aluminum chassis.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat1', brandId: 'brand9', stock: 16,
    sourceImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=85',
    variants: [
      { id: 'v11a', sku: 'ZB14-R7-16', name: 'R7 / 16 GB / 512 GB', price: 999,  stock: 10, attributes: { cpu: 'Ryzen 7', memory: '16 GB', storage: '512 GB' } },
      { id: 'v11b', sku: 'ZB14-R7-32', name: 'R7 / 32 GB / 1 TB',   price: 1199, stock: 6,  attributes: { cpu: 'Ryzen 7', memory: '32 GB', storage: '1 TB' } },
    ],
  },
  {
    id: 'p12', slug: 'acer-swift-5', name: 'Acer Swift 5',
    description: 'Feather-light 14" ultrabook at just 990g with Intel Core i7, IPS touch display, and Thunderbolt 4.',
    price: 1149, compareAtPrice: 1299, categoryId: 'cat1', brandId: 'brand13', stock: 13,
    sourceImageUrl: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=800&q=85',
    variants: [
      { id: 'v12a', sku: 'SWIFT5-I7-16', name: 'i7 / 16 GB / 512 GB', price: 1149, stock: 8, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '512 GB' } },
    ],
  },
  {
    id: 'p13', slug: 'hp-elitebook-840', name: 'HP EliteBook 840 G10',
    description: 'Business-class 14" laptop with Intel vPro, 5G connectivity, HP Wolf Security, and a durable magnesium alloy chassis.',
    price: 1799, compareAtPrice: 1999, categoryId: 'cat1', brandId: 'brand12', stock: 7,
    sourceImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b7?w=800&q=85',
    variants: [
      { id: 'v13a', sku: 'EB840-I5-16', name: 'i5 vPro / 16 GB', price: 1799, stock: 4, attributes: { cpu: 'Core i5 vPro', memory: '16 GB' } },
      { id: 'v13b', sku: 'EB840-I7-32', name: 'i7 vPro / 32 GB', price: 2099, stock: 3, attributes: { cpu: 'Core i7 vPro', memory: '32 GB' } },
    ],
  },
  {
    id: 'p14', slug: 'lg-gram-16', name: 'LG Gram 16',
    description: '16" ultralight laptop at under 1.2kg with MIL-SPEC durability, Intel Core i7, and a stunning WQXGA IPS display.',
    price: 1399, compareAtPrice: 1549, categoryId: 'cat1', brandId: 'brand5', stock: 9,
    sourceImageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=85',
    variants: [
      { id: 'v14a', sku: 'GRAM16-I7-16', name: 'i7 / 16 GB / 512 GB', price: 1399, stock: 6, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '512 GB' } },
      { id: 'v14b', sku: 'GRAM16-I7-32', name: 'i7 / 32 GB / 2 TB',   price: 1699, stock: 3, attributes: { cpu: 'Core i7', memory: '32 GB', storage: '2 TB' } },
    ],
  },
  {
    id: 'p15', slug: 'samsung-galaxy-book3-pro', name: 'Samsung Galaxy Book3 Pro 360',
    description: '2-in-1 with a 16" AMOLED 3K display, Intel Core i7, S Pen, and seamless Galaxy ecosystem connectivity.',
    price: 1699, compareAtPrice: 1849, categoryId: 'cat1', brandId: 'brand2', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=85',
    variants: [
      { id: 'v15a', sku: 'GB3P360-I7-16', name: 'i7 / 16 GB / 512 GB', price: 1699, stock: 6, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '512 GB' } },
      { id: 'v15b', sku: 'GB3P360-I7-32', name: 'i7 / 32 GB / 1 TB',   price: 1999, stock: 4, attributes: { cpu: 'Core i7', memory: '32 GB', storage: '1 TB' } },
    ],
  },

  // ═══════════════════════════════════════════════════ SMARTPHONES (cat2) ══

  {
    id: 'p16', slug: 'iphone-15-pro', name: 'iPhone 15 Pro',
    description: 'Titanium design, A17 Pro chip, and the most powerful iPhone camera system ever. Action button. USB-C.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat2', brandId: 'brand1', stock: 60,
    sourceImageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=85',
    variants: [
      { id: 'v16a', sku: 'IP15PRO-128', name: '128 GB', price: 999,  stock: 30, attributes: { storage: '128 GB' } },
      { id: 'v16b', sku: 'IP15PRO-256', name: '256 GB', price: 1099, stock: 20, attributes: { storage: '256 GB' } },
      { id: 'v16c', sku: 'IP15PRO-512', name: '512 GB', price: 1299, stock: 10, attributes: { storage: '512 GB' } },
    ],
  },
  {
    id: 'p17', slug: 'iphone-15', name: 'iPhone 15',
    description: 'Dynamic Island, 48MP camera, USB-C, and the powerful A16 Bionic chip. A huge leap forward.',
    price: 799, compareAtPrice: 899, categoryId: 'cat2', brandId: 'brand1', stock: 50,
    sourceImageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=85',
    variants: [
      { id: 'v17a', sku: 'IP15-128', name: '128 GB', price: 799, stock: 25, attributes: { storage: '128 GB' } },
      { id: 'v17b', sku: 'IP15-256', name: '256 GB', price: 899, stock: 25, attributes: { storage: '256 GB' } },
    ],
  },
  {
    id: 'p18', slug: 'iphone-se-3rd-gen', name: 'iPhone SE (3rd Gen)',
    description: 'The most affordable iPhone with A15 Bionic chip, 5G, and a classic Touch ID design in a compact 4.7" form.',
    price: 429, categoryId: 'cat2', brandId: 'brand1', stock: 40,
    sourceImageUrl: 'https://images.unsplash.com/photo-1565537395643-1d03ea1ccd33?w=800&q=85',
    variants: [
      { id: 'v18a', sku: 'IPSE-64',  name: '64 GB',  price: 429, stock: 15, attributes: { storage: '64 GB' } },
      { id: 'v18b', sku: 'IPSE-128', name: '128 GB', price: 479, stock: 15, attributes: { storage: '128 GB' } },
      { id: 'v18c', sku: 'IPSE-256', name: '256 GB', price: 579, stock: 10, attributes: { storage: '256 GB' } },
    ],
  },
  {
    id: 'p19', slug: 'samsung-galaxy-s24-ultra', name: 'Samsung Galaxy S24 Ultra',
    description: '200MP camera, built-in S Pen, Snapdragon 8 Gen 3, and a 6.8" Dynamic AMOLED 2X display with 2600 nits.',
    price: 1299, categoryId: 'cat2', brandId: 'brand2', stock: 37,
    sourceImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85',
    variants: [
      { id: 'v19a', sku: 'S24U-256', name: '256 GB', price: 1299, stock: 25, attributes: { storage: '256 GB' } },
      { id: 'v19b', sku: 'S24U-512', name: '512 GB', price: 1419, stock: 12, attributes: { storage: '512 GB' } },
    ],
  },
  {
    id: 'p20', slug: 'samsung-galaxy-s24-plus', name: 'Samsung Galaxy S24+',
    description: 'Snapdragon 8 Gen 3, 50MP triple camera, 6.7" Dynamic AMOLED 2X at 120Hz, and 45W fast charging.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat2', brandId: 'brand2', stock: 28,
    sourceImageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85',
    variants: [
      { id: 'v20a', sku: 'S24P-256', name: '256 GB', price: 999,  stock: 18, attributes: { storage: '256 GB' } },
      { id: 'v20b', sku: 'S24P-512', name: '512 GB', price: 1099, stock: 10, attributes: { storage: '512 GB' } },
    ],
  },
  {
    id: 'p21', slug: 'samsung-galaxy-a54', name: 'Samsung Galaxy A54 5G',
    description: 'Flagship features at mid-range price. 50MP OIS camera, IP67 water resistance, and 5000mAh battery.',
    price: 449, compareAtPrice: 499, categoryId: 'cat2', brandId: 'brand2', stock: 45,
    sourceImageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=85',
    variants: [
      { id: 'v21a', sku: 'A54-128', name: '128 GB', price: 449, stock: 25, attributes: { storage: '128 GB' } },
      { id: 'v21b', sku: 'A54-256', name: '256 GB', price: 499, stock: 20, attributes: { storage: '256 GB' } },
    ],
  },
  {
    id: 'p22', slug: 'samsung-galaxy-z-fold5', name: 'Samsung Galaxy Z Fold 5',
    description: 'The ultimate foldable — a 7.6" tablet that folds into a phone. Snapdragon 8 Gen 2 and S Pen support.',
    price: 1799, compareAtPrice: 1999, categoryId: 'cat2', brandId: 'brand2', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=85',
    variants: [
      { id: 'v22a', sku: 'ZF5-256', name: '256 GB', price: 1799, stock: 8,  attributes: { storage: '256 GB' } },
      { id: 'v22b', sku: 'ZF5-512', name: '512 GB', price: 1959, stock: 7,  attributes: { storage: '512 GB' } },
    ],
  },
  {
    id: 'p23', slug: 'google-pixel-8-pro', name: 'Google Pixel 8 Pro',
    description: 'Google Tensor G3, 50MP triple camera with 5x optical zoom, Temperature sensor, and 7 years of updates.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat2', brandId: 'brand10', stock: 30,
    sourceImageUrl: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=85',
    variants: [
      { id: 'v23a', sku: 'P8P-128', name: '128 GB', price: 999,  stock: 15, attributes: { storage: '128 GB' } },
      { id: 'v23b', sku: 'P8P-256', name: '256 GB', price: 1059, stock: 10, attributes: { storage: '256 GB' } },
      { id: 'v23c', sku: 'P8P-1TB', name: '1 TB',   price: 1359, stock: 5,  attributes: { storage: '1 TB' } },
    ],
  },
  {
    id: 'p24', slug: 'google-pixel-8', name: 'Google Pixel 8',
    description: 'Google Tensor G3, 50MP main camera, Best Take feature, and 7 years of OS updates. AI-first smartphone.',
    price: 699, compareAtPrice: 799, categoryId: 'cat2', brandId: 'brand10', stock: 35,
    sourceImageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=85',
    variants: [
      { id: 'v24a', sku: 'P8-128', name: '128 GB', price: 699, stock: 20, attributes: { storage: '128 GB' } },
      { id: 'v24b', sku: 'P8-256', name: '256 GB', price: 759, stock: 15, attributes: { storage: '256 GB' } },
    ],
  },
  {
    id: 'p25', slug: 'sony-xperia-1-v', name: 'Sony Xperia 1 V',
    description: 'Cinematography-focused smartphone with Zeiss optics, 4K 120fps recording, 6.5" 4K HDR OLED, and 3.5mm jack.',
    price: 1299, compareAtPrice: 1399, categoryId: 'cat2', brandId: 'brand4', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=85',
    variants: [
      { id: 'v25a', sku: 'XP1V-256', name: '256 GB', price: 1299, stock: 15, attributes: { storage: '256 GB' } },
    ],
  },
  {
    id: 'p26', slug: 'asus-rog-phone-7', name: 'ASUS ROG Phone 7 Ultimate',
    description: 'The ultimate gaming phone — Snapdragon 8 Gen 2, 165Hz AMOLED, 6000mAh battery, AeroActive Cooler 7.',
    price: 1099, compareAtPrice: 1199, categoryId: 'cat2', brandId: 'brand9', stock: 12,
    sourceImageUrl: 'https://images.unsplash.com/photo-1546422904-90eab22b0311?w=800&q=85',
    variants: [
      { id: 'v26a', sku: 'ROGP7-512', name: '512 GB / 16 GB RAM', price: 1099, stock: 7, attributes: { storage: '512 GB', ram: '16 GB' } },
      { id: 'v26b', sku: 'ROGP7-1TB', name: '1 TB / 16 GB RAM',   price: 1249, stock: 5, attributes: { storage: '1 TB',   ram: '16 GB' } },
    ],
  },
  {
    id: 'p27', slug: 'motorola-edge-40-pro', name: 'Motorola Edge 40 Pro',
    description: '165Hz pOLED display, 125W TurboPower charging, 50MP triple camera, and Snapdragon 8 Gen 2.',
    price: 799, compareAtPrice: 899, categoryId: 'cat2', brandId: 'brand22', stock: 22,
    sourceImageUrl: 'https://images.unsplash.com/photo-1595941069915-4ebc5197e35f?w=800&q=85',
    variants: [
      { id: 'v27a', sku: 'ME40P-256', name: '256 GB', price: 799, stock: 22, attributes: { storage: '256 GB' } },
    ],
  },
  {
    id: 'p28', slug: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max',
    description: 'A18 Pro chip, 48MP Fusion camera with 5x optical zoom, titanium design, and the biggest battery ever in an iPhone.',
    price: 1199, compareAtPrice: 1299, categoryId: 'cat2', brandId: 'brand1', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=85',
    variants: [
      { id: 'v28a', sku: 'IP16PM-256', name: '256 GB',  price: 1199, stock: 8,  attributes: { storage: '256 GB' } },
      { id: 'v28b', sku: 'IP16PM-512', name: '512 GB',  price: 1309, stock: 7,  attributes: { storage: '512 GB' } },
      { id: 'v28c', sku: 'IP16PM-1TB', name: '1 TB',    price: 1529, stock: 5,  attributes: { storage: '1 TB' } },
    ],
  },
  {
    id: 'p29', slug: 'samsung-galaxy-s26-ultra', name: 'Samsung Galaxy S26 Ultra',
    description: 'Galaxy AI built-in, 200MP ProVisual camera, titanium frame, built-in S Pen, and Snapdragon 8 Elite.',
    price: 1299, compareAtPrice: 1399, categoryId: 'cat2', brandId: 'brand2', stock: 18,
    sourceImageUrl: 'https://images.unsplash.com/photo-1610945264803-b22b1d8a6959?w=800&q=85',
    variants: [
      { id: 'v29a', sku: 'SGS26U-256-12', name: '256 GB / 12 GB RAM', price: 1299, stock: 10, attributes: { storage: '256 GB', ram: '12 GB' } },
      { id: 'v29b', sku: 'SGS26U-512-12', name: '512 GB / 12 GB RAM', price: 1419, stock: 8,  attributes: { storage: '512 GB', ram: '12 GB' } },
    ],
  },
  {
    id: 'p30', slug: 'xiaomi-14-pro', name: 'Xiaomi 14 Pro',
    description: 'Leica Summilux optics, Snapdragon 8 Gen 3, 90W wired + 80W wireless charging, and 6.73" LTPO AMOLED.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat2', brandId: 'brand2', stock: 14,
    sourceImageUrl: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=85',
    variants: [
      { id: 'v30a', sku: 'XI14P-512-16', name: '512 GB / 16 GB RAM', price: 999, stock: 14, attributes: { storage: '512 GB', ram: '16 GB' } },
    ],
  },

  // ══════════════════════════════════════════════════ HEADPHONES (cat3) ══

  {
    id: 'p31', slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation, 30-hour battery, multipoint Bluetooth, and speak-to-chat technology.',
    price: 349, compareAtPrice: 399, categoryId: 'cat3', brandId: 'brand4', stock: 35,
    sourceImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
    variants: [
      { id: 'v31a', sku: 'WH1000XM5-BLK', name: 'Black',  price: 349, stock: 20, attributes: { color: 'Black' } },
      { id: 'v31b', sku: 'WH1000XM5-SLV', name: 'Silver', price: 349, stock: 15, attributes: { color: 'Silver' } },
    ],
  },
  {
    id: 'p32', slug: 'sony-wf-1000xm5', name: 'Sony WF-1000XM5',
    description: 'World\'s smallest and lightest ANC earbuds. 8h battery + 24h case, crystal-clear calls, and Hi-Res Audio.',
    price: 279, compareAtPrice: 299, categoryId: 'cat3', brandId: 'brand4', stock: 28,
    sourceImageUrl: 'https://images.unsplash.com/photo-1590658268037-41b7a8a40cf6?w=800&q=85',
    variants: [
      { id: 'v32a', sku: 'WF1000XM5-BLK', name: 'Black', price: 279, stock: 15, attributes: { color: 'Black' } },
      { id: 'v32b', sku: 'WF1000XM5-SLV', name: 'Silver', price: 279, stock: 13, attributes: { color: 'Silver' } },
    ],
  },
  {
    id: 'p33', slug: 'bose-qc45', name: 'Bose QuietComfort 45',
    description: 'Award-winning noise cancellation, 24-hour battery, Aware Mode, and legendary Bose sound quality.',
    price: 279, compareAtPrice: 329, categoryId: 'cat3', brandId: 'brand8', stock: 30,
    sourceImageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=85',
    variants: [
      { id: 'v33a', sku: 'QC45-BLK', name: 'Black',       price: 279, stock: 18, attributes: { color: 'Black' } },
      { id: 'v33b', sku: 'QC45-WHT', name: 'White Smoke', price: 279, stock: 12, attributes: { color: 'White' } },
    ],
  },
  {
    id: 'p34', slug: 'bose-qc-earbuds-2', name: 'Bose QuietComfort Earbuds II',
    description: 'Custom-tune noise cancellation that adapts to your ear. 6h battery + 18h case, OpenAudio technology.',
    price: 249, compareAtPrice: 279, categoryId: 'cat3', brandId: 'brand8', stock: 22,
    sourceImageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=85',
    variants: [
      { id: 'v34a', sku: 'QCEB2-BLK', name: 'Triple Black', price: 249, stock: 12, attributes: { color: 'Black' } },
      { id: 'v34b', sku: 'QCEB2-SOA', name: 'Soapstone',    price: 249, stock: 10, attributes: { color: 'Soapstone' } },
    ],
  },
  {
    id: 'p35', slug: 'apple-airpods-max', name: 'Apple AirPods Max',
    description: 'High-fidelity audio, custom acoustic design, Transparency mode, and seamless Apple ecosystem integration.',
    price: 549, compareAtPrice: 599, categoryId: 'cat3', brandId: 'brand1', stock: 18,
    sourceImageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=85',
    variants: [
      { id: 'v35a', sku: 'APMAX-MID', name: 'Midnight',     price: 549, stock: 6, attributes: { color: 'Midnight' } },
      { id: 'v35b', sku: 'APMAX-SLV', name: 'Silver',       price: 549, stock: 6, attributes: { color: 'Silver' } },
      { id: 'v35c', sku: 'APMAX-STB', name: 'Starlight',    price: 549, stock: 6, attributes: { color: 'Starlight' } },
    ],
  },
  {
    id: 'p36', slug: 'apple-airpods-pro-2', name: 'Apple AirPods Pro (2nd Gen)',
    description: 'H2 chip, Adaptive Audio, Personalized Spatial Audio, and up to 2× more Active Noise Cancellation.',
    price: 249, categoryId: 'cat3', brandId: 'brand1', stock: 40,
    sourceImageUrl: 'https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800&q=85',
    variants: [
      { id: 'v36a', sku: 'APP2-USB-C', name: 'USB-C',    price: 249, stock: 25, attributes: { connector: 'USB-C' } },
      { id: 'v36b', sku: 'APP2-LIGHT', name: 'Lightning', price: 229, stock: 15, attributes: { connector: 'Lightning' } },
    ],
  },
  {
    id: 'p37', slug: 'jabra-evolve2-85', name: 'Jabra Evolve2 85',
    description: 'Professional-grade ANC headset with 40-hour battery, 10-mic call technology, and MS Teams certified.',
    price: 449, compareAtPrice: 499, categoryId: 'cat3', brandId: 'brand17', stock: 12,
    sourceImageUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=85',
    variants: [
      { id: 'v37a', sku: 'EV2-85-BLK', name: 'Black',  price: 449, stock: 7, attributes: { color: 'Black' } },
      { id: 'v37b', sku: 'EV2-85-BGE', name: 'Beige',  price: 449, stock: 5, attributes: { color: 'Beige' } },
    ],
  },
  {
    id: 'p38', slug: 'sennheiser-momentum-4', name: 'Sennheiser Momentum 4',
    description: 'Premium 60-hour ANC headphones with audiophile-grade sound, Smart Control app, and crystal-clear calls.',
    price: 349, compareAtPrice: 379, categoryId: 'cat3', brandId: 'brand21', stock: 16,
    sourceImageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=85',
    variants: [
      { id: 'v38a', sku: 'MM4-BLK', name: 'Black',  price: 349, stock: 10, attributes: { color: 'Black' } },
      { id: 'v38b', sku: 'MM4-WHT', name: 'White',  price: 349, stock: 6,  attributes: { color: 'White' } },
    ],
  },
  {
    id: 'p39', slug: 'samsung-galaxy-buds2-pro', name: 'Samsung Galaxy Buds2 Pro',
    description: '360° Audio with head tracking, 24-bit Hi-Fi sound, IPX7, and intelligent ANC that auto-adjusts.',
    price: 229, compareAtPrice: 249, categoryId: 'cat3', brandId: 'brand2', stock: 24,
    sourceImageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=85',
    variants: [
      { id: 'v39a', sku: 'GB2P-GRP', name: 'Graphite', price: 229, stock: 12, attributes: { color: 'Graphite' } },
      { id: 'v39b', sku: 'GB2P-WHT', name: 'White',    price: 229, stock: 12, attributes: { color: 'White' } },
    ],
  },
  {
    id: 'p40', slug: 'beats-studio-pro', name: 'Beats Studio Pro',
    description: 'Personalized ANC, USB-C lossless audio, 40h battery, and dual-mode Bluetooth for iOS and Android.',
    price: 349, compareAtPrice: 379, categoryId: 'cat3', brandId: 'brand1', stock: 14,
    sourceImageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=85',
    variants: [
      { id: 'v40a', sku: 'BSP-BLK', name: 'Black',       price: 349, stock: 8, attributes: { color: 'Black' } },
      { id: 'v40b', sku: 'BSP-DRK', name: 'Deep Brown',  price: 349, stock: 6, attributes: { color: 'Deep Brown' } },
    ],
  },
  {
    id: 'p41', slug: 'jbl-tune-770nc', name: 'JBL Tune 770NC',
    description: 'Adaptive ANC, 70-hour battery life, hands-free Google Assistant & Alexa, and foldable flat design.',
    price: 99, compareAtPrice: 129, categoryId: 'cat3', brandId: 'brand8', stock: 35,
    sourceImageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e7?w=800&q=85',
    variants: [
      { id: 'v41a', sku: 'T770-BLK', name: 'Black', price: 99,  stock: 20, attributes: { color: 'Black' } },
      { id: 'v41b', sku: 'T770-BLU', name: 'Blue',  price: 99,  stock: 15, attributes: { color: 'Blue' } },
    ],
  },
  {
    id: 'p42', slug: 'jabra-evolve2-55', name: 'Jabra Evolve2 55',
    description: 'Professional wireless headset with hybrid ANC, 50m wireless range, and certified for all major UC platforms.',
    price: 299, compareAtPrice: 329, categoryId: 'cat3', brandId: 'brand17', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=85',
    variants: [
      { id: 'v42a', sku: 'EV2-55-BLK', name: 'Black', price: 299, stock: 10, attributes: { color: 'Black' } },
    ],
  },
  {
    id: 'p43', slug: 'anker-soundcore-q45', name: 'Anker Soundcore Q45',
    description: 'Multi-mode ANC, LDAC Hi-Res audio, 50h playtime, and adaptive EQ in a premium foldable design under $100.',
    price: 79, compareAtPrice: 99, categoryId: 'cat3', brandId: 'brand8', stock: 40,
    sourceImageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=85',
    variants: [
      { id: 'v43a', sku: 'SQ45-BLK', name: 'Black', price: 79, stock: 25, attributes: { color: 'Black' } },
      { id: 'v43b', sku: 'SQ45-WHT', name: 'White', price: 79, stock: 15, attributes: { color: 'White' } },
    ],
  },
  {
    id: 'p44', slug: 'sony-wh-ch720n', name: 'Sony WH-CH720N',
    description: 'Lightweight 192g design, effective ANC, 35h battery, and clear voice call quality at an accessible price.',
    price: 149, compareAtPrice: 179, categoryId: 'cat3', brandId: 'brand4', stock: 30,
    sourceImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
    variants: [
      { id: 'v44a', sku: 'WHCH720N-BLK', name: 'Black', price: 149, stock: 18, attributes: { color: 'Black' } },
      { id: 'v44b', sku: 'WHCH720N-WHT', name: 'White', price: 149, stock: 12, attributes: { color: 'White' } },
    ],
  },
  {
    id: 'p45', slug: 'bose-sport-earbuds', name: 'Bose Sport Earbuds',
    description: 'Water-resistant earbuds engineered for sport. StayHear Max tips, 5h battery + 10h case, open design.',
    price: 179, compareAtPrice: 199, categoryId: 'cat3', brandId: 'brand8', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=85',
    variants: [
      { id: 'v45a', sku: 'BSE-BLK', name: 'Black',        price: 179, stock: 12, attributes: { color: 'Black' } },
      { id: 'v45b', sku: 'BSE-GLT', name: 'Glacier White', price: 179, stock: 8,  attributes: { color: 'Glacier White' } },
    ],
  },

  // ════════════════════════════════════════════════════ MONITORS (cat4) ══

  {
    id: 'p46', slug: 'lg-27gp950', name: 'LG 27GP950 4K Gaming',
    description: '27" 4K Nano IPS, 160Hz, 1ms GTG, HDMI 2.1 — the ultimate gaming monitor with DisplayHDR 600.',
    price: 599, compareAtPrice: 699, categoryId: 'cat4', brandId: 'brand5', stock: 14,
    sourceImageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85',
    variants: [
      { id: 'v46a', sku: 'LG27GP950', name: 'Standard', price: 599, stock: 14, attributes: {} },
    ],
  },
  {
    id: 'p47', slug: 'dell-u2722d', name: 'Dell UltraSharp U2722D',
    description: '27" 4K USB-C hub monitor with IPS Black panel, 60W power delivery, and built-in USB-C hub.',
    price: 549, categoryId: 'cat4', brandId: 'brand3', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=85',
    variants: [
      { id: 'v47a', sku: 'U2722D', name: 'Standard', price: 549, stock: 10, attributes: {} },
    ],
  },
  {
    id: 'p48', slug: 'samsung-odyssey-g7-32', name: 'Samsung 32" Odyssey G7',
    description: '32" QLED 4K 144Hz gaming monitor with 1ms response, G-Sync Compatible, and DisplayHDR 600.',
    price: 699, compareAtPrice: 799, categoryId: 'cat4', brandId: 'brand2', stock: 12,
    sourceImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
    variants: [
      { id: 'v48a', sku: 'OG7-32', name: 'Standard', price: 699, stock: 12, attributes: {} },
    ],
  },
  {
    id: 'p49', slug: 'lg-34wn80c-ultrawide', name: 'LG 34WN80C-B Ultrawide',
    description: '34" UltraWide QHD IPS, USB-C 60W delivery, 5ms GTG, HDR10, and a curved 21:9 cinematic experience.',
    price: 499, compareAtPrice: 549, categoryId: 'cat4', brandId: 'brand5', stock: 9,
    sourceImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=85',
    variants: [
      { id: 'v49a', sku: 'LG34WN80C', name: 'Standard', price: 499, stock: 9, attributes: {} },
    ],
  },
  {
    id: 'p50', slug: 'asus-proart-pa279cv', name: 'ASUS ProArt PA279CV',
    description: '27" 4K IPS with 100% sRGB and Rec. 709 coverage, hardware calibration, and USB-C 65W delivery for creators.',
    price: 599, compareAtPrice: 649, categoryId: 'cat4', brandId: 'brand9', stock: 8,
    sourceImageUrl: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=85',
    variants: [
      { id: 'v50a', sku: 'PA279CV', name: 'Standard', price: 599, stock: 8, attributes: {} },
    ],
  },
  {
    id: 'p51', slug: 'benq-pd3220u', name: 'BenQ PD3220U',
    description: '32" 4K IPS Thunderbolt 3 designer monitor with 100% sRGB, Hotkey Puck G2, and KVM switch built-in.',
    price: 1199, compareAtPrice: 1299, categoryId: 'cat4', brandId: 'brand18', stock: 6,
    sourceImageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=85',
    variants: [
      { id: 'v51a', sku: 'PD3220U', name: 'Standard', price: 1199, stock: 6, attributes: {} },
    ],
  },
  {
    id: 'p52', slug: 'asus-rog-swift-pg279qm', name: 'ASUS ROG Swift PG279QM',
    description: '27" WQHD 240Hz IPS gaming monitor with G-Sync, Extreme Low Motion Blur, and 1ms GTG for pro-level gaming.',
    price: 799, compareAtPrice: 849, categoryId: 'cat4', brandId: 'brand9', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1616763355548-1b606f9aa4a4?w=800&q=85',
    variants: [
      { id: 'v52a', sku: 'PG279QM', name: 'Standard', price: 799, stock: 10, attributes: {} },
    ],
  },
  {
    id: 'p53', slug: 'gigabyte-m32u', name: 'Gigabyte M32U',
    description: '32" 4K 144Hz IPS panel with HDMI 2.1, USB-C KVM, and a game-changing 1ms response with SS IPS technology.',
    price: 649, compareAtPrice: 699, categoryId: 'cat4', brandId: 'brand9', stock: 11,
    sourceImageUrl: 'https://images.unsplash.com/photo-1555617117-38e2a8fec6e4?w=800&q=85',
    variants: [
      { id: 'v53a', sku: 'M32U', name: 'Standard', price: 649, stock: 11, attributes: {} },
    ],
  },
  {
    id: 'p54', slug: 'dell-s2722qc', name: 'Dell S2722QC',
    description: '27" 4K USB-C monitor with 65W charging, ComfortView Plus, AMD FreeSync, and a clean bezel-less design.',
    price: 399, compareAtPrice: 449, categoryId: 'cat4', brandId: 'brand3', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=85',
    variants: [
      { id: 'v54a', sku: 'S2722QC', name: 'Standard', price: 399, stock: 15, attributes: {} },
    ],
  },
  {
    id: 'p55', slug: 'aoc-27g2', name: 'AOC 27G2 Gaming',
    description: '27" FHD 144Hz IPS gaming monitor with 1ms MPRT, AMD FreeSync Premium, and a budget-friendly price point.',
    price: 229, compareAtPrice: 279, categoryId: 'cat4', brandId: 'brand5', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1598064979898-47fc9082c9c8?w=800&q=85',
    variants: [
      { id: 'v55a', sku: 'AOC27G2', name: 'Standard', price: 229, stock: 20, attributes: {} },
    ],
  },
  {
    id: 'p56', slug: 'dell-u2723qe', name: 'Dell UltraSharp U2723QE',
    description: '27" 4K IPS Black panel with 98% DCI-P3, factory-calibrated, USB-C 90W, and built-in USB hub.',
    price: 699, compareAtPrice: 749, categoryId: 'cat4', brandId: 'brand3', stock: 8,
    sourceImageUrl: 'https://images.unsplash.com/photo-1498354235637-f718e4eb4c53?w=800&q=85',
    variants: [
      { id: 'v56a', sku: 'U2723QE', name: 'Standard', price: 699, stock: 8, attributes: {} },
    ],
  },
  {
    id: 'p57', slug: 'samsung-viewfinity-s9', name: 'Samsung ViewFinity S9 5K',
    description: '27" 5K 218ppi IPS for Mac, Thunderbolt 4, webcam, matte display, and Slim One Connect box.',
    price: 1599, compareAtPrice: 1799, categoryId: 'cat4', brandId: 'brand2', stock: 5,
    sourceImageUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&q=85',
    variants: [
      { id: 'v57a', sku: 'VS9-5K', name: 'Standard', price: 1599, stock: 5, attributes: {} },
    ],
  },
  {
    id: 'p58', slug: 'acer-predator-x28', name: 'Acer Predator X28',
    description: '28" 4K 144Hz IPS gaming monitor with NVIDIA G-Sync, Quantum Dot Wide Color Gamut, and VESA HDR 400.',
    price: 799, compareAtPrice: 899, categoryId: 'cat4', brandId: 'brand13', stock: 7,
    sourceImageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=85',
    variants: [
      { id: 'v58a', sku: 'PX28', name: 'Standard', price: 799, stock: 7, attributes: {} },
    ],
  },
  {
    id: 'p59', slug: 'msi-optix-mag274qrf', name: 'MSI Optix MAG274QRF-QD',
    description: '27" WQHD 165Hz IPS Quantum Dot panel with 1ms GTG, AMD FreeSync Premium Pro, and Night Vision.',
    price: 399, compareAtPrice: 449, categoryId: 'cat4', brandId: 'brand9', stock: 13,
    sourceImageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85',
    variants: [
      { id: 'v59a', sku: 'MAG274QRF', name: 'Standard', price: 399, stock: 13, attributes: {} },
    ],
  },
  {
    id: 'p60', slug: 'lg-27uk850', name: 'LG 27UK850-W 4K HDR',
    description: '27" 4K IPS with HDR10, USB-C 60W, AMD FreeSync, and two HDMI 2.0 ports for a versatile workspace setup.',
    price: 449, compareAtPrice: 499, categoryId: 'cat4', brandId: 'brand5', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=85',
    variants: [
      { id: 'v60a', sku: 'LG27UK850', name: 'Standard', price: 449, stock: 10, attributes: {} },
    ],
  },

  // ═══════════════════════════════════════════════════════ TABLETS (cat5) ══

  {
    id: 'p61', slug: 'ipad-pro-11-m4', name: 'iPad Pro 11" M4',
    description: 'Impossibly thin. Incredibly powerful. M4 chip, Ultra Retina XDR tandem OLED, nano-texture glass option.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat5', brandId: 'brand1', stock: 24,
    sourceImageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85',
    variants: [
      { id: 'v61a', sku: 'IPADPRO11-256-WF', name: '256 GB Wi-Fi',    price: 999,  stock: 12, attributes: { storage: '256 GB', connectivity: 'Wi-Fi' } },
      { id: 'v61b', sku: 'IPADPRO11-512-WF', name: '512 GB Wi-Fi',    price: 1199, stock: 8,  attributes: { storage: '512 GB', connectivity: 'Wi-Fi' } },
      { id: 'v61c', sku: 'IPADPRO11-256-5G', name: '256 GB Wi-Fi+5G', price: 1149, stock: 4,  attributes: { storage: '256 GB', connectivity: 'Wi-Fi+5G' } },
    ],
  },
  {
    id: 'p62', slug: 'ipad-pro-13-m4', name: 'iPad Pro 13" M4',
    description: 'The largest, most immersive iPad ever. M4 chip, 13" Ultra Retina XDR OLED, and landscape front camera.',
    price: 1299, compareAtPrice: 1399, categoryId: 'cat5', brandId: 'brand1', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=85',
    variants: [
      { id: 'v62a', sku: 'IPADPRO13-256', name: '256 GB Wi-Fi', price: 1299, stock: 10, attributes: { storage: '256 GB', connectivity: 'Wi-Fi' } },
      { id: 'v62b', sku: 'IPADPRO13-512', name: '512 GB Wi-Fi', price: 1499, stock: 5,  attributes: { storage: '512 GB', connectivity: 'Wi-Fi' } },
    ],
  },
  {
    id: 'p63', slug: 'ipad-air-m2', name: 'iPad Air 11" M2',
    description: 'M2 chip, 11" Liquid Retina display, Apple Pencil Pro and Magic Keyboard support, and USB-C with 10Gbps.',
    price: 599, compareAtPrice: 699, categoryId: 'cat5', brandId: 'brand1', stock: 30,
    sourceImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85',
    variants: [
      { id: 'v63a', sku: 'IPADAIR11-128', name: '128 GB Wi-Fi', price: 599, stock: 15, attributes: { storage: '128 GB', connectivity: 'Wi-Fi' } },
      { id: 'v63b', sku: 'IPADAIR11-256', name: '256 GB Wi-Fi', price: 749, stock: 15, attributes: { storage: '256 GB', connectivity: 'Wi-Fi' } },
    ],
  },
  {
    id: 'p64', slug: 'ipad-mini-6', name: 'iPad mini (6th Gen)',
    description: '8.3" Liquid Retina display, A15 Bionic, USB-C, 5G support, Center Stage, and Apple Pencil (2nd gen) compatible.',
    price: 499, compareAtPrice: 549, categoryId: 'cat5', brandId: 'brand1', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=85',
    variants: [
      { id: 'v64a', sku: 'IPADMINI6-64',  name: '64 GB Wi-Fi',  price: 499, stock: 10, attributes: { storage: '64 GB',  connectivity: 'Wi-Fi' } },
      { id: 'v64b', sku: 'IPADMINI6-256', name: '256 GB Wi-Fi', price: 649, stock: 10, attributes: { storage: '256 GB', connectivity: 'Wi-Fi' } },
    ],
  },
  {
    id: 'p65', slug: 'ipad-10th-gen', name: 'iPad (10th Gen)',
    description: 'Completely redesigned with A14 Bionic, 10.9" Liquid Retina display, USB-C, and landscape front camera.',
    price: 349, compareAtPrice: 399, categoryId: 'cat5', brandId: 'brand1', stock: 35,
    sourceImageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85',
    variants: [
      { id: 'v65a', sku: 'IPAD10-64',  name: '64 GB Wi-Fi',  price: 349, stock: 20, attributes: { storage: '64 GB',  connectivity: 'Wi-Fi' } },
      { id: 'v65b', sku: 'IPAD10-256', name: '256 GB Wi-Fi', price: 499, stock: 15, attributes: { storage: '256 GB', connectivity: 'Wi-Fi' } },
    ],
  },
  {
    id: 'p66', slug: 'samsung-galaxy-tab-s9-ultra', name: 'Samsung Galaxy Tab S9 Ultra',
    description: '14.6" Dynamic AMOLED 2X, Snapdragon 8 Gen 2, S Pen included, IP68, and DeX Mode for desktop experience.',
    price: 1199, compareAtPrice: 1299, categoryId: 'cat5', brandId: 'brand2', stock: 12,
    sourceImageUrl: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800&q=85',
    variants: [
      { id: 'v66a', sku: 'GTS9U-256-12', name: '256 GB / 12 GB RAM', price: 1199, stock: 8,  attributes: { storage: '256 GB', ram: '12 GB' } },
      { id: 'v66b', sku: 'GTS9U-512-12', name: '512 GB / 12 GB RAM', price: 1399, stock: 4,  attributes: { storage: '512 GB', ram: '12 GB' } },
    ],
  },
  {
    id: 'p67', slug: 'samsung-galaxy-tab-s9-plus', name: 'Samsung Galaxy Tab S9+',
    description: '12.4" Dynamic AMOLED 2X, S Pen included, IP68, Snapdragon 8 Gen 2, and expandable storage via microSD.',
    price: 999, compareAtPrice: 1049, categoryId: 'cat5', brandId: 'brand2', stock: 14,
    sourceImageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=85',
    variants: [
      { id: 'v67a', sku: 'GTS9P-256-12', name: '256 GB / 12 GB RAM', price: 999,  stock: 9, attributes: { storage: '256 GB', ram: '12 GB' } },
      { id: 'v67b', sku: 'GTS9P-512-12', name: '512 GB / 12 GB RAM', price: 1099, stock: 5, attributes: { storage: '512 GB', ram: '12 GB' } },
    ],
  },
  {
    id: 'p68', slug: 'microsoft-surface-pro-9', name: 'Microsoft Surface Pro 9',
    description: '13" PixelSense Flow display, Intel Core i7, Windows 11 Pro, Thunderbolt 4, and up to 19h battery.',
    price: 1599, compareAtPrice: 1799, categoryId: 'cat5', brandId: 'brand6', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=85',
    variants: [
      { id: 'v68a', sku: 'SP9-I5-8-256',  name: 'i5 / 8 GB / 256 GB',  price: 1599, stock: 6, attributes: { cpu: 'Core i5', memory: '8 GB',  storage: '256 GB' } },
      { id: 'v68b', sku: 'SP9-I7-16-256', name: 'i7 / 16 GB / 256 GB', price: 1899, stock: 4, attributes: { cpu: 'Core i7', memory: '16 GB', storage: '256 GB' } },
    ],
  },
  {
    id: 'p69', slug: 'microsoft-surface-go-3', name: 'Microsoft Surface Go 3',
    description: 'Compact 10.5" Windows 11 tablet with Intel Pentium, USB-C, and a lightweight 544g body for on-the-go.',
    price: 549, compareAtPrice: 599, categoryId: 'cat5', brandId: 'brand6', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85',
    variants: [
      { id: 'v69a', sku: 'SGO3-128', name: '128 GB / 8 GB RAM', price: 549, stock: 15, attributes: { storage: '128 GB', ram: '8 GB' } },
    ],
  },
  {
    id: 'p70', slug: 'lenovo-tab-p12-pro', name: 'Lenovo Tab P12 Pro',
    description: '12.6" AMOLED 2K 120Hz display, Snapdragon 870, JBL quad speakers, and Lenovo Precision Pen 3 included.',
    price: 749, compareAtPrice: 849, categoryId: 'cat5', brandId: 'brand7', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1620594737779-cd6d42db0b3a?w=800&q=85',
    variants: [
      { id: 'v70a', sku: 'LTABP12-256-8', name: '256 GB / 8 GB RAM', price: 749, stock: 10, attributes: { storage: '256 GB', ram: '8 GB' } },
    ],
  },
  {
    id: 'p71', slug: 'google-pixel-tablet', name: 'Google Pixel Tablet',
    description: 'Tensor G2, 10.95" LCD, Charging Speaker Dock included, Cast controls, and seamless Google Home integration.',
    price: 499, compareAtPrice: 549, categoryId: 'cat5', brandId: 'brand10', stock: 18,
    sourceImageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85',
    variants: [
      { id: 'v71a', sku: 'GPT-128', name: '128 GB', price: 499, stock: 18, attributes: { storage: '128 GB' } },
    ],
  },
  {
    id: 'p72', slug: 'asus-rog-flow-z13', name: 'ASUS ROG Flow Z13',
    description: '13.4" 165Hz gaming tablet with RTX 4060, Ryzen Z1 Extreme, detachable keyboard, and XG Mobile port.',
    price: 1799, compareAtPrice: 1999, categoryId: 'cat5', brandId: 'brand9', stock: 6,
    sourceImageUrl: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800&q=85',
    variants: [
      { id: 'v72a', sku: 'ROZ13-R9-16-512', name: 'Z1 Extreme / 16 GB / 512 GB', price: 1799, stock: 6, attributes: { cpu: 'Z1 Extreme', memory: '16 GB', storage: '512 GB' } },
    ],
  },
  {
    id: 'p73', slug: 'samsung-galaxy-tab-a9-plus', name: 'Samsung Galaxy Tab A9+',
    description: '11" 90Hz LCD, Snapdragon 695, quad speakers, microSD support, and long battery life at a budget-friendly price.',
    price: 299, compareAtPrice: 349, categoryId: 'cat5', brandId: 'brand2', stock: 28,
    sourceImageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=85',
    variants: [
      { id: 'v73a', sku: 'GTA9P-64',  name: '64 GB / 4 GB RAM',  price: 299, stock: 15, attributes: { storage: '64 GB',  ram: '4 GB' } },
      { id: 'v73b', sku: 'GTA9P-128', name: '128 GB / 8 GB RAM', price: 349, stock: 13, attributes: { storage: '128 GB', ram: '8 GB' } },
    ],
  },
  {
    id: 'p74', slug: 'amazon-fire-max-11', name: 'Amazon Fire Max 11',
    description: '11" 2000×1200 display, octa-core processor, USB-C, Alexa built-in, and 14h battery for work and play.',
    price: 229, compareAtPrice: 269, categoryId: 'cat5', brandId: 'brand6', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=85',
    variants: [
      { id: 'v74a', sku: 'FIREMAX11-64', name: '64 GB', price: 229, stock: 20, attributes: { storage: '64 GB' } },
    ],
  },
  {
    id: 'p75', slug: 'xiaomi-pad-6-pro', name: 'Xiaomi Pad 6 Pro',
    description: 'Snapdragon 8 Gen 1, 11" 144Hz 2.8K WQHD+ LCD, 67W fast charging, quad speakers, and pen support.',
    price: 499, compareAtPrice: 549, categoryId: 'cat5', brandId: 'brand2', stock: 16,
    sourceImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85',
    variants: [
      { id: 'v75a', sku: 'XPAD6P-256-8',  name: '256 GB / 8 GB RAM',  price: 499, stock: 10, attributes: { storage: '256 GB', ram: '8 GB' } },
      { id: 'v75b', sku: 'XPAD6P-512-12', name: '512 GB / 12 GB RAM', price: 599, stock: 6,  attributes: { storage: '512 GB', ram: '12 GB' } },
    ],
  },

  // ══════════════════════════════════════════════════ COMPONENTS (cat6) ══

  {
    id: 'p76', slug: 'corsair-vengeance-ddr5-32gb', name: 'Corsair Vengeance DDR5 32GB',
    description: '32GB (2×16GB) DDR5-6000 kit with XMP 3.0 support and low-profile aluminum heat spreader.',
    price: 119, compareAtPrice: 149, categoryId: 'cat6', brandId: 'brand11', stock: 35,
    sourceImageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=85',
    variants: [
      { id: 'v76a', sku: 'CMK32GX5M2B6000', name: '32 GB Kit', price: 119, stock: 35, attributes: {} },
    ],
  },
  {
    id: 'p77', slug: 'kingston-fury-beast-ddr5-64gb', name: 'Kingston Fury Beast DDR5 64GB',
    description: '64GB (2×32GB) DDR5-6000 kit with Intel XMP 3.0 and AMD EXPO, plug-and-play overclocking for any platform.',
    price: 199, compareAtPrice: 249, categoryId: 'cat6', brandId: 'brand19', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=85',
    variants: [
      { id: 'v77a', sku: 'KF560C36BBEK2-64', name: '64 GB Kit', price: 199, stock: 20, attributes: {} },
    ],
  },
  {
    id: 'p78', slug: 'gskill-trident-z5-rgb-32gb', name: 'G.Skill Trident Z5 RGB DDR5 32GB',
    description: '32GB (2×16GB) DDR5-6400 with aluminum heat spreader and per-key RGB lighting. XMP 3.0 and EXPO certified.',
    price: 149, compareAtPrice: 179, categoryId: 'cat6', brandId: 'brand11', stock: 22,
    sourceImageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=85',
    variants: [
      { id: 'v78a', sku: 'F5-6400J3239G16GX2-TZ5RK', name: '32 GB Kit', price: 149, stock: 22, attributes: {} },
    ],
  },
  {
    id: 'p79', slug: 'samsung-990-pro-1tb', name: 'Samsung 990 Pro NVMe SSD 1TB',
    description: 'PCIe 4.0 NVMe with 7,450 MB/s read speeds, heat sink option, and enhanced endurance for gaming and creators.',
    price: 129, compareAtPrice: 149, categoryId: 'cat6', brandId: 'brand2', stock: 40,
    sourceImageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&q=85',
    variants: [
      { id: 'v79a', sku: '990PRO-1TB',    name: '1 TB',    price: 129, stock: 20, attributes: { capacity: '1 TB' } },
      { id: 'v79b', sku: '990PRO-2TB',    name: '2 TB',    price: 199, stock: 15, attributes: { capacity: '2 TB' } },
      { id: 'v79c', sku: '990PRO-4TB',    name: '4 TB',    price: 349, stock: 5,  attributes: { capacity: '4 TB' } },
    ],
  },
  {
    id: 'p80', slug: 'wd-black-sn850x-2tb', name: 'WD Black SN850X 2TB',
    description: 'PCIe Gen4 NVMe SSD with 7,300 MB/s read, Game Mode 2.0, and a heatsink version for PS5 and PC gaming.',
    price: 179, compareAtPrice: 219, categoryId: 'cat6', brandId: 'brand20', stock: 25,
    sourceImageUrl: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=85',
    variants: [
      { id: 'v80a', sku: 'SN850X-1TB', name: '1 TB', price: 119, stock: 15, attributes: { capacity: '1 TB' } },
      { id: 'v80b', sku: 'SN850X-2TB', name: '2 TB', price: 179, stock: 10, attributes: { capacity: '2 TB' } },
    ],
  },
  {
    id: 'p81', slug: 'seagate-ironwolf-8tb', name: 'Seagate IronWolf 8TB',
    description: '8TB NAS hard drive with AgileArray technology, 7200 RPM, IronWolf Health Management, and CMR recording.',
    price: 189, compareAtPrice: 219, categoryId: 'cat6', brandId: 'brand20', stock: 18,
    sourceImageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800&q=85',
    variants: [
      { id: 'v81a', sku: 'IW-4TB', name: '4 TB', price: 99,  stock: 10, attributes: { capacity: '4 TB' } },
      { id: 'v81b', sku: 'IW-8TB', name: '8 TB', price: 189, stock: 8,  attributes: { capacity: '8 TB' } },
    ],
  },
  {
    id: 'p82', slug: 'nvidia-rtx-4070', name: 'NVIDIA GeForce RTX 4070',
    description: 'Ada Lovelace architecture, DLSS 3, 12GB GDDR6X, and the perfect balance of 4K performance and efficiency.',
    price: 599, compareAtPrice: 649, categoryId: 'cat6', brandId: 'brand14', stock: 15,
    sourceImageUrl: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=85',
    variants: [
      { id: 'v82a', sku: 'RTX4070-12GB', name: 'RTX 4070 12 GB', price: 599, stock: 15, attributes: { vram: '12 GB' } },
    ],
  },
  {
    id: 'p83', slug: 'nvidia-rtx-4080', name: 'NVIDIA GeForce RTX 4080 Super',
    description: '16GB GDDR6X, DLSS 3.5, Frame Generation, and Ray Reconstruction for the most immersive 4K gaming.',
    price: 999, compareAtPrice: 1099, categoryId: 'cat6', brandId: 'brand14', stock: 8,
    sourceImageUrl: 'https://images.unsplash.com/photo-1555617117-38e2a8fec6e4?w=800&q=85',
    variants: [
      { id: 'v83a', sku: 'RTX4080S-16GB', name: 'RTX 4080 Super 16 GB', price: 999, stock: 8, attributes: { vram: '16 GB' } },
    ],
  },
  {
    id: 'p84', slug: 'amd-rx-7900-xt', name: 'AMD Radeon RX 7900 XT',
    description: 'RDNA 3 architecture, 20GB GDDR6, FSR 3.0, DisplayPort 2.1, and unmatched rasterization performance.',
    price: 799, compareAtPrice: 899, categoryId: 'cat6', brandId: 'brand15', stock: 10,
    sourceImageUrl: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=85',
    variants: [
      { id: 'v84a', sku: 'RX7900XT-20GB', name: 'RX 7900 XT 20 GB', price: 799, stock: 10, attributes: { vram: '20 GB' } },
    ],
  },
  {
    id: 'p85', slug: 'amd-ryzen-9-7900x', name: 'AMD Ryzen 9 7900X',
    description: '12 cores / 24 threads, 5.6GHz boost, PCIe 5.0, DDR5 support, and the fastest Zen 4 IPC ever.',
    price: 449, compareAtPrice: 549, categoryId: 'cat6', brandId: 'brand15', stock: 20,
    sourceImageUrl: 'https://images.unsplash.com/photo-1580191947416-62d35a55e71d?w=800&q=85',
    variants: [
      { id: 'v85a', sku: 'R9-7900X', name: 'Ryzen 9 7900X', price: 449, stock: 20, attributes: {} },
    ],
  },
  {
    id: 'p86', slug: 'intel-core-i9-13900k', name: 'Intel Core i9-13900K',
    description: '24 cores (8P+16E), 5.8GHz boost, PCIe 5.0 + 4.0, and unlocked multiplier for extreme overclocking.',
    price: 549, compareAtPrice: 699, categoryId: 'cat6', brandId: 'brand16', stock: 14,
    sourceImageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85',
    variants: [
      { id: 'v86a', sku: 'I9-13900K', name: 'Core i9-13900K', price: 549, stock: 14, attributes: {} },
    ],
  },
  {
    id: 'p87', slug: 'corsair-rm1000x', name: 'Corsair RM1000x PSU',
    description: '1000W 80 Plus Gold fully modular ATX power supply with zero-RPM fan mode and 10-year warranty.',
    price: 179, compareAtPrice: 199, categoryId: 'cat6', brandId: 'brand11', stock: 25,
    sourceImageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=85',
    variants: [
      { id: 'v87a', sku: 'RM1000X', name: '1000W', price: 179, stock: 25, attributes: { wattage: '1000W', rating: '80+ Gold' } },
    ],
  },
  {
    id: 'p88', slug: 'asus-rog-strix-b650-f', name: 'ASUS ROG Strix B650-F Gaming',
    description: 'AMD AM5 motherboard with PCIe 5.0, DDR5, 2.5G LAN, USB 3.2 Gen 2x2 USB-C, and AI overclocking.',
    price: 299, compareAtPrice: 329, categoryId: 'cat6', brandId: 'brand9', stock: 12,
    sourceImageUrl: 'https://images.unsplash.com/photo-1580191947416-62d35a55e71d?w=800&q=85',
    variants: [
      { id: 'v88a', sku: 'ROG-B650F', name: 'ATX', price: 299, stock: 12, attributes: { socket: 'AM5', formFactor: 'ATX' } },
    ],
  },
  {
    id: 'p89', slug: 'noctua-nh-d15', name: 'Noctua NH-D15 CPU Cooler',
    description: 'Dual-tower heatsink with two NF-A15 PWM fans, 165mm height, compatible with AM5, AM4, and LGA1700.',
    price: 99, compareAtPrice: 109, categoryId: 'cat6', brandId: 'brand11', stock: 30,
    sourceImageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=85',
    variants: [
      { id: 'v89a', sku: 'NH-D15-2024', name: 'NH-D15 (2024)', price: 99, stock: 30, attributes: {} },
    ],
  },
  {
    id: 'p90', slug: 'corsair-icue-h150i-elite', name: 'Corsair iCUE H150i Elite Capellix',
    description: '360mm AIO liquid cooler with three 120mm LL RGB fans, Zero RPM mode, and iCUE software integration.',
    price: 179, compareAtPrice: 199, categoryId: 'cat6', brandId: 'brand11', stock: 16,
    sourceImageUrl: 'https://images.unsplash.com/photo-1555617117-38e2a8fec6e4?w=800&q=85',
    variants: [
      { id: 'v90a', sku: 'H150I-ELITE', name: '360mm', price: 179, stock: 16, attributes: { radiatorSize: '360mm' } },
    ],
  },
]

const USERS = [
  { id: 'u1', email: 'admin@premiumtech.com',      firstName: 'Alex',  lastName: 'Rivera', role: 'admin'    as const, password: 'password123' },
  { id: 'u2', email: 'sofia.martin@gmail.com',     firstName: 'Sofia', lastName: 'Martin', role: 'customer' as const, password: 'password123' },
  { id: 'u3', email: 'lucas.perez@outlook.com',    firstName: 'Lucas', lastName: 'Perez',  role: 'customer' as const, password: 'password123' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...\n')

  await prisma.$executeRawUnsafe(
    `TRUNCATE "OrderItem","Order","Address","ProductImage","ProductVariant","Product","Brand","Category","User" RESTART IDENTITY CASCADE`
  )
  console.log('✓ Cleared existing data\n')

  await prisma.category.createMany({ data: CATEGORIES })
  console.log(`✓ ${CATEGORIES.length} categories`)

  await prisma.brand.createMany({ data: BRANDS })
  await prisma.brand.update({ where: { slug: 'motorola' }, data: { logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Motorola_logo.svg' } })
  console.log(`✓ ${BRANDS.length} brands (+ Motorola logo uploaded)`)

  console.log('\n📸 Assigning category images to products...')
  const CATEGORY_IMAGES: Record<string, string[]> = {
    'cat1': [ // Laptops
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85',
      'https://images.unsplash.com/photo-1484788974561-a4f307cf402f?w=800&q=85',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=85'
    ],
    'cat2': [ // Smartphones
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=85',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=85',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=85'
    ],
    'cat3': [ // Headphones
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=85'
    ],
    'cat4': [ // Monitors
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
      'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=85'
    ],
    'cat5': [ // Tablets
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=85',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=85',
      'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=800&q=85',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=85'
    ],
    'cat6': [ // Components
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=85',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=85',
      'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=85',
      'https://images.unsplash.com/photo-1555617117-38e2a8fec6e4?w=800&q=85'
    ],
  };

  for (const p of PRODUCTS) {
    const categoryImages = CATEGORY_IMAGES[p.categoryId];
    const imageUrl = categoryImages 
      ? categoryImages[Math.floor(Math.random() * categoryImages.length)] 
      : p.sourceImageUrl;
    
    const copPrice = Math.floor(Math.random() * 5900001) + 100000;
    const copCompareAtPrice = p.compareAtPrice ? Math.floor(copPrice * (p.compareAtPrice / p.price)) : null;

    await prisma.product.create({
      data: {
        id: p.id, slug: p.slug, name: p.name, description: p.description,
        price: copPrice, compareAtPrice: copCompareAtPrice,
        stock: p.stock, isActive: true, categoryId: p.categoryId, brandId: p.brandId,
        images:   { create: [{ url: imageUrl, altText: p.name, order: 0 }] },
        variants: { create: p.variants.map(v => {
          const variantCopPrice = Math.floor(copPrice * (v.price / p.price));
          return { id: v.id, sku: v.sku, name: v.name, price: variantCopPrice, stock: v.stock, attributes: v.attributes };
        }) },
      },
    })
  }
  console.log(`\n✓ ${PRODUCTS.length} products`)

  for (const u of USERS) {
    await prisma.user.create({
      data: { id: u.id, email: u.email, passwordHash: await bcrypt.hash(u.password, 10), firstName: u.firstName, lastName: u.lastName, role: u.role },
    })
  }
  console.log(`✓ ${USERS.length} users`)

  await prisma.address.create({
    data: { id: 'addr1', userId: 'u2', street: '456 Oak Ave', city: 'Bogotá', country: 'Colombia', cedula: '1078458105', celular: '3148091765', isDefault: true },
  })
  console.log('✓ 1 address')
  console.log('\n✅ Seed completed!')
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(() => prisma.$disconnect())

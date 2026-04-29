export interface Brand {
  id: string
  slug: string
  name: string
  logoUrl?: string
  bannerUrl?: string
  tagline: { en: string; es: string }
  productCount: number
  bgColor: string
}

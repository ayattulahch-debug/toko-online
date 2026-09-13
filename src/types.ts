export interface ProductImage {
  url: string
  thumbUrl: string
}

export interface ProductVariant {
  label: string
  price: number
}

export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  sold: number
  location: string
  rating: number
  images: ProductImage[]
  description: string
  variants: ProductVariant[]
  categoryIds: number[]
}

export interface ProductForm extends Omit<Product, 'price' | 'originalPrice'> {
  price: string
  originalPrice: string
}

export interface Category {
  id: number
  icon: string
  name: string
}

export interface StoreSettings {
  name: string
  location: string
  promoText: string
  banner: string
  whatsappNumber: string
}

export interface Catalog {
  products: Product[]
  categories: Category[]
  settings: StoreSettings
}

export type SortFilter = 'rekomendasi' | 'termurah' | 'premium'

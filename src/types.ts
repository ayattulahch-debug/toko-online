export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  sold: number
  location: string
  rating: number
  images: string[]
  description: string
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
}

export type SortFilter = 'rekomendasi' | 'termurah' | 'premium'

export type View =
  | 'home'
  | 'product'
  | 'store'
  | 'admin_login'
  | 'admin_dashboard'
  | 'admin_edit_product'
  | 'admin_categories'
  | 'admin_settings'

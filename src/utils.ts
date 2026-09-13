import type { Product } from './types'

export function formatRp(angka: number): string {
  return 'Rp' + angka.toLocaleString('id-ID')
}

export function formatSold(sold: number): string {
  return sold >= 1000 ? `${(sold / 1000).toFixed(1)}RB` : String(sold)
}

// Kalau produk punya varian, harga produk induk diabaikan karena tiap varian
// punya harganya sendiri.
export function priceRange(product: Product): { min: number; max: number } {
  if (product.variants.length === 0) {
    return { min: product.price, max: product.price }
  }

  const prices = product.variants.map((variant) => variant.price)

  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function formatPriceRange(product: Product): string {
  const { min, max } = priceRange(product)

  return min === max ? formatRp(min) : `${formatRp(min)} - ${formatRp(max)}`
}

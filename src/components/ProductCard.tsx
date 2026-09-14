import type { Product } from '../types'
import { formatRp, formatSold, priceRange } from '../utils'

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const thumbnail = product.images[0]?.thumbUrl ?? ''
  const { min, max } = priceRange(product)
  const hasRange = min !== max

  const originalPrice = product.originalPrice ?? 0
  const discount = originalPrice > min ? Math.round((1 - min / originalPrice) * 100) : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white relative flex flex-col text-left w-full cursor-pointer hover:-translate-y-0.5 transition-transform"
    >
      <div className="aspect-square w-full bg-gray-200 relative overflow-hidden">
        {thumbnail === '' ? (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
            Tanpa foto
          </div>
        ) : (
          <img
            src={thumbnail}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        )}
        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md">
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-2 flex-1 flex flex-col justify-between">
        <h3 className="text-xs text-gray-800 line-clamp-2 leading-tight h-8">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span
            className={`text-[var(--accent)] font-semibold ${hasRange ? 'text-[11px]' : 'text-sm'}`}
          >
            {hasRange ? `${formatRp(min)} - ${formatRp(max)}` : formatRp(min)}
          </span>
          <span className="text-[10px] text-gray-500 whitespace-nowrap">
            {formatSold(product.sold)} Terjual
          </span>
        </div>
      </div>
    </button>
  )
}

import type { Product } from '../types'
import { formatRp, formatSold } from '../utils'

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const thumbnail = product.images[0]?.thumbUrl ?? ''

  return (
    <div
      className="bg-white relative flex flex-col cursor-pointer hover:-translate-y-0.5 transition-transform"
      onClick={onClick}
    >
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
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
        <div className="absolute top-0 left-0 bg-[#ee4d2d] text-white text-[10px] font-bold px-1 py-0.5 rounded-br-md">
          Star+
        </div>
      </div>
      <div className="p-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs text-gray-800 line-clamp-2 leading-tight h-8 mb-1">{product.name}</h3>
          <div className="inline-block border border-[#ee4d2d] text-[#ee4d2d] text-[9px] px-1 bg-red-50 rounded-sm mb-1">
            Cashback XTRA
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[#ee4d2d] font-semibold text-sm">{formatRp(product.price)}</span>
          <span className="text-[10px] text-gray-500">{formatSold(product.sold)} Terjual</span>
        </div>
      </div>
    </div>
  )
}

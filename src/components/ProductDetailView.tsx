import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MoreVertical,
  Share2,
  ShoppingCart,
  Star,
  Store,
} from 'lucide-react'
import { WHATSAPP_NUMBER } from '../data'
import type { Product, StoreSettings } from '../types'
import { formatRp, formatSold } from '../utils'

interface ProductDetailViewProps {
  product: Product
  storeSettings: StoreSettings
  onBack: () => void
  onStoreClick: () => void
}

export function ProductDetailView({ product, storeSettings, onBack, onStoreClick }: ProductDetailViewProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0)

  const nextImg = () => setCurrentImgIdx((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  const prevImg = () => setCurrentImgIdx((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))

  const handleBuyWhatsApp = () => {
    const message = `Halo, saya tertarik untuk membeli produk ini dari katalog Anda:%0A%0A*${product.name}*%0AHarga: ${formatRp(product.price)}%0A%0AApakah stoknya masih tersedia?`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  return (
    <div className="pb-16 bg-gray-100 min-h-screen">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-3 py-3 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm">
            <Share2 size={18} />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm relative">
            <ShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 bg-[#ee4d2d] text-white text-[10px] px-1.5 rounded-full border border-white">
              3
            </span>
          </button>
          <button className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="relative aspect-square bg-white">
        <img src={product.images[currentImgIdx]} alt={product.name} className="w-full h-full object-cover" />
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 rounded-full flex items-center justify-center shadow-md text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 rounded-full flex items-center justify-center shadow-md text-gray-700"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
              {currentImgIdx + 1} / {product.images.length}
            </div>
          </>
        )}
      </div>

      <div className="bg-white p-3 mb-2 shadow-sm">
        <div className="text-[#ee4d2d] text-2xl font-bold flex items-center gap-2">
          {formatRp(product.price)}
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through font-normal">{formatRp(product.originalPrice)}</span>
          )}
        </div>
        <h1 className="text-gray-800 text-sm font-semibold mt-1 leading-snug">
          <span className="inline-block align-middle bg-[#ee4d2d] text-white text-[9px] px-1 py-0.5 rounded-sm mr-1">
            Star+
          </span>
          {product.name}
        </h1>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <div className="flex items-center text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span className="text-gray-700 ml-1 font-medium">{product.rating}</span>
          </div>
          <div className="w-px h-3 bg-gray-300"></div>
          <div>{formatSold(product.sold)} Terjual</div>
        </div>
      </div>

      <div className="bg-white p-3 mb-2 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border border-gray-300">
          <Store size={24} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-800">{storeSettings.name}</div>
          <div className="text-xs text-gray-500">Aktif 5 menit yang lalu</div>
        </div>
        <button
          onClick={onStoreClick}
          className="border border-[#ee4d2d] text-[#ee4d2d] px-3 py-1 rounded-sm text-xs font-medium bg-white active:bg-orange-50"
        >
          Kunjungi Toko
        </button>
      </div>

      <div className="bg-white p-3 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Deskripsi Produk</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex h-14 z-50">
        <button className="flex flex-col items-center justify-center w-[20%] border-r border-gray-200 text-gray-600 active:bg-gray-100">
          <MessageSquare size={20} className="mb-0.5" />
          <span className="text-[9px]">Chat</span>
        </button>
        <button className="flex flex-col items-center justify-center w-[20%] text-gray-600 active:bg-gray-100">
          <ShoppingCart size={20} className="mb-0.5" />
          <span className="text-[9px]">Keranjang</span>
        </button>
        <button
          onClick={handleBuyWhatsApp}
          className="flex-1 bg-green-500 text-white font-bold text-sm flex items-center justify-center active:bg-green-600 gap-1"
        >
          Hubungi WhatsApp
        </button>
      </div>
    </div>
  )
}

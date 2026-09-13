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
import { productUrl } from '../lib/router'
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
  const [variantIdx, setVariantIdx] = useState(0)

  const imageCount = product.images.length
  const currentImage = product.images[currentImgIdx]?.url ?? ''
  const selectedVariant = product.variants[variantIdx] ?? null
  const displayPrice = selectedVariant?.price ?? product.price

  const nextImg = () => setCurrentImgIdx((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
  const prevImg = () => setCurrentImgIdx((prev) => (prev === 0 ? imageCount - 1 : prev - 1))

  const handleBuyWhatsApp = () => {
    const number = storeSettings.whatsappNumber
    if (number === '') {
      window.alert('Nomor WhatsApp toko belum diatur oleh admin.')
      return
    }

    const lines = [
      'Halo, saya tertarik untuk membeli produk ini dari katalog Anda:',
      '',
      `*${product.name}*`,
    ]

    if (selectedVariant !== null) {
      lines.push(`Varian: ${selectedVariant.label}`)
    }

    lines.push(
      `Harga: ${formatRp(displayPrice)}`,
      '',
      `Link produk: ${productUrl(product.id)}`,
      '',
      'Apakah stoknya masih tersedia?',
    )

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
  }

  const handleShare = async () => {
    const url = productUrl(product.id)

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} — ${formatRp(displayPrice)}`,
          url,
        })
        return
      } catch (err) {
        // Pengguna menutup menu share sendiri; tidak perlu pesan apa pun.
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      window.alert('Tautan produk disalin ke papan klip.')
    } catch {
      window.alert(`Tautan produk:\n${url}`)
    }
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
          <button
            onClick={() => void handleShare()}
            className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
          >
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
        {currentImage === '' ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Foto belum tersedia
          </div>
        ) : (
          <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
        )}

        {imageCount > 1 && (
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
              {currentImgIdx + 1} / {imageCount}
            </div>
          </>
        )}
      </div>

      <div className="bg-white p-3 mb-2 shadow-sm">
        <div className="text-[#ee4d2d] text-2xl font-bold flex items-center gap-2">
          {formatRp(displayPrice)}
          {selectedVariant === null && product.originalPrice ? (
            <span className="text-gray-400 text-sm line-through font-normal">
              {formatRp(product.originalPrice)}
            </span>
          ) : null}
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

      {product.variants.length > 0 && (
        <div className="bg-white p-3 mb-2 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Pilih Varian</h2>
          <div className="flex flex-col gap-2">
            {product.variants.map((variant, index) => {
              const active = index === variantIdx

              return (
                <button
                  key={variant.label}
                  type="button"
                  onClick={() => setVariantIdx(index)}
                  className={`flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-left text-xs ${
                    active
                      ? 'border-[#ee4d2d] bg-red-50 text-[#ee4d2d] font-semibold'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <span>{variant.label}</span>
                  <span className="whitespace-nowrap">{formatRp(variant.price)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

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

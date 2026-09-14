import { useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, Share2, Star, Store } from 'lucide-react'
import { productUrl } from '../lib/router'
import { openWhatsApp, shareLink } from '../lib/share'
import type { Product, StoreSettings } from '../types'
import { formatRp, formatSold } from '../utils'

interface ProductDetailViewProps {
  product: Product
  storeSettings: StoreSettings
  onBack: () => void
  onStoreClick: () => void
}

const SWIPE_THRESHOLD = 40

export function ProductDetailView({ product, storeSettings, onBack, onStoreClick }: ProductDetailViewProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0)
  const [variantIdx, setVariantIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const imageCount = product.images.length
  const currentImage = product.images[currentImgIdx]?.url ?? ''
  const selectedVariant = product.variants[variantIdx] ?? null
  const displayPrice = selectedVariant?.price ?? product.price

  const nextImg = () => setCurrentImgIdx((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
  const prevImg = () => setCurrentImgIdx((prev) => (prev === 0 ? imageCount - 1 : prev - 1))

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current
    touchStartX.current = null

    if (startX === null || imageCount < 2) {
      return
    }

    const deltaX = (e.changedTouches[0]?.clientX ?? startX) - startX

    // Ambang batas mencegah foto berpindah saat halaman digulir.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return
    }

    if (deltaX < 0) {
      nextImg()
    } else {
      prevImg()
    }
  }

  const handleBuyWhatsApp = () => {
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

    openWhatsApp(storeSettings.whatsappNumber, lines.join('\n'))
  }

  const handleShare = () => {
    void shareLink({
      title: product.name,
      text: `${product.name} — ${formatRp(displayPrice)}`,
      url: productUrl(product.id),
    })
  }

  return (
    <div className="pb-16 bg-gray-100 min-h-screen">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-3 py-3 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onBack}
          aria-label="Kembali"
          className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleShare}
          aria-label="Bagikan produk ini"
          className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div
        className="relative aspect-square bg-white"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentImage === '' ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Foto belum tersedia
          </div>
        ) : (
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        )}

        {imageCount > 1 && (
          <>
            <button
              onClick={prevImg}
              aria-label="Foto sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/70 rounded-full flex items-center justify-center shadow-md text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              aria-label="Foto berikutnya"
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

      {imageCount > 1 && (
        <div className="bg-white px-3 py-2 mb-2 flex gap-2 overflow-x-auto shadow-sm">
          {product.images.map((image, index) => (
            <button
              key={image.thumbUrl}
              type="button"
              onClick={() => setCurrentImgIdx(index)}
              aria-label={`Buka foto ${index + 1}`}
              className={`w-14 h-14 shrink-0 rounded-md overflow-hidden border-2 ${
                index === currentImgIdx ? 'border-[var(--accent)]' : 'border-transparent'
              }`}
            >
              <img src={image.thumbUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="bg-white p-3 mb-2 shadow-sm">
        <div className="text-[var(--accent)] text-2xl font-bold flex items-center gap-2">
          {formatRp(displayPrice)}
          {selectedVariant === null && product.originalPrice ? (
            <span className="text-gray-400 text-sm line-through font-normal">
              {formatRp(product.originalPrice)}
            </span>
          ) : null}
        </div>
        <h1 className="text-gray-800 text-sm font-semibold mt-1 leading-snug">{product.name}</h1>
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
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
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
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-800 truncate">{storeSettings.name}</div>
          <div className="text-xs text-gray-500">
            {product.location === '' ? storeSettings.location : product.location}
          </div>
        </div>
        <button
          onClick={onStoreClick}
          className="border border-[var(--accent)] text-[var(--accent)] px-3 py-1 rounded-sm text-xs font-medium bg-white active:bg-[var(--accent-soft)]"
        >
          Kunjungi Toko
        </button>
      </div>

      <div className="bg-white p-3 shadow-sm mb-6">
        <h2 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Deskripsi Produk</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex h-14 z-50">
        <button
          onClick={handleBuyWhatsApp}
          className="flex-1 bg-green-500 text-white font-bold text-sm flex items-center justify-center active:bg-green-600"
        >
          Hubungi WhatsApp
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  ChevronLeft,
  Home as HomeIcon,
  MapPin,
  Search,
  Settings,
  Star,
  Store,
  Tag,
} from 'lucide-react'
import type { Category, Product, StoreSettings } from '../types'
import { ProductCard } from './ProductCard'

interface StoreViewProps {
  products: Product[]
  storeSettings: StoreSettings
  categories: Category[]
  isAdmin: boolean
  onProductClick: (product: Product) => void
  onHomeClick: () => void
  onAdminClick: () => void
}

export function StoreView({
  products,
  storeSettings,
  categories,
  isAdmin,
  onProductClick,
  onHomeClick,
  onAdminClick,
}: StoreViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // Kategori yang tampil di bilah bawah, diatur dari menu Pengaturan.
  const bottomCategories = storeSettings.bottomCategoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => category !== undefined)

  const filteredProducts = products
    .filter((product) =>
      selectedCategory === null ? true : product.categoryIds.includes(selectedCategory),
    )
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Statistik ditampilkan apa adanya dari data toko, bukan angka contoh.
  const ratedProducts = products.filter((product) => product.rating > 0)
  const averageRating =
    ratedProducts.length === 0
      ? null
      : ratedProducts.reduce((total, product) => total + product.rating, 0) / ratedProducts.length

  return (
    <div className="pb-16 bg-gray-100 min-h-screen">
      <div className="relative w-full h-40 bg-gray-800">
        <img src={storeSettings.banner} alt="Store Banner" className="w-full h-full object-cover opacity-60" />

        <div className="absolute top-0 w-full px-3 py-3 flex items-center justify-between z-10">
          <button
            onClick={onHomeClick}
            aria-label="Kembali ke beranda"
            className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 ml-3 bg-white/20 backdrop-blur-sm rounded-sm flex items-center px-2 py-1.5 border border-white/30">
            <Search size={16} className="text-white" />
            <input
              type="text"
              placeholder="Cari di toko ini..."
              className="w-full text-xs outline-none px-2 bg-transparent text-white placeholder-white/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={onAdminClick}
            aria-label="Buka pengaturan toko"
            className="w-8 h-8 ml-3 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm relative hover:bg-black/60"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-full p-0.5 border-2 border-white shadow-md relative">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
              <Store size={28} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 text-white">
            <h1 className="font-bold text-base leading-tight drop-shadow-md">{storeSettings.name}</h1>
            <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {storeSettings.location}
            </p>
          </div>
          <button
            onClick={onAdminClick}
            className={`border border-white px-3 py-1 rounded-sm text-xs font-medium backdrop-blur-sm flex items-center gap-1 ${isAdmin ? 'bg-[var(--accent)] text-white' : 'bg-black/20 text-white hover:bg-white/20'}`}
          >
            {isAdmin ? (
              <>
                <Settings size={12} /> Kelola
              </>
            ) : (
              '+ Ikuti'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white flex py-3 border-b shadow-sm">
        <div className="flex-1 border-r text-center">
          <div className="text-[var(--accent)] font-bold text-sm">
            {averageRating === null ? '—' : `${averageRating.toFixed(1)}/5.0`}
          </div>
          <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
            <Star size={10} /> Penilaian
          </div>
        </div>
        <div className="flex-1 border-r text-center">
          <div className="text-[var(--accent)] font-bold text-sm">{products.length}</div>
          <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
            <Store size={10} /> Produk
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[var(--accent)] font-bold text-sm">{categories.length}</div>
          <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
            <Tag size={10} /> Kategori
          </div>
        </div>
      </div>

      <div className="px-2 pt-3">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-bold text-gray-800 text-sm">Semua Produk</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-gray-500">
              <Search size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium">Tidak ada produk yang cocok</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-2 text-[10px] text-gray-500 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={onHomeClick}
          className="flex flex-col items-center hover:text-[var(--accent)]"
        >
          <HomeIcon size={20} />
          <span>Rekomendasi</span>
        </button>

        {bottomCategories.map((category) => {
          const active = category.id === selectedCategory

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setSelectedCategory(active ? null : category.id)
                window.scrollTo({ top: 300, behavior: 'smooth' })
              }}
              className={`flex flex-col items-center max-w-[70px] ${
                active ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)]'
              }`}
            >
              <span className="text-[18px] leading-5">{category.icon}</span>
              <span className="truncate w-full">{category.name}</span>
            </button>
          )
        })}

        <button type="button" className="flex flex-col items-center text-[var(--accent)]">
          <Store size={20} />
          <span>Toko Saya</span>
        </button>
      </div>
    </div>
  )
}

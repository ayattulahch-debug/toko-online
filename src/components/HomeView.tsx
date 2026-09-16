import { useState } from 'react'
import { Home as HomeIcon, MessageSquare, Search, Share2, Store, X } from 'lucide-react'
import { categoryUrl } from '../lib/router'
import { openWhatsApp, shareLink } from '../lib/share'
import type { Category, Product, StoreSettings } from '../types'
import { ProductCard } from './ProductCard'

interface HomeViewProps {
  products: Product[]
  storeSettings: StoreSettings
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number | null) => void
  onProductClick: (product: Product) => void
  onStoreClick: () => void
}

export function HomeView({
  products,
  storeSettings,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onProductClick,
  onStoreClick,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const activeCategory = categories.find((category) => category.id === selectedCategoryId) ?? null

  // Kategori yang tampil di bilah bawah, diatur dari menu Pengaturan.
  const bottomCategories = storeSettings.bottomCategoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => category !== undefined)

  const filteredProducts = products
    .filter((product) =>
      selectedCategoryId === null ? true : product.categoryIds.includes(selectedCategoryId),
    )
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const handleShareCategory = () => {
    if (activeCategory === null) {
      return
    }

    void shareLink({
      title: activeCategory.name,
      text: `${activeCategory.icon} ${activeCategory.name} — ${storeSettings.name}`,
      url: categoryUrl(activeCategory.id),
    })
  }

  const handleChatStore = () => {
    openWhatsApp(storeSettings.whatsappNumber, `Halo ${storeSettings.name}, saya ingin bertanya.`)
  }

  return (
    <div className="pb-16">
      <div className="bg-[var(--accent)] sticky top-0 z-50 px-3 py-3 flex items-center gap-3">
        <div className="flex-1 bg-white rounded-sm flex items-center px-2 py-1.5">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk akrilik..."
            className="w-full text-sm outline-none px-2 text-[var(--accent)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleChatStore}
          aria-label="Hubungi toko lewat WhatsApp"
          className="text-white cursor-pointer"
        >
          <MessageSquare size={24} />
        </button>
      </div>

      <div className="w-full bg-white mb-2">
        <div className="relative aspect-[21/9] overflow-hidden bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent)] flex items-center justify-center px-4 text-center">
          {storeSettings.homeBanner !== '' && (
            <img
              src={storeSettings.homeBanner}
              alt={`Banner ${storeSettings.name}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {storeSettings.homeBanner !== '' && storeSettings.promoText !== '' && (
            <div className="absolute inset-0 bg-black/40" />
          )}
          <span className="relative text-white font-bold text-xl">{storeSettings.promoText}</span>
        </div>
      </div>

      <div className="bg-white p-4 mb-2 grid grid-cols-4 gap-4 text-center text-xs shadow-sm">
        {categories.map((cat) => {
          const active = cat.id === selectedCategoryId

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(active ? null : cat.id)}
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div
                className={`w-10 h-10 border rounded-xl flex items-center justify-center text-xl shadow-sm ${
                  active ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {cat.icon}
              </div>
              <span
                className={`truncate w-full font-medium ${
                  active ? 'text-[var(--accent)]' : 'text-gray-700'
                }`}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="px-2">
        {activeCategory !== null ? (
          <div className="bg-white mb-2 border-b-4 border-[var(--accent)] flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-[var(--accent)] font-bold text-sm truncate">
              {activeCategory.icon} {activeCategory.name}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleShareCategory}
                aria-label={`Bagikan kategori ${activeCategory.name}`}
                className="flex items-center gap-1 text-[11px] text-[var(--accent)] border border-[var(--accent)] rounded-full px-2 py-0.5 whitespace-nowrap active:bg-[var(--accent-soft)]"
              >
                <Share2 size={12} /> Bagikan
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 py-0.5 whitespace-nowrap active:bg-gray-100"
              >
                <X size={12} /> Hapus
              </button>
            </span>
          </div>
        ) : (
          <div className="bg-white text-[var(--accent)] font-bold text-center py-3 mb-2 border-b-4 border-[var(--accent)]">
            REKOMENDASI UNTUKMU
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-gray-500">
              <Search size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">Produk tidak ditemukan</p>
              <p className="text-xs mt-1">Coba gunakan kata kunci lain.</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center py-2 text-[10px] text-gray-500 z-40">
        <button
          type="button"
          onClick={() => {
            onSelectCategory(null)
            window.scrollTo(0, 0)
          }}
          className={`flex flex-col items-center ${
            selectedCategoryId === null ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)]'
          }`}
        >
          <HomeIcon size={20} />
          <span>Rekomendasi</span>
        </button>

        {bottomCategories.map((category) => {
          const active = category.id === selectedCategoryId

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onSelectCategory(active ? null : category.id)
                window.scrollTo(0, 0)
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

        <button
          type="button"
          onClick={onStoreClick}
          className="flex flex-col items-center hover:text-[var(--accent)]"
        >
          <Store size={20} />
          <span>Toko Saya</span>
        </button>
      </div>
    </div>
  )
}

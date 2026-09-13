import { useState } from 'react'
import { Home as HomeIcon, MessageSquare, Search, ShoppingCart, Store, X } from 'lucide-react'
import type { Category, Product, StoreSettings } from '../types'
import { ProductCard } from './ProductCard'

interface HomeViewProps {
  products: Product[]
  storeSettings: StoreSettings
  categories: Category[]
  onProductClick: (product: Product) => void
  onStoreClick: () => void
}

export function HomeView({
  products,
  storeSettings,
  categories,
  onProductClick,
  onStoreClick,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const activeCategory = categories.find((category) => category.id === selectedCategory) ?? null

  // Kategori yang tampil di bilah bawah, diatur dari menu Pengaturan.
  const bottomCategories = storeSettings.bottomCategoryIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is Category => category !== undefined)

  const filteredProducts = products
    .filter((product) =>
      selectedCategory === null ? true : product.categoryIds.includes(selectedCategory),
    )
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <div className="pb-16">
      <div className="bg-[#ee4d2d] sticky top-0 z-50 px-3 py-3 flex items-center gap-3">
        <div className="flex-1 bg-white rounded-sm flex items-center px-2 py-1.5">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk akrilik..."
            className="w-full text-sm outline-none px-2 text-[#ee4d2d]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-white relative cursor-pointer">
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-2 bg-white text-[#ee4d2d] text-[10px] font-bold px-1.5 rounded-full border border-[#ee4d2d]">
            3
          </span>
        </div>
        <div className="text-white cursor-pointer">
          <MessageSquare size={24} />
        </div>
      </div>

      <div className="w-full bg-white mb-2">
        <div className="aspect-[21/9] bg-gradient-to-r from-orange-400 to-[#ee4d2d] flex items-center justify-center text-white font-bold text-xl px-4 text-center">
          {storeSettings.promoText}
        </div>
      </div>

      <div className="bg-white p-4 mb-2 grid grid-cols-4 gap-4 text-center text-xs shadow-sm">
        {categories.map((cat) => {
          const active = cat.id === selectedCategory

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(active ? null : cat.id)}
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div
                className={`w-10 h-10 border rounded-xl flex items-center justify-center text-xl shadow-sm ${
                  active ? 'border-[#ee4d2d] bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {cat.icon}
              </div>
              <span
                className={`truncate w-full font-medium ${
                  active ? 'text-[#ee4d2d]' : 'text-gray-700'
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
          <div className="bg-white mb-2 border-b-4 border-[#ee4d2d] flex items-center justify-between px-3 py-2.5">
            <span className="text-[#ee4d2d] font-bold text-sm truncate">
              {activeCategory.icon} {activeCategory.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-300 rounded-full px-2 py-0.5 whitespace-nowrap active:bg-gray-100"
            >
              <X size={12} /> Hapus saringan
            </button>
          </div>
        ) : (
          <div className="bg-white text-[#ee4d2d] font-bold text-center py-3 mb-2 border-b-4 border-[#ee4d2d]">
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
            setSelectedCategory(null)
            window.scrollTo(0, 0)
          }}
          className={`flex flex-col items-center ${
            selectedCategory === null ? 'text-[#ee4d2d]' : 'hover:text-[#ee4d2d]'
          }`}
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
                window.scrollTo(0, 0)
              }}
              className={`flex flex-col items-center max-w-[70px] ${
                active ? 'text-[#ee4d2d]' : 'hover:text-[#ee4d2d]'
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
          className="flex flex-col items-center hover:text-[#ee4d2d]"
        >
          <Store size={20} />
          <span>Toko Saya</span>
        </button>
      </div>
    </div>
  )
}

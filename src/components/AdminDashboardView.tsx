import { useState } from 'react'
import { ChevronLeft, Edit3, Layout, LogOut, Plus, Settings } from 'lucide-react'
import type { Product, View } from '../types'
import { formatRp } from '../utils'

type DashboardTab = 'products' | 'categories' | 'settings'

interface AdminDashboardViewProps {
  products: Product[]
  onLogout: () => void
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onNavigate: (view: View) => void
}

export function AdminDashboardView({
  products,
  onLogout,
  onAddProduct,
  onEditProduct,
  onNavigate,
}: AdminDashboardViewProps) {
  const [tab, setTab] = useState<DashboardTab>('products')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <h1 className="font-bold text-lg">Kelola Toko</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 p-2 rounded-full hover:bg-red-700 active:bg-red-800"
        >
          <LogOut size={16} />
        </button>
      </div>
      <div className="flex bg-white shadow-sm border-b">
        <button
          className={`flex-1 py-3 text-xs font-bold ${tab === 'products' ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]' : 'text-gray-500'}`}
          onClick={() => setTab('products')}
        >
          PRODUK
        </button>
        <button
          className={`flex-1 py-3 text-xs font-bold ${tab === 'categories' ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]' : 'text-gray-500'}`}
          onClick={() => setTab('categories')}
        >
          KATEGORI
        </button>
        <button
          className={`flex-1 py-3 text-xs font-bold ${tab === 'settings' ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]' : 'text-gray-500'}`}
          onClick={() => setTab('settings')}
        >
          TAMPILAN
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {tab === 'products' && (
          <div className="space-y-3 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Pilih produk yang ingin diedit.</p>
              <button
                onClick={onAddProduct}
                className="bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm active:bg-green-600"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-md shadow-sm flex items-center gap-3 border border-gray-100"
              >
                <img src={p.images[0]} className="w-16 h-16 object-cover rounded" alt="thumb" />
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</h3>
                  <p className="text-[#ee4d2d] text-xs font-semibold mt-1">{formatRp(p.price)}</p>
                </div>
                <button
                  onClick={() => onEditProduct(p)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-md active:bg-blue-100"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === 'categories' && (
          <div className="text-center py-10">
            <Layout size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-4">Kelola ikon dan nama kategori di halaman utama.</p>
            <button
              onClick={() => onNavigate('admin_categories')}
              className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-sm shadow-md"
            >
              Buka Menu Kategori
            </button>
          </div>
        )}
        {tab === 'settings' && (
          <div className="text-center py-10">
            <Settings size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-4">Ubah banner promo, nama toko, dan lokasi.</p>
            <button
              onClick={() => onNavigate('admin_settings')}
              className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-sm shadow-md"
            >
              Buka Menu Tampilan
            </button>
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => onNavigate('store')}
          className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-md active:bg-gray-200 flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} /> Kembali ke Toko
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronUp, Edit3, Layout, Loader2, LogOut, Plus, Settings, Trash2 } from 'lucide-react'
import type { Route } from '../lib/router'
import type { Product } from '../types'
import { formatRp } from '../utils'

type DashboardTab = 'products' | 'categories' | 'settings'

interface AdminDashboardViewProps {
  products: Product[]
  onLogout: () => void
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (product: Product) => Promise<void>
  onReorderProducts: (ids: number[]) => Promise<void>
  onNavigate: (route: Route) => void
}

export function AdminDashboardView({
  products,
  onLogout,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onReorderProducts,
  onNavigate,
}: AdminDashboardViewProps) {
  const [tab, setTab] = useState<DashboardTab>('products')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [reordering, setReordering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction

    if (target < 0 || target >= products.length) {
      return
    }

    const ordered = products.map((product) => product.id)
    const temp = ordered[index]
    ordered[index] = ordered[target]
    ordered[target] = temp

    setReordering(true)
    setError(null)

    try {
      await onReorderProducts(ordered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan urutan produk.')
    } finally {
      setReordering(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return
    }

    setDeletingId(product.id)
    setError(null)

    try {
      await onDeleteProduct(product)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk.')
    } finally {
      setDeletingId(null)
    }
  }

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
          className={`flex-1 py-3 text-xs font-bold ${tab === 'products' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-gray-500'}`}
          onClick={() => setTab('products')}
        >
          PRODUK
        </button>
        <button
          className={`flex-1 py-3 text-xs font-bold ${tab === 'categories' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-gray-500'}`}
          onClick={() => setTab('categories')}
        >
          KATEGORI
        </button>
        <button
          className={`flex-1 py-3 text-xs font-bold ${tab === 'settings' ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-gray-500'}`}
          onClick={() => setTab('settings')}
        >
          TAMPILAN
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {tab === 'products' && (
          <div className="space-y-3 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{products.length} produk tampil di katalog.</p>
              <button
                onClick={onAddProduct}
                className="bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm active:bg-green-600"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>

            {error !== null && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
            )}

            {products.map((p, index) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-md shadow-sm flex items-center gap-3 border border-gray-100"
              >
                {p.images[0] === undefined ? (
                  <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-[9px] text-gray-400">
                    Tanpa foto
                  </div>
                ) : (
                  <img
                    src={p.images[0].thumbUrl}
                    className="w-16 h-16 object-cover rounded"
                    alt={`Foto ${p.name}`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</h3>
                  <p className="text-[var(--accent)] text-xs font-semibold mt-1">{formatRp(p.price)}</p>
                </div>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => void handleMove(index, -1)}
                    disabled={index === 0 || reordering}
                    aria-label={`Naikkan urutan ${p.name}`}
                    className="p-1 text-gray-500 rounded active:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMove(index, 1)}
                    disabled={index === products.length - 1 || reordering}
                    aria-label={`Turunkan urutan ${p.name}`}
                    className="p-1 text-gray-500 rounded active:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button
                  onClick={() => onEditProduct(p)}
                  aria-label={`Edit produk ${p.name}`}
                  className="p-2 bg-blue-50 text-blue-600 rounded-md active:bg-blue-100"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => void handleDelete(p)}
                  disabled={deletingId === p.id}
                  aria-label={`Hapus produk ${p.name}`}
                  className="p-2 bg-red-50 text-red-500 rounded-md active:bg-red-100 disabled:opacity-50"
                >
                  {deletingId === p.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}

            {products.length === 0 && (
              <p className="text-center text-xs text-gray-500 py-10">
                Belum ada produk. Tekan tombol Tambah untuk mulai mengisi katalog.
              </p>
            )}
          </div>
        )}
        {tab === 'categories' && (
          <div className="text-center py-10">
            <Layout size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-4">Kelola ikon dan nama kategori di halaman utama.</p>
            <button
              onClick={() => onNavigate({ name: 'admin_categories' })}
              className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-sm shadow-md"
            >
              Buka Menu Kategori
            </button>
          </div>
        )}
        {tab === 'settings' && (
          <div className="text-center py-10">
            <Settings size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Ubah banner promo, nama toko, nomor WhatsApp, dan password admin.
            </p>
            <button
              onClick={() => onNavigate({ name: 'admin_settings' })}
              className="bg-gray-800 text-white px-4 py-2 rounded-md font-bold text-sm shadow-md"
            >
              Buka Menu Tampilan
            </button>
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => onNavigate({ name: 'store' })}
          className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-md active:bg-gray-200 flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} /> Kembali ke Toko
        </button>
      </div>
    </div>
  )
}

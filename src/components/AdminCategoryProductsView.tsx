import { useState } from 'react'
import { Check, ChevronLeft, Loader2, Plus, Search, Trash2, X } from 'lucide-react'
import type { Category, Product } from '../types'
import { formatRp } from '../utils'

interface AdminCategoryProductsViewProps {
  category: Category
  products: Product[]
  onSave: (categoryId: number, productIds: number[]) => Promise<void>
  onBack: () => void
}

export function AdminCategoryProductsView({
  category,
  products,
  onSave,
  onBack,
}: AdminCategoryProductsViewProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    products
      .filter((product) => product.categoryIds.includes(category.id))
      .map((product) => product.id),
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pendingIds, setPendingIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Diturunkan dari `products` supaya urutannya mengikuti urutan katalog.
  const selectedProducts = products.filter((product) => selectedIds.includes(product.id))

  const availableProducts = products
    .filter((product) => !selectedIds.includes(product.id))
    .filter((product) => product.name.toLowerCase().includes(pickerQuery.toLowerCase()))

  const openPicker = () => {
    setPendingIds([])
    setPickerQuery('')
    setPickerOpen(true)
  }

  const togglePending = (id: number) => {
    setPendingIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const confirmPending = () => {
    setSelectedIds((prev) => [...prev, ...pendingIds.filter((id) => !prev.includes(id))])
    setPickerOpen(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await onSave(category.id, selectedIds)
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk kategori.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-50">
        <button onClick={onBack} className="mr-3" aria-label="Kembali">
          <ChevronLeft size={24} />
        </button>
        <div className="min-w-0">
          <h1 className="font-bold text-lg truncate">
            {category.icon} {category.name}
          </h1>
          <p className="text-[11px] text-gray-300">Kelola Produk</p>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-500 mb-4">
          {selectedIds.length} dari {products.length} produk masuk kategori ini. Perubahan baru
          tersimpan setelah menekan <strong>Simpan Perubahan</strong> di bawah.
        </p>

        {error !== null && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-3 mb-3">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-200 flex items-center gap-3"
            >
              {product.images[0] === undefined ? (
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 shrink-0">
                  Tanpa foto
                </div>
              ) : (
                <img
                  src={product.images[0].thumbUrl}
                  className="w-16 h-16 object-cover rounded shrink-0"
                  alt={`Foto ${product.name}`}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                <p className="text-[var(--accent)] text-xs font-semibold mt-1">
                  {formatRp(product.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIds((prev) => prev.filter((id) => id !== product.id))}
                aria-label={`Keluarkan ${product.name} dari kategori ini`}
                className="p-2 bg-red-50 text-red-500 rounded-md active:bg-red-100 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {selectedProducts.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-8">
            Belum ada produk di kategori ini. Tekan tombol di bawah untuk menambahkan.
          </p>
        )}

        <button
          type="button"
          onClick={openPicker}
          className="mt-3 w-full border-2 border-dashed border-gray-300 text-gray-600 font-bold py-3 rounded-md flex items-center justify-center gap-2 active:bg-gray-100"
        >
          <Plus size={18} /> Tambahkan Produk
        </button>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-md shadow-md active:bg-[var(--accent-dark)] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-t-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-800">Tambahkan Produk</h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Tutup"
                className="text-gray-400 p-1 active:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center border border-gray-300 rounded-md px-2 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari nama produk..."
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  className="w-full text-sm outline-none px-2"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Hanya produk yang belum masuk kategori ini yang ditampilkan.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {availableProducts.map((product) => {
                const checked = pendingIds.includes(product.id)

                return (
                  <label
                    key={product.id}
                    className={`flex items-center gap-3 border rounded-md p-2 cursor-pointer ${
                      checked
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[var(--accent)] shrink-0"
                      checked={checked}
                      onChange={() => togglePending(product.id)}
                    />
                    {product.images[0] === undefined ? (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 shrink-0">
                        -
                      </div>
                    ) : (
                      <img
                        src={product.images[0].thumbUrl}
                        className="w-10 h-10 object-cover rounded shrink-0"
                        alt=""
                      />
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-medium text-gray-800 line-clamp-1">
                        {product.name}
                      </span>
                      <span className="block text-[11px] text-[var(--accent)] font-semibold mt-0.5">
                        {formatRp(product.price)}
                      </span>
                    </span>
                  </label>
                )
              })}

              {availableProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-medium">
                    {products.length === 0
                      ? 'Belum ada produk di katalog.'
                      : pickerQuery === ''
                        ? 'Semua produk sudah masuk kategori ini.'
                        : 'Produk tidak ditemukan.'}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-md active:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmPending}
                disabled={pendingIds.length === 0}
                className="flex-[2] bg-[var(--accent)] text-white font-bold py-3 rounded-md shadow-md active:bg-[var(--accent-dark)] disabled:opacity-50"
              >
                Tambahkan ({pendingIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Check, ChevronLeft, Loader2, Package, Plus, Trash2 } from 'lucide-react'
import type { Category } from '../types'

interface AdminCategoryViewProps {
  categories: Category[]
  onSave: (categories: Category[]) => Promise<void>
  onManageProducts: (category: Category) => void
  onBack: () => void
}

export function AdminCategoryView({
  categories,
  onSave,
  onManageProducts,
  onBack,
}: AdminCategoryViewProps) {
  const [cats, setCats] = useState<Category[]>(() => categories.map((category) => ({ ...category })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    setCats((prev) => [...prev, { id: -Date.now(), icon: '📦', name: 'Kategori Baru' }])
  }

  const handleChange = (id: number, field: 'icon' | 'name', value: string) => {
    setCats((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const handleRemove = (id: number) => {
    setCats((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      // ID kategori lama ikut dikirim supaya server memperbaruinya, bukan
      // menghapus lalu membuat ulang (itu akan memutus tautan ke produk).
      await onSave(cats.map(({ id, icon, name }) => ({ id: id > 0 ? id : 0, icon, name })))
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kategori.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">Kelola Kategori</h1>
        </div>
        <button onClick={handleAdd} className="bg-green-500 text-white p-1.5 rounded-md">
          <Plus size={18} />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-500 mb-4">
          Ubah nama dan emoji icon kategori untuk halaman utama. Tombol <strong>Produk</strong>{' '}
          dipakai untuk memilih produk mana saja yang masuk kategori tersebut — simpan dulu
          perubahan nama/ikon sebelum mengatur produk.
        </p>

        <div className="space-y-3">
          {cats.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-3 rounded-md shadow-sm border border-gray-200 flex gap-2 items-center"
            >
              <div className="flex flex-col">
                <label className="text-[10px] text-gray-400">Emoji</label>
                <input
                  type="text"
                  value={cat.icon}
                  onChange={(e) => handleChange(cat.id, 'icon', e.target.value)}
                  className="w-12 border border-gray-300 rounded px-2 py-2 text-center text-lg outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-[10px] text-gray-400">Nama Kategori</label>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleChange(cat.id, 'name', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                type="button"
                onClick={() => onManageProducts(cat)}
                disabled={cat.id <= 0}
                aria-label={`Atur produk kategori ${cat.name}`}
                className="mt-4 bg-gray-100 text-gray-700 p-2 rounded-md active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Package size={16} />
              </button>
              <button
                onClick={() => handleRemove(cat.id)}
                className="mt-4 bg-red-50 text-red-500 p-2 rounded-md active:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {error !== null && <p className="text-xs text-red-500 mt-4">{error}</p>}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-md shadow-md active:bg-[var(--accent-dark)] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {saving ? 'Menyimpan...' : 'Simpan Kategori'}
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Check, ChevronLeft, Trash2, Upload } from 'lucide-react'
import type { Product, ProductForm } from '../types'

type EditableField = 'name' | 'price' | 'originalPrice' | 'description'

interface AdminEditProductViewProps {
  product: Product
  onSave: (product: Product) => void
  onCancel: () => void
}

function toForm(product: Product): ProductForm {
  return {
    ...product,
    price: product.price ? String(product.price) : '',
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
  }
}

export function AdminEditProductView({ product, onSave, onCancel }: AdminEditProductViewProps) {
  const [formData, setFormData] = useState<ProductForm>(() => toForm(product))

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as EditableField
    const { value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, images: [...prev.images, reader.result as string] }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formData.images.length === 0) return
    onSave({
      ...formData,
      price: Number(formData.price) || 0,
      originalPrice: formData.originalPrice === '' ? undefined : Number(formData.originalPrice),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-50">
        <button onClick={onCancel} className="mr-3">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Edit Produk</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-4">
          <label className="text-sm font-bold text-gray-800 mb-3 block">Foto Produk (Maks 5)</label>
          <div className="flex flex-wrap gap-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-100">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-red-500 active:bg-red-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {formData.images.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 active:bg-gray-100">
                <Upload size={20} className="mb-1" />
                <span className="text-[9px] font-medium">Tambah Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          {formData.images.length === 0 && (
            <p className="text-xs text-red-500 mt-2">Minimal 1 foto wajib diisi!</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2">Informasi Produk</h2>

          <div>
            <label className="text-xs font-semibold text-gray-600">Nama Produk</label>
            <textarea
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Harga (Rp)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Harga Coret (Opsional)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Deskripsi Lengkap</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
          </div>
        </div>

        <div className="mt-6 mb-8 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-md shadow-sm active:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={formData.images.length === 0}
            className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check size={18} /> Simpan
          </button>
        </div>
      </form>
    </div>
  )
}

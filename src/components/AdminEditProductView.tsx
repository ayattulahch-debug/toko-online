import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Check, ChevronLeft, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { uploadImage } from '../api'
import { compressImage } from '../lib/image'
import type { Product, ProductForm, ProductImage } from '../types'

type EditableField = 'name' | 'price' | 'originalPrice' | 'description'

const MAX_IMAGES = 5
const MAX_VARIANTS = 20

interface DraftImage extends ProductImage {
  previewUrl?: string
}

interface DraftVariant {
  label: string
  price: string
}

interface AdminEditProductViewProps {
  product: Product
  onSave: (product: Product) => Promise<void>
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
  const [images, setImages] = useState<DraftImage[]>(() => product.images.map((image) => ({ ...image })))
  const [variants, setVariants] = useState<DraftVariant[]>(() =>
    product.variants.map((variant) => ({ label: variant.label, price: String(variant.price) })),
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as EditableField
    const { value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRemoveImage = (index: number) => {
    const target = images[index]
    if (target?.previewUrl !== undefined) {
      URL.revokeObjectURL(target.previewUrl)
    }
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file === undefined) return

    const previewUrl = URL.createObjectURL(file)
    setImages((prev) => [...prev, { url: '', thumbUrl: '', previewUrl }])
    setUploading(true)
    setError(null)

    try {
      const compressed = await compressImage(file)
      const uploaded = await uploadImage(compressed.full, compressed.thumb)
      setImages((prev) => prev.map((image) => (image.previewUrl === previewUrl ? { ...uploaded } : image)))
    } catch (err) {
      setImages((prev) => prev.filter((image) => image.previewUrl !== previewUrl))
      setError(err instanceof Error ? err.message : 'Gagal mengunggah foto.')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setUploading(false)
    }
  }

  const addVariant = () => {
    setVariants((prev) => [...prev, { label: '', price: '' }])
  }

  const changeVariant = (index: number, field: keyof DraftVariant, value: string) => {
    setVariants((prev) => prev.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant)))
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const readyImages = images.filter((image) => image.url !== '')
  const filledVariants = variants.filter(
    (variant) => variant.label.trim() !== '' || variant.price.trim() !== '',
  )
  const hasNamelessVariant = filledVariants.some((variant) => variant.label.trim() === '')
  const canSubmit =
    images.length > 0 &&
    images.length === readyImages.length &&
    !hasNamelessVariant &&
    !uploading &&
    !saving

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return

    setSaving(true)
    setError(null)

    try {
      await onSave({
        ...product,
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        originalPrice: formData.originalPrice === '' ? null : Number(formData.originalPrice),
        description: formData.description,
        images: readyImages.map(({ url, thumbUrl }) => ({ url, thumbUrl })),
        variants: filledVariants.map((variant) => ({
          label: variant.label.trim(),
          price: Number(variant.price) || 0,
        })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-50">
        <button onClick={onCancel} className="mr-3">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">{product.id === 0 ? 'Tambah Produk' : 'Edit Produk'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-4">
          <label className="text-sm font-bold text-gray-800 mb-3 block">
            Foto Produk (Maks {MAX_IMAGES})
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 border rounded-md overflow-hidden bg-gray-100">
                <img src={img.url || img.previewUrl} alt="preview" className="w-full h-full object-cover" />
                {img.url === '' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-red-500 active:bg-red-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 active:bg-gray-100">
                {uploading ? (
                  <Loader2 size={20} className="mb-1 animate-spin" />
                ) : (
                  <Upload size={20} className="mb-1" />
                )}
                <span className="text-[9px] font-medium">{uploading ? 'Mengunggah' : 'Tambah Foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => void handleImageUpload(e)}
                />
              </label>
            )}
          </div>
          {images.length === 0 && (
            <p className="text-xs text-red-500 mt-2">Minimal 1 foto wajib diisi!</p>
          )}
          <p className="text-[10px] text-gray-400 mt-2">
            Foto otomatis diperkecil dan dikompres sebelum diunggah agar hemat ruang hosting.
          </p>
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
                min={0}
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
                min={0}
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

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mt-4">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h2 className="text-sm font-bold text-gray-800">Varian Produk</h2>
            {variants.length < MAX_VARIANTS && (
              <button
                type="button"
                onClick={addVariant}
                className="bg-green-500 text-white px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 active:bg-green-600"
              >
                <Plus size={12} /> Tambah Varian
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-gray-500">
              Kosongkan kalau produk ini hanya punya satu harga. Isi kalau ada pilihan seperti
              &ldquo;Hanya Plakat&rdquo; atau &ldquo;Plakat + Box 5mm&rdquo;.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={variant.label}
                      onChange={(e) => changeVariant(index, 'label', e.target.value)}
                      placeholder="Nama varian"
                      className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-xs outline-none focus:border-[#ee4d2d]"
                    />
                    <input
                      type="number"
                      min={0}
                      value={variant.price}
                      onChange={(e) => changeVariant(index, 'price', e.target.value)}
                      placeholder="Harga"
                      className="w-24 border border-gray-300 rounded-md px-2 py-2 text-xs outline-none focus:border-[#ee4d2d]"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 bg-red-50 text-red-500 rounded-md active:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3">
                Kalau varian diisi, harga pada kolom &ldquo;Harga&rdquo; di atas diabaikan — yang
                dipakai adalah harga tiap varian. Harga coret juga tidak ditampilkan.
              </p>
            </>
          )}

          {hasNamelessVariant && (
            <p className="text-xs text-red-500 mt-2">Setiap varian harus punya nama.</p>
          )}
        </div>

        {error !== null && (
          <p className="text-xs text-red-500 mt-4 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

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
            disabled={!canSubmit}
            className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-md shadow-md hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Check, ChevronLeft, Upload } from 'lucide-react'
import type { StoreSettings } from '../types'

interface AdminSettingsViewProps {
  storeSettings: StoreSettings
  onSave: (settings: StoreSettings) => void
  onBack: () => void
}

export function AdminSettingsView({ storeSettings, onSave, onBack }: AdminSettingsViewProps) {
  const [settings, setSettings] = useState<StoreSettings>(() => ({ ...storeSettings }))

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSettings((prev) => ({ ...prev, banner: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onSave(settings)
    onBack()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-50">
        <button onClick={onBack} className="mr-3">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Pengaturan Tampilan</h1>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Informasi Toko</h2>

          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600">Nama Toko</label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Lokasi / Kota</label>
            <input
              type="text"
              name="location"
              value={settings.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Tampilan Halaman</h2>

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600">Teks Banner Promo (Beranda)</label>
            <input
              type="text"
              name="promoText"
              value={settings.promoText}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">Banner Profil Toko</label>
            <div className="relative w-full h-32 border border-gray-300 rounded-md overflow-hidden bg-gray-100 group">
              <img src={settings.banner} alt="banner" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="mb-1" />
                <span className="text-xs font-medium">Ubah Banner</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Rekomendasi ukuran rasio lanskap. Sentuh gambar/hover untuk mengubah.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <button
          onClick={handleSave}
          className="w-full bg-[#ee4d2d] text-white font-bold py-3 rounded-md shadow-md active:bg-orange-600 flex items-center justify-center gap-2"
        >
          <Check size={18} /> Simpan Pengaturan
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Check, ChevronLeft, KeyRound, Loader2, Upload } from 'lucide-react'
import { uploadImage } from '../api'
import { compressImage } from '../lib/image'
import type { StoreSettings } from '../types'

interface AdminSettingsViewProps {
  storeSettings: StoreSettings
  onSave: (settings: StoreSettings) => Promise<void>
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>
  onBack: () => void
}

export function AdminSettingsView({
  storeSettings,
  onSave,
  onChangePassword,
  onBack,
}: AdminSettingsViewProps) {
  const [settings, setSettings] = useState<StoreSettings>(() => ({ ...storeSettings }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bannerUploading, setBannerUploading] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file === undefined) return

    setBannerUploading(true)
    setError(null)

    try {
      const compressed = await compressImage(file)
      const uploaded = await uploadImage(compressed.full)
      setSettings((prev) => ({ ...prev, banner: uploaded.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah banner.')
    } finally {
      setBannerUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await onSave(settings)
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordNotice(null)

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak sama.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.')
      return
    }

    setChangingPassword(true)

    try {
      await onChangePassword(oldPassword, newPassword)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordNotice('Password berhasil diubah. Sesi di perangkat lain sudah keluar.')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password.')
    } finally {
      setChangingPassword(false)
    }
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

          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600">Lokasi / Kota</label>
            <input
              type="text"
              name="location"
              value={settings.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Nomor WhatsApp Tujuan</label>
            <input
              type="text"
              name="whatsappNumber"
              value={settings.whatsappNumber}
              onChange={handleChange}
              placeholder="6281234567890"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Format internasional tanpa tanda plus, contoh <span className="font-mono">6281234567890</span>.
            </p>
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
              {settings.banner === '' ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  Belum ada banner
                </div>
              ) : (
                <img src={settings.banner} alt="banner" className="w-full h-full object-cover" />
              )}

              {bannerUploading ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs font-medium">Ubah Banner</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleBannerUpload(e)} />
                </label>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Rekomendasi ukuran rasio lanskap. Sentuh gambar/hover untuk mengubah.
            </p>
          </div>
        </div>

        {error !== null && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2">
            <KeyRound size={14} /> Ganti Password Admin
          </h2>

          <form onSubmit={(e) => void handlePasswordSubmit(e)} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Password Lama</label>
              <input
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Password Baru</label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Ulangi Password Baru</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[#ee4d2d]"
              />
            </div>

            {passwordError !== null && <p className="text-xs text-red-500">{passwordError}</p>}
            {passwordNotice !== null && <p className="text-xs text-green-600">{passwordNotice}</p>}

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full bg-gray-800 text-white font-bold py-2.5 rounded-md shadow-sm active:bg-gray-900 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {changingPassword && <Loader2 size={16} className="animate-spin" />}
              {changingPassword ? 'Menyimpan...' : 'Ganti Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <button
          onClick={() => void handleSave()}
          disabled={saving || bannerUploading}
          className="w-full bg-[#ee4d2d] text-white font-bold py-3 rounded-md shadow-md active:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}

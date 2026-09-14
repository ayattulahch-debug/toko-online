import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Check, ChevronLeft, KeyRound, Loader2, Upload } from 'lucide-react'
import { uploadImage } from '../api'
import { accentShades } from '../lib/color'
import { compressImage } from '../lib/image'
import type { Category, StoreSettings } from '../types'

const MAX_BOTTOM_CATEGORIES = 3

const ACCENT_PRESETS = [
  { name: 'Oranye', color: '#ee4d2d' },
  { name: 'Merah marun', color: '#b91c1c' },
  { name: 'Biru', color: '#2563eb' },
  { name: 'Hijau', color: '#059669' },
  { name: 'Ungu', color: '#7c3aed' },
  { name: 'Hitam', color: '#111827' },
]

interface AdminSettingsViewProps {
  storeSettings: StoreSettings
  categories: Category[]
  onSave: (settings: StoreSettings) => Promise<void>
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>
  onBack: () => void
}

export function AdminSettingsView({
  storeSettings,
  categories,
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

  // Pratinjau langsung: warna ikut berubah begitu dipilih, dan dikembalikan ke
  // warna tersimpan kalau halaman ini ditinggalkan tanpa menyimpan.
  useEffect(() => {
    const root = document.documentElement

    const apply = (hex: string) => {
      const shades = accentShades(hex)
      root.style.setProperty('--accent', shades.accent)
      root.style.setProperty('--accent-dark', shades.dark)
      root.style.setProperty('--accent-soft', shades.soft)
    }

    apply(settings.accentColor)

    return () => apply(storeSettings.accentColor)
  }, [settings.accentColor, storeSettings.accentColor])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const toggleBottomCategory = (id: number) => {
    setSettings((prev) => {
      if (prev.bottomCategoryIds.includes(id)) {
        return { ...prev, bottomCategoryIds: prev.bottomCategoryIds.filter((item) => item !== id) }
      }

      if (prev.bottomCategoryIds.length >= MAX_BOTTOM_CATEGORIES) {
        return prev
      }

      return { ...prev, bottomCategoryIds: [...prev.bottomCategoryIds, id] }
    })
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="mb-3">
            <label className="text-xs font-semibold text-gray-600">Lokasi / Kota</label>
            <input
              type="text"
              name="location"
              value={settings.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
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

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Warna Tema</h2>

          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label="Pilih warna tema toko"
              value={settings.accentColor}
              onChange={(e) => setSettings((prev) => ({ ...prev, accentColor: e.target.value }))}
              className="w-14 h-14 border border-gray-300 rounded-md cursor-pointer bg-white p-1"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-600">Warna aksen toko</p>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">{settings.accentColor}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                aria-label={`Pakai warna ${preset.name}`}
                onClick={() => setSettings((prev) => ({ ...prev, accentColor: preset.color }))}
                style={{ backgroundColor: preset.color }}
                className={`w-8 h-8 rounded-full border-2 ${
                  settings.accentColor.toLowerCase() === preset.color
                    ? 'border-gray-800'
                    : 'border-transparent'
                }`}
              />
            ))}
          </div>

          <p className="text-[10px] text-gray-400 mt-3">
            Warna ini dipakai untuk tombol, harga, dan sorotan di seluruh halaman toko. Perubahan
            terlihat langsung di halaman ini, dan tersimpan untuk pengunjung setelah kamu menekan
            Simpan Pengaturan.
          </p>
        </div>

        {error !== null && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-md p-3">{error}</p>
        )}

        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Bilah Bawah</h2>

          {categories.length === 0 ? (
            <p className="text-xs text-gray-500">
              Belum ada kategori. Tambahkan dulu lewat menu <strong>Kategori</strong> di dashboard.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">
                Pilih kategori yang ingin tampil di bilah bawah, maksimal {MAX_BOTTOM_CATEGORIES}.
                Menekannya di aplikasi akan menyaring produk.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const checked = settings.bottomCategoryIds.includes(category.id)
                  const penuh =
                    !checked && settings.bottomCategoryIds.length >= MAX_BOTTOM_CATEGORIES

                  return (
                    <label
                      key={category.id}
                      className={`flex items-center gap-2 border rounded-md px-2 py-2 text-xs ${
                        checked
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                          : penuh
                            ? 'border-gray-100 bg-gray-50 text-gray-400'
                            : 'border-gray-200 bg-white text-gray-700 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={checked}
                        disabled={penuh}
                        onChange={() => toggleBottomCategory(category.id)}
                      />
                      <span className="truncate">
                        {category.icon} {category.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </div>

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
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent)]"
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
          className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-md shadow-md active:bg-[var(--accent-dark)] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}

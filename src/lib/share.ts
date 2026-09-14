export interface ShareOptions {
  title: string
  text?: string
  url: string
}

// Memakai menu share bawaan HP bila tersedia. Kalau tidak, tautannya disalin ke
// papan klip supaya tetap bisa dibagikan.
export async function shareLink(options: ShareOptions): Promise<void> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(options)
      return
    } catch (err) {
      // Pengguna menutup menu share sendiri; tidak perlu pesan apa pun.
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
    }
  }

  try {
    await navigator.clipboard.writeText(options.url)
    window.alert('Tautan disalin ke papan klip.')
  } catch {
    window.alert(`Tautan:\n${options.url}`)
  }
}

export function openWhatsApp(number: string, message: string): void {
  if (number === '') {
    window.alert('Nomor WhatsApp toko belum diatur oleh admin.')
    return
  }

  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank')
}

import { useCallback, useEffect, useState } from 'react'
import { fetchCatalog } from '../api'
import type { Catalog } from '../types'

// Server yang belum diperbarui belum mengirim `variants` dan `categoryIds`.
// Nilai bawaannya diisi di sini supaya tampilan tidak rusak saat versi
// backend dan frontend belum sama.
function normalizeCatalog(catalog: Catalog): Catalog {
  return {
    ...catalog,
    products: catalog.products.map((product) => ({
      ...product,
      variants: product.variants ?? [],
      categoryIds: product.categoryIds ?? [],
      hidden: product.hidden ?? false,
    })),
    settings: {
      ...catalog.settings,
      homeBanner: catalog.settings.homeBanner ?? '',
      bottomCategoryIds: catalog.settings.bottomCategoryIds ?? [],
      accentColor: catalog.settings.accentColor ?? '#ee4d2d',
    },
  }
}

// `includeHidden` bernilai true saat admin login: katalog lalu memuat juga
// produk yang disembunyikan. Tampilan pengunjung tetap menyaringnya di App.
export function useCatalog(includeHidden: boolean) {
  const [data, setData] = useState<Catalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dimuat ulang setiap kali status login admin berubah. State hanya disentuh
  // di dalam callback promise, bukan langsung di badan effect.
  useEffect(() => {
    let active = true

    fetchCatalog(includeHidden)
      .then((catalog) => {
        if (!active) return
        setData(normalizeCatalog(catalog))
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Gagal memuat katalog.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [includeHidden])

  // Dipakai setelah aksi admin dan oleh tombol "Coba Lagi".
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(normalizeCatalog(await fetchCatalog(includeHidden)))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat katalog.')
    } finally {
      setLoading(false)
    }
  }, [includeHidden])

  return { data, loading, error, reload }
}

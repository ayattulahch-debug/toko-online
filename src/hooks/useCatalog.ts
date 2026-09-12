import { useCallback, useEffect, useState } from 'react'
import { fetchCatalog } from '../api'
import type { Catalog } from '../types'

export function useCatalog() {
  const [data, setData] = useState<Catalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pemuatan awal: state hanya disentuh di dalam callback promise, bukan
  // langsung di badan effect.
  useEffect(() => {
    let active = true

    fetchCatalog()
      .then((catalog) => {
        if (!active) return
        setData(catalog)
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
  }, [])

  // Dipakai setelah aksi admin dan oleh tombol "Coba Lagi".
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchCatalog())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat katalog.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, reload }
}

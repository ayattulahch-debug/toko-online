import { useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'category'; id: number }
  | { name: 'product'; id: number }
  | { name: 'store' }
  | { name: 'admin_login' }
  | { name: 'admin_dashboard' }
  | { name: 'admin_product'; id: number }
  | { name: 'admin_categories' }
  | { name: 'admin_category_products'; id: number }
  | { name: 'admin_settings' }

export function parseHash(hash: string): Route {
  const parts = hash
    .replace(/^#/, '')
    .split('/')
    .filter((part) => part !== '')

  if (parts.length === 0) {
    return { name: 'home' }
  }

  if (parts[0] === 'produk') {
    const id = Number(parts[1])
    return Number.isInteger(id) && id > 0 ? { name: 'product', id } : { name: 'home' }
  }

  if (parts[0] === 'kategori') {
    const id = Number(parts[1])
    return Number.isInteger(id) && id > 0 ? { name: 'category', id } : { name: 'home' }
  }

  if (parts[0] === 'toko') {
    return { name: 'store' }
  }

  if (parts[0] === 'admin') {
    if (parts[1] === 'login') {
      return { name: 'admin_login' }
    }
    if (parts[1] === 'kategori') {
      const id = Number(parts[2])
      if (parts[3] === 'produk' && Number.isInteger(id) && id > 0) {
        return { name: 'admin_category_products', id }
      }
      return { name: 'admin_categories' }
    }
    if (parts[1] === 'tampilan') {
      return { name: 'admin_settings' }
    }
    if (parts[1] === 'produk') {
      const id = Number(parts[2])
      return { name: 'admin_product', id: Number.isInteger(id) && id > 0 ? id : 0 }
    }
    if (parts.length === 1) {
      return { name: 'admin_dashboard' }
    }
  }

  return { name: 'home' }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'product':
      return `#/produk/${route.id}`
    case 'category':
      return `#/kategori/${route.id}`
    case 'store':
      return '#/toko'
    case 'admin_login':
      return '#/admin/login'
    case 'admin_dashboard':
      return '#/admin'
    case 'admin_product':
      return route.id > 0 ? `#/admin/produk/${route.id}` : '#/admin/produk/baru'
    case 'admin_categories':
      return '#/admin/kategori'
    case 'admin_category_products':
      return `#/admin/kategori/${route.id}/produk`
    case 'admin_settings':
      return '#/admin/tampilan'
    default:
      return '#/'
  }
}

let inAppNavigations = 0

export function navigate(route: Route): void {
  const hash = routeToHash(route)

  if (window.location.hash === hash) {
    return
  }

  inAppNavigations += 1
  window.location.hash = hash
}

// Dipakai tombol kembali: kalau pengguna memang sudah berpindah halaman di
// dalam aplikasi, pakai riwayat browser. Kalau halaman produk dibuka langsung
// dari tautan share, kembali ke beranda supaya tidak keluar dari situs.
export function canGoBack(): boolean {
  return inAppNavigations > 0 && window.history.length > 1
}

// Dipakai untuk tombol share dan tautan di pesan WhatsApp.
export function productUrl(id: number): string {
  return `${window.location.origin}${window.location.pathname}#/produk/${id}`
}

export function categoryUrl(id: number): string {
  return `${window.location.origin}${window.location.pathname}#/kategori/${id}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const handleChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', handleChange)

    return () => window.removeEventListener('hashchange', handleChange)
  }, [])

  return route
}

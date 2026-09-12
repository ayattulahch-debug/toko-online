import type { Catalog, Category, Product, ProductImage, StoreSettings } from './types'

const BASE = import.meta.env.VITE_API_BASE ?? '/api'
const TOKEN_KEY = 'toko.token'

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) {
      window.localStorage.removeItem(TOKEN_KEY)
    } else {
      window.localStorage.setItem(TOKEN_KEY, token)
    }
  } catch {
    // localStorage bisa diblokir (mode privat). Sesi tetap jalan sampai halaman ditutup.
  }
}

function errorMessage(payload: unknown, status: number): string {
  if (payload !== null && typeof payload === 'object' && 'error' in payload) {
    return String((payload as { error: unknown }).error)
  }
  if (status === 401) {
    return 'Sesi tidak valid atau sudah berakhir. Silakan login ulang.'
  }
  return `Permintaan ke server gagal (kode ${status}).`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token !== null) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers })
  } catch {
    throw new Error('Tidak dapat menghubungi server. Periksa koneksi internet kamu.')
  }

  const text = await response.text()
  let payload: unknown = null
  if (text !== '') {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null)
    }
    throw new Error(errorMessage(payload, response.status))
  }

  return payload as T
}

export function fetchCatalog(): Promise<Catalog> {
  return request<Catalog>('/catalog.php')
}

export function login(username: string, password: string): Promise<{ token: string }> {
  return request<{ token: string }>('/auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/auth.php?action=logout', { method: 'POST' })
}

export function changePassword(oldPassword: string, newPassword: string): Promise<{ token: string }> {
  return request<{ token: string }>('/auth.php?action=change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  })
}

export function saveProduct(product: Product): Promise<{ ok: boolean; id: number }> {
  return request<{ ok: boolean; id: number }>('/products.php', {
    method: 'POST',
    body: JSON.stringify(product),
  })
}

export function deleteProduct(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/products.php?id=${id}`, { method: 'DELETE' })
}

export function saveCategories(categories: Category[]): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/categories.php', {
    method: 'POST',
    body: JSON.stringify({ categories }),
  })
}

export function saveSettings(settings: StoreSettings): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/settings.php', {
    method: 'POST',
    body: JSON.stringify(settings),
  })
}

export function uploadImage(full: Blob, thumb?: Blob): Promise<ProductImage> {
  const form = new FormData()
  form.append('file', full, 'foto-full.webp')
  if (thumb !== undefined) {
    form.append('thumb', thumb, 'foto-thumb.webp')
  }

  return request<ProductImage>('/upload.php', { method: 'POST', body: form })
}

import { useState } from 'react'
import {
  changePassword,
  deleteProduct,
  getToken,
  login,
  logout,
  saveCategories,
  saveProduct,
  saveSettings,
  setToken,
} from './api'
import { AdminCategoryView } from './components/AdminCategoryView'
import { AdminDashboardView } from './components/AdminDashboardView'
import { AdminEditProductView } from './components/AdminEditProductView'
import { AdminLoginView } from './components/AdminLoginView'
import { AdminSettingsView } from './components/AdminSettingsView'
import { HomeView } from './components/HomeView'
import { ProductDetailView } from './components/ProductDetailView'
import { StoreView } from './components/StoreView'
import { useCatalog } from './hooks/useCatalog'
import { canGoBack, navigate, useRoute } from './lib/router'
import type { Category, Product, SortFilter, StoreSettings } from './types'

const NEW_PRODUCT: Product = {
  id: 0,
  name: '',
  price: 0,
  sold: 0,
  location: '',
  rating: 5,
  images: [],
  description: '',
  variants: [],
  categoryIds: [],
}

export default function App() {
  const { data, loading, error, reload } = useCatalog()
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [activeFilter, setActiveFilter] = useState<SortFilter>('rekomendasi')
  const route = useRoute()

  const isAdmin = token !== null

  const handleLogin = async (username: string, password: string) => {
    const result = await login(username, password)
    setToken(result.token)
    setTokenState(result.token)
    navigate({ name: 'admin_dashboard' })
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Token mungkin sudah kedaluwarsa di server; sesi lokal tetap dibersihkan.
    }
    setToken(null)
    setTokenState(null)
    navigate({ name: 'store' })
  }

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    const result = await changePassword(oldPassword, newPassword)
    setToken(result.token)
    setTokenState(result.token)
  }

  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product)
    await reload()
    navigate({ name: 'admin_dashboard' })
  }

  const handleDeleteProduct = async (product: Product) => {
    await deleteProduct(product.id)
    await reload()
  }

  const handleSaveCategories = async (categories: Category[]) => {
    await saveCategories(categories)
    await reload()
  }

  const handleSaveSettings = async (settings: StoreSettings) => {
    await saveSettings(settings)
    await reload()
  }

  if (data === null) {
    return (
      <div className="min-h-screen bg-gray-200 flex justify-center">
        <div className="w-full max-w-md bg-gray-100 min-h-screen shadow-2xl flex flex-col items-center justify-center px-8 text-center">
          {loading ? (
            <>
              <div className="w-10 h-10 border-4 border-gray-300 border-t-[#ee4d2d] rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600">Memuat katalog toko...</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-800 mb-2">Katalog gagal dimuat</p>
              <p className="text-xs text-gray-500 mb-5">{error}</p>
              <button
                onClick={() => void reload()}
                className="bg-[#ee4d2d] text-white font-bold px-5 py-2.5 rounded-md shadow-md active:bg-orange-600"
              >
                Coba Lagi
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const goToProduct = (product: Product) => navigate({ name: 'product', id: product.id })

  const goBackOrHome = () => {
    if (canGoBack()) {
      window.history.back()
      return
    }
    navigate({ name: 'home' })
  }

  const loginScreen = (
    <AdminLoginView onLogin={handleLogin} onBack={() => navigate({ name: 'store' })} />
  )

  const notFoundScreen = (message: string, back: () => void) => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-8 text-center">
      <p className="text-sm font-bold text-gray-800 mb-2">{message}</p>
      <p className="text-xs text-gray-500 mb-5">Produk mungkin sudah dihapus dari katalog.</p>
      <button
        onClick={back}
        className="bg-[#ee4d2d] text-white font-bold px-5 py-2.5 rounded-md shadow-md active:bg-orange-600"
      >
        Kembali
      </button>
    </div>
  )

  const renderRoute = () => {
    switch (route.name) {
      case 'product': {
        const product = data.products.find((item) => item.id === route.id)
        if (product === undefined) {
          return notFoundScreen('Produk tidak ditemukan', () => navigate({ name: 'home' }))
        }
        return (
          <ProductDetailView
            product={product}
            storeSettings={data.settings}
            onBack={goBackOrHome}
            onStoreClick={() => navigate({ name: 'store' })}
          />
        )
      }

      case 'store':
        return (
          <StoreView
            products={data.products}
            storeSettings={data.settings}
            isAdmin={isAdmin}
            onProductClick={goToProduct}
            onHomeClick={() => navigate({ name: 'home' })}
            onAdminClick={() => navigate(isAdmin ? { name: 'admin_dashboard' } : { name: 'admin_login' })}
          />
        )

      case 'admin_login':
        return loginScreen

      case 'admin_dashboard':
        if (!isAdmin) {
          return loginScreen
        }
        return (
          <AdminDashboardView
            products={data.products}
            onLogout={() => void handleLogout()}
            onAddProduct={() => navigate({ name: 'admin_product', id: 0 })}
            onEditProduct={(product) => navigate({ name: 'admin_product', id: product.id })}
            onDeleteProduct={handleDeleteProduct}
            onNavigate={(target) => navigate(target)}
          />
        )

      case 'admin_product': {
        if (!isAdmin) {
          return loginScreen
        }

        const editing =
          route.id > 0 ? data.products.find((item) => item.id === route.id) : NEW_PRODUCT

        if (editing === undefined) {
          return notFoundScreen('Produk tidak ditemukan', () => navigate({ name: 'admin_dashboard' }))
        }

        return (
          <AdminEditProductView
            product={editing}
            categories={data.categories}
            onSave={handleSaveProduct}
            onCancel={() => navigate({ name: 'admin_dashboard' })}
          />
        )
      }

      case 'admin_categories':
        if (!isAdmin) {
          return loginScreen
        }
        return (
          <AdminCategoryView
            categories={data.categories}
            onSave={handleSaveCategories}
            onBack={() => navigate({ name: 'admin_dashboard' })}
          />
        )

      case 'admin_settings':
        if (!isAdmin) {
          return loginScreen
        }
        return (
          <AdminSettingsView
            storeSettings={data.settings}
            onSave={handleSaveSettings}
            onChangePassword={handleChangePassword}
            onBack={() => navigate({ name: 'admin_dashboard' })}
          />
        )

      default:
        return (
          <HomeView
            products={data.products}
            storeSettings={data.settings}
            categories={data.categories}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onProductClick={goToProduct}
            onStoreClick={() => navigate({ name: 'store' })}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-md bg-gray-100 min-h-screen shadow-2xl relative overflow-x-hidden">
        {renderRoute()}
      </div>
    </div>
  )
}

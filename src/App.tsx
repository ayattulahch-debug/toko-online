import { useState } from 'react'
import { AdminCategoryView } from './components/AdminCategoryView'
import { AdminDashboardView } from './components/AdminDashboardView'
import { AdminEditProductView } from './components/AdminEditProductView'
import { AdminLoginView } from './components/AdminLoginView'
import { AdminSettingsView } from './components/AdminSettingsView'
import { HomeView } from './components/HomeView'
import { ProductDetailView } from './components/ProductDetailView'
import { StoreView } from './components/StoreView'
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from './data'
import { usePersistentState } from './hooks/usePersistentState'
import type { Category, Product, SortFilter, StoreSettings, View } from './types'

export default function App() {
  const [products, setProducts] = usePersistentState<Product[]>('toko.products', INITIAL_PRODUCTS)
  const [categories, setCategories] = usePersistentState<Category[]>('toko.categories', INITIAL_CATEGORIES)
  const [storeSettings, setStoreSettings] = usePersistentState<StoreSettings>(
    'toko.storeSettings',
    INITIAL_STORE_SETTINGS,
  )

  const [view, setView] = useState<View>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeFilter, setActiveFilter] = useState<SortFilter>('rekomendasi')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)

  const goToProduct = (product: Product) => {
    setSelectedProduct(product)
    setView('product')
    window.scrollTo(0, 0)
  }

  const goToHome = () => {
    setSelectedProduct(null)
    setView('home')
    window.scrollTo(0, 0)
  }

  const goToStore = () => {
    setView('store')
    window.scrollTo(0, 0)
  }

  const goToAdmin = () => {
    setView(isAdminLoggedIn ? 'admin_dashboard' : 'admin_login')
    window.scrollTo(0, 0)
  }

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id)
      return exists ? prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)) : [updatedProduct, ...prev]
    })
    setView('admin_dashboard')
  }

  const handleAddProduct = () => {
    setSelectedProduct({
      id: Date.now(),
      name: '',
      price: 0,
      sold: 0,
      location: 'Toko Online',
      rating: 5.0,
      images: [],
      description: '',
    })
    setView('admin_edit_product')
  }

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-md bg-gray-100 min-h-screen shadow-2xl relative overflow-x-hidden">
        {view === 'home' && (
          <HomeView
            products={products}
            storeSettings={storeSettings}
            categories={categories}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onProductClick={goToProduct}
            onStoreClick={goToStore}
          />
        )}

        {view === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            storeSettings={storeSettings}
            onBack={goToHome}
            onStoreClick={goToStore}
          />
        )}

        {view === 'store' && (
          <StoreView
            products={products}
            storeSettings={storeSettings}
            isAdmin={isAdminLoggedIn}
            onProductClick={goToProduct}
            onHomeClick={goToHome}
            onAdminClick={goToAdmin}
          />
        )}

        {view === 'admin_login' && (
          <AdminLoginView
            onLogin={() => {
              setIsAdminLoggedIn(true)
              setView('admin_dashboard')
            }}
            onBack={() => setView('store')}
          />
        )}

        {view === 'admin_dashboard' && (
          <AdminDashboardView
            products={products}
            onLogout={() => {
              setIsAdminLoggedIn(false)
              setView('store')
            }}
            onAddProduct={handleAddProduct}
            onEditProduct={(product) => {
              setSelectedProduct(product)
              setView('admin_edit_product')
            }}
            onNavigate={setView}
          />
        )}

        {view === 'admin_edit_product' && selectedProduct && (
          <AdminEditProductView
            product={selectedProduct}
            onSave={handleUpdateProduct}
            onCancel={() => setView('admin_dashboard')}
          />
        )}

        {view === 'admin_categories' && (
          <AdminCategoryView
            categories={categories}
            onSave={setCategories}
            onBack={() => setView('admin_dashboard')}
          />
        )}

        {view === 'admin_settings' && (
          <AdminSettingsView
            storeSettings={storeSettings}
            onSave={setStoreSettings}
            onBack={() => setView('admin_dashboard')}
          />
        )}
      </div>
    </div>
  )
}

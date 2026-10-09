import { useMemo, useState } from 'react'
import { PRODUCTS } from './data/products.js'
import { useCart } from './context/CartContext.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import NoticeBar from './components/NoticeBar.jsx'
import CategoryBar from './components/CategoryBar.jsx'
import ProductCard from './components/ProductCard.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Checkout from './components/Checkout.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const { toast } = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter((p) => {
      const catOk = category === 'all' || p.category === category
      if (!catOk) return false
      if (!q) return true
      return [p.name, p.nameEn, p.description, p.unitLabel].join(' ').toLowerCase().includes(q)
    })
  }, [query, category])

  return (
    <div className="min-h-screen pt-[132px] md:pt-[104px]">
      {/* 1. TOP NAVBAR — fixed: Logo, Name, Menu, Search, Cart */}
      <Header query={query} setQuery={setQuery} onOpenCheckout={() => setCheckoutOpen(true)} />

      {/* 2. HERO VIDEO SECTION — full-width unlimited loop, no overlay */}
      <Hero />

      {/* 3. NOTICE BAR — directly under hero video */}
      <NoticeBar />

      {/* 4. RESPONSIVE PRODUCT GRID — 2 mobile / 3 tablet / 4 desktop */}
      <main id="shop" className="mx-auto max-w-7xl scroll-mt-32 px-3 pt-6 sm:px-4 md:pt-8">
        <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">The Collection</p>
            <h2 className="bn font-display text-2xl text-emerald-ink md:text-3xl">খেজুর ও শুকনো ফল</h2>
          </div>
          <p className="text-sm text-ink/60">{filtered.length} products</p>
        </div>
        <CategoryBar active={category} setActive={setCategory} />
        {filtered.length === 0 ? (
          <p className="bn mt-8 rounded-3xl bg-white p-10 text-center text-ink/60">কোনো পণ্য পাওয়া যায়নি।</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <Checkout open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      {toast && (
        <div className="bn fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-emerald-ink px-5 py-2 text-sm text-gold-soft shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

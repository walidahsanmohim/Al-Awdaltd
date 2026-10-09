import { useMemo, useState } from 'react'
import { PRODUCTS } from './data/products.js'
import { CATEGORIES } from './data/store.js'
import { useCart } from './context/CartContext.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import FlashSale from './components/FlashSale.jsx'
import NoticeBar from './components/NoticeBar.jsx'
import CategoryBar from './components/CategoryBar.jsx'
import ProductCard from './components/ProductCard.jsx'
import Reviews from './components/Reviews.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Checkout from './components/Checkout.jsx'
import Footer from './components/Footer.jsx'

function matchesSearch(p, q) {
  const cat = CATEGORIES.find((c) => c.id === p.category)
  const priceStrings = p.variants.flatMap((v) => [String(v.price), v.label.toLowerCase()])
  const haystack = [p.name, p.nameEn, p.description, p.unitLabel, p.id, cat?.label, cat?.labelEn, cat?.id, ...priceStrings]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token))
}

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
      return matchesSearch(p, q)
    })
  }, [query, category])

  const counts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = { all: 0 }
    CATEGORIES.forEach((c) => {
      if (c.id !== 'all') out[c.id] = 0
    })
    PRODUCTS.forEach((p) => {
      if (q && !matchesSearch(p, q)) return
      out.all += 1
      if (out[p.category] != null) out[p.category] += 1
    })
    return out
  }, [query])

  const resetFilters = () => {
    setQuery('')
    setCategory('all')
  }
  const hasActiveFilter = query.trim() !== '' || category !== 'all'

  return (
    <div className="min-h-screen pt-[64px] md:pt-[104px]">
      {/* 1. TOP NAVBAR — fixed: Logo, Name, Menu, Cart */}
      <Header onOpenCheckout={() => setCheckoutOpen(true)} />

      {/* 2. HERO VIDEO SECTION — full-width unlimited loop, no overlay */}
      <Hero />

      {/* FLASH SALE — vibrant banner + countdown, right below hero */}
      <FlashSale />

      {/* 3. NOTICE BAR — under flash sale */}
      <NoticeBar />

      {/* 4. RESPONSIVE PRODUCT GRID — 2 mobile / 3 tablet / 4 desktop */}
      <main id="shop" className="mx-auto max-w-7xl scroll-mt-32 px-3 pt-6 sm:px-4 md:pt-8">
        <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">The Collection</p>
            <h2 className="bn font-display text-2xl text-emerald-ink md:text-3xl">খেজুর ও শুকনো ফল</h2>
          </div>
          <p className="text-sm text-ink/60" aria-live="polite">
            {query.trim() ? (
              <>
                “{query.trim()}” — {filtered.length}টি পণ্য পাওয়া গেছে
              </>
            ) : (
              <>{filtered.length} products</>
            )}
          </p>
        </div>
        <div className="relative mb-2">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-emerald-deep/40">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="পণ্যের নাম, ক্যাটাগরি বা দাম লিখে খুঁজুন… (যেমন: আজুয়া / dry / 1250)"
            aria-label="পণ্য খুঁজুন"
            className="bn w-full rounded-2xl border border-emerald-deep/15 bg-white py-3 pr-10 pl-11 text-sm text-ink shadow-sm outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-gold/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-1 text-lg leading-none text-ink/40 hover:text-ink"
            >
              ×
            </button>
          )}
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="bn mb-1 text-xs font-semibold text-emerald-mid underline-offset-2 hover:underline"
          >
            ✕ ফিল্টার রিসেট করুন
          </button>
        )}
        <CategoryBar active={category} setActive={setCategory} counts={counts} />
        {filtered.length === 0 ? (
          <div className="bn mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-lg font-semibold text-emerald-ink">কোনো পন্য পাওয়া যায়নি</p>
            {query.trim() && (
              <p className="mt-1 text-sm text-ink/60">
                “{query.trim()}” দিয়ে কিছু খুঁজে পাওয়া যায়নি। অন্য নাম, ক্যাটাগরি বা দাম লিখে চেষ্টা করুন।
              </p>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="bn mt-4 rounded-full bg-emerald-deep px-6 py-2.5 text-sm font-semibold text-gold-soft transition hover:opacity-90"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* CUSTOMER REVIEWS */}
      <Reviews />

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

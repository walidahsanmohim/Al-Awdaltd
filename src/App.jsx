import { useMemo, useState } from 'react'
import { PRODUCTS } from './data/products.js'
import { CATEGORIES, DATE_GROUPS } from './data/store.js'
import { useCart } from './context/CartContext.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import FlashSale from './components/FlashSale.jsx'
import NoticeBar from './components/NoticeBar.jsx'
import CategoryBar from './components/CategoryBar.jsx'
import ProductCard from './components/ProductCard.jsx'
import Gallery from './components/Gallery.jsx'
import Reviews from './components/Reviews.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Checkout from './components/Checkout.jsx'
import Footer from './components/Footer.jsx'
import AdminProofUpload from './components/AdminProofUpload.jsx'

// Browse-tab matching: 'dates' covers all date groups (vip/premium/carton).
function matchesCategory(p, category) {
  if (category === 'all') return true
  if (category === 'dates') return DATE_GROUPS.includes(p.category)
  return p.category === category
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

function toAsciiDigits(s) {
  return String(s).replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
}

function cleanNumberToken(raw) {
  return toAsciiDigits(raw)
    .replace(/[,\s৳]/g, '')
    .replace(/^(tk|bdt)+/i, '')
    .replace(/(tk|bdt)+$/i, '')
}

function parseBudget(raw) {
  const t = cleanNumberToken(raw)
  if (!/^\d+(\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) && n > 0 ? n : null
}

function cheapestPrice(p) {
  const prices = (p.variants || []).map((v) => Number(v.price)).filter(Number.isFinite)
  return prices.length ? Math.min(...prices) : Infinity
}

// Split tokens into numeric budget caps + text tokens.
// Explicit `price:1000` form is also accepted as a budget token.
function splitQuery(q) {
  const budgets = []
  const words = []
  q.split(/\s+/).filter(Boolean).forEach((tok) => {
    const m = toAsciiDigits(tok).match(/^price:([\d.,৳]+(?:\.\d+)?(?:tk|bdt)?)$/i)
    if (m) {
      const b = parseBudget(m[1])
      if (b != null) budgets.push(b)
      return
    }
    const b = parseBudget(tok)
    if (b != null) budgets.push(b)
    else words.push(tok)
  })
  return { budgets, words }
}

function matchesSearch(p, q) {
  const { budgets, words } = splitQuery(q)
  // A numeric token is a maximum-budget threshold: cheapest variant must fit.
  if (budgets.length && !(cheapestPrice(p) <= Math.min(...budgets))) return false
  if (!words.length) return true
  const cat = CATEGORIES.find((c) => c.id === p.category)
  const groupLabel = p.category === 'dry' ? 'ড্রাই ফ্রুটস dry fruits' : 'খেজুর dates'
  const priceStrings = p.variants.flatMap((v) => [String(v.price), v.label.toLowerCase()])
  const haystack = [p.name, p.nameEn, p.description, p.unitLabel, p.id, groupLabel, cat?.label, cat?.labelEn, cat?.id, ...priceStrings]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return words.every((token) => haystack.includes(token))
}

export default function App() {
  const { toast } = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [adminStage, setAdminStage] = useState('closed') // closed | auth | open

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter((p) => {
      if (!matchesCategory(p, category)) return false
      if (!q) return true
      return matchesSearch(p, q)
    })
  }, [query, category])

  const counts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = {}
    CATEGORIES.forEach((c) => {
      out[c.id] = 0
    })
    PRODUCTS.forEach((p) => {
      if (q && !matchesSearch(p, q)) return
      out.all += 1
      if (matchesCategory(p, 'dates')) out.dates += 1
      if (out[p.category] != null && p.category !== 'dates') out[p.category] += 1
    })
    return out
  }, [query])

  const resetFilters = () => {
    setQuery('')
    setCategory('all')
  }
  const hasActiveFilter = query.trim() !== '' || category !== 'all'

  const budgetCap = useMemo(() => {
    const { budgets } = splitQuery(query.trim().toLowerCase())
    return budgets.length ? Math.min(...budgets) : null
  }, [query])

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

      {/* 4. CATEGORY-FIRST BROWSING — big tap targets, then secondary search */}
      <main id="shop" className="mx-auto max-w-7xl scroll-mt-32 px-3 pt-6 sm:px-4 md:pt-8">
        <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold">The Collection</p>
            <h2 className="bn font-display text-2xl text-emerald-ink md:text-3xl">খেজুর ও শুকনো ফল</h2>
            <p className="bn mt-1 text-sm text-ink/60">৮ জাতের খেজুর · ৫ জাতের ড্রাই ফ্রুটস — ক্যাটাগরিতে ট্যাপ করেই বেছে নিন</p>
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
        <CategoryBar active={category} setActive={setCategory} counts={counts} />
        <details className="group mt-2">
          <summary className="bn inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-ink/50 hover:text-emerald-mid [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true">⌕</span> নাম বা বাজেট লিখে খুঁজুন (ঐচ্ছিক)
          </summary>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-emerald-deep/40">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="পণ্যের নাম বা বাজেট লিখে খুঁজুন (যেমন: আজুয়া / 1000)"
              aria-label="পণ্য খুঁজুন"
              className="bn w-full rounded-full border border-emerald-deep/20 bg-white py-3 pr-10 pl-11 text-sm text-ink shadow-[0_1px_10px_rgba(15,61,46,0.10)] transition outline-none placeholder:text-ink/40 focus:border-gold/60 focus:ring-2 focus:ring-gold/40 sm:text-[15px]"
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
            {budgetCap != null && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="bn mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-gold-soft"
              >
                ৳{budgetCap.toLocaleString('en-IN')} পর্যন্ত ×
              </button>
            )}
          </div>
        </details>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="bn mt-2 mb-1 text-xs font-semibold text-emerald-mid underline-offset-2 hover:underline"
          >
            ✕ ফিল্টার রিসেট করুন
          </button>
        )}
        {filtered.length === 0 ? (
          <div className="bn mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-lg font-semibold text-emerald-ink">কোনো পন্য পাওয়া যায়নি</p>
            {query.trim() ? (
              <p className="mt-1 text-sm text-ink/60">
                “{query.trim()}” দিয়ে কিছু খুঁজে পাওয়া যায়নি। অন্য নাম, বাজেট বা ক্যাটাগরি দিয়ে চেষ্টা করুন।
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink/60">এই ক্যাটাগরিতে কোনো পণ্য নেই। অন্য ক্যাটাগরি বেছে দেখুন।</p>
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
          <div id="shop-grid" className="mt-4 grid scroll-mt-32 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* CUSTOMER REVIEWS */}
      <Reviews />

      {/* HAPPY CUSTOMERS GALLERY */}
      <Gallery />

      <Footer onSecretTrigger={() => setAdminStage('auth')} />
      <AdminProofUpload stage={adminStage} setStage={setAdminStage} />
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

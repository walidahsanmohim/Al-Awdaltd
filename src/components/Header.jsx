import { STORE } from '../data/store.js'
import { useCart } from '../context/CartContext.jsx'
import { WHATSAPP_NUMBER } from '../utils/orderMessage.js'
import { CartIcon, PhoneIcon, WhatsAppIcon } from './Icons.jsx'

export default function Header({ onOpenCheckout }) {
  const { count, setOpen } = useCart()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gold/20 bg-[#0f3d2e]/95 text-cream backdrop-blur-md">
      <div className="hidden border-b border-white/10 bg-emerald-ink/80 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-gold-soft">
          <p className="bn flex items-center gap-2">
            <span>{STORE.locationBn}</span>
            <span className="text-white/30">•</span>
            <span>{STORE.email}</span>
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white"
            title="Chat on WhatsApp"
          >
            <PhoneIcon />
            {STORE.phoneDisplay}
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <a href="#home" className="flex min-w-0 items-center gap-3">
          <img
            src="/assets/logo.jpg"
            alt={STORE.name}
            className="h-11 w-11 shrink-0 rounded-full border border-gold/50 object-cover"
          />
          <span className="hidden min-w-0 sm:block">
            <span className="block font-display text-lg leading-tight whitespace-nowrap text-gold-soft">{STORE.name}</span>
            <span className="bn block truncate text-[11px] text-cream/70">{STORE.taglineBn}</span>
          </span>
        </a>
        <nav className="ml-2 hidden items-center gap-5 text-sm font-semibold text-cream/90 lg:flex" aria-label="Menu">
          <a href="#home" className="transition hover:text-gold-soft">
            Home
          </a>
          <a href="#shop" className="transition hover:text-gold-soft">
            Shop
          </a>
          <a href="#reviews" className="transition hover:text-gold-soft">
            Reviews
          </a>
          <a href="#gallery" className="transition hover:text-gold-soft">
            Gallery
          </a>
          <a href="#contact" className="transition hover:text-gold-soft">
            Contact
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-sm font-semibold text-white sm:flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={onOpenCheckout}
            className="hidden rounded-full border border-gold/40 px-3 py-2 text-sm text-gold-soft lg:inline"
          >
            Checkout
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-gold text-emerald-ink"
            aria-label="Open cart"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-cream px-1 text-[11px] font-bold text-emerald-ink">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

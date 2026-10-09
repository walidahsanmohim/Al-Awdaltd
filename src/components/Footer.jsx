import { STORE } from '../data/store.js'
import { WHATSAPP_NUMBER } from '../utils/orderMessage.js'
import { MapPinIcon, PhoneIcon, WhatsAppIcon } from './Icons.jsx'

export default function Footer() {
  return (
    <footer id="contact" className="pattern-bg mt-16 text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl text-gold-soft">{STORE.name}</h3>
          <p className="bn mt-2 text-cream/80">{STORE.taglineBn}</p>
          <p className="font-arabic mt-4 text-gold">الحمد لله</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <MapPinIcon /> {STORE.location}
          </p>
          <a className="flex items-center gap-2 hover:text-gold" href={`tel:+${STORE.phoneDigits}`}>
            <PhoneIcon /> {STORE.phoneDisplay}
          </a>
          <a className="flex items-center gap-2 hover:text-gold" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp order
          </a>
          <a className="block hover:text-gold" href={`mailto:${STORE.email}`}>
            {STORE.email}
          </a>
          <a className="block hover:text-gold" href={STORE.facebook} target="_blank" rel="noreferrer">
            Facebook page
          </a>
        </div>
        <div className="text-sm text-cream/80">
          <p className="font-semibold text-gold-soft">Shipping</p>
          <p className="mt-2">Inside Chattogram City: ৳60 first KG, then ৳20 / KG.</p>
          <p>Rest of Bangladesh: ৳150 first KG, then ৳20 / KG.</p>
          <p className="mt-2">Weights under 1 KG bill as 1 KG. Grams (500g) count as 0.5 KG.</p>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} {STORE.name}. All rights reserved.
      </p>
    </footer>
  )
}

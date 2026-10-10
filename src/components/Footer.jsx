import { useRef } from 'react'
import { STORE } from '../data/store.js'
import { WHATSAPP_NUMBER } from '../utils/orderMessage.js'
import { MapPinIcon, PhoneIcon, WhatsAppIcon, MailIcon, FacebookIcon } from './Icons.jsx'

// Reusable pill badge for contact links.
const pill =
  'group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-cream/90 transition hover:border-gold/60 hover:bg-white/10 hover:text-gold-soft md:justify-start'

export default function Footer({ onSecretTrigger }) {
  // Hidden admin trigger: 3 quick clicks on the copyright text.
  const clickCount = useRef(0)
  const clickTimer = useRef(null)

  const handleSecretClick = () => {
    clickCount.current += 1
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, 800)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      clearTimeout(clickTimer.current)
      onSecretTrigger?.()
    }
  }

  return (
    <footer id="contact" className="pattern-bg mt-16 text-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 text-center md:grid-cols-3 md:gap-10 md:py-14 md:text-left">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <img
            src="/assets/logo.jpg"
            alt={STORE.name}
            className="h-14 w-14 rounded-full border-2 border-gold/50 object-cover shadow-lg"
          />
          <h3 className="font-display text-2xl text-gold-soft">{STORE.name}</h3>
          <p className="bn text-sm text-cream/80">{STORE.taglineBn}</p>
          <p className="bn flex items-center gap-2 text-xs text-cream/60">
            <MapPinIcon className="h-4 w-4 text-gold" /> {STORE.locationBn}
          </p>
          <p className="font-arabic text-gold">الحمد لله</p>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <p className="bn text-sm font-bold tracking-wide text-gold-soft uppercase">যোগাযোগ</p>
          <div className="flex flex-col items-center gap-2.5 md:items-start">
            <a href={`tel:+${STORE.phoneDigits}`} className={pill}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span className="bn">কল করুন: {STORE.phoneDisplay}</span>
            </a>
            <a href={`mailto:${STORE.email}`} className={pill}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
                <MailIcon className="h-4 w-4" />
              </span>
              <span className="truncate">{STORE.email}</span>
            </a>
          </div>
        </div>

        {/* Social / Order */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <p className="bn text-sm font-bold tracking-wide text-gold-soft uppercase">সোশ্যাল ও অর্ডার</p>
          <div className="flex flex-col items-center gap-2.5 md:items-start">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 md:justify-start"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <span className="bn hidden sm:inline">হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন</span>
              <span className="bn sm:hidden">WhatsApp অর্ডার</span>
            </a>
            <a
              href={STORE.facebook}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 md:justify-start"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
                <FacebookIcon className="h-4 w-4" />
              </span>
              <span className="bn hidden sm:inline">আমাদের অফিশিয়াল ফেসবুক পেজ</span>
              <span className="bn sm:hidden">Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <p
        onClick={handleSecretClick}
        className="cursor-default border-t border-white/10 py-4 text-center text-xs text-cream/60 select-none"
        title=""
      >
        © {new Date().getFullYear()} {STORE.name}. All rights reserved.
      </p>
    </footer>
  )
}

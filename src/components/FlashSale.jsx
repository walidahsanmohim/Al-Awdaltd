import { useEffect, useState } from 'react'

const STORAGE_KEY = 'al-awda-flash-end'
// Initial urgency window matching the 05h : 23m : 45s style countdown.
const INITIAL_MS = (5 * 3600 + 23 * 60 + 45) * 1000
const RESET_MS = 12 * 3600 * 1000

function loadEnd() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    if (saved && saved > Date.now()) return saved
  } catch {
    /* storage unavailable */
  }
  const end = Date.now() + INITIAL_MS
  try {
    localStorage.setItem(STORAGE_KEY, String(end))
  } catch {
    /* ignore */
  }
  return end
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function FlashSale() {
  const [end, setEnd] = useState(loadEnd)
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  let remaining = end - now
  if (remaining <= 0) {
    remaining = 0
  }

  useEffect(() => {
    if (end - Date.now() <= 0) {
      const next = Date.now() + RESET_MS
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore */
      }
      setEnd(next)
    }
  }, [now, end])

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)

  const cells = [
    { value: pad(h), label: 'ঘণ্টা' },
    { value: pad(m), label: 'মিনিট' },
    { value: pad(s), label: 'সেকেন্ড' },
  ]

  return (
    <section aria-label="Flash sale" className="w-full bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">
            ⚡
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-300" />
            </span>
          </span>
          <div>
            <p className="font-display text-xl leading-tight font-bold md:text-2xl">
              Flash Sale <span className="bn">/ ৫০% পর্যন্ত ছাড়</span>
            </p>
            <p className="bn text-sm text-white/85">আজুয়া, মেজদুলসহ বাছাইকৃত পণ্যে সীমিত সময়ের অফার!</p>
          </div>
        </div>

        <div className="flex items-center gap-2" role="timer" aria-live="off" aria-label={`${h} ঘণ্টা ${m} মিনিট ${s} সেকেন্ড বাকি`}>
          {cells.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2">
              <div className="min-w-14 rounded-xl bg-black/30 px-2 py-1.5 backdrop-blur">
                <p className="text-xl font-bold tabular-nums md:text-2xl">{c.value}</p>
                <p className="bn text-[11px] text-white/80">{c.label}</p>
              </div>
              {i < cells.length - 1 && <span className="text-xl font-bold">:</span>}
            </div>
          ))}
        </div>

        <a
          href="#shop"
          className="bn shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-red-700 shadow-lg transition hover:scale-105 hover:bg-yellow-100"
        >
          এখনই কিনুন
        </a>
      </div>
    </section>
  )
}

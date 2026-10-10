import { useCallback, useEffect, useRef, useState } from 'react'

const HERO_SHOP_PRESETS = {
  // Calibrated by owner via ?calibrate=hero — center of baked-in SHOP NOW box.
  base: { x: 49.82, y: 75.38, w: 19, h: 10 }, // mobile
  md: { x: 49.82, y: 74.65, w: 22, h: 8 }, // ipad/tab (768–1023px)
  lg: { x: 49.92, y: 81.83, w: 19, h: 10 }, // laptop/desktop (1024px+)
}

function presetStyle(p) {
  return {
    left: `${p.x}%`,
    top: `${p.y}%`,
    width: `${p.w}%`,
    height: `${p.h}%`,
    transform: 'translate(-50%, -50%)',
  }
}

function CalBox({ cal, setCal, pct, onClose }) {
  const move = (dx, dy) => setCal((c) => ({ ...c, x: +(c.x + dx).toFixed(2), y: +(c.y + dy).toFixed(2) }))
  const size = (dw, dh) =>
    setCal((c) => ({ ...c, w: Math.max(1, +(c.w + dw).toFixed(2)), h: Math.max(1, +(c.h + dh).toFixed(2)) }))

  return (
    <div className="absolute inset-0 z-10">
      <div
        className="absolute cursor-move touch-none border-2 border-dashed border-cyan-300 bg-cyan-300/15"
        style={presetStyle(cal)}
        onPointerDown={(e) => {
          e.preventDefault()
          const sx = e.clientX
          const sy = e.clientY
          const start = { ...cal }
          const resizing = e.shiftKey
          const mv = (ev) => {
            const a = pct(sx, sy)
            const b = pct(ev.clientX, ev.clientY)
            if (!a || !b) return
            if (resizing) size((b.x - a.x) * 2, (b.y - a.y) * 2)
            else setCal({ ...start, x: +(start.x + (b.x - a.x)).toFixed(2), y: +(start.y + (b.y - a.y)).toFixed(2) })
          }
          const up = () => {
            window.removeEventListener('pointermove', mv)
            window.removeEventListener('pointerup', up)
          }
          window.addEventListener('pointermove', mv)
          window.addEventListener('pointerup', up)
        }}
        title="Drag to move · Shift+drag to resize"
      >
        <span className="absolute -top-6 left-0 rounded bg-black/80 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-cyan-200">
          x{cal.x} y{cal.y} w{cal.w} h{cal.h}
        </span>
      </div>
      <div className="absolute top-2 right-2 flex gap-1.5">
        <button type="button" onClick={() => move(-0.5, 0)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">←</button>
        <button type="button" onClick={() => move(0.5, 0)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">→</button>
        <button type="button" onClick={() => move(0, -0.5)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">↑</button>
        <button type="button" onClick={() => move(0, 0.5)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">↓</button>
        <button type="button" onClick={() => size(-1, 0)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">W−</button>
        <button type="button" onClick={() => size(1, 0)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">W+</button>
        <button type="button" onClick={() => size(0, -1)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">H−</button>
        <button type="button" onClick={() => size(0, 1)} className="rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">H+</button>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(`{ x: ${cal.x}, y: ${cal.y}, w: ${cal.w}, h: ${cal.h} }`).catch(() => {})}
          className="rounded bg-cyan-300 px-2 py-1 text-[11px] font-bold text-black"
        >
          Copy
        </button>
        <button type="button" onClick={onClose} className="rounded bg-red-600 px-2 py-1 text-[11px] font-bold text-white">
          Done
        </button>
      </div>
      <p className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 text-[11px] text-white">
        Drag dashed box exactly onto SHOP NOW · Shift+drag resizes · Copy → send me the numbers
      </p>
    </div>
  )
}

function Hero() {
  const sectionRef = useRef(null)
  const [cal, setCal] = useState(null)

  useEffect(() => {
    const has = new URLSearchParams(window.location.search).has('calibrate')
    if (has) setCal({ ...HERO_SHOP_PRESETS.base })
    let presses = 0
    let timer = null
    const onKey = (e) => {
      if (e.key.toLowerCase() !== 'c' || e.target.matches('input, textarea')) return
      presses += 1
      clearTimeout(timer)
      timer = setTimeout(() => (presses = 0), 800)
      if (presses >= 3) {
        presses = 0
        setCal((c) => (c ? null : { ...HERO_SHOP_PRESETS.base }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(timer)
    }
  }, [])

  const scrollToShop = (e) => {
    e.preventDefault()
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  const pct = useCallback((cx, cy) => {
    const r = sectionRef.current?.getBoundingClientRect()
    if (!r) return null
    return { x: ((cx - r.left) / r.width) * 100, y: ((cy - r.top) / r.height) * 100 }
  }, [])

  return (
    <section ref={sectionRef} id="home" className="relative w-full w-screen max-w-none overflow-hidden bg-black">
      <video
        className="pointer-events-none block aspect-video h-auto w-full w-screen max-w-none object-contain select-none md:aspect-auto md:h-[500px] md:object-cover lg:h-[600px]"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/assets/mejdhool.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
        <source src="/assets/hero-banner.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0">
        <a
          href="#shop"
          onClick={scrollToShop}
          aria-label="Shop now — browse products"
          className="pointer-events-auto absolute block cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-white md:hidden"
          style={presetStyle(HERO_SHOP_PRESETS.base)}
        >
          <span className="sr-only">Shop Now</span>
        </a>
        <a
          href="#shop"
          onClick={scrollToShop}
          aria-label="Shop now — browse products"
          className="pointer-events-auto absolute hidden cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-white md:block lg:hidden"
          style={presetStyle(HERO_SHOP_PRESETS.md)}
        >
          <span className="sr-only">Shop Now</span>
        </a>
        <a
          href="#shop"
          onClick={scrollToShop}
          aria-label="Shop now — browse products"
          className="pointer-events-auto absolute hidden cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-white lg:block"
          style={presetStyle(HERO_SHOP_PRESETS.lg)}
        >
          <span className="sr-only">Shop Now</span>
        </a>
      </div>
      {cal && (
        <CalBox cal={cal} setCal={setCal} pct={pct} onClose={() => setCal(null)} />
      )}
    </section>
  )
}

export default Hero

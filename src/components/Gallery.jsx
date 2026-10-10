import { useState } from 'react'
import { useProofRows } from '../utils/supabase.js'
import { GALLERY_PROOFS, TAG_STYLES } from '../data/galleryProofs.js'

// Polaroid collage presets — slight rotations + varied aspect ratios.
const ROTATIONS = ['-rotate-2', 'rotate-[1.6deg]', '-rotate-1', 'rotate-[2.2deg]', '-rotate-[1.6deg]', 'rotate-1']
const RATIOS = ['aspect-[4/5]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]']

/**
 * Gallery — "Happy Customers & Delivery Proofs".
 * Image source (highest priority first):
 *   1. Supabase → Reviews table, type = 'proof'   (admin uploads, instant)
 *   2. Local    → GALLERY_PROOFS array            (fallback while DB is being set up)
 */
export default function Gallery() {
  const { proofs, configured, refresh } = useProofRows()
  const [lightbox, setLightbox] = useState(null)
  const [failed, setFailed] = useState({})
  const [mode, setMode] = useState('auto') // auto | local | supa

  const localTiles = GALLERY_PROOFS.filter((t) => t?.src && !failed[t.id])
  const supaTiles = (proofs || [])
    .map((p, i) => ({
      id: `supa-${i}-${p.id || p.name}`,
      src: p.image_url,
      tag: 'ডেলিভারি প্রুফ',
      title: p.name || 'Unnamed proof',
      quote: p.comment || '',
    }))
    .filter((t) => t.src)

  let tiles
  if (mode === 'local') tiles = localTiles
  else if (mode === 'supa') tiles = supaTiles
  else tiles = configured ? supaTiles : localTiles

  return (
    <section id="gallery" className="mx-auto max-w-7xl scroll-mt-32 px-3 pt-10 sm:px-4 md:pt-14">
      <div className="mb-5 text-center md:mb-7">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Trust & Proofs</p>
        <h2 className="bn font-display text-2xl text-emerald-ink md:text-3xl">Happy Customers & Delivery Proofs</h2>
        <p className="bn mx-auto mt-1.5 max-w-xl text-sm text-ink/60">
          আসল কাস্টমার চ্যাট, ডেলিভারি প্রমাণ ও পণ্যের ছবি — কেনার আগে নিশ্চিন্ত হোন।
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-ink px-3 py-1 text-gold-soft">✓ ১০০% অরিজিনাল পণ্য</span>
          <span className="rounded-full bg-emerald-ink px-3 py-1 text-gold-soft">✓ ক্যাশ অন ডেলিভারি</span>
          <span className="rounded-full bg-emerald-ink px-3 py-1 text-gold-soft">✓ সারাদেশে হোম ডেলিভারি</span>
        </div>
      </div>

      {tiles.length === 0 ? (
        <div className="bn rounded-3xl border border-dashed border-gold/50 bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">📸</p>
          <p className="mt-2 font-semibold text-emerald-ink">সন্তুষ্ট কাস্টমারদের প্রমাণ শীঘ্রই যোগ হবে</p>
          <p className="mt-1 text-sm text-ink/60">আমাদের অর্ডার ও ডেলিভারির আসল প্রমাণ এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream-deep via-cream to-gold-soft/40 p-4 shadow-inner ring-1 ring-gold/20 sm:p-6">
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-7">
            {tiles.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLightbox(t)}
                className={`group relative block w-full cursor-zoom-in break-inside-avoid rounded-md bg-white p-2.5 pb-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-transform duration-300 select-none hover:z-10 hover:rotate-0 hover:scale-[1.04] hover:shadow-[0_22px_45px_rgba(0,0,0,0.28)] focus-visible:z-10 focus-visible:rotate-0 focus-visible:outline-none ${ROTATIONS[i % ROTATIONS.length]}`}
              >
                <span className="relative block">
                  <img
                    src={t.src}
                    alt={t.title}
                    loading="lazy"
                    onError={() => setFailed((f) => (f[t.id] ? f : { ...f, [t.id]: true }))}
                    className={`w-full ${RATIOS[i % RATIOS.length]} object-cover rounded-sm ring-1 ring-black/5`}
                  />
                  {/* scrapbook tape */}
                  <span aria-hidden="true" className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-gold/30 shadow-sm" />
                </span>
                <span className="mt-3 block px-1 text-center">
                  <span className="bn block text-sm font-bold text-emerald-ink">{t.title}</span>
                  {t.quote ? <span className="bn mt-1 line-clamp-2 block text-[11px] leading-snug text-ink/60">{t.quote}</span> : null}
                  <span className={`bn mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${TAG_STYLES[t.tag] || 'bg-black/60'}`}>{t.tag}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30"
          >
            ✕
          </button>
          <figure
            className="max-h-[88vh] w-full max-w-3xl"
            style={{ animation: 'galleryPop 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="max-h-[74vh] w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/20"
            />
            <figcaption className="bn mt-4 text-center">
              <span className="block text-lg font-bold text-gold-soft">{lightbox.title}</span>
              {lightbox.quote ? <span className="mt-1 block text-sm text-white/80">{lightbox.quote}</span> : null}
              {lightbox.tag ? (
                <span className={`bn mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${TAG_STYLES[lightbox.tag] || 'bg-black/60'}`}>
                  {lightbox.tag}
                </span>
              ) : null}
            </figcaption>
          </figure>
        </div>
      )}
      <style>{`
        @keyframes galleryPop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </section>
  )
}

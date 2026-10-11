import { useState } from 'react'
import { useProofRows } from '../utils/supabase.js'
import { GALLERY_PROOFS, TAG_STYLES } from '../data/galleryProofs.js'

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
        <div className="rounded-3xl border border-gold/20 bg-white/70 p-3 shadow-sm ring-1 ring-black/5 sm:p-4">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
            {tiles.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLightbox(t)}
                aria-label={t.title}
                className="group relative block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <img
                  src={t.src}
                  alt={t.title}
                  loading="lazy"
                  onError={() => setFailed((f) => (f[t.id] ? f : { ...f, [t.id]: true }))}
                  className="h-24 w-full object-cover sm:h-32"
                />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className={`bn pointer-events-none absolute bottom-1.5 left-1.5 max-w-[92%] truncate rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${TAG_STYLES[t.tag] || 'bg-black/60'}`}>
                  {t.tag}
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

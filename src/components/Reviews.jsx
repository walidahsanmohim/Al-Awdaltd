import { useCallback, useEffect, useState } from 'react'
import { supabase, REVIEWS_TABLE, mapReviewRow, isPublicReview, uploadReviewImage } from '../utils/supabase.js'

export function usePublicPhotoReviews() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase
      .from(REVIEWS_TABLE)
      .select('id, Name, Rating, Comment, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(30)
    const mapped = (Array.isArray(data) ? data.map(mapReviewRow).filter(Boolean) : []).filter(
      (r) => isPublicReview(r) && r.image_url,
    )
    setPhotos(mapped)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPhotos()
    const channel = supabase
      .channel('gallery-photos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: REVIEWS_TABLE }, (payload) => {
        const mapped = mapReviewRow(payload?.new)
        if (mapped && isPublicReview(mapped) && mapped.image_url) {
          setPhotos((prev) => (prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev].slice(0, 30)))
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPhotos])

  return { photos, loading, refresh: fetchPhotos }
}

const SEEDS = [
  { id: 's1', name: 'রহিম উদ্দিন', rating: 5, created_at: '2026-10-05T10:00:00.000Z', comment: 'মেজদুল খেজুরটা অসাধারণ! নরম, মিষ্টি আর প্যাকেজিং খুব ভালো। চট্টগ্রামে একদিনেই ডেলিভারি পেয়েছি।' },
  { id: 's2', name: 'ফাতেমা বেগম', rating: 5, created_at: '2026-10-02T10:00:00.000Z', comment: 'আজুয়া খেজুর ১০০% অরিজিনাল। দাম অনুযায়ী কোয়ালিটি চমৎকার, আবার অর্ডার করব ইনশাআল্লাহ।' },
  { id: 's3', name: 'করিম শেখ', rating: 4, created_at: '2026-09-28T10:00:00.000Z', comment: 'কাজুবাদাম তাজা ও মচমচে ছিল। পণ্য ভালো, ডেলিভারিও সময়মতো পেয়েছি।' },
]

function StarRow({ v, pick, big }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" aria-label={`${n} star`} disabled={!pick} onClick={() => pick?.(n)}
          className={`${big ? 'text-2xl' : 'text-base'} leading-none ${n <= v ? 'text-amber-500' : 'text-gray-300'} ${pick ? 'cursor-pointer hover:scale-125 transition' : ''}`}>
          ★
        </button>
      ))}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function Reviews() {
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const [sending, setSending] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  const pickPhoto = (file) => {
    if (!file) {
      setPhoto(null)
      setPhotoPreview('')
      return
    }
    setPhoto(file)
    try {
      const url = URL.createObjectURL(file)
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    } catch {
      setPhotoPreview('')
    }
  }

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from(REVIEWS_TABLE)
      .select('id, Name, Rating, Comment, image_url, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      setLoadError('রিভিউ লোড করা যায়নি। পরে আবার চেষ্টা করুন।')
    } else {
      setRemote(Array.isArray(data) ? data.map(mapReviewRow).filter(Boolean) : [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReviews()
    // Real-time: any visitor's new review appears instantly for everyone.
    const channel = supabase
      .channel('public-reviews')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: REVIEWS_TABLE }, (payload) => {
        const mapped = mapReviewRow(payload?.new)
        if (mapped && isPublicReview(mapped))
          setRemote((prev) => (prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev]))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReviews])

  const all = [...remote, ...SEEDS].filter(isPublicReview)
  const avg = all.length ? (all.reduce((s, r) => s + Number(r.rating || 0), 0) / all.length).toFixed(1) : '0.0'

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setErr('আপনার নাম লিখুন।')
    if (!rating) return setErr('১ থেকে ৫ স্টার রেটিং দিন।')
    if (!text.trim()) return setErr('আপনার মতামত লিখুন।')
    if (sending) return
    setSending(true)
    setErr('')
    try {
      const image_url = await uploadReviewImage(photo)
      const { data, error } = await supabase
        .from(REVIEWS_TABLE)
        .insert({ Name: name.trim(), Rating: rating, Comment: text.trim(), image_url })
        .select('id, Name, Rating, Comment, image_url, created_at')
        .single()
      if (error) throw new Error(error.message || 'insert failed')
      // Immediately refresh the list (realtime subscription also prepends it).
      const mapped = mapReviewRow(data)
      if (mapped) {
        setRemote((prev) => (prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev]))
      } else {
        fetchReviews()
      }
      setName('')
      setRating(0)
      setText('')
      pickPhoto(null)
      if (Number(rating) >= 4) {
        setOk(true)
        setTimeout(() => setOk(false), 4000)
      } else {
        setOk(false)
        setErr('')
      }
    } catch (err) {
      setErr(err?.message || 'রিভিউ জমা দেওয়া যায়নি। আবার চেষ্টা করুন।')
    } finally {
      setSending(false)
    }
  }

  const input = 'bn w-full rounded-xl border border-emerald-deep/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-gold/50'

  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-32 px-3 pt-10 sm:px-4 md:pt-14">
      <div className="mb-4 text-center md:mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Testimonials</p>
        <h2 className="bn font-display text-2xl text-emerald-ink md:text-3xl">কাস্টমার রিভিউ ও মতামত</h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <StarRow v={Math.round(avg)} />
          <p className="text-sm text-ink/60">{avg} / 5 · {all.length}টি রিভিউ</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          {loading && (
            <div className="space-y-3" aria-live="polite" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-emerald-deep/10 bg-white p-4 shadow-sm">
                  <div className="h-4 w-1/3 rounded bg-cream-deep" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-cream-deep" />
                  <div className="mt-2 h-3 w-full rounded bg-cream-deep" />
                </div>
              ))}
              <p className="bn text-center text-sm text-ink/50">রিভিউ লোড হচ্ছে…</p>
            </div>
          )}
          {!loading && loadError && (
            <div className="bn rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
              <p>{loadError}</p>
              <button type="button" onClick={fetchReviews} className="mt-2 rounded-full bg-red-700 px-4 py-1.5 font-semibold text-white">
                আবার চেষ্টা করুন
              </button>
            </div>
          )}
          {!loading &&
            all.map((r) => (
              <article key={r.id} className="overflow-hidden rounded-2xl border border-emerald-deep/10 bg-white shadow-sm">
                {r.image_url && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ src: r.image_url, name: r.name })}
                    className="block w-full cursor-zoom-in"
                    aria-label={`${r.name}-এর ছবি বড় করে দেখুন`}
                  >
                    <img
                      src={r.image_url}
                      alt={`${r.name}-এর পণ্যের ছবি`}
                      loading="lazy"
                      className="h-44 w-full object-cover transition hover:opacity-95 sm:h-52"
                    />
                  </button>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="bn font-semibold text-emerald-ink">{r.name}</p>
                      <p className="text-xs text-ink/50">{formatDate(r.created_at)}</p>
                    </div>
                    <StarRow v={Number(r.rating) || 0} />
                  </div>
                  <p className="bn mt-2 text-sm text-ink/75">{r.comment}</p>
                </div>
              </article>
            ))}
          {!loading && all.length === 0 && (
            <p className="bn rounded-2xl bg-white p-6 text-center text-ink/60">এখনো কোনো রিভিউ নেই — প্রথম রিভিউটি আপনিই দিন!</p>
          )}
        </div>
        <div className="h-fit rounded-3xl border border-gold/40 bg-white p-5 shadow-md md:sticky md:top-32 md:p-6">
          <h3 className="bn font-display text-xl text-emerald-ink">Add Your Review</h3>
          <p className="bn mt-1 text-sm text-ink/60">আপনার অভিজ্ঞতা শেয়ার করুন — এটি অন্যদের সাহায্য করবে।</p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="bn mb-1 block font-medium text-emerald-ink">আপনার নাম *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: আব্দুল্লাহ" className={input} />
            </label>
            <div>
              <span className="bn mb-1 block text-sm font-medium text-emerald-ink">স্টার রেটিং * (১-৫)</span>
              <StarRow v={rating} pick={setRating} big />
            </div>
            <label className="block text-sm">
              <span className="bn mb-1 block font-medium text-emerald-ink">মতামত / ফিডব্যাক *</span>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="পণ্যের মান, ডেলিভারি, সার্ভিস সম্পর্কে লিখুন…" rows={4} className={input} />
            </label>
            <div className="text-sm">
              <span className="bn mb-1 block font-medium text-emerald-ink">পণ্যের ছবি (ঐচ্ছিক)</span>
              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-center transition ${
                  photo ? 'border-emerald-mid/50 bg-emerald-ink/5' : 'border-emerald-deep/20 bg-cream hover:border-gold'
                }`}
              >
                <span aria-hidden="true" className="text-xl">📷</span>
                <span className="bn text-xs text-ink/70">
                  {photo ? photo.name : 'খেজুর/ড্রাই ফ্রুটসের ছবি যোগ করুন (JPG/PNG, সর্বোচ্চ ৫MB)'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => pickPhoto(e.target.files?.[0] || null)}
                />
              </label>
              {photoPreview && (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-emerald-deep/15">
                  <img src={photoPreview} alt="আপলোড প্রিভিউ" className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => pickPhoto(null)}
                    aria-label="ছবি সরান"
                    className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            {err && <p className="bn text-sm text-red-700">{err}</p>}
            {ok && (
              <div className="bn rounded-xl bg-emerald-ink/5 p-3 text-center">
                <p className="text-sm font-semibold text-emerald-mid">ধন্যবাদ! আপনার রিভিউ যোগ হয়েছে।</p>
                <p className="mt-0.5 text-xs text-ink/60">৪★/৫★ রিভিউ সঙ্গে সঙ্গে সবার কাছে দেখা যাবে।</p>
              </div>
            )}
            <button type="submit" disabled={sending}
              className="bn w-full rounded-full bg-emerald-deep py-3 text-sm font-semibold text-gold-soft transition hover:opacity-90 disabled:opacity-60">
              {sending ? 'জমা হচ্ছে…' : 'রিভিউ জমা দিন'}
            </button>
          </form>
        </div>
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.name}-এর ছবি`}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="বন্ধ করুন"
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl text-white hover:bg-white/30"
          >
            ✕
          </button>
          <figure className="max-h-[88vh] w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={`${lightbox.name}-এর পণ্যের ছবি`} className="max-h-[76vh] w-full rounded-2xl object-contain" />
            <figcaption className="bn mt-3 text-center text-sm text-white/85">
              {lightbox.name} · Al-Awda ltd হ্যাপি কাস্টমার
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { supabase, REVIEWS_TABLE, mapReviewRow } from '../utils/supabase.js'

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
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from(REVIEWS_TABLE)
      .select('id, Name, Rating, Comment, created_at')
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
        if (mapped) setRemote((prev) => (prev.some((r) => r.id === mapped.id) ? prev : [mapped, ...prev]))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReviews])

  const all = [...remote, ...SEEDS]
  const avg = all.length ? (all.reduce((s, r) => s + Number(r.rating || 0), 0) / all.length).toFixed(1) : '0.0'

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setErr('আপনার নাম লিখুন।')
    if (!rating) return setErr('১ থেকে ৫ স্টার রেটিং দিন।')
    if (!text.trim()) return setErr('আপনার মতামত লিখুন।')
    if (sending) return
    setSending(true)
    setErr('')
    const { data, error } = await supabase
      .from(REVIEWS_TABLE)
      .insert({ Name: name.trim(), Rating: rating, Comment: text.trim() })
      .select('id, Name, Rating, Comment, created_at')
      .single()
    setSending(false)
    if (error) {
      setErr('রিভিউ জমা দেওয়া যায়নি। আবার চেষ্টা করুন।')
      return
    }
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
    setOk(true)
    setTimeout(() => setOk(false), 3000)
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
              <article key={r.id} className="rounded-2xl border border-emerald-deep/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="bn font-semibold text-emerald-ink">{r.name}</p>
                    <p className="text-xs text-ink/50">{formatDate(r.created_at)}</p>
                  </div>
                  <StarRow v={Number(r.rating) || 0} />
                </div>
                <p className="bn mt-2 text-sm text-ink/75">{r.comment}</p>
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
            {err && <p className="bn text-sm text-red-700">{err}</p>}
            {ok && <p className="bn text-sm font-semibold text-emerald-mid">ধন্যবাদ! আপনার রিভিউ যোগ হয়েছে।</p>}
            <button type="submit" disabled={sending}
              className="bn w-full rounded-full bg-emerald-deep py-3 text-sm font-semibold text-gold-soft transition hover:opacity-90 disabled:opacity-60">
              {sending ? 'জমা হচ্ছে…' : 'রিভিউ জমা দিন'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

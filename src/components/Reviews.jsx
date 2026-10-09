import { useEffect, useState } from 'react'

const KEY = 'al-awda-reviews-v1'

const SEEDS = [
  { id: 's1', name: 'রহিম উদ্দিন', rating: 5, date: '৫ অক্টোবর, ২০২৬', mine: false, comment: 'মেজদুল খেজুরটা অসাধারণ! নরম, মিষ্টি আর প্যাকেজিং খুব ভালো। চট্টগ্রামে একদিনেই ডেলিভারি পেয়েছি।' },
  { id: 's2', name: 'ফাতেমা বেগম', rating: 5, date: '২ অক্টোবর, ২০২৬', mine: false, comment: 'আজুয়া খেজুর ১০০% অরিজিনাল। দাম অনুযায়ী কোয়ালিটি চমৎকার, আবার অর্ডার করব ইনশাআল্লাহ।' },
  { id: 's3', name: 'করিম শেখ', rating: 4, date: '২৮ সেপ্টেম্বর, ২০২৬', mine: false, comment: 'কাজুবাদাম তাজা ও মচমচে ছিল। পণ্য ভালো, ডেলিভারিও সময়মতো পেয়েছি।' },
]

function loadMine() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

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

export default function Reviews() {
  const [mine, setMine] = useState(loadMine)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(mine))
    } catch { /* ignore */ }
  }, [mine])

  const all = [...mine, ...SEEDS]
  const avg = (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return setErr('আপনার নাম লিখুন।')
    if (!rating) return setErr('১ থেকে ৫ স্টার রেটিং দিন।')
    if (!text.trim()) return setErr('আপনার মতামত লিখুন।')
    setMine((p) => [{ id: `u${Date.now()}`, name: name.trim(), rating, comment: text.trim(), date: 'এইমাত্র', mine: true }, ...p])
    setName('')
    setRating(0)
    setText('')
    setErr('')
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
          {all.map((r) => (
            <article key={r.id} className="rounded-2xl border border-emerald-deep/10 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="bn font-semibold text-emerald-ink">{r.name}</p>
                  <p className="text-xs text-ink/50">{r.date}</p>
                </div>
                <StarRow v={r.rating} />
              </div>
              <p className="bn mt-2 text-sm text-ink/75">{r.comment}</p>
              {r.mine && (
                <button type="button" onClick={() => setMine((p) => p.filter((x) => x.id !== r.id))}
                  className="mt-2 text-xs text-red-700 hover:underline">মুছুন</button>
              )}
            </article>
          ))}
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
            <button type="submit"
              className="bn w-full rounded-full bg-emerald-deep py-3 text-sm font-semibold text-gold-soft transition hover:opacity-90">
              রিভিউ জমা দিন
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

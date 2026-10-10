import { useState } from 'react'
import { supabase, uploadReviewImage } from '../utils/supabase.js'

// Dual-credential gate for the hidden admin proof-upload panel.
const ADMIN_PASSWORD = '@wd@_limited9939'
const ADMIN_CODE = '544221'

const inputCls =
  'bn w-full rounded-xl border-0 bg-cream px-3 py-2.5 text-sm text-emerald-ink placeholder:text-ink/40 outline-none focus:ring-2 focus:ring-emerald-deep/30'

/**
 * AdminProofUpload — hidden, dual-credential-gated admin panel.
 * stage: 'closed' | 'auth' | 'open'
 *   closed -> renders nothing
 *   auth   -> password + secret-code prompt
 *   open   -> a minimal delivery-proof upload form (image + optional note)
 */
export default function AdminProofUpload({ stage, setStage }) {
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [authError, setAuthError] = useState('')

  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  if (stage === 'closed') return null

  const close = () => {
    setStage('closed')
    setAuthError('')
    setPassword('')
    setCode('')
  }

  const submitAuth = (e) => {
    e.preventDefault()
    if (password !== ADMIN_PASSWORD || code !== ADMIN_CODE) {
      setAuthError('Incorrect password or secret code.')
      return
    }
    setAuthError('')
    setStage('open')
  }

  const pick = (f) => {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : '')
    setError('')
    setOk(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setOk(false)
    if (!file) return setError('Select a proof image.')
    setSending(true)
    try {
      const url = await uploadReviewImage(file)
      const { error: insErr } = await supabase.from('Reviews').insert({
        Name: 'Delivery Proof',
        Rating: 5,
        Comment: note.trim() || 'Delivery proof',
        image_url: url,
        is_admin_proof: true,
      })
      if (insErr) throw new Error(insErr.message)
      setOk(true)
      setFile(null)
      setPreview('')
      setNote('')
      setTimeout(() => setOk(false), 3000)
    } catch (err) {
      setError(err.message || 'Upload or DB connection failed.')
    } finally {
      setSending(false)
    }
  }

  if (stage === 'auth') {
    return (
      <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={close}>
        <form onSubmit={submitAuth} className="bn my-auto w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 text-center">
            <span aria-hidden="true" className="text-3xl">🔒</span>
            <h2 className="bn mt-1 text-xl font-bold text-emerald-ink">Admin Access</h2>
            <p className="bn text-xs text-ink/60">Enter password and secret code to continue.</p>
          </div>
          <label className="mb-3 block text-sm">
            <span className="bn mb-1 block font-medium text-emerald-ink">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus className={inputCls} placeholder="••••••••" />
          </label>
          <label className="mb-3 block text-sm">
            <span className="bn mb-1 block font-medium text-emerald-ink">Secret Code</span>
            <input type="password" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder="••••••" />
          </label>
          {authError && <p className="bn mb-3 text-center text-sm font-semibold text-red-700">{authError}</p>}
          <button type="submit" className="bn w-full rounded-full bg-emerald-deep py-3 text-sm font-semibold text-gold-soft transition hover:opacity-90">
            Unlock
          </button>
          <button type="button" onClick={close} className="bn mt-2 w-full rounded-full py-2 text-xs text-ink/50 hover:text-ink">
            Cancel
          </button>
        </form>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-black/60 p-4" onClick={close}>
      <form onSubmit={submit} className="bn my-auto w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <span aria-hidden="true" className="text-3xl">📸</span>
          <h2 className="bn text-xl font-bold text-emerald-ink">Upload Delivery Proof</h2>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-deep/20 bg-cream px-4 py-8 text-center transition hover:border-gold">
          <span aria-hidden="true" className="text-3xl">🖼️</span>
          <span className="bn text-sm font-semibold text-emerald-ink">{file ? file.name : 'Choose or drop an image'}</span>
          <span className="bn text-xs text-ink/50">JPG / PNG, max 5MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0] || null)} />
        </label>

        <label className="mt-3 block text-sm">
          <span className="bn mb-1 block text-xs font-semibold text-ink/70">Short note (optional)</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Delivered in Chattogram" className={inputCls} />
        </label>

        {preview && <img src={preview} alt="Upload preview" className="bn mt-3 h-40 w-full rounded-xl object-cover" />}
        {error && <p className="bn mt-2 text-sm text-red-700">{error}</p>}
        {ok && <div className="bn mt-2 rounded-xl bg-emerald-ink/5 p-3 text-center"><p className="text-sm font-semibold text-emerald-mid">Proof published — the gallery updates instantly!</p></div>}
        <button type="submit" disabled={sending} className="bn mt-4 w-full rounded-full bg-emerald-deep py-3 text-sm font-semibold text-gold-soft transition hover:opacity-90 disabled:opacity-60">{sending ? 'Uploading…' : 'Upload & Publish'}</button>
        <button type="button" onClick={close} className="bn mt-2 w-full rounded-full py-2 text-xs text-ink/50 hover:text-ink">Close</button>
      </form>
    </div>
  )
}


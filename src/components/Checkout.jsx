import { useState } from 'react'
import { STORE } from '../data/store.js'
import { useCart } from '../context/CartContext.jsx'
import { formatBdt } from '../utils/money.js'
import { ZONE } from '../utils/shipping.js'
import { buildOrderMessage } from '../utils/orderMessage.js'
import { buildTelegramOrderMessage, sendTelegramOrder } from '../utils/telegram.js'
import { CloseIcon, WhatsAppIcon } from './Icons.jsx'

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  district: 'Chattogram',
  note: '',
}

export default function Checkout({ open, onClose }) {
  const { items, totals, zone, setZone, clearCart } = useCart()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [codDone, setCodDone] = useState(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!/^01[0-9]{9}$/.test(form.phone.replace(/\s/g, '')) && !/^\+8801[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) {
      next.phone = 'Enter a valid BD mobile number'
    }
    if (!form.address.trim()) next.address = 'Address is required'
    if (!form.district.trim()) next.district = 'District is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const payload = () => ({
    items,
    totals,
    customer: form,
    zone,
  })

  const onWhatsApp = () => {
    if (!validate() || items.length === 0) return
    const message = buildOrderMessage({ ...payload(), method: 'WhatsApp' })
    const whatsappUrl = `https://wa.me/8801788544111?text=${encodeURIComponent(message)}`
    const opened = window.open(whatsappUrl, '_blank')
    if (!opened) window.location.href = whatsappUrl
  }

  const onCod = async (e) => {
    e.preventDefault()
    if (!validate() || items.length === 0 || sending) return
    setSending(true)
    setSendError('')
    const orderId = `AWDA-${Date.now().toString().slice(-8)}`
    try {
      const telegramText = buildTelegramOrderMessage({ orderId, ...payload() })
      await sendTelegramOrder(telegramText)
      const message = buildOrderMessage({ ...payload(), method: 'Cash on Delivery (COD)' })
      setCodDone({ orderId, message })
      clearCart()
    } catch (err) {
      setSendError(err?.message || 'অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।')
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-6 max-w-3xl rounded-3xl bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-deep/10 px-6 py-4">
          <h2 className="font-display text-2xl text-emerald-ink">Checkout</h2>
          <button type="button" onClick={onClose} aria-label="Close checkout">
            <CloseIcon />
          </button>
        </div>

        {codDone ? (
          <div className="space-y-4 p-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-deep text-2xl text-gold-soft">
              ✓
            </div>
            <p className="bn text-xl font-semibold text-emerald-ink">
              আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! আমরা দ্রুত আপনার সাথে যোগাযোগ করব।
            </p>
            <p className="text-sm text-ink/60">
              Order reference <strong>{codDone.orderId}</strong>. Pay cash on delivery.
            </p>
            <button
              type="button"
              onClick={() => {
                setCodDone(null)
                setForm(emptyForm)
                onClose()
              }}
              className="rounded-full bg-gold px-5 py-2 font-semibold text-emerald-ink"
            >
              Back to shop
            </button>
          </div>
        ) : (
          <form onSubmit={onCod} className="grid gap-6 p-6 md:grid-cols-2">
            <div className="space-y-3">
              <Field label="Full name" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="input"
                  placeholder="Your name"
                />
              </Field>
              <Field label="Mobile / WhatsApp" error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="input"
                  placeholder="01XXXXXXXXX"
                />
              </Field>
              <Field label="Delivery address" error={errors.address}>
                <textarea
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input min-h-24"
                  placeholder="House, road, area"
                />
              </Field>
              <Field label="District" error={errors.district}>
                <input
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Note (optional)">
                <input value={form.note} onChange={(e) => update('note', e.target.value)} className="input" />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Shipping zone</p>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setZone(ZONE.INSIDE)}
                  className={`rounded-xl px-3 py-2 text-sm ${zone === ZONE.INSIDE ? 'bg-emerald-deep text-gold-soft' : 'bg-white'}`}
                >
                  Inside Chattogram
                </button>
                <button
                  type="button"
                  onClick={() => setZone(ZONE.OUTSIDE)}
                  className={`rounded-xl px-3 py-2 text-sm ${zone === ZONE.OUTSIDE ? 'bg-emerald-deep text-gold-soft' : 'bg-white'}`}
                >
                  Outside City
                </button>
              </div>
              <div className="rounded-2xl bg-white p-4 text-sm">
                {items.map((item) => (
                  <div key={item.lineId} className="flex justify-between py-1">
                    <span className="bn">
                      {item.name} × {item.qty}
                    </span>
                    <span>{formatBdt(item.unitPrice * item.qty)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t pt-2">
                  <span>Delivery</span>
                  <span>{formatBdt(totals.delivery)}</span>
                </div>
                <div className="mt-1 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatBdt(totals.grandTotal)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={onWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-semibold text-white"
                >
                  <WhatsAppIcon /> Order via WhatsApp
                </button>
                <button
                  type="submit"
                  disabled={sending || items.length === 0}
                  className="w-full rounded-full bg-emerald-deep py-3 font-semibold text-gold-soft disabled:opacity-60"
                >
                  {sending ? 'Sending order…' : 'Place COD order'}
                </button>
                {sendError && <p className="bn text-center text-sm text-red-700">{sendError}</p>}
                <p className="text-center text-xs text-ink/50">WhatsApp: {STORE.phoneDisplay}</p>
              </div>
            </div>
          </form>
        )}
      </div>
      <style>{`
        .input { width: 100%; border-radius: 0.9rem; border: 1px solid rgba(15,61,46,.15); background: white; padding: .7rem .9rem; outline: none; }
        .input:focus { box-shadow: 0 0 0 2px rgba(201,162,39,.45); }
      `}</style>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-emerald-ink">{label}</span>
      {children}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  )
}

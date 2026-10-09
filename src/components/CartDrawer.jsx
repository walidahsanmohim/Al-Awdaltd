import { useCart } from '../context/CartContext.jsx'
import { formatBdt, formatKg } from '../utils/money.js'
import { ZONE } from '../utils/shipping.js'
import { CloseIcon } from './Icons.jsx'

export default function CartDrawer({ onCheckout }) {
  const { items, open, setOpen, setQty, removeItem, zone, setZone, totals } = useCart()

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-emerald-deep/10 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl text-emerald-ink">Your Cart</h2>
            <p className="bn text-sm text-ink/60">ওজন অনুযায়ী ডেলিভারি চার্জ</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-cream-deep" aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {items.length === 0 && (
            <p className="bn rounded-2xl bg-white p-6 text-center text-ink/60">কার্ট খালি। পণ্য যোগ করুন।</p>
          )}
          {items.map((item) => (
            <div key={item.lineId} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="bn font-semibold text-emerald-ink">{item.name}</p>
                <p className="text-xs text-ink/50">
                  {item.variantLabel} · {formatBdt(item.unitPrice)} · {formatKg(item.weightKg)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-full bg-cream-deep">
                    <button type="button" className="px-2 py-1" onClick={() => setQty(item.lineId, item.qty - 1)}>
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <button type="button" className="px-2 py-1" onClick={() => setQty(item.lineId, item.qty + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" className="text-xs text-red-700" onClick={() => removeItem(item.lineId)}>
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold">{formatBdt(item.unitPrice * item.qty)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-emerald-deep/10 bg-white p-5">
          <p className="mb-2 text-sm font-semibold text-emerald-ink">Delivery zone</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setZone(ZONE.INSIDE)}
              className={`rounded-xl px-3 py-2 text-sm ${
                zone === ZONE.INSIDE ? 'bg-emerald-deep text-gold-soft' : 'bg-cream text-emerald-deep'
              }`}
            >
              Inside Chattogram
            </button>
            <button
              type="button"
              onClick={() => setZone(ZONE.OUTSIDE)}
              className={`rounded-xl px-3 py-2 text-sm ${
                zone === ZONE.OUTSIDE ? 'bg-emerald-deep text-gold-soft' : 'bg-cream text-emerald-deep'
              }`}
            >
              Outside City
            </button>
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Net weight</dt>
              <dd>{formatKg(totals.totalWeightInKg)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Billable weight</dt>
              <dd>{totals.billableWeight} KG</dd>
            </div>
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatBdt(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{formatBdt(totals.delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-emerald-deep/10 pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatBdt(totals.grandTotal)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-ink/50">
            {zone === ZONE.INSIDE
              ? 'Inside city: ৳60 first KG + ৳20 each extra KG'
              : 'Outside city: ৳150 first KG + ৳20 each extra KG'}
          </p>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              setOpen(false)
              onCheckout()
            }}
            className="mt-4 w-full rounded-full bg-gold py-3 font-semibold text-emerald-ink disabled:opacity-40"
          >
            Proceed to checkout
          </button>
        </div>
      </aside>
    </>
  )
}

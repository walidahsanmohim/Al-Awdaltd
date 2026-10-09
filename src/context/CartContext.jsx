import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCartTotals, ZONE } from '../utils/shipping.js'

const CartContext = createContext(null)
const STORAGE_KEY = 'al-awda-cart-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], zone: ZONE.INSIDE }
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      zone: parsed.zone === ZONE.OUTSIDE ? ZONE.OUTSIDE : ZONE.INSIDE,
    }
  } catch {
    return { items: [], zone: ZONE.INSIDE }
  }
}

export function CartProvider({ children }) {
  const [{ items, zone }, setState] = useState(loadState)
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, zone }))
  }, [items, zone])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const totals = useMemo(() => getCartTotals(items, zone), [items, zone])
  const count = useMemo(() => items.reduce((n, item) => n + item.qty, 0), [items])

  const addItem = (line, qty = 1) => {
    const safeQty = Math.max(1, Number(qty) || 1)
    setState((prev) => {
      const existing = prev.items.find((item) => item.lineId === line.lineId)
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.lineId === line.lineId ? { ...item, qty: item.qty + safeQty } : item,
          ),
        }
      }
      return { ...prev, items: [...prev.items, { ...line, qty: safeQty }] }
    })
    setToast(`${line.name} কার্টে যোগ হয়েছে`)
    setOpen(true)
  }

  const setQty = (lineId, qty) => {
    const next = Math.max(0, Number(qty) || 0)
    setState((prev) => ({
      ...prev,
      items:
        next === 0
          ? prev.items.filter((item) => item.lineId !== lineId)
          : prev.items.map((item) => (item.lineId === lineId ? { ...item, qty: next } : item)),
    }))
  }

  const removeItem = (lineId) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((item) => item.lineId !== lineId) }))
  }

  const clearCart = () => setState((prev) => ({ ...prev, items: [] }))
  const setZone = (nextZone) => setState((prev) => ({ ...prev, zone: nextZone }))

  const value = {
    items,
    zone,
    totals,
    count,
    open,
    toast,
    setOpen,
    addItem,
    setQty,
    removeItem,
    clearCart,
    setZone,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

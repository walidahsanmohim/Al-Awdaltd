export const ZONE = {
  INSIDE: 'inside',
  OUTSIDE: 'outside',
}

export function getBillableWeight(totalWeightInKg) {
  const raw = Number(totalWeightInKg) || 0
  if (raw <= 0) return 0
  return Math.max(1, Math.ceil(raw))
}

export function calculateDeliveryCharge(totalWeightInKg, zone) {
  const billableWeight = getBillableWeight(totalWeightInKg)
  if (billableWeight === 0) return 0
  const firstKg = zone === ZONE.INSIDE ? 60 : 150
  return firstKg + (billableWeight - 1) * 20
}

export function getCartTotals(items, zone) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  const totalWeightInKg = items.reduce((sum, item) => sum + item.weightKg * item.qty, 0)
  const billableWeight = getBillableWeight(totalWeightInKg)
  const delivery = calculateDeliveryCharge(totalWeightInKg, zone)
  return {
    subtotal,
    totalWeightInKg,
    billableWeight,
    delivery,
    grandTotal: subtotal + delivery,
  }
}

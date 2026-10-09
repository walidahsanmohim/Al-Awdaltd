import { STORE } from '../data/store.js'
import { formatBdt, formatKg } from './money.js'
import { ZONE } from './shipping.js'

export function buildOrderMessage({ items, totals, customer, zone, method }) {
  const zoneLabel = zone === ZONE.INSIDE ? 'Inside Chattogram City' : 'Outside Chattogram (Rest of Bangladesh)'
  const lines = [
    `*${STORE.name} — New Order*`,
    `Payment: ${method}`,
    '',
    '*Items:*',
    ...items.map(
      (item, i) =>
        `${i + 1}. ${item.name} (${item.nameEn}) — ${item.variantLabel} × ${item.qty} = ${formatBdt(item.unitPrice * item.qty)} [${formatKg(item.weightKg * item.qty)}]`,
    ),
    '',
    `Total weight: ${formatKg(totals.totalWeightInKg)}`,
    `Billable weight: ${totals.billableWeight} KG`,
    `Subtotal: ${formatBdt(totals.subtotal)}`,
    `Delivery (${zoneLabel}): ${formatBdt(totals.delivery)}`,
    `*Grand Total: ${formatBdt(totals.grandTotal)}*`,
    '',
    '*Customer:*',
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}`,
    `District: ${customer.district}`,
  ]
  if (customer.note) lines.push(`Note: ${customer.note}`)
  return lines.join('\n')
}

export const WHATSAPP_NUMBER = '8801788544111'

export function getWhatsAppNumber() {
  const digits = String(STORE.whatsapp || '')
    .replace(/\D/g, '')
    .replace(/^0+/, '')
  // Strictly use 8801788544111 — fall back if store value is ever malformed.
  if (digits === WHATSAPP_NUMBER) return digits
  if (/^8801\d{9}$/.test(digits)) return digits
  return WHATSAPP_NUMBER
}

export function whatsappCheckoutUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

import { STORE } from '../data/store.js'
import { formatBdt, formatKg } from './money.js'
import { ZONE } from './shipping.js'

// Telegram Bot credentials — used to push COD orders to owner's mobile.
// WARNING: this token is bundled into the frontend JS and visible to anyone.
// For production, move sending behind your own backend proxy and rotate the
// token if you see spam. See success modal + error handling in Checkout.jsx.
export const TELEGRAM_BOT_TOKEN = '8251107441:AAHtkp3WnFYklCcPgnIw1MCjRApFoH0MvQw'
export const TELEGRAM_CHAT_ID = '8817664001'

function escapeMarkdown(text) {
  return String(text ?? '').replace(/([_*`[])/g, '\\$1')
}

export function buildTelegramOrderMessage({ orderId, items, totals, customer, zone }) {
  const zoneLabel = zone === ZONE.INSIDE ? 'Inside Chattogram City' : 'Outside Chattogram (Rest of Bangladesh)'
  const lines = [
    `🛒 *New COD Order — ${escapeMarkdown(STORE.name)}*`,
    `Order ID: ${escapeMarkdown(orderId)}`,
    '',
    '*Customer:*',
    `Name: ${escapeMarkdown(customer.name)}`,
    `Phone: ${escapeMarkdown(customer.phone)}`,
    `Address: ${escapeMarkdown(customer.address)}`,
    `District: ${escapeMarkdown(customer.district)}`,
    `Shipping Area: ${escapeMarkdown(zoneLabel)}`,
  ]
  if (customer.note) lines.push(`Note: ${escapeMarkdown(customer.note)}`)
  lines.push('', '*Items:*')
  items.forEach((item, i) => {
    lines.push(
      `${i + 1}. ${escapeMarkdown(item.name)} (${escapeMarkdown(item.nameEn)}) — ${escapeMarkdown(item.variantLabel)} x ${item.qty} = ${escapeMarkdown(formatBdt(item.unitPrice * item.qty))} [${escapeMarkdown(formatKg(item.weightKg * item.qty))}]`,
    )
  })
  lines.push(
    '',
    `Subtotal: ${escapeMarkdown(formatBdt(totals.subtotal))}`,
    `Delivery Charge (${escapeMarkdown(zoneLabel)}): ${escapeMarkdown(formatBdt(totals.delivery))}`,
    `*Total Amount: ${escapeMarkdown(formatBdt(totals.grandTotal))}*`,
    'Payment: Cash on Delivery (COD)',
  )
  return lines.join('\n')
}

export async function sendTelegramOrder(text) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok || !data?.ok) {
    throw new Error(data?.description || `Telegram send failed (HTTP ${res.status})`)
  }
  return data
}

export function formatBdt(amount) {
  const n = Number(amount) || 0
  return `৳${n.toLocaleString('en-BD')}`
}

export function formatKg(kg) {
  const n = Number(kg) || 0
  if (Number.isInteger(n)) return `${n} KG`
  return `${n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} KG`
}

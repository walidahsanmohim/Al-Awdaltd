import { calculateDeliveryCharge, getBillableWeight, ZONE } from './shipping.js'

const cases = [
  ['0.4kg inside', calculateDeliveryCharge(0.4, ZONE.INSIDE), 60],
  ['0.5kg inside', calculateDeliveryCharge(0.5, ZONE.INSIDE), 60],
  ['1kg inside', calculateDeliveryCharge(1, ZONE.INSIDE), 60],
  ['3kg inside', calculateDeliveryCharge(3, ZONE.INSIDE), 100],
  ['2kg outside', calculateDeliveryCharge(2, ZONE.OUTSIDE), 170],
  ['empty', calculateDeliveryCharge(0, ZONE.INSIDE), 0],
  ['ceil 1.01', getBillableWeight(1.01), 2],
]

const failed = cases.filter(([, got, expected]) => got !== expected)
if (failed.length) {
  console.error(failed)
  process.exit(1)
}
console.log('shipping checks passed')

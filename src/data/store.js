export const STORE = {
  name: 'Al-Awda ltd',
  nameBn: 'আল-আওদা লিমিটেড',
  tagline: 'Premium Dates & Dry Fruits',
  taglineBn: 'প্রিমিয়াম খেজুর ও শুকনো ফল',
  phoneDisplay: '+880 1788-544111',
  phoneDigits: '8801788544111',
  // Strict digits-only format for wa.me links — no '+', spaces, or dashes.
  whatsapp: '8801788544111',
  email: 'alawda.ltd@gmail.com',
  location: 'Chottogram, Bangladesh',
  locationBn: 'চট্টগ্রাম, বাংলাদেশ',
  facebook: 'https://www.facebook.com/share/1M3945MJdt/',
  currency: 'BDT',
  symbol: '৳',
}

export const CATEGORIES = [
  { id: 'all', label: 'সব পণ্য', labelEn: 'All', icon: '🛒' },
  { id: 'dates', label: 'খেজুর (৮ জাত)', labelEn: 'Dates · 8 varieties', icon: '🌴' },
  { id: 'dry', label: 'ড্রাই ফ্রুটস (৫ জাত)', labelEn: 'Dry Fruits · 5 varieties', icon: '🥜' },
  { id: 'vip', label: 'ভিআইপি সাইজ', labelEn: 'VIP Size', icon: '⭐' },
  { id: 'carton', label: 'কার্টুন প্যাক', labelEn: 'Carton Packs', icon: '📦' },
]

// Raw product groups (vip / premium / carton are all dates; dry is dry fruits).
export const DATE_GROUPS = ['vip', 'premium', 'carton']

// English badge label per raw product group (used on product cards).
export const GROUP_LABEL_EN = {
  vip: 'VIP Large',
  premium: 'Premium Medium',
  carton: 'Carton Packs',
  dry: 'Dry Fruits',
}

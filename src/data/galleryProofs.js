// Owner-managed proof entries. Photographs are either:
//   - `/assets/proofs/xxx.jpg`  (local, committed to this repo)
//   - a full https:// URL (any public host: GitHub Pages, Cloudinary, Imgur, ...)
// The Supabase admin uploader adds rows to the `Reviews` table with `type='proof'`
// and does NOT touch this array. Gallery read order: Supabase → GALLERY_PROOFS.
export const GALLERY_PROOFS = [
  {
    id: 'wa-1',
    src: '/assets/proofs/whatsapp-review-1.jpg',
    tag: 'হোয়াটসঅ্যাপ রিভিউ',
    title: 'মেজদুল — একদিনে ডেলিভারি',
    quote: '"ভাই খেজুর পেয়েছি, একদম ফ্রেশ! প্যাকেজিংও দারুণ।" — চট্টগ্রাম',
  },
  {
    id: 'wa-2',
    src: '/assets/proofs/whatsapp-review-2.jpg',
    tag: 'হোয়াটসঅ্যাপ রিভিউ',
    title: 'আজুয়া — ১০০% অরিজিনাল',
    quote: '"আজুয়া খেজুরটা আসল মদিনার মতোই লাগলো। আবার নেব ইনশাআল্লাহ।" — ঢাকা',
  },
  {
    id: 'cod-1',
    src: '/assets/proofs/delivery-cod-1.jpg',
    tag: 'অফিশিয়াল ডেলিভারি প্রুফ',
    title: 'COD — ক্যাশ অন ডেলিভারি',
    quote: 'অর্ডার → কল কনফার্ম → same-day ডেলিভারি → ক্যাশ পেমেন্ট',
  },
  {
    id: 'pack-1',
    src: '/assets/proofs/packaging-1.jpg',
    tag: 'অফিশিয়াল ডেলিভারি প্রুফ',
    title: 'সিলড কার্টুন প্যাকেজিং',
    quote: '৩ কেজি / ৬ কেজি ফুড-গ্রেড সিলড কার্টুনে সারাদেশে কুরিয়ার',
  },
  {
    id: 'ms-1',
    src: '/assets/proofs/messenger-review-1.jpg',
    tag: 'মেসেঞ্জার রিভিউ',
    title: 'কাজুবাদাম — তাজা ও মচমচে',
    quote: '"কাজুটা অনেক মজা! বাচ্চারা খুব পছন্দ করেছে।" — কুমিল্লা',
  },
  {
    id: 'ms-2',
    src: '/assets/proofs/delivery-nationwide-1.jpg',
    tag: 'ডেলিভারি প্রুফ',
    title: 'সারাদেশে হোম ডেলিভারি',
    quote: 'চট্টগ্রামসহ ৬৪ জেলায় ক্যাশ অন ডেলিভারি সার্ভিস চালু',
  },
]

export const TAG_STYLES = {
  'হোয়াটসঅ্যাপ রিভিউ': 'bg-[#25D366]/95',
  'মেসেঞ্জার রিভিউ': 'bg-[#0084FF]/95',
  'অফিশিয়াল ডেলিভারি প্রুফ': 'bg-emerald-ink/90',
  'ডেলিভারি প্রুফ': 'bg-gold/95 text-emerald-ink',
  'কাস্টমার ছবি': 'bg-emerald-mid/95',
}

// Short description used in the admin panel heading.
export const ADMIN_PANEL_HINT =
  "Uploaded to 'Reviews-image' bucket → inserted as `type='proof'` → live in the gallery."

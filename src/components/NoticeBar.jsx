export default function NoticeBar() {
  return (
    <div className="w-full border-y border-gold/40 bg-gold-soft">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-2.5">
        <div className="notice-marquee flex w-max items-center gap-8">
          {[0, 1].map((copy) => (
            <p
              key={copy}
              aria-hidden={copy === 1}
              className="bn text-sm font-semibold whitespace-nowrap text-emerald-ink"
            >
              📢 চট্টগ্রামসহ সারা বাংলাদেশে হোম ডেলিভারি সার্ভিস চালু আছে! ১০০% প্রিমিয়াম ও অরিজিনাল খেজুর ও ড্রাই
              ফ্রুটস অর্ডার করুন।
            </p>
          ))}
        </div>
      </div>
      <style>{`
        .notice-marquee { animation: notice-scroll 22s linear infinite; }
        @keyframes notice-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .notice-marquee { animation: none; flex-wrap: wrap; width: 100%; }
        }
      `}</style>
    </div>
  )
}

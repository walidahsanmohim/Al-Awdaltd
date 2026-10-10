import { CATEGORIES } from '../data/store.js'

export default function CategoryBar({ active, setActive, counts }) {
  return (
    <div
      className="no-scrollbar -mx-3 flex gap-2.5 overflow-x-auto px-3 py-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="tablist"
      aria-label="পণ্যের ক্যাটাগরি"
    >
      {CATEGORIES.map((cat) => {
        const selected = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              setActive(cat.id)
              document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }}
            className={`bn flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition active:scale-95 sm:min-h-[48px] sm:flex-1 sm:justify-center sm:px-4 ${
              selected
                ? 'bg-emerald-deep text-gold-soft shadow-md ring-2 ring-gold'
                : 'border border-emerald-deep/20 bg-white text-emerald-deep shadow-sm hover:border-gold hover:bg-gold-soft/20'
            }`}
          >
            <span>{cat.label}</span>
            {counts && counts[cat.id] != null && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  selected ? 'bg-gold px-2 text-emerald-ink' : 'bg-cream-deep text-emerald-deep'
                }`}
              >
                {counts[cat.id]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

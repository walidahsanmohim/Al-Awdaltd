import { CATEGORIES } from '../data/store.js'

export default function CategoryBar({ active, setActive, counts }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2">
      {CATEGORIES.map((cat) => {
        const selected = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            aria-pressed={selected}
            className={`bn flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition ${
              selected
                ? 'bg-emerald-deep text-gold-soft shadow'
                : 'border border-emerald-deep/15 bg-white text-emerald-deep hover:border-gold'
            }`}
          >
            {cat.label}
            {counts && counts[cat.id] != null && (
              <span
                className={`rounded-full px-1.5 text-[11px] font-bold ${
                  selected ? 'bg-gold-soft/20 text-gold-soft' : 'bg-cream-deep text-emerald-deep'
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

import { CATEGORIES } from '../data/store.js'

export default function CategoryBar({ active, setActive }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2">
      {CATEGORIES.map((cat) => {
        const selected = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            className={`bn shrink-0 rounded-full px-4 py-2 text-sm transition ${
              selected
                ? 'bg-emerald-deep text-gold-soft shadow'
                : 'border border-emerald-deep/15 bg-white text-emerald-deep hover:border-gold'
            }`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}

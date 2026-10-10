import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { GROUP_LABEL_EN } from '../data/store.js'
import { formatBdt } from '../utils/money.js'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [variantId, setVariantId] = useState(product.variants[0].id)
  const [qty, setQty] = useState(1)
  const variant = product.variants.find((v) => v.id === variantId) || product.variants[0]
  const groupLabel = GROUP_LABEL_EN[product.category] || product.category

  const onAdd = () => {
    addItem(
      {
        lineId: variant.id,
        productId: product.id,
        name: product.name,
        nameEn: product.nameEn,
        variantLabel: variant.label,
        unitPrice: variant.price,
        weightKg: variant.weightKg,
        image: product.image,
        category: product.category,
      },
      qty,
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-deep/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:rounded-3xl">
      <div className="relative h-36 overflow-hidden sm:h-44 md:h-48">
        <img
          src={product.image}
          alt={product.nameEn}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/assets/logo.jpg'
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 rounded-full bg-emerald-ink/90 px-2 py-0.5 text-[10px] tracking-wide text-gold-soft md:top-3 md:left-3 md:px-3 md:py-1 md:text-[11px]">
          {groupLabel}
        </span>
        {product.saleBadge && (
          <span className="absolute top-2 right-2 animate-pulse rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-white shadow-lg md:top-3 md:right-3 md:px-3 md:py-1 md:text-[11px]">
            {product.saleBadge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="bn text-base font-semibold text-emerald-ink md:text-lg">{product.name}</h3>
        <p className="text-xs text-ink/60 md:text-sm">{product.nameEn}</p>
        <p className="bn mt-1.5 line-clamp-2 text-xs text-ink/70 md:mt-2 md:text-sm">{product.description}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2 md:mt-3">
          <p className="font-display text-xl text-emerald-mid md:text-2xl">{formatBdt(variant.price)}</p>
          {variant.compareAt && variant.compareAt > variant.price && (
            <p className="text-xs text-ink/40 line-through md:text-sm">{formatBdt(variant.compareAt)}</p>
          )}
        </div>
        <p className="bn text-[11px] text-ink/50 md:text-xs">{product.unitLabel}</p>

        {product.variants.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold md:px-3 md:text-xs ${
                  variantId === v.id ? 'bg-emerald-deep text-gold-soft' : 'bg-cream-deep text-emerald-deep'
                }`}
              >
                {v.label} · {formatBdt(v.price)}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-3 md:gap-2 md:pt-4">
          <div className="flex items-center rounded-full border border-emerald-deep/15">
            <button type="button" className="px-2 py-2 md:px-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="w-5 text-center text-xs md:w-6 md:text-sm">{qty}</span>
            <button type="button" className="px-2 py-2 md:px-3" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex-1 rounded-full bg-emerald-deep py-2 text-xs font-semibold text-gold-soft md:py-2.5 md:text-sm"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}

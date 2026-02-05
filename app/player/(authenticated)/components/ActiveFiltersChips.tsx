'use client'

type FilterChip = {
  id: string
  label: string
  value: string
  onRemove: () => void
}

type ActiveFiltersChipsProps = {
  chips: FilterChip[]
  onClearAll?: () => void
}

export default function ActiveFiltersChips({ chips, onClearAll }: ActiveFiltersChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap py-3">
      <span className="text-xs font-medium text-slate-500 uppercase">Filtres actifs:</span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
        >
          <span className="text-slate-600">{chip.label}:</span>
          <span className="font-semibold">{chip.value}</span>
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
      {onClearAll && chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 underline decoration-dotted underline-offset-4 transition-colors"
        >
          Tout effacer
        </button>
      )}
    </div>
  )
}

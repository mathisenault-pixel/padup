'use client'

import { ReactNode } from 'react'

type SearchBarField = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'select'
  options?: { value: string; label: string }[]
}

type PageHeaderProps = {
  title: string
  subtitle: string
  leftField: SearchBarField
  rightField: SearchBarField
  buttonLabel: string
  onSearch: () => void
}

export default function PageHeader({
  title,
  subtitle,
  leftField,
  rightField,
  buttonLabel,
  onSearch
}: PageHeaderProps) {
  return (
    <div className="mb-8 md:mb-12">
      {/* Titre + Sous-titre centrés */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {title}
        </h1>
        <p className="text-base md:text-lg text-slate-600">
          {subtitle}
        </p>
      </div>

      {/* Barre de recherche unifiée */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-3 flex items-stretch gap-0">
          {/* Champ gauche */}
          <div className="flex-1 px-4 py-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {leftField.label}
            </label>
            <input
              type="text"
              value={leftField.value}
              onChange={(e) => leftField.onChange(e.target.value)}
              placeholder={leftField.placeholder}
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Séparateur vertical */}
          <div className="w-px bg-slate-200 self-stretch my-2"></div>

          {/* Champ droit */}
          <div className="flex-1 px-4 py-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {rightField.label}
            </label>
            {rightField.type === 'select' && rightField.options ? (
              <select
                value={rightField.value}
                onChange={(e) => rightField.onChange(e.target.value)}
                className="w-full text-sm text-slate-900 focus:outline-none bg-transparent cursor-pointer"
              >
                {rightField.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={rightField.value}
                onChange={(e) => rightField.onChange(e.target.value)}
                placeholder={rightField.placeholder}
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            )}
          </div>

          {/* Bouton */}
          <button
            onClick={onSearch}
            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

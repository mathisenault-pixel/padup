'use client'

// TODO: Intégrer i18n pour changer la langue du site
export default function LanguageSwitcher() {

  return (
    <button
      type="button"
      onClick={() => {}}
      className="p-2 text-black/70 hover:text-black transition-colors"
      aria-label="Changer la langue"
    >
      {/* Icône globe */}
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    </button>
  )
}

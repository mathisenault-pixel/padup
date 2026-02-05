/**
 * Séparateur visuel vertical entre sections
 * Barre courte, élégante, premium (sans bleu)
 */
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`my-14 md:my-16 flex justify-center ${className}`}>
      <div className="w-[3px] h-14 bg-slate-400 rounded-full" />
    </div>
  )
}

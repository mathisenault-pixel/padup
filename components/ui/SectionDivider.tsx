/**
 * Séparateur visuel entre sections
 * Ligne fine, sobre, premium (sans bleu)
 */
export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`my-10 md:my-14 w-full flex justify-center px-6 ${className}`}>
      <div className="h-px w-full max-w-5xl bg-slate-200" />
    </div>
  )
}

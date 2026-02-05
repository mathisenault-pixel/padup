import Link from 'next/link'

/**
 * Lien avec le style "pro" identique à celui du footer
 * Classes: text-sm text-slate-400 hover:text-white avec transition
 */
export function ProLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`text-sm text-slate-400 hover:text-white transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}

/**
 * Version bouton du ProLink (pour onClick sans navigation)
 */
export function ProButton({
  onClick,
  children,
  className = '',
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm text-slate-400 hover:text-white transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

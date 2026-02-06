'use client'

import Link from 'next/link'

type TournoiCardProps = {
  id: number
  nom: string
  club: string
  date: string
  categorie: string
  imageUrl: string
  href?: string
  onClick?: () => void
}

export default function TournoiCard({
  id,
  nom,
  club,
  date,
  categorie,
  imageUrl,
  href,
  onClick
}: TournoiCardProps) {
  const content = (
    <>
      {/* Image avec ratio fixe 16:9 */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={nom}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Texte */}
      <div className="p-4 min-h-[80px]">
        <p className="text-xs font-normal text-slate-500 mb-1">
          Découvrez
        </p>
        <h3 className="text-base font-semibold text-slate-900 leading-tight mb-1">
          {nom}
        </h3>
        <p className="text-sm text-slate-500">
          {club} • {date}
        </p>
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full text-left"
    >
      {content}
    </button>
  )
}

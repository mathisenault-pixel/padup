'use client'

import Link from 'next/link'

type ClubCardProps = {
  id: string
  name: string
  city: string
  imageUrl: string
  href: string
}

export default function ClubCard({ id, name, city, imageUrl, href }: ClubCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Texte */}
      <div className="p-3">
        <p className="text-[11px] font-normal text-slate-500 mb-0.5">
          Découvrez nos
        </p>
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">
          {name}
        </h3>
      </div>
    </Link>
  )
}

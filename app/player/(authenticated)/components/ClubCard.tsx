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
      className="group block rounded-md overflow-hidden hover:opacity-90 transition-opacity duration-200"
    >
      {/* Image */}
      <div className="relative w-full h-32 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Texte */}
      <div className="pt-2 pb-1">
        <p className="text-[11px] font-normal text-slate-500 mb-0.5">
          Découvrez nos
        </p>
        <h3 className="text-xs font-medium text-slate-900 leading-tight">
          {name}
        </h3>
      </div>
    </Link>
  )
}

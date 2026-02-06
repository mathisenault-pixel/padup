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
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Texte */}
      <div className="p-5">
        <p className="text-xs font-normal text-slate-500 mb-1.5">
          Découvrez nos
        </p>
        <h3 className="text-lg font-semibold text-slate-900 leading-snug">
          {name}
        </h3>
      </div>
    </Link>
  )
}

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
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Texte */}
      <div className="px-3 py-2.5">
        <h3 className="text-sm font-medium text-slate-900 leading-snug">
          {name}
        </h3>
      </div>
    </Link>
  )
}

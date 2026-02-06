'use client'

import Link from 'next/link'
import Image from 'next/image'

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
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Texte */}
      <div className="p-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          Découvrez
        </p>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-slate-600 mt-0.5">
          {city}
        </p>
      </div>
    </Link>
  )
}

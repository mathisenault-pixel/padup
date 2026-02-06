'use client'

import Link from 'next/link'

type ReservationCardProps = {
  id: string
  clubName: string
  clubCity: string
  date: string
  timeSlot: string
  imageUrl: string
  href: string
  onClick?: () => void
  drivingInfo?: {
    km: number
    min: number
  } | null
}

export default function ReservationCard({
  id,
  clubName,
  clubCity,
  date,
  timeSlot,
  imageUrl,
  href,
  onClick,
  drivingInfo
}: ReservationCardProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image avec ratio fixe 16:9 */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={clubName}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Texte */}
      <div className="p-4 min-h-[80px]">
        <p className="text-xs font-normal text-slate-500 mb-1">
          Découvrez
        </p>
        <h3 className="text-base font-semibold text-slate-900 leading-tight mb-1">
          {clubName}
        </h3>
        <p className="text-sm text-slate-500 mb-2">
          {date} • {timeSlot}
        </p>
        
        {/* Distance et temps en voiture */}
        {drivingInfo && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {drivingInfo.km < 10 ? drivingInfo.km.toFixed(1).replace('.', ',') : Math.round(drivingInfo.km)} km • {drivingInfo.min} min
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

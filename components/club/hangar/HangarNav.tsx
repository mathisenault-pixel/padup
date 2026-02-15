"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function HangarNav() {
  const pathname = usePathname()

  const tabs = [
    { id: "dashboard", label: "Dashboard", href: "/club/hangar" },
    { id: "courts", label: "Terrains", href: "/club/hangar/courts" },
    { id: "reservations", label: "Réservations", href: "/club/hangar/reservations" },
    { id: "settings", label: "Paramètres", href: "/club/hangar/settings" },
  ]

  // Déterminer l'onglet actif en fonction de l'URL
  const getActiveTab = () => {
    if (pathname === "/club/hangar") return "dashboard"
    if (pathname?.startsWith("/club/hangar/courts")) return "courts"
    if (pathname?.startsWith("/club/hangar/reservations")) return "reservations"
    if (pathname?.startsWith("/club/hangar/settings")) return "settings"
    if (pathname?.startsWith("/club/hangar/dashboard")) return "dashboard"
    return "dashboard"
  }

  const active = getActiveTab()

  return (
    <nav className="w-full bg-white/50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-3 py-3">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              active === t.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <div className="ml-auto text-xs text-slate-500 font-semibold px-3 py-1 bg-slate-100 rounded-full">
          Hangar • Club
        </div>
      </div>
    </nav>
  )
}

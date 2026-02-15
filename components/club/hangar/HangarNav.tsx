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
    <nav className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 py-3">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition ${
              active === t.id
                ? "bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
            }`}
          >
            {t.label}
            {active === t.id && (
              <span className="absolute left-4 right-4 -bottom-2 h-[2px] rounded bg-blue-500" />
            )}
          </Link>
        ))}
        <div className="ml-auto text-xs text-gray-500 font-medium">Hangar • Club</div>
      </div>
    </nav>
  )
}

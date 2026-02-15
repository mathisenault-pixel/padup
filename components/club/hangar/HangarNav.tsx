import Link from "next/link";

export default function HangarNav({ active = "dashboard" }: { active?: string }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", href: "/club/hangar" },
    { id: "courts", label: "Terrains", href: "/club/hangar/courts" },
    { id: "reservations", label: "Réservations", href: "/club/hangar/reservations" },
    { id: "settings", label: "Paramètres", href: "/club/hangar/settings" },
  ];

  return (
    <nav className="w-full border-b border-slate-800 mb-6">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-6">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`py-3 px-4 rounded-md text-sm font-medium transition ${
              active === t.id
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <div className="ml-auto text-xs text-slate-400">Hangar • Club</div>
      </div>
    </nav>
  );
}

import Link from "next/link";

export default function HangarNav({ active = "dashboard" }: { active?: string }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", href: "/club/hangar" },
    { id: "courts", label: "Terrains", href: "/club/hangar/courts" },
    { id: "reservations", label: "Réservations", href: "/club/hangar/reservations" },
    { id: "settings", label: "Paramètres", href: "/club/hangar/settings" },
  ];

  return (
    <nav className="w-full border-b border-slate-800/60 bg-slate-950/40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/30">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 py-3">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition ${
              active === t.id
                ? "bg-slate-900/70 text-white border border-slate-700/60 shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-900/40 border border-transparent"
            }`}
          >
            {t.label}
            {active === t.id && (
              <span className="absolute left-4 right-4 -bottom-2 h-[2px] rounded bg-slate-400/60" />
            )}
          </Link>
        ))}
        <div className="ml-auto text-xs text-slate-500">Hangar • Club</div>
      </div>
    </nav>
  );
}

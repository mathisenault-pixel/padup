import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-slate-300">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xl font-semibold text-white">
                Réservez en 30 secondes.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Disponibilités en temps réel • Réservations sans frais • Made in France
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/player/clubs"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90"
              >
                Trouver un club
              </Link>
              <Link
                href="/player/reservations"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                Mes réservations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="Pad'Up logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="text-base font-semibold text-white">Pad&apos;Up</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Le leader français de la réservation de terrains de padel.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {/* Social icons placeholders (remplace par tes icônes) */}
              <a className="rounded-lg p-2 hover:bg-white/5" href="#" aria-label="Facebook">
                <span className="text-slate-300">f</span>
              </a>
              <a className="rounded-lg p-2 hover:bg-white/5" href="#" aria-label="Instagram">
                <span className="text-slate-300">ig</span>
              </a>
              <a className="rounded-lg p-2 hover:bg-white/5" href="#" aria-label="X">
                <span className="text-slate-300">x</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-8">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <FooterCol
                title="Padel"
                links={[
                  { label: "Trouver un club", href: "/player/clubs" },
                  { label: "Tournois", href: "/player/tournois" },
                  { label: "Mes réservations", href: "/player/reservations" },
                ]}
              />
              <FooterCol
                title="Entreprise"
                links={[
                  { label: "À propos", href: "/a-propos" },
                  { label: "Partenaires", href: "/partenaires" },
                  { label: "Carrières", href: "/carrieres" },
                ]}
              />
              <FooterCol
                title="Support"
                links={[
                  { label: "Contact", href: "/contact" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Conditions", href: "/conditions-utilisation" },
                ]}
              />
              <FooterCol
                title="Légal"
                links={[
                  { label: "Confidentialité", href: "/confidentialite" },
                  { label: "CGU / CGV", href: "/conditions-utilisation" },
                  { label: "Mentions légales", href: "/mentions-legales" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Pad&apos;Up. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link className="hover:text-white" href="/confidentialite">Confidentialité</Link>
            <Link className="hover:text-white" href="/conditions-utilisation">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link className="text-sm text-slate-400 hover:text-white" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

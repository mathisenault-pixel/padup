import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-slate-400">
      {/* CTA band - Réduit */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-medium text-white">
                Prêt à réserver ?
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/player/clubs"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-all"
              >
                Trouver un club
              </Link>
              <Link
                href="/club-access"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                Espace club
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="Pad'Up logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-base font-semibold text-white">Pad&apos;Up</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Réservation de terrains de padel en France.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {/* Social icons - Plus discrets */}
              <a className="rounded-lg p-1.5 hover:bg-white/5 transition-all" href="#" aria-label="Facebook">
                <span className="text-xs text-slate-500">f</span>
              </a>
              <a className="rounded-lg p-1.5 hover:bg-white/5 transition-all" href="#" aria-label="Instagram">
                <span className="text-xs text-slate-500">ig</span>
              </a>
              <a className="rounded-lg p-1.5 hover:bg-white/5 transition-all" href="#" aria-label="X">
                <span className="text-xs text-slate-500">x</span>
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
      <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link className="text-sm text-slate-500 hover:text-white transition-colors" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-slate-500">
      {/* Main grid - Minimal */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/icon.png"
                alt="Pad'Up logo"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-sm font-semibold text-white">Pad&apos;Up</span>
            </div>
          </div>

          {/* Links - 3 colonnes max */}
          <FooterCol
            title="Produit"
            links={[
              { label: "Trouver un club", href: "/player/clubs" },
              { label: "Espace club", href: "/club-access" },
            ]}
          />
          <FooterCol
            title="Support"
            links={[
              { label: "Contact", href: "/contact" },
              { label: "FAQ", href: "/faq" },
            ]}
          />
          <FooterCol
            title="Légal"
            links={[
              { label: "Confidentialité", href: "/confidentialite" },
              { label: "Conditions", href: "/conditions-utilisation" },
              { label: "Mentions légales", href: "/mentions-legales" },
            ]}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Pad&apos;Up</p>
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
      <p className="text-xs font-medium text-white mb-3">{title}</p>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link className="text-xs text-slate-500 hover:text-white" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

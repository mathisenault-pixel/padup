'use client'

import Link from "next/link"
import Image from "next/image"
import { useLocale } from "@/state/LocaleContext"

export default function Footer() {
  const { t } = useLocale()

  return (
    <footer className="bg-black text-slate-300">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xl font-semibold text-white">
                {t('footer.ctaTitle')}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {t('footer.ctaSubtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/player/clubs"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90"
              >
                {t('footer.trouverUnClub')}
              </Link>
              <Link
                href="/player/reservations"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                {t('footer.mesReservations')}
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
              {t('footer.tagline')}
            </p>

            <div className="mt-5 flex items-center gap-3">
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
                title={t('footer.padel')}
                links={[
                  { label: t('footer.trouverUnClub'), href: "/player/clubs" },
                  { label: t('nav.tournois'), href: "/player/tournois" },
                  { label: t('footer.mesReservations'), href: "/player/reservations" },
                ]}
              />
              <FooterCol
                title={t('footer.entreprise')}
                links={[
                  { label: t('footer.aPropos'), href: "/a-propos" },
                  { label: t('footer.partenaires'), href: "/partenaires" },
                  { label: t('footer.carrieres'), href: "/carrieres" },
                ]}
              />
              <FooterCol
                title={t('footer.support')}
                links={[
                  { label: t('footer.contact'), href: "/contact" },
                  { label: t('footer.faq'), href: "/faq" },
                  { label: t('footer.conditions'), href: "/conditions-utilisation" },
                ]}
              />
              <FooterCol
                title={t('footer.legal')}
                links={[
                  { label: t('footer.confidentialite'), href: "/confidentialite" },
                  { label: t('footer.cgu'), href: "/conditions-utilisation" },
                  { label: t('footer.mentionsLegales'), href: "/mentions-legales" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Pad&apos;Up. {t('footer.copyright')}</p>
          <div className="flex gap-4">
            <Link className="hover:text-white" href="/confidentialite">{t('footer.confidentialite')}</Link>
            <Link className="hover:text-white" href="/conditions-utilisation">{t('footer.conditions')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
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
  )
}

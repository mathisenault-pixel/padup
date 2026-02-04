"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PartenairesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Nos partenaires</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Pad&apos;Up travaille avec des clubs de padel indépendants et des acteurs du secteur afin de proposer une expérience de réservation simple, fiable et efficace. Nous croyons aux partenariats utiles, construits sur le long terme, avec des acteurs qui partagent une même vision du padel.
          </p>

          {/* Clubs partenaires */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Clubs partenaires</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pad&apos;Up s&apos;adresse en priorité aux clubs indépendants qui souhaitent :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Faciliter la réservation pour leurs joueurs</li>
              <li>Centraliser leurs disponibilités en temps réel</li>
              <li>Réduire la gestion manuelle et les erreurs</li>
              <li>Gagner en visibilité sans complexité technique</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Chaque partenariat est pensé pour s&apos;adapter aux besoins réels du club, quelle que soit sa taille.
            </p>
          </section>

          {/* Acteurs du padel */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acteurs du padel</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nous collaborons également avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Des organisateurs de tournois</li>
              <li>Des structures locales ou régionales</li>
              <li>Des acteurs engagés dans le développement du padel</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              L&apos;objectif est simple : renforcer l&apos;écosystème et améliorer l&apos;expérience des joueurs comme des clubs.
            </p>
          </section>

          {/* Pourquoi devenir partenaire ? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi devenir partenaire ?</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Devenir partenaire Pad&apos;Up, c&apos;est :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Rejoindre une plateforme en croissance</li>
              <li>Bénéficier d&apos;un outil moderne et évolutif</li>
              <li>Être accompagné par une équipe à l&apos;écoute</li>
              <li>Construire une relation claire, sans contraintes inutiles</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nous privilégions la simplicité, la transparence et l&apos;efficacité.
            </p>
          </section>

          {/* Nous contacter */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nous contacter</h2>
            <p className="text-gray-700 leading-relaxed">
              Vous êtes un club, une structure ou un acteur du padel et souhaitez collaborer avec Pad&apos;Up ?
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Contactez-nous pour échanger et étudier les possibilités de partenariat.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Construisons ensemble l&apos;avenir de la réservation de padel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AProposPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">À propos de Pad&apos;Up</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Pad&apos;Up est une plateforme française conçue pour simplifier la réservation de terrains de padel. Notre objectif est clair : permettre aux joueurs de trouver et réserver un terrain en quelques secondes, et aider les clubs à gérer leurs disponibilités simplement, sans complexité inutile.
          </p>

          {/* Pourquoi Pad'Up ? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi Pad&apos;Up ?</h2>
            <p className="text-gray-700 leading-relaxed">
              Le padel connaît une croissance rapide, mais la réservation reste souvent compliquée : plateformes peu intuitives, informations obsolètes, indisponibilités mal synchronisées.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Pad&apos;Up est né de ce constat. Nous avons voulu créer une solution fluide, rapide et fiable, pensée à la fois pour les joueurs et pour les clubs.
            </p>
          </section>

          {/* Pour les joueurs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pour les joueurs</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Avec Pad&apos;Up, les joueurs peuvent :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Trouver des clubs près de chez eux</li>
              <li>Voir les disponibilités en temps réel</li>
              <li>Réserver un créneau en quelques clics</li>
              <li>Gérer facilement leurs réservations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Moins de recherches, moins de contraintes, plus de jeu.
            </p>
          </section>

          {/* Pour les clubs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pour les clubs</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pad&apos;Up accompagne les clubs indépendants avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Une gestion simple des réservations</li>
              <li>Une visibilité accrue auprès des joueurs</li>
              <li>Une réduction des erreurs et des doubles réservations</li>
              <li>Un outil moderne, sans usine à gaz</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Notre priorité est de proposer une solution efficace, adaptée aux besoins réels du terrain.
            </p>
          </section>

          {/* Une solution française */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Une solution française</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up est un projet développé en France, avec une attention particulière portée à la qualité, à la simplicité et à l&apos;expérience utilisateur.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Nous construisons Pad&apos;Up étape par étape, avec une vision long terme : devenir une référence fiable de la réservation de padel.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Pad&apos;Up, c&apos;est moins de friction, plus de jeu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MentionsLegalesPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mentions légales</h1>

        <div className="space-y-8">
          {/* Éditeur du site */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Éditeur du site</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le site Pad&apos;Up est édité par :
            </p>
            <div className="text-gray-700 space-y-1">
              <p>Nom du projet : Pad&apos;Up</p>
              <p>Responsable de la publication : Pad&apos;Up</p>
              <p>Statut : Projet en cours de développement</p>
              <p>Pays : France</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              Les informations légales détaillées seront précisées prochainement.
            </p>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hébergement</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Le site est hébergé par un prestataire tiers.
            </p>
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">Hébergeur :</p>
              <p>Vercel Inc.</p>
              <p>Pays : États-Unis</p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;ensemble du contenu présent sur le site Pad&apos;Up (textes, logos, éléments graphiques, structure) est protégé par le droit de la propriété intellectuelle.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable est interdite.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up met tout en œuvre pour fournir des informations fiables et à jour.
              Toutefois, des erreurs ou omissions peuvent survenir. L&apos;utilisateur reconnaît utiliser les informations du site sous sa responsabilité.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Pad&apos;Up ne pourra être tenu responsable des dommages directs ou indirects liés à l&apos;utilisation du site.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant le site ou les présentes mentions légales, vous pouvez nous contacter via la page Contact.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Pad&apos;Up s&apos;engage à fournir une plateforme claire, transparente et fiable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

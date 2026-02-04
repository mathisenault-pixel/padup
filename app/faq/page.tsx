"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FAQPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Foire aux questions</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Retrouvez ici les réponses aux questions les plus fréquentes concernant l&apos;utilisation de Pad&apos;Up.
            Si vous ne trouvez pas votre réponse, vous pouvez nous contacter.
          </p>

          {/* Réservations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Réservations</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Comment réserver un terrain sur Pad&apos;Up ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Il suffit de sélectionner un club, de choisir un créneau disponible et de confirmer la réservation. Le processus est rapide et se fait en quelques clics.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Dois-je créer un compte pour réserver ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Oui, la création d&apos;un compte est nécessaire pour réserver un terrain et gérer vos réservations.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Les disponibilités sont-elles en temps réel ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Oui, les disponibilités affichées sur Pad&apos;Up sont mises à jour en temps réel afin d&apos;éviter les doubles réservations.
                </p>
              </div>
            </div>
          </section>

          {/* Paiement et frais */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Paiement et frais</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  La réservation est-elle payante ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  La réservation via Pad&apos;Up est sans frais pour les joueurs. Les éventuels paiements dépendent des conditions du club.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Puis-je annuler une réservation ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Les conditions d&apos;annulation dépendent du club auprès duquel la réservation a été effectuée.
                </p>
              </div>
            </div>
          </section>

          {/* Clubs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Clubs</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Comment un club peut-il rejoindre Pad&apos;Up ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Les clubs peuvent nous contacter via la page Contact afin d&apos;étudier une intégration à la plateforme.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Pad&apos;Up est-il réservé aux clubs indépendants ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Pad&apos;Up s&apos;adresse en priorité aux clubs indépendants, mais reste ouvert à toute structure partageant la même vision.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Support</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Que faire en cas de problème ?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  En cas de souci, vous pouvez contacter l&apos;équipe Pad&apos;Up via la page Contact. Nous ferons notre possible pour vous aider rapidement.
                </p>
              </div>
            </div>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Pad&apos;Up, une réservation simple, sans complication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">À propos de Pad&apos;Up</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 text-lg leading-relaxed">
            Page en cours de construction.
          </p>

          <p className="text-gray-600 mt-4">
            Pad&apos;Up est la plateforme leader de réservation de terrains de padel en France.
            Notre mission est de rendre le padel accessible à tous en simplifiant la réservation
            de terrains.
          </p>
        </div>
      </div>
    </div>
  );
}

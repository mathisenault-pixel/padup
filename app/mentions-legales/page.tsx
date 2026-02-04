import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Mentions Légales</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 text-lg leading-relaxed">
            Page en cours de construction.
          </p>

          <p className="text-gray-600 mt-4">
            Informations légales relatives à l&apos;éditeur et à l&apos;hébergeur du site Pad&apos;Up.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/state/LocaleContext";

export default function ContactPage() {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← {t("public.retour")}
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("contact.title")}</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("contact.intro")}
          </p>

          {/* Vous êtes joueur */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.vousEtesJoueur")}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {t("contact.contactJoueur")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t("contact.questionReservation")}</li>
              <li>{t("contact.problemePlateforme")}</li>
              <li>{t("contact.suggestion")}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t("contact.reponseRapide")}
            </p>
          </section>

          {/* Vous êtes un club ou un partenaire */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.vousEtesClub")}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {t("contact.contactClub")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t("contact.demandeInfo")}</li>
              <li>{t("contact.partenariat")}</li>
              <li>{t("contact.integration")}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t("contact.etudeDemande")}
            </p>
          </section>

          {/* Moyens de contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.moyensContact")}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {t("contact.contactMoyens")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t("contact.parEmail")}</li>
              <li>{t("contact.formulaire")}</li>
              <li>{t("contact.depuisPlateforme")}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t("contact.coordonneesProchainement")}
            </p>
          </section>

          {/* Notre engagement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("contact.engagement")}</h2>
            <p className="text-gray-700 leading-relaxed">
              {t("contact.engagementDesc")}
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Chaque message est lu et traité avec sérieux.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Un message suffit pour commencer à jouer ensemble.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

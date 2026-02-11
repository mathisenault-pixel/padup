"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/state/LocaleContext";

export default function AProposPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("aPropos.title")}</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("aPropos.intro")}
          </p>

          {/* Pourquoi Pad'Up ? */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("aPropos.pourquoi")}</h2>
            <p className="text-gray-700 leading-relaxed">
              {t("aPropos.pourquoiDesc1")}
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              {t("aPropos.pourquoiDesc2")}
            </p>
          </section>

          {/* Pour les joueurs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("aPropos.pourJoueurs")}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {t("aPropos.joueursDesc")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t("aPropos.trouverClubs")}</li>
              <li>{t("aPropos.disposTempsReel")}</li>
              <li>{t("aPropos.reserverClics")}</li>
              <li>{t("aPropos.gererReservations")}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t("aPropos.plusDeJeu")}
            </p>
          </section>

          {/* Pour les clubs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("aPropos.pourClubs")}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {t("aPropos.clubsDesc")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t("aPropos.gestionSimple")}</li>
              <li>{t("aPropos.visibilite")}</li>
              <li>{t("aPropos.reductionErreurs")}</li>
              <li>{t("aPropos.outilModerne")}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t("aPropos.prioriteClubs")}
            </p>
          </section>

          {/* Une solution française */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("aPropos.solutionFrancaise")}</h2>
            <p className="text-gray-700 leading-relaxed">
              {t("aPropos.solutionDesc1")}
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              {t("aPropos.solutionDesc2")}
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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/state/LocaleContext";

export default function FAQPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("faqPage.title")}</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("faqPage.intro")}
          </p>

          {/* Réservations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("faqPage.reservations")}</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q1")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a1")}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q2")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a2")}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q3")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a3")}</p>
              </div>
            </div>
          </section>

          {/* Paiement et frais */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("faqPage.paiementFrais")}</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q4")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a4")}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q5")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a5")}</p>
              </div>
            </div>
          </section>

          {/* Clubs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("faqPage.clubs")}</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q6")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a6")}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q7")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a7")}</p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("faqPage.support")}</h2>
            
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-900 mb-2">{t("faqPage.q8")}</p>
                <p className="text-gray-700 leading-relaxed">{t("faqPage.a8")}</p>
              </div>
            </div>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              {t("faqPage.phraseFin")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

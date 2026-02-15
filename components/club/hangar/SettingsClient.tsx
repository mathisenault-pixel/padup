"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type DaySchedule = {
  open: string
  close: string
}

type OpenHours = {
  mon: DaySchedule
  tue: DaySchedule
  wed: DaySchedule
  thu: DaySchedule
  fri: DaySchedule
  sat: DaySchedule
  sun: DaySchedule
}

type ClubSettings = {
  club_id: string
  timezone: string
  open_hours: OpenHours
  slot_minutes: number
  price_offpeak_cents: number
  price_peak_cents: number
  peak_start: string
  peak_end: string
  updated_at: string
}

type Props = {
  clubId: string
  clubName: string
  initialSettings: ClubSettings | null
}

const defaultOpenHours: OpenHours = {
  mon: { open: "08:00", close: "23:00" },
  tue: { open: "08:00", close: "23:00" },
  wed: { open: "08:00", close: "23:00" },
  thu: { open: "08:00", close: "23:00" },
  fri: { open: "08:00", close: "23:00" },
  sat: { open: "08:00", close: "23:00" },
  sun: { open: "08:00", close: "23:00" },
}

const dayLabels: Record<keyof OpenHours, string> = {
  mon: "Lundi",
  tue: "Mardi",
  wed: "Mercredi",
  thu: "Jeudi",
  fri: "Vendredi",
  sat: "Samedi",
  sun: "Dimanche",
}

export default function SettingsClient({ clubId, clubName, initialSettings }: Props) {
  // États du formulaire
  const [openHours, setOpenHours] = useState<OpenHours>(
    initialSettings?.open_hours || defaultOpenHours
  )
  const [slotMinutes, setSlotMinutes] = useState(
    initialSettings?.slot_minutes || 90
  )
  const [priceOffpeak, setPriceOffpeak] = useState(
    (initialSettings?.price_offpeak_cents || 4000) / 100
  )
  const [pricePeak, setPricePeak] = useState(
    (initialSettings?.price_peak_cents || 5000) / 100
  )
  const [peakStart, setPeakStart] = useState(
    initialSettings?.peak_start || "18:00"
  )
  const [peakEnd, setPeakEnd] = useState(initialSettings?.peak_end || "23:00")

  // UX
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Validation
  const validate = (): boolean => {
    // Vérifier que tous les horaires sont cohérents
    for (const day of Object.keys(openHours) as Array<keyof OpenHours>) {
      const { open, close } = openHours[day]
      if (open >= close) {
        setError(`${dayLabels[day]}: l'heure d'ouverture doit être avant l'heure de fermeture.`)
        return false
      }
    }

    // Vérifier peak_start < peak_end
    if (peakStart >= peakEnd) {
      setError("L'heure de début des heures de pointe doit être avant l'heure de fin.")
      return false
    }

    // Vérifier prix
    if (priceOffpeak <= 0 || pricePeak <= 0) {
      setError("Les prix doivent être supérieurs à 0€.")
      return false
    }

    // Vérifier slot_minutes
    if (slotMinutes <= 0) {
      setError("La durée du créneau doit être supérieure à 0 minutes.")
      return false
    }

    return true
  }

  // Sauvegarder
  const handleSave = async () => {
    setError("")
    setMessage("")

    if (!validate()) return

    setIsSaving(true)

    const payload = {
      club_id: clubId,
      timezone: "Europe/Paris",
      open_hours: openHours,
      slot_minutes: slotMinutes,
      price_offpeak_cents: Math.round(priceOffpeak * 100),
      price_peak_cents: Math.round(pricePeak * 100),
      peak_start: peakStart,
      peak_end: peakEnd,
    }

    const { error: upsertError } = await supabase
      .from("club_settings")
      .upsert(payload, { onConflict: "club_id" })

    setIsSaving(false)

    if (upsertError) {
      setError(`Erreur: ${upsertError.message}`)
    } else {
      setMessage("Paramètres sauvegardés avec succès")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  // Mise à jour d'un jour
  const updateDay = (day: keyof OpenHours, field: "open" | "close", value: string) => {
    setOpenHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  return (
    <section className="space-y-6">
      {/* Shell Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Paramètres du club</h2>
            <p className="text-sm text-slate-400 mt-1">
              Configurez les horaires, les prix et la durée des créneaux pour {clubName}.
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
              <p className="text-sm text-green-200">{message}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-8">
            {/* Section Prix */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tarification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">
                    Prix normal (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceOffpeak}
                    onChange={(e) => setPriceOffpeak(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Prix appliqué en dehors des heures de pointe
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">
                    Prix heures de pointe (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricePeak}
                    onChange={(e) => setPricePeak(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Prix appliqué pendant les heures de pointe
                  </p>
                </div>
              </div>
            </div>

            {/* Section Heures de pointe */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Heures de pointe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Début</label>
                  <input
                    type="time"
                    value={peakStart}
                    onChange={(e) => setPeakStart(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Fin</label>
                  <input
                    type="time"
                    value={peakEnd}
                    onChange={(e) => setPeakEnd(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Section Créneau */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Durée d'un créneau
              </h3>
              <div className="max-w-sm">
                <label className="block text-xs text-slate-400 mb-2">Minutes</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(parseInt(e.target.value) || 90)}
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Durée standard d'une réservation (ex: 90 minutes)
                </p>
              </div>
            </div>

            {/* Section Horaires par jour */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Horaires d'ouverture
              </h3>
              <div className="space-y-3">
                {(Object.keys(openHours) as Array<keyof OpenHours>).map((day) => (
                  <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="font-medium">{dayLabels[day]}</div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Ouverture</label>
                      <input
                        type="time"
                        value={openHours[day].open}
                        onChange={(e) => updateDay(day, "open", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Fermeture</label>
                      <input
                        type="time"
                        value={openHours[day].close}
                        onChange={(e) => updateDay(day, "close", e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton Sauvegarder */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sauvegarder les paramètres
                </>
              )}
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center">
              Ces paramètres affectent le calcul des revenus et du taux d'occupation dans le dashboard.
            </p>
          </div>
        </div>
    </section>
  )
}

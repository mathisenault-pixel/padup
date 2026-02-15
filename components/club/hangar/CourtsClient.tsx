"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Court = {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

type Props = {
  clubId: string
  initialCourts: Court[]
}

export default function CourtsClient({ clubId, initialCourts }: Props) {
  const [courts, setCourts] = useState<Court[]>(initialCourts)
  const [isLive, setIsLive] = useState(false)

  // Ajout de terrain
  const [newCourtName, setNewCourtName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState("")

  // Édition inline
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Toggle active
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Message global
  const [message, setMessage] = useState("")

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("hangar-courts-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courts",
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCourts((prev) => {
              const exists = prev.find((c) => c.id === payload.new.id)
              if (exists) return prev
              return [...prev, payload.new as Court].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            })
          } else if (payload.eventType === "UPDATE") {
            setCourts((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Court) : c))
            )
          } else if (payload.eventType === "DELETE") {
            setCourts((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
      setIsLive(false)
    }
  }, [clubId])

  // Ajouter un terrain
  const handleAddCourt = async () => {
    if (!newCourtName.trim()) {
      setAddError("Le nom du terrain est obligatoire.")
      return
    }

    setIsAdding(true)
    setAddError("")

    const { error } = await supabase.from("courts").insert({
      club_id: clubId,
      name: newCourtName.trim(),
      is_active: true,
    })

    setIsAdding(false)

    if (error) {
      setAddError(`Erreur: ${error.message}`)
    } else {
      setNewCourtName("")
      showMessage("Terrain ajouté avec succès")
    }
  }

  // Démarrer l'édition
  const startEdit = (court: Court) => {
    setEditingId(court.id)
    setEditValue(court.name)
  }

  // Sauvegarder l'édition
  const saveEdit = async (courtId: string) => {
    if (!editValue.trim()) {
      setEditingId(null)
      return
    }

    setIsUpdating(true)

    const { error } = await supabase
      .from("courts")
      .update({ name: editValue.trim() })
      .eq("id", courtId)

    setIsUpdating(false)
    setEditingId(null)

    if (error) {
      showMessage(`Erreur: ${error.message}`, true)
    } else {
      showMessage("Terrain renommé avec succès")
    }
  }

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
  }

  // Toggle actif/inactif
  const toggleActive = async (court: Court) => {
    setTogglingId(court.id)

    const { error } = await supabase
      .from("courts")
      .update({ is_active: !court.is_active })
      .eq("id", court.id)

    setTogglingId(null)

    if (error) {
      showMessage(`Erreur: ${error.message}`, true)
    } else {
      showMessage(
        court.is_active
          ? "Terrain désactivé avec succès"
          : "Terrain activé avec succès"
      )
    }
  }

  // Afficher un message temporaire
  const showMessage = (msg: string, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <section className="space-y-6">
      {/* Live Badge */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200">
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-white animate-pulse" : "bg-white/50"}`} />
          <span className="text-xs font-bold">{isLive ? "LIVE" : "HORS LIGNE"}</span>
        </div>
      </div>

      {/* Shell Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Gestion des terrains</h2>
            <p className="text-sm text-slate-600 mt-1">
              Ajoutez, renommez et activez/désactivez vos terrains en temps réel.
            </p>
          </div>

          {/* Message global */}
          {message && (
            <div className="mb-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <p className="text-sm font-medium text-emerald-700">✓ {message}</p>
            </div>
          )}

          {/* Formulaire d'ajout */}
          <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl shadow-sm">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Nom du nouveau terrain (ex: Terrain 1)"
                  value={newCourtName}
                  onChange={(e) => {
                    setNewCourtName(e.target.value)
                    setAddError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCourt()
                  }}
                  disabled={isAdding}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition font-medium"
                />
                {addError && (
                  <p className="text-xs text-rose-600 mt-2 font-medium">{addError}</p>
                )}
              </div>
              <button
                onClick={handleAddCourt}
                disabled={isAdding}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg shadow-blue-200"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Ajout...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Liste des terrains */}
          {courts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏟️</div>
              <p className="text-slate-600 font-medium">Aucun terrain pour le moment.</p>
              <p className="text-sm text-slate-500 mt-2">
                Ajoutez votre premier terrain ci-dessus.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courts.map((court) => {
                const isEditing = editingId === court.id
                const isToggling = togglingId === court.id

                return (
                  <div
                    key={court.id}
                    className={`p-5 rounded-xl border-2 transition shadow-sm ${
                      court.is_active
                        ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                        : "bg-slate-50 border-slate-300 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Nom du terrain */}
                      <div className="flex-1 flex items-center gap-3">
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(court.id)
                                if (e.key === "Escape") cancelEdit()
                              }}
                              disabled={isUpdating}
                              autoFocus
                              className="flex-1 px-4 py-2 bg-white border-2 border-blue-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 font-medium"
                            />
                            <button
                              onClick={() => saveEdit(court.id)}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 font-semibold shadow-md"
                            >
                              {isUpdating ? "..." : "✓"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition disabled:opacity-50 font-semibold"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{court.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Créé le{" "}
                                {new Date(court.created_at).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </div>

                            {/* Badge statut */}
                            <div>
                              {court.is_active ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1.5 text-xs font-semibold">
                                  ✓ Actif
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-600 px-3 py-1.5 text-xs font-semibold">
                                  Inactif
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2">
                          {/* Renommer */}
                          <button
                            onClick={() => startEdit(court)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Renommer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* Toggle Actif/Inactif */}
                          <button
                            onClick={() => toggleActive(court)}
                            disabled={isToggling}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                              court.is_active
                                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                            }`}
                          >
                            {isToggling
                              ? "..."
                              : court.is_active
                              ? "Désactiver"
                              : "Activer"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Stats */}
          {courts.length > 0 && (
            <div className="mt-6 pt-5 border-t-2 border-slate-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{courts.length}</div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {courts.filter((c) => c.is_active).length}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">Actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400">
                    {courts.filter((c) => !c.is_active).length}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">Inactifs</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center font-medium">
              ⚡ Les données sont mises à jour en temps réel
            </p>
          </div>
        </div>
    </section>
  )
}

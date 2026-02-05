'use client'

import { useState } from 'react'

type InviteButtonProps = {
  clubName: string
  dateText: string
  bookingUrl?: string
}

/**
 * Composant exemple pour envoyer une invitation email
 * 
 * Utilisation:
 * <InviteButton 
 *   clubName="Le Hangar Sport & Co"
 *   dateText="Samedi 25 janvier 2026 à 14h00 - 15h30"
 *   bookingUrl="https://padup.one/player/reservations/res_12345"
 * />
 */
export default function InviteButton({ clubName, dateText, bookingUrl }: InviteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendInvite = async () => {
    // Validation côté client
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer un email valide')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('[INVITE] Sending invitation to:', email)

      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          clubName,
          dateText,
          message: message || undefined,
          bookingUrl: bookingUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      console.log('[INVITE] Success:', data)
      setSuccess(true)
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        setEmail('')
        setMessage('')
        setSuccess(false)
      }, 2000)

    } catch (err: any) {
      console.error('[INVITE] Error:', err)
      setError(err.message || 'Erreur lors de l\'envoi de l\'invitation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Bouton pour ouvrir le modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Inviter un ami
      </button>

      {/* Modal d'invitation */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Inviter un ami</h3>
                <p className="text-sm text-gray-600">Partagez votre réservation par email</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info réservation */}
            <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-lg">
              <p className="text-sm font-semibold text-slate-900 mb-1">{clubName}</p>
              <p className="text-sm text-slate-700">{dateText}</p>
            </div>

            {/* Success message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">Invitation envoyée avec succès !</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 mb-6">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email du destinataire *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ami@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none transition-all"
                  disabled={isLoading || success}
                  required
                />
              </div>

              {/* Message input */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message personnel (optionnel)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ajoute un message pour ton ami..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none transition-all resize-none"
                  disabled={isLoading || success}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={isLoading || success || !email}
                className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi...
                  </>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Envoyé !
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Envoyer l'invitation
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

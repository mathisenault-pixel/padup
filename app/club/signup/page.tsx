'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClubRequest, type ClubRequestData } from '@/app/actions/clubRequests'

export default function ClubRequestPage() {
  const [formData, setFormData] = useState<ClubRequestData>({
    clubName: '',
    city: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    numCourts: undefined,
    message: '',
    acceptContact: false,
    website: '',
  })
  const [honeypot, setHoneypot] = useState('') // Anti-spam
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Anti-spam: honeypot
    if (honeypot) {
      console.log('[Club Request] Honeypot triggered')
      setError('Erreur de validation')
      return
    }

    // Validation checkbox obligatoire
    if (!formData.acceptContact) {
      setError('Vous devez accepter d\'être recontacté pour envoyer votre demande')
      return
    }

    setIsLoading(true)

    try {
      const result = await createClubRequest(formData)

      if (result.success) {
        console.log('[Club Request] ✅ Success:', result.requestId)
        setShowSuccess(true)
      } else {
        setError(result.error || 'Erreur lors de l\'envoi de votre demande')
      }
    } catch (err) {
      console.error('[Club Request] Error:', err)
      setError('Une erreur inattendue s\'est produite')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée !</h2>
          <p className="text-gray-600 mb-2">Nous avons bien reçu votre demande d&apos;accès.</p>
          <p className="text-gray-600 mb-6">Notre équipe vous recontactera sous <strong>24 à 48h</strong>.</p>
          
          <div className="space-y-3">
            <Link 
              href="/club/login"
              className="block w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all"
            >
              Retour à la connexion
            </Link>
            <Link 
              href="/"
              className="block w-full px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-all"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demander un accès club</h1>
          <p className="text-gray-600">Remplissez ce formulaire, nous vous recontactons sous 24-48h</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du club */}
          <div>
            <label htmlFor="clubName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du club <span className="text-red-500">*</span>
            </label>
            <input
              id="clubName"
              name="clubName"
              type="text"
              value={formData.clubName}
              onChange={handleChange}
              placeholder="Ex: Le Hangar Padel Club"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
              Ville <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex: Avignon"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Nom / Prénom contact */}
          <div>
            <label htmlFor="contactName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nom / Prénom du contact <span className="text-red-500">*</span>
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="Ex: Jean Dupont"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="Ex: 06 12 34 56 78"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="contact@monclub.fr"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Nombre de terrains (optionnel) */}
          <div>
            <label htmlFor="numCourts" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de terrains <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              id="numCourts"
              name="numCourts"
              type="number"
              min="1"
              max="50"
              value={formData.numCourts || ''}
              onChange={handleChange}
              placeholder="Ex: 4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Site web / Instagram (optionnel) */}
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
              Site web ou Instagram <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              id="website"
              name="website"
              type="text"
              value={formData.website}
              onChange={handleChange}
              placeholder="Ex: www.monclub.fr ou @monclub_padel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Message (optionnel) */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Message <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Parlez-nous de votre club, vos besoins..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Honeypot (anti-spam) - Hidden */}
          <div className="hidden">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Checkbox accepter contact - OBLIGATOIRE */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <input
              id="acceptContact"
              name="acceptContact"
              type="checkbox"
              checked={formData.acceptContact}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-slate-900 border-gray-300 rounded focus:ring-slate-400"
            />
            <label htmlFor="acceptContact" className="text-sm text-gray-700">
              <span className="font-semibold">J&apos;accepte d&apos;être recontacté par l&apos;équipe Pad&apos;Up</span>
              <span className="text-red-500"> *</span>
              <span className="block text-xs text-gray-500 mt-1">
                Cette autorisation est nécessaire pour traiter votre demande d&apos;accès.
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Envoyer ma demande
              </>
            )}
          </button>
        </form>

        {/* Info notice */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Comment ça marche ?</p>
              <p className="text-sm text-slate-700">
                Après réception de votre demande, notre équipe vous recontactera sous 24-48h pour valider votre inscription et vous fournir vos identifiants d&apos;accès.
              </p>
            </div>
          </div>
        </div>

        {/* Already have code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un code d&apos;accès ?{' '}
            <Link href="/club/login" className="text-slate-700 hover:text-slate-900 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Back to access */}
        <div className="mt-4 text-center">
          <Link href="/club-access" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour
          </Link>
        </div>
      </div>
    </div>
  )
}

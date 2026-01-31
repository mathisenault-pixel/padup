'use client'

import { useEffect, useTransition } from 'react'
import { selectRoleAction } from './actions'

export default function OnboardingClient() {
  const [isPending, startTransition] = useTransition()

  // Sélectionner automatiquement le rôle 'player' au montage
  useEffect(() => {
    startTransition(async () => {
      try {
        await selectRoleAction('player')
        // La redirection se fait automatiquement dans l'action
      } catch (err) {
        console.error('Error selecting role:', err)
        // La redirection peut causer une "erreur" côté client, c'est normal
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bienvenue sur Pad&apos;Up 🎾
        </h1>
        <p className="text-lg text-slate-600">
          Configuration de votre compte en cours...
        </p>
      </div>
    </div>
  )
}


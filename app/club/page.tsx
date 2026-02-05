'use client'

import { useEffect, useState } from 'react'
import { getClubSession } from '@/lib/clubAuth'
import { getClubById } from '@/lib/data/clubs'
import { useReservationsStore } from '@/store/reservationsStore'
import Link from 'next/link'

export default function ClubDashboardPage() {
  const [clubData, setClubData] = useState<any>(null)
  const [stats, setStats] = useState({
    todayReservations: 0,
    totalReservations: 0,
    blockedSlots: 0,
    activeReservations: 0,
  })

  const { getReservationsByClub, getReservationsByDate, getBlockedSlotsByClub } = useReservationsStore()

  useEffect(() => {
    const session = getClubSession()
    if (!session) return

    // Charger les données du club
    const club = getClubById(session.clubId)
    setClubData(club)

    // Calculer les stats
    const today = new Date().toISOString().split('T')[0]
    const allReservations = getReservationsByClub(session.clubId)
    const todayReservations = getReservationsByDate(session.clubId, today)
    const blockedSlots = getBlockedSlotsByClub(session.clubId)

    setStats({
      todayReservations: todayReservations.length,
      totalReservations: allReservations.length,
      blockedSlots: blockedSlots.length,
      activeReservations: allReservations.filter(r => r.status === 'confirmed').length,
    })
  }, [])

  if (!clubData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Bienvenue ! 👋</h1>
        <p className="text-slate-100 text-lg">Tableau de bord - {clubData.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Réservations aujourd'hui */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.todayReservations}</p>
          <p className="text-sm text-gray-600 font-medium">Réservations aujourd'hui</p>
        </div>

        {/* Réservations actives */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeReservations}</p>
          <p className="text-sm text-gray-600 font-medium">Réservations actives</p>
        </div>

        {/* Total réservations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalReservations}</p>
          <p className="text-sm text-gray-600 font-medium">Total réservations</p>
        </div>

        {/* Slots bloqués */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.blockedSlots}</p>
          <p className="text-sm text-gray-600 font-medium">Créneaux bloqués</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/club/courts"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-slate-300 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-900 transition-all">
            <svg className="w-6 h-6 text-slate-700 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Gérer les terrains</h3>
          <p className="text-sm text-gray-600">{clubData.courts.length} terrains disponibles</p>
        </Link>

        <Link
          href="/club/reservations"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-slate-300 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-all">
            <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Voir les réservations</h3>
          <p className="text-sm text-gray-600">{stats.activeReservations} réservations en cours</p>
        </Link>

        <Link
          href="/club/settings"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-slate-300 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-all">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Paramètres</h3>
          <p className="text-sm text-gray-600">Configurer votre club</p>
        </Link>
      </div>

      {/* Club Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du club</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Adresse</p>
            <p className="text-gray-900">{clubData.address}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
            <p className="text-gray-900">{clubData.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Téléphone</p>
            <p className="text-gray-900">{clubData.phone}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Note moyenne</p>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-gray-900">{clubData.note}</span>
              <span className="text-gray-500 text-sm">({clubData.avis} avis)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

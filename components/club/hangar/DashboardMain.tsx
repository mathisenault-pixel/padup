"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Booking = {
  id: string
  club_id: string
  court_id: string
  slot_start: string
  slot_end: string
  status: string
  created_at: string
  created_by: string
}

type Court = {
  id: string
  name: string
  is_active?: boolean
}

type Props = {
  clubId: string
  initialBookings: Booking[]
  courts: Court[]
  settings: any
}

function KPI({ title, value, small }: { title: string; value: string | number; small?: string }) {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-xl p-5 min-w-[180px] shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      {small && <div className="text-xs text-slate-600 mt-1">{small}</div>}
    </div>
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

type TimeSlot = {
  courtId: string
  courtName: string
  date: string
  start: string
  end: string
  isBooked: boolean
}

export default function DashboardMain({ clubId, initialBookings, courts, settings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isLive, setIsLive] = useState(false)
  
  // Onglets : "reservations" ou "disponibilites"
  const [activeTab, setActiveTab] = useState<'reservations' | 'disponibilites'>('reservations')
  
  // Filtres pour les disponibilités
  const [periodFilter, setPeriodFilter] = useState<'today' | '7days' | 'month'>('today')
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('all')
  
  // Modal ajout réservation
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [selectedCourt, setSelectedCourt] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTime, setSelectedTime] = useState("")

  // ============================================
  // REALTIME SUBSCRIPTION (LIVE)
  // ============================================
  useEffect(() => {
    console.log('[HANGAR DASHBOARD] Setting up Realtime subscription for club:', clubId)
    
    const channel = supabase
      .channel('hangar-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log('[HANGAR DASHBOARD] Realtime event received:', payload.eventType, payload)
          
          setBookings((prev) => {
            if (payload.eventType === 'INSERT') {
              // Vérifier si le booking n'existe pas déjà
              const exists = prev.find(b => b.id === (payload.new as Booking).id)
              if (exists) return prev
              
              console.log('[HANGAR DASHBOARD] Adding new booking:', payload.new)
              return [...prev, payload.new as Booking].sort(
                (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
              )
            }
            
            if (payload.eventType === 'UPDATE') {
              console.log('[HANGAR DASHBOARD] Updating booking:', payload.new)
              return prev.map(b => 
                b.id === (payload.new as Booking).id ? (payload.new as Booking) : b
              )
            }
            
            if (payload.eventType === 'DELETE') {
              console.log('[HANGAR DASHBOARD] Deleting booking:', payload.old)
              return prev.filter(b => b.id !== (payload.old as Booking).id)
            }
            
            return prev
          })
        }
      )
      .subscribe((status) => {
        console.log('[HANGAR DASHBOARD] Subscription status:', status)
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('[HANGAR DASHBOARD] Cleaning up Realtime subscription')
      supabase.removeChannel(channel)
      setIsLive(false)
    }
  }, [clubId])

  // Filtrer les bookings pour AUJOURD'HUI uniquement (pour les KPIs et l'affichage par défaut)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  
  const bookingsToday = bookings.filter(b => {
    const slotDate = new Date(b.slot_start)
    return slotDate >= todayStart && slotDate <= todayEnd
  })
  
  console.log('[DASHBOARD MAIN] Total bookings in state:', bookings.length)
  console.log('[DASHBOARD MAIN] Bookings today:', bookingsToday.length)
  console.log('[DASHBOARD MAIN] Courts count:', courts.length)
  
  // Debug première réservation pour voir le format
  if (bookingsToday.length > 0) {
    const firstBooking = bookingsToday[0]
    console.log('[DASHBOARD MAIN] First booking raw:', firstBooking)
    console.log('[DASHBOARD MAIN] slot_start raw:', firstBooking.slot_start)
    console.log('[DASHBOARD MAIN] slot_start as Date:', new Date(firstBooking.slot_start))
    console.log('[DASHBOARD MAIN] slot_start formatted:', formatTime(firstBooking.slot_start))
    console.log('[DASHBOARD MAIN] slot_start local time:', new Date(firstBooking.slot_start).toLocaleString('fr-FR'))
  }
  
  // Calcul KPI basé sur les bookings d'AUJOURD'HUI uniquement
  const confirmed = bookingsToday.filter((b) => b.status === "confirmed").length
  const cancelled = bookingsToday.filter((b) => b.status === "cancelled").length
  
  const priceOffpeak = (settings?.price_offpeak_cents || 4000) / 100
  const revenus = confirmed * priceOffpeak

  // Calcul du taux d'occupation basé sur les heures d'ouverture réelles
  // Compter TOUS les terrains (pas seulement actifs pour le calcul d'occupation)
  const nbTerrains = courts.length > 0 ? courts.length : 1 // Au moins 1 pour éviter division par 0
  const slotMinutes = settings?.slot_minutes || 90
  
  // Calculer le nombre de créneaux par jour par terrain
  // Ex: Si ouvert de 8h à 23h = 15h = 900 min, et créneaux de 90 min = 10 créneaux
  const openHours = settings?.open_hours || { "1": { start: "08:00", end: "23:00" } }
  const firstDay = openHours["1"] || openHours["0"] || { start: "08:00", end: "23:00" }
  const [startH, startM] = firstDay.start.split(":").map(Number)
  const [endH, endM] = firstDay.end.split(":").map(Number)
  const totalMinutesOpen = (endH * 60 + endM) - (startH * 60 + startM)
  const slotsPerCourtPerDay = Math.floor(totalMinutesOpen / slotMinutes)
  
  const totalSlots = nbTerrains * slotsPerCourtPerDay
  const tauxOccupation = totalSlots > 0 ? Math.round((confirmed / totalSlots) * 100) : 0

  const now = new Date()
  const next = bookings.find(
    (b) => b.status === "confirmed" && new Date(b.slot_start) > now
  )

  const courtsMap: Record<string, string> = {}
  courts.forEach((c) => {
    courtsMap[c.id] = c.name
  })

  // Grouper les réservations d'AUJOURD'HUI par terrain
  const bookingsByCourt = courts.map(court => {
    const courtBookings = bookingsToday.filter(b => b.court_id === court.id && b.status === "confirmed")
    return {
      court,
      bookings: courtBookings,
      isEmpty: courtBookings.length === 0
    }
  })

  // ============================================
  // GÉNÉRATION DES CRÉNEAUX DISPONIBLES
  // ============================================
  
  // Fonction pour générer tous les créneaux possibles sur une période
  const generateAllSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const slotDuration = settings?.slot_minutes || 90
    
    // Déterminer la plage de dates selon le filtre
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let startDate = new Date(today)
    let endDate = new Date(today)
    
    if (periodFilter === 'today') {
      endDate.setDate(endDate.getDate() + 1)
    } else if (periodFilter === '7days') {
      endDate.setDate(endDate.getDate() + 7)
    } else if (periodFilter === 'month') {
      endDate.setMonth(endDate.getMonth() + 1)
    }
    
    // Pour chaque jour dans la période
    const currentDate = new Date(startDate)
    while (currentDate < endDate) {
      const dayOfWeek = currentDate.getDay() // 0=dimanche, 1=lundi, etc.
      const dayKey = dayOfWeek === 0 ? 'sun' : dayOfWeek === 1 ? 'mon' : dayOfWeek === 2 ? 'tue' : dayOfWeek === 3 ? 'wed' : dayOfWeek === 4 ? 'thu' : dayOfWeek === 5 ? 'fri' : 'sat'
      
      const openHours = settings?.open_hours || {}
      const daySchedule = openHours[dayKey] || openHours['mon'] || { open: '08:00', close: '23:00' }
      
      // Parser les heures d'ouverture
      const [openH, openM] = daySchedule.open.split(':').map(Number)
      const [closeH, closeM] = daySchedule.close.split(':').map(Number)
      
      const openMinutes = openH * 60 + openM
      const closeMinutes = closeH * 60 + closeM
      
      // Pour chaque terrain
      courts.forEach(court => {
        // Générer tous les créneaux pour ce terrain ce jour-là
        let currentMinutes = openMinutes
        
        while (currentMinutes + slotDuration <= closeMinutes) {
          const startH = Math.floor(currentMinutes / 60)
          const startM = currentMinutes % 60
          const endMinutes = currentMinutes + slotDuration
          const endH = Math.floor(endMinutes / 60)
          const endM = endMinutes % 60
          
          const slotStart = new Date(currentDate)
          slotStart.setHours(startH, startM, 0, 0)
          
          const slotEnd = new Date(currentDate)
          slotEnd.setHours(endH, endM, 0, 0)
          
          // Vérifier si ce créneau est réservé
          const isBooked = bookings.some(b => 
            b.court_id === court.id &&
            b.status === 'confirmed' &&
            new Date(b.slot_start).getTime() === slotStart.getTime()
          )
          
          slots.push({
            courtId: court.id,
            courtName: court.name,
            date: currentDate.toISOString().split('T')[0],
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            isBooked
          })
          
          currentMinutes += slotDuration
        }
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return slots
  }
  
  // Générer tous les créneaux
  const allSlots = generateAllSlots()
  
  // Filtrer pour n'avoir que les créneaux DISPONIBLES (non réservés)
  let availableSlots = allSlots.filter(slot => !slot.isBooked)
  
  // Appliquer le filtre terrain si sélectionné
  if (selectedCourtFilter !== 'all') {
    availableSlots = availableSlots.filter(slot => slot.courtId === selectedCourtFilter)
  }
  
  // Grouper les créneaux disponibles par date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = []
    }
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)
  
  // Compter les créneaux disponibles
  const totalAvailableSlots = availableSlots.length

  // Export CSV (exporte les bookings d'aujourd'hui)
  const exportCsv = () => {
    const headers = ["Date", "Heure début", "Heure fin", "Terrain", "Statut"]
    const rows = bookingsToday.map((b) => [
      new Date(b.slot_start).toLocaleDateString("fr-FR"),
      formatTime(b.slot_start),
      formatTime(b.slot_end),
      courtsMap[b.court_id] || "—",
      b.status === "confirmed" ? "Confirmée" : "Annulée",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `hangar-reservations-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Ajouter une réservation
  const handleAddBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      setModalError("Tous les champs sont obligatoires")
      return
    }

    setModalLoading(true)
    setModalError("")

    // Créer la date en forçant l'heure locale (pas de conversion timezone automatique)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const [year, month, day] = selectedDate.split('-').map(Number)
    
    const slotStart = new Date(year, month - 1, day, hours, minutes, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000)

    console.log('[HANGAR DASHBOARD] Creating booking:')
    console.log('  - Selected date:', selectedDate)
    console.log('  - Selected time:', selectedTime)
    console.log('  - Constructed date object:', slotStart)
    console.log('  - Slot start (local):', slotStart.toLocaleString('fr-FR'))
    console.log('  - Slot start (ISO):', slotStart.toISOString())
    console.log('  - Slot start (UTC hour):', slotStart.getUTCHours())
    console.log('  - Slot start (local hour):', slotStart.getHours())
    console.log('  - Slot end (ISO):', slotEnd.toISOString())
    console.log('  - Timezone offset:', slotStart.getTimezoneOffset())

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setModalError("Vous devez être connecté pour ajouter une réservation")
      setModalLoading(false)
      return
    }

    console.log('[HANGAR DASHBOARD] Inserting booking for court:', selectedCourt)

    const { data: insertedBooking, error } = await supabase
      .from("bookings")
      .insert({
        club_id: clubId,
        court_id: selectedCourt,
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        booking_date: selectedDate,
        status: "confirmed",
        created_by: userData.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[HANGAR DASHBOARD] Insert error:', error)
      setModalError(`Erreur: ${error.message}`)
      setModalLoading(false)
    } else {
      console.log('[HANGAR DASHBOARD] Booking inserted successfully:', insertedBooking)
      
      setIsModalOpen(false)
      setModalError("")
      setSelectedCourt("")
      setSelectedTime("")
      setModalLoading(false)
      
      // Le Realtime devrait mettre à jour automatiquement,
      // mais on fait un refetch de secours après 500ms si pas encore mis à jour
      setTimeout(async () => {
        const existsInState = bookings.some(b => b.id === insertedBooking?.id)
        if (!existsInState && insertedBooking) {
          console.log('[HANGAR DASHBOARD] Realtime delayed, adding booking manually to state')
          setBookings(prev => [...prev, insertedBooking as Booking].sort(
            (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
          ))
        }
      }, 500)
    }
  }

  return (
    <section className="space-y-6">
      {/* Live Badge */}
      <div className="flex items-center justify-end">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
          isLive 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200' 
            : 'bg-slate-200 text-slate-900'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
          <span className="text-xs font-bold">{isLive ? 'LIVE' : 'CONNEXION...'}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex gap-4 overflow-x-auto py-2 pb-4">
        <KPI title="Réservations (confirmées)" value={confirmed} small="Aujourd'hui" />
        <KPI title="Annulations" value={cancelled} small="Aujourd'hui" />
        <KPI title="Revenus" value={`${revenus}€`} small="Aujourd'hui" />
        <KPI title="Taux d'occupation" value={`${tauxOccupation}%`} small="Aujourd'hui" />
        <KPI
          title="Prochaine réservation"
          value={next ? formatTime(next.slot_start) : "—"}
          small="À venir"
        />
      </div>

      {/* Onglets : Réservations / Créneaux disponibles */}
      <div className="flex gap-2 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-5 py-3 font-semibold text-sm transition-all ${
            activeTab === 'reservations'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📅 Réservations du jour
        </button>
        <button
          onClick={() => setActiveTab('disponibilites')}
          className={`px-5 py-3 font-semibold text-sm transition-all ${
            activeTab === 'disponibilites'
              ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ✓ Créneaux disponibles
          <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
            {totalAvailableSlots}
          </span>
        </button>
      </div>

      {/* Vue : Réservations */}
      {activeTab === 'reservations' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Planning du jour par terrain</h2>
            <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
              {confirmed} réservation{confirmed > 1 ? 's' : ''}
            </span>
          </div>

          {bookingsToday.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">
              Aucune réservation aujourd'hui
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bookingsByCourt.map(({ court, bookings: courtBookings, isEmpty }) => (
                <div
                  key={court.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    isEmpty
                      ? "border-slate-200 bg-slate-50/50"
                      : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm"
                  }`}
                >
                  {/* Header terrain */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b-2 border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isEmpty ? "bg-slate-300" : "bg-emerald-500"}`}></div>
                      <h3 className="font-bold text-slate-900">{court.name}</h3>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isEmpty
                        ? "bg-slate-200 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {courtBookings.length}
                    </span>
                  </div>

                  {/* Liste des réservations ou message vide */}
                  {isEmpty ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">✓</div>
                      <p className="text-xs text-slate-500 font-medium">Disponible toute la journée</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {courtBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white border border-emerald-200 rounded-lg p-3 hover:shadow-sm transition"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold text-slate-900">
                              {formatTime(b.slot_start)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 ml-6">
                            → {formatTime(b.slot_end)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vue : Créneaux disponibles */}
      {activeTab === 'disponibilites' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-5 pb-5 border-b-2 border-slate-200">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Période</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Aujourd'hui</option>
                <option value="7days">7 prochains jours</option>
                <option value="month">Mois courant</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Terrain</label>
              <select
                value={selectedCourtFilter}
                onChange={(e) => setSelectedCourtFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les terrains</option>
                {courts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="px-5 py-2 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl">
                <div className="text-xs text-emerald-700 font-semibold uppercase">Disponibles</div>
                <div className="text-2xl font-bold text-emerald-900">{totalAvailableSlots}</div>
              </div>
            </div>
          </div>

          {/* Liste des créneaux disponibles groupés par date */}
          {Object.keys(slotsByDate).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-600 font-medium">Aucun créneau disponible sur cette période</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(slotsByDate).map(([date, slots]) => {
                const dateObj = new Date(date)
                const dateFormatted = dateObj.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })
                
                // Grouper par terrain pour ce jour
                const slotsByCourt = slots.reduce((acc, slot) => {
                  if (!acc[slot.courtId]) {
                    acc[slot.courtId] = {
                      courtName: slot.courtName,
                      slots: []
                    }
                  }
                  acc[slot.courtId].slots.push(slot)
                  return acc
                }, {} as Record<string, { courtName: string, slots: TimeSlot[] }>)

                return (
                  <div key={date} className="border-2 border-blue-100 rounded-xl overflow-hidden">
                    {/* Header date */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 flex items-center justify-between">
                      <h3 className="text-white font-bold capitalize">{dateFormatted}</h3>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full">
                        {slots.length} créneaux
                      </span>
                    </div>

                    {/* Liste des créneaux par terrain */}
                    <div className="p-4 space-y-4">
                      {Object.entries(slotsByCourt).map(([courtId, { courtName, slots: courtSlots }]) => (
                        <div key={courtId} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h4 className="font-bold text-slate-900">{courtName}</h4>
                            <span className="ml-auto text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded-full">
                              {courtSlots.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {courtSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="bg-white border-2 border-emerald-200 rounded-lg px-3 py-2 text-center hover:border-emerald-400 hover:shadow-sm transition"
                              >
                                <div className="text-xs font-bold text-emerald-700">
                                  {formatTime(slot.start)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {formatTime(slot.end)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-amber-50/30 border border-amber-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="text-sm font-semibold text-slate-900">Alertes</div>
          </div>
          <div className="text-xs text-slate-600 mt-3">Aucune alerte pour le moment</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900 mb-4">Actions rapides</div>
          <div className="space-y-2">
            <button
              onClick={() => alert("Fonctionnalité à venir : bloquer un créneau spécifique")}
              className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 transition font-semibold"
            >
              🔒 Bloquer un créneau
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition font-semibold shadow-sm"
            >
              + Ajouter une réservation
            </button>
            <button
              onClick={exportCsv}
              className="w-full py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 text-xs hover:bg-slate-50 transition font-semibold"
            >
              📥 Exporter (CSV)
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="text-sm font-semibold text-slate-900">Activité récente</div>
          </div>
          <div className="text-xs text-slate-600 mt-3">En attente d'activité…</div>
        </div>
      </div>

      {/* Modal Ajouter une réservation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Nouvelle réservation</h3>

            <div className="space-y-5">
              {/* Terrain */}
              <div>
                <label className="block text-sm text-slate-700 font-semibold mb-2">Terrain</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Sélectionner un terrain</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-slate-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Heure */}
              <div>
                <label className="block text-sm text-slate-700 font-semibold mb-2">Heure de début</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 px-3 py-2 rounded-lg">
                  ⏱️ Durée du créneau : <span className="font-semibold">{slotMinutes} min</span> (automatique)
                </p>
              </div>

              {/* Erreur */}
              {modalError && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-700 font-medium">⚠️ {modalError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setModalError("")
                  }}
                  disabled={modalLoading}
                  className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition disabled:opacity-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBooking}
                  disabled={modalLoading}
                  className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-200"
                >
                  {modalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Ajout...
                    </>
                  ) : (
                    "✓ Ajouter"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

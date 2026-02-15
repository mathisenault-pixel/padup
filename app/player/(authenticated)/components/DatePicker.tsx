'use client'

import { useState, useRef, useEffect } from 'react'

type DatePickerProps = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export default function DatePicker({
  label,
  placeholder,
  value,
  onChange
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLButtonElement>(null)

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Format de la date affichée
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // Obtenir les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Ajouter les jours vides du début
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(null)
    }

    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange(date.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    return date1.toDateString() === date2.toDateString()
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div ref={containerRef} className="relative px-4 py-2">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <button
        ref={inputRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent flex items-center gap-2"
      >
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={selectedDate ? 'text-slate-900' : 'text-slate-400'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
      </button>

      {/* Calendrier dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 w-80">
          {/* Header du calendrier */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-sm font-bold text-slate-900 capitalize">
              {monthName}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
              const isSelected = isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)

              return (
                <button
                  key={index}
                  onClick={() => !isPast && handleDateSelect(day)}
                  disabled={isPast}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${isPast 
                      ? 'text-slate-300 cursor-not-allowed' 
                      : 'hover:bg-slate-100 cursor-pointer'
                    }
                    ${isSelected 
                      ? 'bg-slate-900 text-white font-bold hover:bg-slate-800' 
                      : isTodayDate
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-slate-700'
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Actions rapides */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => handleDateSelect(new Date(Date.now() + 24 * 60 * 60 * 1000))}
              className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Demain
            </button>
            <button
              onClick={() => {
                setSelectedDate(null)
                onChange('')
                setIsOpen(false)
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

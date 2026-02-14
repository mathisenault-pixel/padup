'use client'

import { ReactNode, useEffect } from 'react'
import { useLocale } from '@/state/LocaleContext'

type FiltersDrawerProps = {
  isOpen: boolean
  onClose: () => void
  onApply?: () => void
  onReset?: () => void
  title?: string
  children: ReactNode
}

export default function FiltersDrawer({
  isOpen,
  onClose,
  onApply,
  onReset,
  title = 'Filtres',
  children,
}: FiltersDrawerProps) {
  const { t } = useLocale()
  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={t('common.fermer')}
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex gap-3" style={{ paddingBottom: 'calc(1rem + 1.5cm + env(safe-area-inset-bottom, 0px))' }}>
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t('common.reinitialiser')}
            </button>
          )}
          <button
            onClick={() => {
              onApply?.()
              onClose()
            }}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {t('common.appliquer')}
          </button>
        </div>
      </div>
    </>
  )
}

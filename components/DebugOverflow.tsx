'use client'

import { useEffect } from 'react'

/**
 * DEBUG TEMPORAIRE - À RETIRER APRÈS IDENTIFICATION DE L'OFFENDER
 * Objectif : trouver l'élément qui dépasse (right > innerWidth ou left < 0)
 */
export function DebugOverflow() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const run = () => {
      const doc = document.documentElement
      console.log('[DEBUG] clientWidth', doc.clientWidth, 'innerWidth', window.innerWidth)
      const offenders = Array.from(document.querySelectorAll('*')).filter((el) => {
        const r = el.getBoundingClientRect()
        return r.left < -1 || r.right > window.innerWidth + 1
      })
      console.log(
        '[DEBUG] OFFENDERS',
        offenders.slice(0, 20).map((el) => ({
          tag: el.tagName,
          id: el.id,
          className: el.className?.slice?.(0, 80),
          left: el.getBoundingClientRect().left,
          right: el.getBoundingClientRect().right,
          width: el.getBoundingClientRect().width,
        }))
      )
      // Remonter les ancêtres du hero pour repérer padding/max-width
      const hero = document.querySelector('section[class*="left-1/2"]')
      if (hero) {
        let el: Element | null = hero
        const chain: { tag: string; class?: string; pl: string; ml: string; width: string; maxWidth: string }[] = []
        while (el && el !== document.body) {
          const s = getComputedStyle(el)
          chain.push({
            tag: el.tagName,
            class: (el as HTMLElement).className?.slice?.(0, 60),
            pl: s.paddingLeft,
            ml: s.marginLeft,
            width: s.width,
            maxWidth: s.maxWidth,
          })
          el = el.parentElement
        }
        console.log('[DEBUG] HERO ANCESTOR CHAIN', chain)
      }
    }
    requestAnimationFrame(run)
  }, [])
  return null
}

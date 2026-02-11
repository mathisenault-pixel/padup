'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * DEBUG TEMPORAIRE - À RETIRER APRÈS IDENTIFICATION DE L'OFFENDER
 * Objectif : trouver l'élément qui dépasse (right > innerWidth ou left < 0)
 */
export function DebugOverflow() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname !== '/player/accueil') return
    if (typeof window === 'undefined') return
    const run = () => {
      const doc = document.documentElement
      const bodyStyle = getComputedStyle(document.body)
      const htmlStyle = getComputedStyle(doc)
      console.log('[DEBUG] clientWidth', doc.clientWidth, 'innerWidth', window.innerWidth)
      console.log('[DEBUG] html margin/padding', htmlStyle.marginLeft, htmlStyle.paddingLeft)
      console.log('[DEBUG] body margin/padding', bodyStyle.marginLeft, bodyStyle.paddingLeft)
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
      // Hero rect et chaîne des ancêtres
      const hero = document.querySelector('section[class*="left-1/2"]')
      if (hero) {
        const r = hero.getBoundingClientRect()
        console.log('[DEBUG] HERO RECT', { left: r.left, right: r.right, width: r.width })
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
        console.log('[DEBUG] HERO ANCESTOR CHAIN (pl=paddingLeft, ml=marginLeft)', chain)
      }
    }
    requestAnimationFrame(run)
  }, [pathname])
  return null
}

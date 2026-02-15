import { useState, useEffect } from 'react'

type ScrollDirection = 'up' | 'down' | 'top'

export function useScrollDirection(threshold: number = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('top')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }

      // Déterminer la direction
      if (scrollY === 0) {
        setScrollDirection('top')
      } else if (scrollY > lastScrollY) {
        setScrollDirection('down')
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up')
      }

      lastScrollY = scrollY > 0 ? scrollY : 0
      setScrollY(scrollY)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { scrollDirection, scrollY }
}

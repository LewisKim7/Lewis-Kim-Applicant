import { useEffect } from 'react'

const REVEAL_GROUPS = [
  '.section-heading',
  '.risk-overview__rows > li',
  '.tool-evidence',
  '.problem-grid > *',
  '.method-grid > li',
  '.demo-frame',
  '.taxonomy-card',
  '.evaluation-visual-grid',
  '.limitations-grid > *',
] as const

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function MotionEnhancer() {
  useEffect(() => {
    const root = document.documentElement
    const consolePanel = document.querySelector<HTMLElement>('.signal-console')
    const reducedMotion = prefersReducedMotion()
    let progressFrame = 0
    let tiltFrame = 0
    let pointerX = 0
    let pointerY = 0

    const updateProgress = () => {
      progressFrame = 0
      const scrollable = root.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      root.style.setProperty('--page-progress', progress.toFixed(4))
    }

    const queueProgress = () => {
      if (progressFrame) return
      progressFrame = window.requestAnimationFrame(updateProgress)
    }

    window.addEventListener('scroll', queueProgress, { passive: true })
    window.addEventListener('resize', queueProgress)
    updateProgress()

    const motionElements: HTMLElement[] = []
    let observer: IntersectionObserver | undefined
    let navObserver: IntersectionObserver | undefined

    if (!reducedMotion && 'IntersectionObserver' in window) {
      REVEAL_GROUPS.forEach((selector) => {
        document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
          element.classList.add('motion-item')
          element.style.setProperty('--motion-order', String(Math.min(index, 6)))
          motionElements.push(element)
        })
      })

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          })
        },
        { rootMargin: '0px 0px -7% 0px', threshold: 0.08 },
      )

      motionElements.forEach((element) => observer?.observe(element))
    }

    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.header-nav a[href^="#"]'),
    )
    const activateNav = (activeId: string | undefined) => {
      navLinks.forEach((link) => {
        const isActive = link.hash === `#${activeId}`
        link.classList.toggle('is-active', isActive)
        if (isActive) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
    }
    const handleHashChange = () => {
      const activeId = window.location.hash.slice(1)
      if (navLinks.some((link) => link.hash === `#${activeId}`)) activateNav(activeId)
    }
    const handleNavTargetClick = (event: Event) => {
      activateNav((event.currentTarget as HTMLElement).id)
    }
    const navTargets = navLinks.flatMap((link) => {
      const target = document.querySelector<HTMLElement>(link.hash)
      return target ? [{ link, target }] : []
    })
    navTargets.forEach(({ target }) => target.addEventListener('click', handleNavTargetClick))
    window.addEventListener('hashchange', handleHashChange)

    if ('IntersectionObserver' in window) {
      navObserver = new IntersectionObserver(
        (entries) => {
          const intersecting = entries.filter((entry) => entry.isIntersecting)
          const activeEntry = intersecting.find(
            (entry) => entry.target.getAttribute('aria-selected') === 'true',
          ) ?? intersecting[0]
          if (activeEntry) activateNav(activeEntry.target.id)
        },
        { rootMargin: '-18% 0px -70% 0px', threshold: 0 },
      )
      navTargets.forEach(({ target }) => navObserver?.observe(target))
    }

    const canTilt = !reducedMotion
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const updateTilt = () => {
      tiltFrame = 0
      if (!consolePanel) return
      const bounds = consolePanel.getBoundingClientRect()
      const normalizedX = (pointerX - bounds.left) / bounds.width - 0.5
      const normalizedY = (pointerY - bounds.top) / bounds.height - 0.5
      consolePanel.style.setProperty('--tilt-x', `${(-normalizedY * 1.6).toFixed(2)}deg`)
      consolePanel.style.setProperty('--tilt-y', `${(normalizedX * 2.1).toFixed(2)}deg`)
      consolePanel.style.setProperty('--glow-x', `${((normalizedX + 0.5) * 100).toFixed(1)}%`)
      consolePanel.style.setProperty('--glow-y', `${((normalizedY + 0.5) * 100).toFixed(1)}%`)
      consolePanel.classList.add('is-tilting')
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (tiltFrame) return
      tiltFrame = window.requestAnimationFrame(updateTilt)
    }

    const resetTilt = () => {
      consolePanel?.classList.remove('is-tilting')
      consolePanel?.style.removeProperty('--tilt-x')
      consolePanel?.style.removeProperty('--tilt-y')
      consolePanel?.style.removeProperty('--glow-x')
      consolePanel?.style.removeProperty('--glow-y')
    }

    if (canTilt && consolePanel) {
      consolePanel.addEventListener('pointermove', handlePointerMove, { passive: true })
      consolePanel.addEventListener('pointerleave', resetTilt)
    }

    return () => {
      window.removeEventListener('scroll', queueProgress)
      window.removeEventListener('resize', queueProgress)
      observer?.disconnect()
      navObserver?.disconnect()
      window.removeEventListener('hashchange', handleHashChange)
      navTargets.forEach(({ target }) => target.removeEventListener('click', handleNavTargetClick))
      navLinks.forEach((link) => {
        link.classList.remove('is-active')
        link.removeAttribute('aria-current')
      })
      motionElements.forEach((element) => {
        element.classList.remove('motion-item', 'is-visible')
        element.style.removeProperty('--motion-order')
      })
      if (progressFrame) window.cancelAnimationFrame(progressFrame)
      if (tiltFrame) window.cancelAnimationFrame(tiltFrame)
      if (consolePanel) {
        consolePanel.removeEventListener('pointermove', handlePointerMove)
        consolePanel.removeEventListener('pointerleave', resetTilt)
      }
      resetTilt()
      root.style.removeProperty('--page-progress')
    }
  }, [])

  return (
    <div className="page-progress" aria-hidden="true">
      <span />
    </div>
  )
}

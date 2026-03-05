import { useRef, useCallback } from 'react'

type SetPosFn = (x: number, y: number) => void

/**
 * Drag-to-move hook for frameless HUD windows.
 * Uses window.outerWidth/outerHeight (CSS pixels = logical pixels) for clamping so the
 * window snaps tightly to screen edges regardless of DPI scaling.
 */
export function useDraggableHud(setPosFn: SetPosFn, locked: boolean) {
  const startMouse = useRef({ x: 0, y: 0 })
  const startWin = useRef({ x: 0, y: 0 })
  const rafId = useRef<number | null>(null)
  const pendingPos = useRef<{ x: number; y: number } | null>(null)

  const clamp = useCallback((nx: number, ny: number) => {
    const ww = window.outerWidth
    const wh = window.outerHeight
    return {
      x: Math.max(0, Math.min(window.screen.availWidth - ww, nx)),
      y: Math.max(0, Math.min(window.screen.availHeight - wh, ny)),
    }
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || locked) return
    e.preventDefault()
    e.stopPropagation()

    startMouse.current = { x: e.screenX, y: e.screenY }
    startWin.current = { x: window.screenLeft, y: window.screenTop }

    document.documentElement.classList.add('hud-dragging')

    const flush = () => {
      if (pendingPos.current) {
        const { x, y } = clamp(pendingPos.current.x, pendingPos.current.y)
        setPosFn(x, y)
        pendingPos.current = null
      }
      rafId.current = null
    }

    const onMove = (ev: MouseEvent) => {
      const dx = ev.screenX - startMouse.current.x
      const dy = ev.screenY - startMouse.current.y
      pendingPos.current = { x: startWin.current.x + dx, y: startWin.current.y + dy }
      if (!rafId.current) rafId.current = requestAnimationFrame(flush)
    }

    const onUp = (ev: MouseEvent) => {
      document.documentElement.classList.remove('hud-dragging')
      if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null }
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('mouseup', onUp, true)
      const dx = ev.screenX - startMouse.current.x
      const dy = ev.screenY - startMouse.current.y
      const { x, y } = clamp(startWin.current.x + dx, startWin.current.y + dy)
      setPosFn(x, y)
    }

    window.addEventListener('mousemove', onMove, true)
    window.addEventListener('mouseup', onUp, true)
  }, [locked, clamp, setPosFn])

  return { onMouseDown }
}

import { useRef, useCallback, useEffect } from 'react'

type SetPosFn = (x: number, y: number) => void
type GetPosFn = () => Promise<{ x: number; y: number } | null>

/**
 * Drag-to-move hook for frameless HUD windows.
 * Fetches the authoritative window position from the main process at drag start so
 * mouse delta + IPC position stays in the same coordinate space, avoiding
 * the accumulating gap that occurs when using window.screenLeft/screenTop.
 * All clamping is delegated to the main process.
 */
// Height in px of the draggable toolbar area (buttons: lock / pin / close).
// When the HUD is locked (click-through), the cursor position is compared against
// this threshold so we can temporarily disable ignoreMouseEvents and let the
// toolbar buttons receive real click events.
const TOOLBAR_HEIGHT = 36

export function useDraggableHud(
  setPosFn: SetPosFn,
  getPosFn: GetPosFn,
  locked: boolean,
  setLocked: (v: boolean) => void,
  target: 'hud' | 'questHud',
  lockKey: 'hudLocked' | 'questHudLocked',
) {
  const rafId = useRef<number | null>(null)
  const pendingPos = useRef<{ x: number; y: number } | null>(null)

  // In locked (click-through) mode, Electron's setIgnoreMouseEvents(true, {forward:true})
  // still delivers mousemove to the renderer for forwarding, but blocks click events.
  // This effect monitors cursor position and temporarily disables mouse-passthrough
  // when the cursor is over the toolbar so buttons remain clickable.
  useEffect(() => {
    if (!locked) return

    const setIgnore = target === 'hud'
      ? (ignore: boolean) => { void window.windowAPI.setHudIgnoreMouse(ignore) }
      : (ignore: boolean) => { void window.windowAPI.setQuestHudIgnoreMouse(ignore) }

    const onMove = (e: MouseEvent) => {
      // Disable passthrough over toolbar, restore it over content area
      setIgnore(e.clientY > TOOLBAR_HEIGHT)
    }

    const onLeave = () => setIgnore(true)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [locked, target])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || locked) return
    e.preventDefault()
    e.stopPropagation()

    const startMouseX = e.screenX
    const startMouseY = e.screenY

    document.documentElement.classList.add('hud-dragging')

    void (async () => {
      const pos = await getPosFn()
      if (!pos) {
        document.documentElement.classList.remove('hud-dragging')
        return
      }

      const startWinX = pos.x
      const startWinY = pos.y

      const flush = () => {
        if (pendingPos.current) {
          setPosFn(pendingPos.current.x, pendingPos.current.y)
          pendingPos.current = null
        }
        rafId.current = null
      }

      const onMove = (ev: MouseEvent) => {
        const dx = ev.screenX - startMouseX
        const dy = ev.screenY - startMouseY
        pendingPos.current = { x: startWinX + dx, y: startWinY + dy }
        if (!rafId.current) rafId.current = requestAnimationFrame(flush)
      }

      const onUp = (ev: MouseEvent) => {
        document.documentElement.classList.remove('hud-dragging')
        if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null }
        window.removeEventListener('mousemove', onMove, true)
        window.removeEventListener('mouseup', onUp, true)
        const dx = ev.screenX - startMouseX
        const dy = ev.screenY - startMouseY
        setPosFn(startWinX + dx, startWinY + dy)
      }

      window.addEventListener('mousemove', onMove, true)
      window.addEventListener('mouseup', onUp, true)
    })()
  }, [locked, getPosFn, setPosFn])

  const toggleLock = useCallback(async () => {
    const newLocked = !locked
    setLocked(newLocked)
    await window.windowAPI.saveHudConfig({ [lockKey]: newLocked })
    if (target === 'hud') {
      await window.windowAPI.setHudIgnoreMouse(newLocked)
    } else {
      await window.windowAPI.setQuestHudIgnoreMouse(newLocked)
    }
  }, [locked, setLocked, target, lockKey])

  return { onMouseDown, toggleLock }
}

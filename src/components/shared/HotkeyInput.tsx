import { useState, useEffect, useRef } from 'react'
import { useT } from '../../utils/i18n'

interface HotkeyInputProps {
  value: string
  onChange: (hotkey: string) => void
}

function toElectronKey(e: KeyboardEvent): string | null {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (e.metaKey) parts.push('Super')
  const key = e.key
  // Ignore lone modifier keys
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return null
  // Map special keys to Electron names
  const MAP: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Escape',
    Enter: 'Return',
    Tab: 'Tab',
    Backspace: 'Backspace',
    Delete: 'Delete'
  }
  parts.push(MAP[key] ?? key.toUpperCase())
  return parts.join('+')
}

export function HotkeyInput({ value, onChange }: HotkeyInputProps): JSX.Element {
  const [recording, setRecording] = useState(false)
  const t = useT()
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!recording) return
    function handleKey(e: KeyboardEvent) {
      e.preventDefault()
      const hotkey = toElectronKey(e)
      if (hotkey) {
        onChange(hotkey)
        setRecording(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [recording, onChange])

  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 rounded border border-edge bg-abyss-deep px-3 py-1.5 font-mono text-sm text-ink-hi">
        {recording ? t('hotkeyRecording') : value}
      </span>
      <button
        ref={ref}
        onClick={() => setRecording((r) => !r)}
        className={`text-xs px-3 py-1.5 rounded border transition-colors ${
          recording ? 'border-gold text-gold' : 'border-edge text-ink-dim hover:text-ink-hi'
        }`}
      >
        {t('hotkeyReset')}
      </button>
    </div>
  )
}

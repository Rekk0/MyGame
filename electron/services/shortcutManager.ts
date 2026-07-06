import { globalShortcut } from 'electron'
import { toggleQuickInput } from '../windows/quickInput'

const DEFAULT_HOTKEY = 'Ctrl+Shift+Q'
let currentHotkey = DEFAULT_HOTKEY

export function registerQuickInputShortcut(hotkey?: string): void {
  const key = hotkey ?? DEFAULT_HOTKEY
  globalShortcut.unregister(currentHotkey)
  const ok = globalShortcut.register(key, toggleQuickInput)
  if (ok) {
    currentHotkey = key
  } else {
    // Fallback: restore previous hotkey
    globalShortcut.register(currentHotkey, toggleQuickInput)
  }
}

export function getCurrentHotkey(): string {
  return currentHotkey
}

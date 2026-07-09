import { useEffect, useState } from 'react'
import { useT } from '../../../utils/i18n'
import type { StringKey } from '../../../utils/i18n'

/** HUD opacity sliders — saves immediately on change, independent of the settings save button. */
export function HudAppearanceSection(): JSX.Element {
  const [bgOpacity, setBgOpacity] = useState(75)
  const [textOpacity, setTextOpacity] = useState(100)
  const t = useT()

  useEffect(() => {
    window.windowAPI.getHudConfig().then((cfg) => {
      setBgOpacity(Math.round((cfg.hudBgOpacity ?? 0.75) * 100))
      setTextOpacity(Math.round((cfg.hudTextOpacity ?? 1.0) * 100))
    })
  }, [])

  const save = (bg: number, text: number): void => {
    void window.windowAPI.saveHudConfig({
      hudBgOpacity: bg / 100,
      hudTextOpacity: text / 100
    })
  }

  const slider = (label: StringKey, value: number, onChange: (v: number) => void): JSX.Element => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-ink-dim">{t(label)}</label>
        <span className="w-8 text-right text-xs tabular-nums text-ink">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-(--rpg-gold)"
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-3 border-t border-edge pt-3">
      <h3 className="text-sm font-semibold text-ink">{t('hudAppearance')}</h3>
      {slider('bgOpacity', bgOpacity, (v) => {
        setBgOpacity(v)
        save(v, textOpacity)
      })}
      {slider('textOpacity', textOpacity, (v) => {
        setTextOpacity(v)
        save(bgOpacity, v)
      })}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '../Button'
import { ImageApiSection } from './ImageApiSection'
import { fieldClass, pillClass } from './styles'
import { useLanguageStore } from '../../../stores/languageStore'
import { usePlayerStore } from '../../../stores/playerStore'
import { useBackgroundStore } from '../../../stores/backgroundStore'
import { useT, WORLD_STYLE_DATA } from '../../../utils/i18n'
import { BACKGROUND_PROMPTS } from '../../../utils/backgroundPrompts'
import type { WorldStyle } from '../../../types/player'

export function BackgroundSettings(): JSX.Element {
  const t = useT()
  const { language } = useLanguageStore()
  const initialWorld = usePlayerStore.getState().player?.worldStyle ?? 'realistic'
  const [world, setWorld] = useState<WorldStyle>(initialWorld)
  const [prompt, setPrompt] = useState(BACKGROUND_PROMPTS[initialWorld])
  const [preview, setPreview] = useState<string | null>(null)
  const [worldsWithBg, setWorldsWithBg] = useState<Partial<Record<WorldStyle, boolean>>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.backgroundAPI.getConfig().then(({ worlds }) => setWorldsWithBg(worlds))
  }, [])

  useEffect(() => {
    setPrompt(BACKGROUND_PROMPTS[world])
    setError(null)
    window.backgroundAPI.getImage(world).then(setPreview)
  }, [world])

  const applyResult = (url: string | null): void => {
    setPreview(url)
    setWorldsWithBg((m) => ({ ...m, [world]: url !== null }))
    useBackgroundStore.getState().setBackground(world, url)
  }

  const handleGenerate = async (): Promise<void> => {
    const { config } = await window.backgroundAPI.getConfig()
    if (!config?.apiKey.trim()) {
      setError(t('bgNeedKey'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const url = await window.backgroundAPI.generate(world, prompt)
      applyResult(url)
    } catch (e) {
      setError(t('bgFailed') + (e instanceof Error ? e.message : String(e)))
    } finally {
      setBusy(false)
    }
  }

  const handleUpload = async (): Promise<void> => {
    const url = await window.backgroundAPI.upload(world).catch(() => null)
    if (url) applyResult(url)
  }

  const handleClear = async (): Promise<void> => {
    await window.backgroundAPI.clear(world)
    applyResult(null)
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
      <ImageApiSection />
      <div className="flex flex-col gap-2 border-t border-edge pt-3">
        <h3 className="text-sm font-semibold text-ink">{t('bgWorldSection')}</h3>
        <div className="flex flex-wrap gap-2">
          {WORLD_STYLE_DATA[language].map((w) => (
            <button
              key={w.value}
              onClick={() => setWorld(w.value)}
              className={pillClass(world === w.value)}
            >
              {w.label}
              {worldsWithBg[w.value] ? ' ●' : ''}
            </button>
          ))}
        </div>
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded border border-edge bg-abyss-deep">
          {preview ? (
            <img src={preview} alt={world} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-ink-dim">{t('bgNoImage')}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-ink-dim">{t('bgPrompt')}</label>
          <button
            onClick={() => setPrompt(BACKGROUND_PROMPTS[world])}
            className="text-xs text-ink-dim hover:text-ink-hi"
          >
            {t('bgResetPrompt')}
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className={`${fieldClass} resize-none`}
        />
        {error && <p className="text-xs text-crimson">{error}</p>}
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleGenerate} disabled={busy} className="flex-1">
            {busy ? t('bgGenerating') : t('bgGenerate')}
          </Button>
          <Button variant="secondary" onClick={handleUpload} disabled={busy}>
            {t('bgUpload')}
          </Button>
          {preview && (
            <Button variant="secondary" onClick={handleClear} disabled={busy}>
              {t('bgClear')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

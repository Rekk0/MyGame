import { useState } from 'react'
import { Sword } from '@phosphor-icons/react'
import { usePlayerStore } from '../../stores/playerStore'
import { useT } from '../../utils/i18n'
import { WORLD_STYLE_DATA } from '../../utils/i18n'
import { useLanguageStore } from '../../stores/languageStore'
import type { WorldStyle } from '../../types/player'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'

interface CreateCharacterProps {
  onCreated: () => void
}

export function CreateCharacter({ onCreated }: CreateCharacterProps): JSX.Element {
  const [name, setName] = useState('')
  const [worldStyle, setWorldStyle] = useState<WorldStyle | null>(null)
  const { createPlayer, loading } = usePlayerStore()
  const { language, setLanguage } = useLanguageStore()
  const t = useT()

  const worldStyles = WORLD_STYLE_DATA[language]

  const handleSubmit = async (): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed || !worldStyle) return
    await createPlayer(trimmed, worldStyle)
    onCreated()
  }

  return (
    <div className="rpg-frame-ornate relative flex w-full max-w-lg flex-col items-center gap-6 rounded-lg bg-panel p-8">
      <div className="absolute right-4 top-4 flex gap-1">
        <button
          onClick={() => setLanguage('zh')}
          className={`rounded border px-2 py-0.5 text-xs transition-colors ${
            language === 'zh' ? 'border-gold text-gold' : 'border-edge text-ink-dim hover:text-ink'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`rounded border px-2 py-0.5 text-xs transition-colors ${
            language === 'en' ? 'border-gold text-gold' : 'border-edge text-ink-dim hover:text-ink'
          }`}
        >
          EN
        </button>
      </div>
      <div className="text-center">
        <p className="font-display text-4xl font-bold tracking-widest text-gold-bright">
          {t('appName')}
        </p>
        <p className="mt-1 text-sm italic text-ink-dim">{t('appSlogan')}</p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-edge-strong to-transparent" />

      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-bold text-gold">
          <Sword size={22} weight="duotone" />
          {t('createCharacterTitle')}
        </h1>
        <p className="mt-2 text-sm text-ink-dim">{t('adventureSubtitle')}</p>
      </div>

      <div className="flex w-full gap-2">
        <Input
          value={name}
          onChange={setName}
          placeholder={t('namePlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
      </div>

      <div className="w-full">
        <p className="mb-2 text-xs text-ink-dim">{t('selectWorldStyle')}</p>
        <div className="grid grid-cols-3 gap-2">
          {worldStyles.map((ws) => (
            <button
              key={ws.value}
              onClick={() => setWorldStyle(ws.value as WorldStyle)}
              className={`rounded-lg border p-2 text-left transition-colors ${
                worldStyle === ws.value
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-edge bg-panel-raised text-ink hover:border-edge-strong'
              }`}
            >
              <p className="text-sm font-bold">{ws.label}</p>
              <p className="mt-0.5 text-xs text-ink-dim">{ws.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading || !name.trim() || !worldStyle}>
        {t('createCharacterBtn')}
      </Button>
    </div>
  )
}

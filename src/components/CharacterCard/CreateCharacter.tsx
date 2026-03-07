import { useState } from 'react'
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
  const { language } = useLanguageStore()
  const t = useT()

  const worldStyles = WORLD_STYLE_DATA[language]

  const handleSubmit = async (): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed || !worldStyle) return
    await createPlayer(trimmed, worldStyle)
    onCreated()
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-700 bg-gray-800 p-8 w-full max-w-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-yellow-400">⚔️ {t('createCharacterTitle')}</h1>
        <p className="mt-2 text-sm text-gray-400">{t('adventureSubtitle')}</p>
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
        <p className="mb-2 text-xs text-gray-400">{t('selectWorldStyle')}</p>
        <div className="grid grid-cols-3 gap-2">
          {worldStyles.map((ws) => (
            <button
              key={ws.value}
              onClick={() => setWorldStyle(ws.value as WorldStyle)}
              className={`rounded-lg border p-2 text-left transition-colors ${
                worldStyle === ws.value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <p className="text-sm font-bold">{ws.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ws.desc}</p>
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

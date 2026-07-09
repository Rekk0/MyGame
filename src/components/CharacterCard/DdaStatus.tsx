import { useEffect, useState } from 'react'
import { BatteryLow, CloudLightning, Waves } from '@phosphor-icons/react'
import { ModalShell } from '../shared/Panel'
import { useT } from '../../utils/i18n'

type DdaState = 'anxious' | 'flow' | 'bored'
interface DdaInfo {
  state: DdaState
  xpMultiplier: number
  suggestion: string
}
interface DdaSuggestion {
  mood: string
  tips: string[]
  suggestedQuestTypes: string[]
}

const DDA_ICONS: Record<DdaState, JSX.Element> = {
  anxious: <CloudLightning size={16} weight="fill" />,
  flow: <Waves size={16} weight="fill" />,
  bored: <BatteryLow size={16} weight="fill" />
}
const DDA_COLORS: Record<DdaState, string> = {
  anxious: 'text-crimson',
  flow: 'text-arcane',
  bored: 'text-gold'
}
const DDA_LABEL_KEYS: Record<DdaState, 'ddaAnxious' | 'ddaFlow' | 'ddaBored'> = {
  anxious: 'ddaAnxious',
  flow: 'ddaFlow',
  bored: 'ddaBored'
}

export function DdaStatus(): JSX.Element {
  const t = useT()
  const [ddaInfo, setDdaInfo] = useState<DdaInfo | null>(null)
  const [ddaSuggestion, setDdaSuggestion] = useState<DdaSuggestion | null>(null)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  useEffect(() => {
    window.ddaAPI
      .getState()
      .then(setDdaInfo)
      .catch(() => {})
  }, [])

  useEffect(() => {
    return window.dataAPI.onUpdated(() => {
      window.ddaAPI
        .getState()
        .then(setDdaInfo)
        .catch(() => {})
    })
  }, [])

  const handleShowSuggestion = async (): Promise<void> => {
    setShowSuggestion(true)
    if (!ddaSuggestion) {
      setLoadingSuggestion(true)
      try {
        const s = await window.ddaAPI.getSuggestion()
        setDdaSuggestion(s)
      } catch {
        /* ignore */
      }
      setLoadingSuggestion(false)
    }
  }

  return (
    <>
      {ddaInfo && (
        <button
          onClick={handleShowSuggestion}
          className={`flex items-center justify-center gap-1 text-sm font-medium ${DDA_COLORS[ddaInfo.state]} hover:opacity-80`}
          title={ddaInfo.suggestion}
        >
          {DDA_ICONS[ddaInfo.state]} {t(DDA_LABEL_KEYS[ddaInfo.state])}
        </button>
      )}
      {showSuggestion && (
        <ModalShell
          title={t('todaySuggestion')}
          onClose={() => setShowSuggestion(false)}
          className="mx-4 w-full max-w-sm"
        >
          <div className="px-5 pb-5 pt-3">
            {loadingSuggestion ? (
              <p className="text-sm text-ink-dim">{t('aiGenerating')}</p>
            ) : ddaSuggestion ? (
              <>
                <p className="mb-2 text-sm text-arcane">
                  {t('status')}
                  {ddaSuggestion.mood}
                </p>
                <ul className="space-y-1">
                  {ddaSuggestion.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-ink">
                      • {tip}
                    </li>
                  ))}
                </ul>
                {ddaSuggestion.suggestedQuestTypes.length > 0 && (
                  <p className="mt-3 text-xs text-ink-dim">
                    {t('recommendedTypes')}
                    {ddaSuggestion.suggestedQuestTypes.join('、')}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-dim">{t('noSuggestion')}</p>
            )}
          </div>
        </ModalShell>
      )}
    </>
  )
}

import { useEffect, useState, type ReactNode } from 'react'
import { BatteryFull, Sword, Waves } from '@phosphor-icons/react'
import { ModalShell } from '../shared/Panel'
import { useT } from '../../utils/i18n'

type DdaState = 'anxious' | 'flow' | 'bored'
interface DdaInfo {
  state: DdaState
  xpMultiplier: number
  suggestion: string
  challenge?: number
  capacity?: number
}
interface DdaSuggestion {
  mood: string
  tips: string[]
  suggestedQuestTypes: string[]
}

const DDA_ICONS: Record<DdaState, JSX.Element> = {
  anxious: <Sword size={16} weight="fill" />,
  flow: <Waves size={16} weight="fill" />,
  bored: <BatteryFull size={16} weight="fill" />
}
const DDA_ACCENTS: Record<DdaState, string> = {
  anxious: 'var(--rpg-crimson)',
  flow: 'var(--rpg-arcane)',
  bored: 'var(--rpg-gold)'
}
const DDA_LABEL_KEYS: Record<DdaState, 'ddaAnxious' | 'ddaFlow' | 'ddaBored'> = {
  anxious: 'ddaAnxious',
  flow: 'ddaFlow',
  bored: 'ddaBored'
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }): JSX.Element {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <span className="flex flex-1 items-center gap-1">
      <span className="shrink-0">{label}</span>
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-edge">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </span>
    </span>
  )
}

/** 把子内容（三资源 / 金币 / 连胜）包进一个心流状态框：框色与辉光跟随当前 DDA 状态 */
export function DdaStatus({ children }: { children: ReactNode }): JSX.Element {
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

  const accent = ddaInfo ? DDA_ACCENTS[ddaInfo.state] : 'var(--rpg-edge-strong)'

  return (
    <>
      <div
        className="rpg-frame flex flex-col gap-3 rounded-lg p-3"
        style={{
          borderColor: `color-mix(in oklab, ${accent} 55%, transparent)`,
          background: `color-mix(in oklab, ${accent} 8%, var(--rpg-panel))`,
          boxShadow: `inset 0 0 16px color-mix(in oklab, ${accent} 12%, transparent)`
        }}
      >
        {ddaInfo && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 font-display text-sm font-bold tracking-wide"
                style={{ color: accent }}
              >
                {DDA_ICONS[ddaInfo.state]}
                {t(DDA_LABEL_KEYS[ddaInfo.state])}
              </span>
              <button
                onClick={handleShowSuggestion}
                className="text-[11px] font-medium hover:opacity-80"
                style={{ color: accent }}
                title={ddaInfo.suggestion}
              >
                {t('viewSuggestion')} ›
              </button>
            </div>
            {ddaInfo.challenge != null && ddaInfo.capacity != null && (
              <div className="flex items-center gap-2 text-[9px] text-ink-faint">
                <MiniBar label={t('ddaChallenge')} value={ddaInfo.challenge} color="var(--rpg-crimson)" />
                <MiniBar label={t('ddaCapacity')} value={ddaInfo.capacity} color="var(--rpg-arcane)" />
              </div>
            )}
          </div>
        )}
        {children}
      </div>
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

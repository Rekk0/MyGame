import { useState } from 'react'
import { Scroll } from '@phosphor-icons/react'
import { useQuestStore } from '../../stores/questStore'
import { useT } from '../../utils/i18n'
import { countTodayCompleted, countWeekCompleted } from '../../utils/dateUtils'
import { useTypewriter } from '../../hooks/useTypewriter'

interface PeriodPanelProps {
  type: 'daily' | 'weekly'
  status: { eligible: boolean; cached?: string }
  onRefresh: () => void
}

export function PeriodPanel({ type, status, onRefresh }: PeriodPanelProps): JSX.Element {
  const t = useT()
  const quests = useQuestStore((s) => s.quests)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [justGeneratedText, setJustGeneratedText] = useState<string | undefined>()

  // Only typewrite freshly generated text; cached → direct display
  const [displayed, typing, skip] = useTypewriter(justGeneratedText)

  const isDaily = type === 'daily'
  const completed = isDaily ? countTodayCompleted(quests) : countWeekCompleted(quests)
  const target = isDaily ? 3 : 15
  const themedColor = isDaily ? 'text-spirit' : 'text-gold'
  const lockedKey = isDaily ? 'journalLockedDaily' : 'journalLockedWeekly'

  const handleGenerate = async (): Promise<void> => {
    setError(undefined)
    setGenerating(true)
    try {
      const summary = isDaily
        ? await window.plotAPI.generateDaily()
        : await window.plotAPI.generateWeekly()
      setJustGeneratedText(summary)
      onRefresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg.includes('configured') ? t('configureAI') : msg)
    }
    setGenerating(false)
  }

  // Locked state
  if (!status.eligible) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Scroll size={40} className="text-ink-faint" />
        <p className="text-base text-ink-dim">{t(lockedKey)}</p>
        <p className="text-sm text-ink-faint">
          {t('journalProgress')} {completed} / {target}
        </p>
      </div>
    )
  }

  // Showing freshly generated text with typewriter
  if (justGeneratedText) {
    return (
      <div className="mx-auto max-w-[680px]">
        {error && <p className="mb-3 text-sm text-crimson">{error}</p>}
        <p
          className={`cursor-pointer whitespace-pre-wrap font-display text-base leading-relaxed text-ink ${typing ? themedColor : ''}`}
          onClick={skip}
          title={typing ? t('clickToSkip') : undefined}
        >
          {displayed}
        </p>
      </div>
    )
  }

  // Showing cached text — no typewriter, full text directly
  if (status.cached) {
    return (
      <div className="mx-auto max-w-[680px]">
        {error && <p className="mb-3 text-sm text-crimson">{error}</p>}
        <p className="whitespace-pre-wrap font-display text-base leading-relaxed text-ink">
          {status.cached}
        </p>
      </div>
    )
  }

  // Ready to generate
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className={`rounded-full border-2 p-5 ${themedColor} border-current opacity-60`}>
        <Scroll size={36} />
      </div>
      {error ? (
        <p className="text-sm text-crimson">{error}</p>
      ) : generating ? (
        <p className="text-sm text-ink-dim">{t('aiWritingStory')}</p>
      ) : (
        <button
          onClick={handleGenerate}
          className={`rpg-frame rounded-lg px-6 py-2.5 font-display text-base font-bold transition-colors ${themedColor} border-current hover:opacity-80`}
        >
          {t('journalGenerateBtn')}
        </button>
      )}
    </div>
  )
}

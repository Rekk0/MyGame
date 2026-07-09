import { useEffect, useRef, useState } from 'react'
import { Scroll } from '@phosphor-icons/react'
import { ModalShell } from '../shared/Panel'
import { useT } from '../../utils/i18n'

interface PlotScrollButtonProps {
  type: 'daily' | 'weekly'
  onOpen: () => void
}

export function PlotScrollButton({ type, onOpen }: PlotScrollButtonProps): JSX.Element {
  const t = useT()
  const isDaily = type === 'daily'
  const colorClass = isDaily
    ? 'text-spirit border-spirit/60 hover:border-spirit'
    : 'text-gold border-gold/60 hover:border-gold'
  const title = isDaily ? t('dailyPlotTitle') : t('weeklyPlotTitle')

  return (
    <div className="relative mt-2">
      <button
        onClick={onOpen}
        className={`relative rounded border bg-panel-raised px-2 py-1.5 transition-colors ${colorClass}`}
        title={title}
      >
        <Scroll size={18} weight="duotone" />
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-crimson text-xs font-bold leading-none text-ink-hi">
          !
        </span>
      </button>
    </div>
  )
}

interface PlotModalProps {
  type: 'daily' | 'weekly'
  onClose: () => void
  summary?: string
  loading: boolean
  error?: string
}

export function PlotModal({ type, onClose, summary, loading, error }: PlotModalProps): JSX.Element {
  const t = useT()
  const isDaily = type === 'daily'
  const titleText = isDaily ? t('dailyPlotTitle') : t('weeklyPlotTitle')

  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!summary) {
      setDisplayed('')
      return
    }
    setDisplayed('')
    setTyping(true)
    let i = 0
    function tick() {
      i++
      setDisplayed(summary!.slice(0, i))
      if (i < summary!.length) {
        timerRef.current = setTimeout(tick, 30)
      } else {
        setTyping(false)
      }
    }
    timerRef.current = setTimeout(tick, 30)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [summary])

  const handleSkip = () => {
    if (typing && summary) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayed(summary)
      setTyping(false)
    }
  }

  return (
    <ModalShell
      title={
        <span className="flex items-center gap-2">
          <Scroll size={18} weight="duotone" />
          {titleText}
        </span>
      }
      titleClassName={isDaily ? 'text-spirit' : 'text-gold'}
      onClose={onClose}
      className="mx-4 max-h-[80vh] w-full max-w-lg"
    >
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <p className="text-sm text-ink-dim">{t('aiWritingStory')}</p>
        ) : error ? (
          <p className="text-sm text-crimson">{error}</p>
        ) : (
          <p
            className="cursor-pointer whitespace-pre-wrap font-display text-sm leading-relaxed text-ink"
            onClick={handleSkip}
            title={typing ? t('clickToSkip') : undefined}
          >
            {displayed}
          </p>
        )}
      </div>
    </ModalShell>
  )
}

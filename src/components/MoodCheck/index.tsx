import { useState } from 'react'
import { Smiley, SmileyMeh, SmileySad, SmileyWink, SmileyXEyes } from '@phosphor-icons/react'
import { useT } from '../../utils/i18n'
import { usePlayerStore } from '../../stores/playerStore'

interface MoodCheckProps {
  onClose: () => void
}

const MOODS: {
  score: number
  key: 'moodVeryHappy' | 'moodHappy' | 'moodNeutral' | 'moodSad' | 'moodVerySad'
  icon: JSX.Element
}[] = [
  {
    score: 5,
    key: 'moodVeryHappy',
    icon: <Smiley size={26} weight="fill" className="text-ep" />
  },
  {
    score: 2,
    key: 'moodHappy',
    icon: <SmileyWink size={26} weight="fill" className="text-gold" />
  },
  {
    score: 0,
    key: 'moodNeutral',
    icon: <SmileyMeh size={26} weight="fill" className="text-ink-dim" />
  },
  {
    score: -2,
    key: 'moodSad',
    icon: <SmileySad size={26} weight="fill" className="text-spirit" />
  },
  {
    score: -5,
    key: 'moodVerySad',
    icon: <SmileyXEyes size={26} weight="fill" className="text-crimson" />
  }
]

export function MoodCheck({ onClose }: MoodCheckProps): JSX.Element {
  const t = useT()
  const fetchPlayer = usePlayerStore((s) => s.fetchPlayer)
  const [feedback, setFeedback] = useState<string | null>(null)

  const record = async (score: number) => {
    await window.resourceAPI.recordMood(score)
    await fetchPlayer()
    setFeedback(t('moodRecorded'))
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim" onClick={onClose}>
      <div
        className="rpg-frame-ornate flex flex-col gap-4 rounded-lg bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-center font-display text-lg font-bold text-ink-hi">{t('moodTitle')}</h3>
        <p className="text-center text-sm text-ink-dim">{t('moodHint')}</p>
        <div className="flex justify-center gap-3">
          {MOODS.map((m) => (
            <button
              key={m.score}
              onClick={() => record(m.score)}
              disabled={feedback != null}
              className="flex flex-col items-center gap-1 rounded-lg border border-edge bg-panel-raised px-3 py-2 text-sm text-ink transition-colors hover:border-edge-strong hover:text-ink-hi disabled:opacity-50"
            >
              {m.icon}
              <span>{t(m.key)}</span>
            </button>
          ))}
        </div>
        {feedback && <p className="text-center text-sm text-ep">{feedback}</p>}
        <button onClick={onClose} className="self-center text-xs text-ink-dim hover:text-ink">
          {t('close')}
        </button>
      </div>
    </div>
  )
}

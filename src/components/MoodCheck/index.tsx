import { useState } from 'react'
import { useT } from '../../utils/i18n'
import { usePlayerStore } from '../../stores/playerStore'

interface MoodCheckProps {
  onClose: () => void
}

const MOODS: { score: number; key: 'moodVeryHappy' | 'moodHappy' | 'moodNeutral' | 'moodSad' | 'moodVerySad' }[] = [
  { score: 5, key: 'moodVeryHappy' },
  { score: 2, key: 'moodHappy' },
  { score: 0, key: 'moodNeutral' },
  { score: -2, key: 'moodSad' },
  { score: -5, key: 'moodVerySad' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="flex flex-col gap-4 rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white text-center">{t('moodTitle')}</h3>
        <p className="text-sm text-gray-400 text-center">{t('moodHint')}</p>
        <div className="flex gap-3 justify-center">
          {MOODS.map((m) => (
            <button
              key={m.score}
              onClick={() => record(m.score)}
              disabled={feedback != null}
              className="flex flex-col items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">{t(m.key).split(' ')[0]}</span>
              <span>{t(m.key).split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
        {feedback && <p className="text-center text-green-400 text-sm">{feedback}</p>}
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-300 self-center"
        >
          {t('close')}
        </button>
      </div>
    </div>
  )
}

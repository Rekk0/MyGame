import { useState, useRef } from 'react'
import { Input } from '../shared/Input'
import { Button } from '../shared/Button'
import { useT } from '../../utils/i18n'
import RatingSliders from './RatingSliders'

interface Ratings {
  E?: number
  D?: number
  L?: number
}

interface QuestInputProps {
  onSubmit: (text: string, ratings?: Ratings, dueDate?: string) => void
}

export function QuestInput({ onSubmit }: QuestInputProps): JSX.Element {
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const ratingsRef = useRef<Ratings | undefined>(undefined)
  const t = useT()

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed, ratingsRef.current, dueDate || undefined)
    setText('')
    setDueDate('')
    ratingsRef.current = undefined
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={setText}
          placeholder={t('questInputPlaceholder')}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Button onClick={handleSubmit} disabled={!text.trim()}>
          {t('addBtn')}
        </Button>
      </div>
      <div className="flex items-start justify-between gap-4">
        <RatingSliders onChange={(r) => { ratingsRef.current = r }} />
        <div className="flex items-center gap-2 text-xs text-ink-dim">
          <label htmlFor="quest-due">{t('dueDateLabel')}</label>
          <input
            id="quest-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded border border-edge bg-transparent px-2 py-1 text-ink-hi outline-none focus:border-edge-strong"
          />
        </div>
      </div>
    </div>
  )
}

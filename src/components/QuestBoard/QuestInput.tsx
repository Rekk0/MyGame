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
  onSubmit: (text: string, ratings?: Ratings) => void
}

export function QuestInput({ onSubmit }: QuestInputProps): JSX.Element {
  const [text, setText] = useState('')
  const ratingsRef = useRef<Ratings | undefined>(undefined)
  const t = useT()

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed, ratingsRef.current)
    setText('')
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
      <RatingSliders onChange={(r) => { ratingsRef.current = r }} />
    </div>
  )
}

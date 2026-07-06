import { useState, useRef, useEffect } from 'react'
import { useQuestStore } from '../../stores/questStore'
import { useT } from '../../utils/i18n'
import RatingSliders from '../QuestBoard/RatingSliders'

export default function QuickInput() {
  const [text, setText] = useState('')
  const createQuest = useQuestStore((s) => s.createQuest)
  const inputRef = useRef<HTMLInputElement>(null)
  const ratingsRef = useRef<{ E?: number; D?: number; L?: number } | undefined>(undefined)
  const t = useT()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    if (!text.trim()) return
    await createQuest(text.trim(), ratingsRef.current)
    setText('')
    ratingsRef.current = undefined
    window.windowAPI.hideQuickInput()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') window.windowAPI.hideQuickInput()
  }

  return (
    <div className="flex flex-col h-screen justify-center px-4 bg-gray-900 rounded-lg gap-3">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('quickInputPlaceholder')}
        className="w-full bg-transparent text-white text-base outline-none placeholder-gray-500"
      />
      <RatingSliders onChange={(r) => { ratingsRef.current = r }} />
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useQuestStore } from '../../stores/questStore'

export default function QuickInput() {
  const [text, setText] = useState('')
  const createQuest = useQuestStore((s) => s.createQuest)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    if (!text.trim()) return
    await createQuest(text.trim())
    setText('')
    window.windowAPI.hideQuickInput()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') window.windowAPI.hideQuickInput()
  }

  return (
    <div className="flex h-screen items-center px-4 bg-gray-900 rounded-lg">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入任务，回车提交..."
        className="w-full bg-transparent text-white text-base outline-none placeholder-gray-500"
      />
    </div>
  )
}

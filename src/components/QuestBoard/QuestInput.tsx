import { useState } from 'react'
import { Input } from '../shared/Input'
import { Button } from '../shared/Button'

interface QuestInputProps {
  onSubmit: (text: string) => void
}

export function QuestInput({ onSubmit }: QuestInputProps): JSX.Element {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex gap-2">
      <Input
        value={text}
        onChange={setText}
        placeholder="输入新任务..."
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Button onClick={handleSubmit} disabled={!text.trim()}>
        添加
      </Button>
    </div>
  )
}

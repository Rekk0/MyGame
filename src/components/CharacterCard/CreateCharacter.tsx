import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'

interface CreateCharacterProps {
  onCreated: () => void
}

export function CreateCharacter({ onCreated }: CreateCharacterProps): JSX.Element {
  const [name, setName] = useState('')
  const { createPlayer, loading } = usePlayerStore()

  const handleSubmit = async (): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed) return
    await createPlayer(trimmed)
    onCreated()
  }
  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-700 bg-gray-800 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-yellow-400">⚔️ 创建角色</h1>
        <p className="mt-2 text-sm text-gray-400">踏上你的冒险之旅</p>
      </div>
      <div className="flex w-full max-w-sm gap-2">
        <Input
          value={name}
          onChange={setName}
          placeholder="输入角色名称..."
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
          创建
        </Button>
      </div>
    </div>
  )
}

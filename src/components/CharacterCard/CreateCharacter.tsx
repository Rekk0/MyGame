import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import type { WorldStyle } from '../../types/player'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'

interface CreateCharacterProps {
  onCreated: () => void
}

const WORLD_STYLES: { value: WorldStyle; label: string; desc: string }[] = [
  { value: 'realistic', label: '现实', desc: '当代都市，真实世界' },
  { value: 'wuxia', label: '武侠', desc: '江湖恩怨，侠义精神' },
  { value: 'xianxia', label: '仙侠', desc: '修仙问道，飞升成仙' },
  { value: 'fantasy', label: '奇幻', desc: '魔法大陆，龙与地下城' },
  { value: 'scifi', label: '科幻', desc: '星际文明，赛博朋克' },
  { value: 'apocalypse', label: '末日', desc: '末世求生，荒野冒险' },
]

export function CreateCharacter({ onCreated }: CreateCharacterProps): JSX.Element {
  const [name, setName] = useState('')
  const [worldStyle, setWorldStyle] = useState<WorldStyle | null>(null)
  const { createPlayer, loading } = usePlayerStore()

  const handleSubmit = async (): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed || !worldStyle) return
    await createPlayer(trimmed, worldStyle)
    onCreated()
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-700 bg-gray-800 p-8 w-full max-w-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-yellow-400">⚔️ 创建角色</h1>
        <p className="mt-2 text-sm text-gray-400">踏上你的冒险之旅</p>
      </div>

      <div className="flex w-full gap-2">
        <Input
          value={name}
          onChange={setName}
          placeholder="输入角色名称..."
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
      </div>

      <div className="w-full">
        <p className="mb-2 text-xs text-gray-400">选择世界观</p>
        <div className="grid grid-cols-3 gap-2">
          {WORLD_STYLES.map((ws) => (
            <button
              key={ws.value}
              onClick={() => setWorldStyle(ws.value)}
              className={`rounded-lg border p-2 text-left transition-colors ${
                worldStyle === ws.value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              <p className="text-sm font-bold">{ws.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ws.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading || !name.trim() || !worldStyle}>
        创建角色
      </Button>
    </div>
  )
}

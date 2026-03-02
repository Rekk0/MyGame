import type { Quest } from '../../types/quest'
import { Button } from '../shared/Button'

interface QuestCardProps {
  quest: Quest
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

const typeColors: Record<string, string> = {
  daily: 'text-green-400',
  dungeon: 'text-purple-400',
  main: 'text-yellow-400',
  timed: 'text-orange-400',
  adventure: 'text-blue-400',
  test: 'text-gray-400',
}

export function QuestCard({ quest, onComplete, onDelete }: QuestCardProps): JSX.Element {
  const name = quest.gamifiedName ?? quest.originalText
  const isCompleted = quest.status === 'completed'

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className={`truncate text-sm font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
          {name}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs">
          <span className={typeColors[quest.type] ?? 'text-gray-400'}>{quest.type}</span>
          <span className="text-yellow-400">+{quest.xp} XP</span>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {!isCompleted && (
          <Button variant="primary" onClick={() => onComplete(quest.id)} className="px-2 py-1 text-xs">
            ✓
          </Button>
        )}
        <Button variant="danger" onClick={() => onDelete(quest.id)} className="px-2 py-1 text-xs">
          ×
        </Button>
      </div>
    </div>
  )
}

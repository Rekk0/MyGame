import { useState } from 'react'
import type { Quest } from '../../types/quest'
import { Button } from '../shared/Button'

interface QuestCardProps {
  quest: Quest
  autoTransform: boolean
  isTransforming: boolean
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onTransform: (id: string) => void
}

const typeColors: Record<string, string> = {
  daily: 'text-gray-400',
  dungeon: 'text-blue-400',
  main: 'text-yellow-400',
  timed: 'text-red-400',
  adventure: 'text-green-400',
  test: 'text-gray-500',
}

export function QuestCard({ quest, autoTransform, isTransforming, onComplete, onDelete, onTransform }: QuestCardProps): JSX.Element {
  const [showOriginal, setShowOriginal] = useState(false)
  const name = quest.gamifiedName ?? quest.originalText
  const isCompleted = quest.status === 'completed'
  const showTransformBtn = !quest.gamifiedName && !autoTransform

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
            {name}
          </p>
          {quest.narrative && (
            <p className="text-xs text-gray-400 italic mt-1 leading-relaxed">{quest.narrative}</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className={typeColors[quest.type] ?? 'text-gray-400'}>{quest.type}</span>
            <span className="text-yellow-400">+{quest.xp} XP</span>
            {quest.gamifiedName && (
              <button onClick={() => setShowOriginal(!showOriginal)}
                className="text-gray-600 hover:text-gray-400 underline underline-offset-2">
                {showOriginal ? '收起' : '原文'}
              </button>
            )}
            {showTransformBtn && (
              <button onClick={() => onTransform(quest.id)} disabled={isTransforming}
                className="text-blue-500 hover:text-blue-400 disabled:text-gray-600 underline underline-offset-2">
                {isTransforming ? '转化中...' : '转化'}
              </button>
            )}
          </div>
          {showOriginal && quest.gamifiedName && (
            <p className="mt-1 text-xs text-gray-500">{quest.originalText}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0 pt-0.5">
          {!isCompleted && (
            <Button variant="primary" onClick={() => onComplete(quest.id)} className="px-2 py-1 text-xs">✓</Button>
          )}
          <Button variant="danger" onClick={() => onDelete(quest.id)} className="px-2 py-1 text-xs">×</Button>
        </div>
      </div>
    </div>
  )
}

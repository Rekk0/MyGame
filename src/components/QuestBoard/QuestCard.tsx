import { useState } from 'react'
import { Check, HandFist, Lightning, Sparkle, Trash } from '@phosphor-icons/react'
import type { Quest } from '../../types/quest'
import { useT } from '../../utils/i18n'
import { isOverdue } from '../../utils/dateUtils'

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}

function ResourcePreview({
  deltas
}: {
  deltas: NonNullable<Quest['predictedDeltas']>
}): JSX.Element | null {
  const items = [
    { key: 'e', v: deltas.energy, cls: 'text-ep', icon: <Lightning size={11} weight="fill" /> },
    { key: 'w', v: deltas.willpower, cls: 'text-will', icon: <HandFist size={11} weight="fill" /> },
    { key: 's', v: deltas.spirit, cls: 'text-spirit', icon: <Sparkle size={11} weight="fill" /> }
  ].filter((i) => i.v !== 0)
  if (items.length === 0) return null
  return (
    <>
      {items.map((i) => (
        <span key={i.key} className={`flex items-center gap-0.5 tabular-nums ${i.cls}`}>
          {i.icon}
          {signed(i.v)}
        </span>
      ))}
    </>
  )
}

interface QuestCardProps {
  quest: Quest
  autoTransform: boolean
  isTransforming: boolean
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onTransform: (id: string) => void
}

export const typeColors: Record<string, string> = {
  daily: 'text-ink-dim',
  dungeon: 'text-arcane',
  main: 'text-gold',
  timed: 'text-crimson',
  adventure: 'text-ep',
  test: 'text-ink-faint'
}

export function QuestCard({
  quest,
  autoTransform,
  isTransforming,
  onComplete,
  onDelete,
  onTransform
}: QuestCardProps): JSX.Element {
  const [showOriginal, setShowOriginal] = useState(false)
  const t = useT()
  const name = quest.gamifiedName ?? quest.originalText
  const isCompleted = quest.status === 'completed'
  const showTransformBtn = !quest.gamifiedName && !autoTransform
  const overdue = isOverdue(quest.dueDate, quest.status)

  return (
    <div
      className={`rpg-frame rounded-lg px-4 py-3 transition-colors ${isCompleted ? 'opacity-60' : 'hover:border-edge-strong'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${isCompleted ? 'line-through text-ink-faint' : 'text-ink-hi'}`}
          >
            {name}
          </p>
          {quest.narrative && (
            <p className="mt-1 text-xs italic leading-relaxed text-ink-dim">{quest.narrative}</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className={typeColors[quest.type] ?? 'text-ink-dim'}>
              {t(
                `questType${quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}` as Parameters<
                  typeof t
                >[0]
              )}
            </span>
            <span className="tabular-nums text-gold">+{quest.xp} XP</span>
            {!isCompleted && quest.predictedDeltas && (
              <ResourcePreview deltas={quest.predictedDeltas} />
            )}
            {quest.dueDate && (
              <span className="tabular-nums text-ink-dim">
                {t('duePrefix')}
                {quest.dueDate.slice(0, 10)}
              </span>
            )}
            {overdue && (
              <span className="rounded border border-crimson px-1 py-px text-[10px] font-medium text-crimson">
                {t('overdue')}
              </span>
            )}
            {quest.gamifiedName && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-ink-faint underline underline-offset-2 hover:text-ink-dim"
              >
                {showOriginal ? t('collapseBtn') : t('originalBtn')}
              </button>
            )}
            {showTransformBtn && (
              <button
                onClick={() => onTransform(quest.id)}
                disabled={isTransforming}
                className="text-arcane underline underline-offset-2 hover:brightness-125 disabled:text-ink-faint"
              >
                {isTransforming ? t('transformingBtn') : t('transformBtn')}
              </button>
            )}
          </div>
          {showOriginal && quest.gamifiedName && (
            <p className="mt-1 text-xs text-ink-faint">{quest.originalText}</p>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0 pt-0.5">
          {!isCompleted && (
            <button
              onClick={() => onComplete(quest.id)}
              title={t('completedSection')}
              className="flex h-7 w-7 items-center justify-center rounded border border-edge-strong bg-gradient-to-b from-gold-bright to-gold text-on-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:translate-y-px"
            >
              <Check size={14} weight="bold" />
            </button>
          )}
          <button
            onClick={() => onDelete(quest.id)}
            className="flex h-7 w-7 items-center justify-center rounded border border-edge text-ink-dim transition-colors hover:border-crimson hover:text-crimson"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

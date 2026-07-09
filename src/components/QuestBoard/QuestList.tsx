import { Reorder } from 'framer-motion'
import type { Quest } from '../../types/quest'
import { useQuestStore } from '../../stores/questStore'
import { useT } from '../../utils/i18n'
import { QuestCard } from './QuestCard'

interface QuestListProps {
  quests: Quest[]
  autoTransform: boolean
  transformingIds: string[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onTransform: (id: string) => void
}

export function QuestList({
  quests,
  autoTransform,
  transformingIds,
  onComplete,
  onDelete,
  onTransform
}: QuestListProps): JSX.Element {
  const { questOrder, reorderQuests } = useQuestStore()
  const t = useT()

  if (quests.length === 0) {
    return <div className="py-12 text-center text-sm text-ink-dim">{t('emptyQuests')}</div>
  }

  const incomplete = quests.filter((q) => q.status !== 'completed')
  const completed = quests.filter((q) => q.status === 'completed')

  // Apply questOrder to incomplete quests (new quests not in order go to end)
  const orderedIncomplete =
    questOrder.length > 0
      ? [
          ...(questOrder
            .map((id) => incomplete.find((q) => q.id === id))
            .filter(Boolean) as Quest[]),
          ...incomplete.filter((q) => !questOrder.includes(q.id))
        ]
      : incomplete

  return (
    <div className="flex flex-col gap-2">
      <Reorder.Group
        axis="y"
        values={orderedIncomplete}
        onReorder={(items) => reorderQuests(items.map((q) => q.id))}
        className="flex flex-col gap-2"
      >
        {orderedIncomplete.map((quest) => (
          <Reorder.Item key={quest.id} value={quest} className="cursor-grab active:cursor-grabbing">
            <QuestCard
              quest={quest}
              autoTransform={autoTransform}
              isTransforming={transformingIds.includes(quest.id)}
              onComplete={onComplete}
              onDelete={onDelete}
              onTransform={onTransform}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {completed.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-edge-strong" />
            <span className="font-display text-xs text-ink-dim">{t('completedSection')}</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-edge-strong" />
          </div>
          <div className="flex flex-col gap-2">
            {completed.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                autoTransform={autoTransform}
                isTransforming={transformingIds.includes(quest.id)}
                onComplete={onComplete}
                onDelete={onDelete}
                onTransform={onTransform}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

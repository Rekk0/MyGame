import { Reorder } from 'framer-motion'
import type { Quest } from '../../types/quest'
import { useT } from '../../utils/i18n'
import { QuestCard } from './QuestCard'

const GROUP_HEADER_COLORS: Record<string, string> = {
  main: 'text-gold',
  timed: 'text-crimson',
  dungeon: 'text-arcane',
  adventure: 'text-ep',
  daily: 'text-ink-dim',
  other: 'text-ink-dim'
}

interface QuestGroupProps {
  groupType: string
  quests: Quest[]
  onReorder: (newIds: string[]) => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onTransform: (id: string) => void
  autoTransform: boolean
  transformingIds: string[]
}

export function QuestGroup({
  groupType,
  quests,
  onReorder,
  onComplete,
  onDelete,
  onTransform,
  autoTransform,
  transformingIds
}: QuestGroupProps): JSX.Element {
  const t = useT()
  const labelKey = `questType${groupType.charAt(0).toUpperCase() + groupType.slice(1)}` as const
  const headerColor = GROUP_HEADER_COLORS[groupType] ?? 'text-ink-dim'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mt-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-edge-strong" />
        <span className={`font-display text-xs ${headerColor}`}>
          {t(labelKey as Parameters<typeof t>[0])} ({quests.length})
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-edge-strong" />
      </div>
      <Reorder.Group
        axis="y"
        values={quests}
        onReorder={(items) => onReorder(items.map((q) => q.id))}
        className="flex flex-col gap-2"
      >
        {quests.map((quest) => (
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
    </div>
  )
}

import { useMemo, useCallback } from 'react'
import type { Quest } from '../../types/quest'
import { useQuestStore } from '../../stores/questStore'
import { useT } from '../../utils/i18n'
import { QuestCard } from './QuestCard'
import { QuestGroup } from './QuestGroup'

const GROUP_ORDER = ['main', 'timed', 'dungeon', 'adventure', 'daily', 'other'] as const

function normalizeType(type: string): string {
  if ((GROUP_ORDER as readonly string[]).includes(type)) return type
  return 'other'
}

function deriveGroupOrders(
  incomplete: Quest[],
  questOrder: string[]
): Map<string, string[]> {
  const grouped = new Map<string, Quest[]>()
  for (const q of incomplete) {
    const nt = normalizeType(q.type)
    if (!grouped.has(nt)) grouped.set(nt, [])
    grouped.get(nt)!.push(q)
  }
  const result = new Map<string, string[]>()
  for (const [type, quests] of grouped) {
    const ordered =
      questOrder.length > 0
        ? [
            ...questOrder.filter((id) => quests.some((q) => q.id === id)),
            ...quests.filter((q) => !questOrder.includes(q.id)).map((q) => q.id)
          ]
        : quests.map((q) => q.id)
    result.set(type, ordered)
  }
  return result
}

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

  const incomplete = useMemo(() => quests.filter((q) => q.status !== 'completed'), [quests])
  const completed = useMemo(() => quests.filter((q) => q.status === 'completed'), [quests])

  // Build quest lookup for fast ID→Quest mapping
  const questMap = useMemo(() => {
    const m = new Map<string, Quest>()
    for (const q of incomplete) m.set(q.id, q)
    return m
  }, [incomplete])

  // Derive ordered IDs per group
  const groupOrders = useMemo(
    () => deriveGroupOrders(incomplete, questOrder),
    [incomplete, questOrder]
  )

  const handleGroupReorder = useCallback(
    (groupType: string, newIds: string[]) => {
      const updated = new Map(groupOrders)
      updated.set(groupType, newIds)
      const newFlatOrder: string[] = []
      for (const type of GROUP_ORDER) {
        const ids = updated.get(type)
        if (ids) newFlatOrder.push(...ids)
      }
      reorderQuests(newFlatOrder)
    },
    [groupOrders, reorderQuests]
  )

  if (quests.length === 0) {
    return <div className="py-12 text-center text-sm text-ink-dim">{t('emptyQuests')}</div>
  }

  // Render groups in fixed order, skip empty
  const groupElements: JSX.Element[] = []
  for (const type of GROUP_ORDER) {
    const orderedIds = groupOrders.get(type)
    if (!orderedIds || orderedIds.length === 0) continue
    const groupQuests = orderedIds
      .map((id) => questMap.get(id))
      .filter((q): q is Quest => q !== undefined)
    groupElements.push(
      <QuestGroup
        key={type}
        groupType={type}
        quests={groupQuests}
        onReorder={(newIds) => handleGroupReorder(type, newIds)}
        onComplete={onComplete}
        onDelete={onDelete}
        onTransform={onTransform}
        autoTransform={autoTransform}
        transformingIds={transformingIds}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {groupElements}

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

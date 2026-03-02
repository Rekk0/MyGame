import type { Quest } from '../../types/quest'
import { QuestCard } from './QuestCard'

interface QuestListProps {
  quests: Quest[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export function QuestList({ quests, onComplete, onDelete }: QuestListProps): JSX.Element {
  if (quests.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        还没有任务，开始创建你的第一个冒险吧！
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

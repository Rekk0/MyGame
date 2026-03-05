import type { Medal } from '../../types/medal'

interface Props {
  medal: Medal
  onSelect: (medal: Medal) => void
}

export function MedalCard({ medal, onSelect }: Props): JSX.Element {
  return (
    <div
      className="flex flex-col items-center gap-1 p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:border-yellow-500 hover:bg-gray-750 transition-colors"
      onClick={() => onSelect(medal)}
      title="点击放大查看"
    >
      <div
        className="w-20 h-20 pointer-events-none [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: medal.svgCode }}
      />
      <p className="text-xs font-medium text-gray-200 text-center leading-tight">{medal.name}</p>
      <p className="text-xs text-gray-500">{medal.unlockedAt.slice(0, 10)}</p>
    </div>
  )
}

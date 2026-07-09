import type { Medal } from '../../types/medal'

interface Props {
  medal: Medal
  onSelect: (medal: Medal) => void
}

export function MedalCard({ medal, onSelect }: Props): JSX.Element {
  return (
    <div
      className="rpg-frame flex cursor-pointer flex-col items-center gap-1 rounded-lg p-3 transition-colors hover:border-gold"
      onClick={() => onSelect(medal)}
      title="点击放大查看"
    >
      <div
        className="pointer-events-none h-20 w-20 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: medal.svgCode }}
      />
      <p className="text-center text-xs font-medium leading-tight text-ink-hi">{medal.name}</p>
      <p className="text-xs text-ink-faint">{medal.unlockedAt.slice(0, 10)}</p>
    </div>
  )
}

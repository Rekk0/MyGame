import { GearSix, ListChecks, Medal, Scroll, TreeStructure, Trophy } from '@phosphor-icons/react'
import { useT } from '../../utils/i18n'

export type ScreenId = 'board' | 'skills' | 'achievements' | 'medals' | 'journal'

interface MenuDockProps {
  active: ScreenId
  onNavigate: (s: ScreenId) => void
  onOpenSettings: () => void
  achievementCount: number
  medalCount: number
  plotBadge: boolean
  plotSlot?: React.ReactNode
}

interface NavItemDef {
  id: ScreenId
  icon: React.ReactNode
  labelKey: 'navBoard' | 'skillTreeTitle' | 'achievementsTitle' | 'navMedals' | 'navJournal'
  badge?: number
}

export function MenuDock({
  active,
  onNavigate,
  onOpenSettings,
  achievementCount,
  medalCount,
  plotBadge,
  plotSlot
}: MenuDockProps): JSX.Element {
  const t = useT()

  const items: NavItemDef[] = [
    { id: 'board', icon: <ListChecks size={20} />, labelKey: 'navBoard' },
    { id: 'skills', icon: <TreeStructure size={20} />, labelKey: 'skillTreeTitle' },
    { id: 'achievements', icon: <Trophy size={20} />, labelKey: 'achievementsTitle', badge: achievementCount },
    { id: 'medals', icon: <Medal size={20} />, labelKey: 'navMedals', badge: medalCount },
    { id: 'journal', icon: <Scroll size={20} />, labelKey: 'navJournal' }
  ]

  return (
    <div className="flex w-24 shrink-0 flex-col items-center pt-2">
      {items.map((item) => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative mt-2 flex w-full flex-col items-center gap-0.5 border-l-2 py-1 transition-colors ${
              isActive
                ? 'border-gold text-gold'
                : 'border-transparent text-ink-dim hover:text-ink-hi'
            }`}
          >
            {item.icon}
            <span className="text-[11px] leading-tight">{t(item.labelKey)}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -right-0.5 -top-0.5 text-[10px] tabular-nums text-ink-faint">
                {item.badge}
              </span>
            )}
            {item.id === 'journal' && plotBadge && (
              <span className="absolute right-1 top-0 h-2 w-2 rounded-full bg-crimson" />
            )}
          </button>
        )
      })}

      <div className="flex-1" />

      {plotSlot}

      <button
        onClick={onOpenSettings}
        className="mb-2 mt-2 flex w-full flex-col items-center gap-0.5 border-l-2 border-transparent py-1 text-ink-dim transition-colors hover:text-ink-hi"
      >
        <GearSix size={20} />
        <span className="text-[11px] leading-tight">{t('aiSettings')}</span>
      </button>
    </div>
  )
}

import { useState } from 'react'
import { ScreenShell } from '../shared/ScreenShell'
import { PeriodPanel } from './PeriodPanel'
import { usePlotStatus } from '../../hooks/usePlotStatus'
import { useT } from '../../utils/i18n'

type JournalTab = 'daily' | 'weekly'

export function JournalScreen(): JSX.Element {
  const t = useT()
  const { daily, weekly, refresh } = usePlotStatus()
  const [tab, setTab] = useState<JournalTab>('daily')

  const tabs: { id: JournalTab; label: string; status: typeof daily }[] = [
    { id: 'daily', label: t('dailyPlotTitle'), status: daily },
    { id: 'weekly', label: t('weeklyPlotTitle'), status: weekly }
  ]

  return (
    <ScreenShell
      title={t('navJournal')}
      actions={
        <div className="flex gap-1">
          {tabs.map((t) => {
            const active = tab === t.id
            const hasRedDot = t.status.eligible && !t.status.cached
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-b-2 border-gold text-gold'
                    : 'text-ink-dim hover:text-ink-hi'
                }`}
              >
                {t.label}
                {hasRedDot && (
                  <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-crimson" />
                )}
              </button>
            )
          })}
        </div>
      }
    >
      <PeriodPanel
        key={tab}
        type={tab}
        status={tab === 'daily' ? daily : weekly}
        onRefresh={refresh}
      />
    </ScreenShell>
  )
}

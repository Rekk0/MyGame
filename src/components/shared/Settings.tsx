import { useState } from 'react'
import { ModalShell } from './Panel'
import { GeneralSettings } from './settings/GeneralSettings'
import { BackgroundSettings } from './settings/BackgroundSettings'
import { useT } from '../../utils/i18n'

type SettingsTab = 'general' | 'background'

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps): JSX.Element {
  const [tab, setTab] = useState<SettingsTab>('general')
  const t = useT()

  const tabClass = (active: boolean): string =>
    `px-3 py-1.5 text-sm border-b-2 transition-colors ${
      active ? 'border-gold text-gold' : 'border-transparent text-ink-dim hover:text-ink-hi'
    }`

  return (
    <ModalShell title={t('settingsTitle')} onClose={onClose} className="max-h-[88vh] w-[26rem]">
      <div className="flex shrink-0 gap-1 px-5 pt-2">
        <button className={tabClass(tab === 'general')} onClick={() => setTab('general')}>
          {t('tabGeneral')}
        </button>
        <button className={tabClass(tab === 'background')} onClick={() => setTab('background')}>
          {t('tabBackground')}
        </button>
      </div>
      {tab === 'general' ? <GeneralSettings /> : <BackgroundSettings />}
    </ModalShell>
  )
}

import { useState } from 'react'
import { MedalCard } from './MedalCard'
import { ModalShell } from '../shared/Panel'
import { useT } from '../../utils/i18n'
import type { Medal } from '../../types/medal'

interface Props {
  medals: Medal[]
  onClose: () => void
}

function MedalDetail({ medal, onClose }: { medal: Medal; onClose: () => void }): JSX.Element {
  const t = useT()
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-scrim"
      onClick={onClose}
    >
      <div
        className="rpg-frame-ornate flex max-w-sm flex-col items-center gap-4 rounded-lg bg-panel p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-48 w-48 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: medal.svgCode }}
        />
        <p className="font-display text-lg font-bold text-gold">{medal.name}</p>
        <p className="text-center text-sm text-ink-dim">{medal.description}</p>
        <p className="text-xs text-ink-faint">
          {t('medalObtainedOn')} {medal.unlockedAt.slice(0, 10)}
        </p>
        <button onClick={onClose} className="mt-1 text-sm text-ink-dim hover:text-ink-hi">
          {t('close')}
        </button>
      </div>
    </div>
  )
}

export function MedalGallery({ medals, onClose }: Props): JSX.Element {
  const [selected, setSelected] = useState<Medal | null>(null)
  const t = useT()

  return (
    <>
      {selected && <MedalDetail medal={selected} onClose={() => setSelected(null)} />}
      <ModalShell
        title={t('medalGalleryTitle')}
        onClose={onClose}
        className="max-h-[80vh] w-[560px]"
      >
        <div className="overflow-y-auto px-5 py-4">
          {medals.length === 0 ? (
            <p className="py-12 text-center text-ink-dim">{t('noMedals')}</p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {medals.map((m) => (
                <MedalCard key={m.id} medal={m} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>
      </ModalShell>
    </>
  )
}

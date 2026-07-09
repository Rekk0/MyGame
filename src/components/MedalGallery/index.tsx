import { useEffect, useState } from 'react'
import { MedalCard } from './MedalCard'
import { ScreenShell } from '../shared/ScreenShell'
import { useT } from '../../utils/i18n'
import type { Medal } from '../../types/medal'

interface Props {
  medals: Medal[]
}

function MedalDetail({ medal, onClose }: { medal: Medal; onClose: () => void }): JSX.Element {
  const t = useT()

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', h, true)
    return () => window.removeEventListener('keydown', h, true)
  }, [onClose])

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
          className="h-56 w-56 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: medal.svgCode }}
        />
        <p className="font-display text-xl font-bold text-gold">{medal.name}</p>
        <p className="text-center text-base text-ink-dim">{medal.description}</p>
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

export function MedalsScreen({ medals }: Props): JSX.Element {
  const [selected, setSelected] = useState<Medal | null>(null)
  const t = useT()

  return (
    <>
      {selected && <MedalDetail medal={selected} onClose={() => setSelected(null)} />}
      <ScreenShell title={t('medalGalleryTitle')}>
        {medals.length === 0 ? (
          <p className="py-12 text-center text-ink-dim">{t('noMedals')}</p>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {medals.map((m) => (
              <MedalCard key={m.id} medal={m} onSelect={setSelected} />
            ))}
          </div>
        )}
      </ScreenShell>
    </>
  )
}

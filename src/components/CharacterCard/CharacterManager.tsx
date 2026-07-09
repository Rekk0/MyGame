import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { ModalShell } from '../shared/Panel'
import { useT } from '../../utils/i18n'
import type { Player } from '../../types/player'

interface CharacterManagerProps {
  currentPlayer: Player
  onClose: () => void
  onCreateNew: () => void
  onSwitched: () => void
}

export function CharacterManager({
  currentPlayer,
  onClose,
  onCreateNew,
  onSwitched
}: CharacterManagerProps): JSX.Element {
  const { allPlayers, switchPlayer, deletePlayer } = usePlayerStore()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const t = useT()

  const handleSwitch = async (id: string): Promise<void> => {
    await switchPlayer(id)
    onSwitched()
    onClose()
  }

  const handleDeleteConfirm = async (id: string): Promise<void> => {
    setConfirmId(null)
    await deletePlayer(id)
    onSwitched()
    if (id === currentPlayer.id) onClose()
  }

  return (
    <ModalShell title={t('characterManager')} onClose={onClose} className="w-80">
      <div className="flex flex-col px-5 py-4">
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {allPlayers.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                p.id === currentPlayer.id ? 'border-gold bg-gold/10' : 'border-edge bg-panel-raised'
              }`}
            >
              <div>
                <p className="font-display text-sm font-bold text-ink-hi">{p.name}</p>
                <p className="text-xs text-ink-dim">
                  Lv.{p.level} · {p.worldStyle}
                </p>
              </div>
              <div className="flex gap-1">
                {p.id !== currentPlayer.id && (
                  <button
                    onClick={() => handleSwitch(p.id)}
                    className="rounded border border-edge-strong bg-gradient-to-b from-gold-bright to-gold px-2 py-1 text-xs text-on-gold hover:brightness-110"
                  >
                    {t('switchBtn')}
                  </button>
                )}
                {confirmId === p.id ? (
                  <>
                    <button
                      onClick={() => handleDeleteConfirm(p.id)}
                      className="rounded bg-gradient-to-b from-crimson to-crimson-deep px-2 py-1 text-xs text-ink-hi hover:brightness-110"
                    >
                      {t('confirm')}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded border border-edge bg-panel-raised px-2 py-1 text-xs text-ink hover:text-ink-hi"
                    >
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className="rounded border border-crimson-deep px-2 py-1 text-xs text-crimson hover:bg-crimson/10"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            onClose()
            onCreateNew()
          }}
          className="mt-4 w-full rounded-lg border border-dashed border-edge py-2 text-sm text-ink-dim transition-colors hover:border-edge-strong hover:text-ink"
        >
          {t('createNew')}
        </button>
      </div>
    </ModalShell>
  )
}

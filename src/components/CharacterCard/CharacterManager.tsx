import { useState } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useT } from '../../utils/i18n'
import type { Player } from '../../types/player'

interface CharacterManagerProps {
  currentPlayer: Player
  onClose: () => void
  onCreateNew: () => void
  onSwitched: () => void
}

export function CharacterManager({ currentPlayer, onClose, onCreateNew, onSwitched }: CharacterManagerProps): JSX.Element {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-80 rounded-xl border border-gray-600 bg-gray-800 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{t('characterManager')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {allPlayers.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                p.id === currentPlayer.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-600 bg-gray-700'
              }`}
            >
              <div>
                <p className="text-sm font-bold text-white">{p.name}</p>
                <p className="text-xs text-gray-400">Lv.{p.level} · {p.worldStyle}</p>
              </div>
              <div className="flex gap-1">
                {p.id !== currentPlayer.id && (
                  <button
                    onClick={() => handleSwitch(p.id)}
                    className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500"
                  >
                    {t('switchBtn')}
                  </button>
                )}
                {confirmId === p.id ? (
                  <>
                    <button
                      onClick={() => handleDeleteConfirm(p.id)}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                    >
                      {t('confirm')}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-500"
                    >
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { onClose(); onCreateNew() }}
          className="mt-4 w-full rounded-lg border border-dashed border-gray-500 py-2 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-300"
        >
          {t('createNew')}
        </button>
      </div>
    </div>
  )
}

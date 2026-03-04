import { useState } from 'react'
import { MedalCard } from './MedalCard'
import type { Medal } from '../../types/medal'

interface Props {
  medals: Medal[]
  onClose: () => void
}

function MedalDetail({ medal, onClose }: { medal: Medal; onClose: () => void }): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 bg-gray-900 rounded-2xl border border-yellow-500/40 shadow-2xl max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-48 h-48"
          dangerouslySetInnerHTML={{ __html: medal.svgCode }}
        />
        <p className="text-lg font-bold text-yellow-400">{medal.name}</p>
        <p className="text-sm text-gray-400 text-center">{medal.description}</p>
        <p className="text-xs text-gray-600">获得于 {medal.unlockedAt.slice(0, 10)}</p>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-sm mt-1">关闭</button>
      </div>
    </div>
  )
}

export function MedalGallery({ medals, onClose }: Props): JSX.Element {
  const [selected, setSelected] = useState<Medal | null>(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {selected && <MedalDetail medal={selected} onClose={() => setSelected(null)} />}
      <div className="bg-gray-900 rounded-xl p-6 w-[560px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-yellow-400">🎖 勋章收藏</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        {medals.length === 0 ? (
          <p className="text-gray-500 text-center py-12">你还没有勋章，完成任务来解锁吧！</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {medals.map((m) => (
              <MedalCard key={m.id} medal={m} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

interface PlotScrollButtonProps {
  type: 'daily' | 'weekly'
  onOpen: () => void
}

export function PlotScrollButton({ type, onOpen }: PlotScrollButtonProps): JSX.Element {
  const isDaily = type === 'daily'
  const colorClass = isDaily ? 'text-purple-300 border-purple-400 hover:border-purple-300' : 'text-yellow-300 border-yellow-400 hover:border-yellow-300'
  const title = isDaily ? '今日剧情' : '本周史诗'

  return (
    <div className="relative mt-2">
      <button
        onClick={onOpen}
        className={`relative text-lg border rounded px-2 py-0.5 ${colorClass} transition-colors`}
        title={title}
      >
        📜
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold leading-none">!</span>
      </button>
    </div>
  )
}

interface PlotModalProps {
  type: 'daily' | 'weekly'
  onClose: () => void
  summary?: string
  loading: boolean
  error?: string
}

export function PlotModal({ type, onClose, summary, loading, error }: PlotModalProps): JSX.Element {
  const isDaily = type === 'daily'
  const titleText = isDaily ? '今日剧情' : '本周史诗'
  const titleColor = isDaily ? 'text-purple-300' : 'text-yellow-300'
  const borderColor = isDaily ? 'border-purple-500' : 'border-yellow-500'

  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!summary) { setDisplayed(''); return }
    setDisplayed('')
    setTyping(true)
    let i = 0
    function tick() {
      i++
      setDisplayed(summary!.slice(0, i))
      if (i < summary!.length) {
        timerRef.current = setTimeout(tick, 30)
      } else {
        setTyping(false)
      }
    }
    timerRef.current = setTimeout(tick, 30)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [summary])

  const handleSkip = () => {
    if (typing && summary) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayed(summary)
      setTyping(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75" onClick={onClose}>
      <div
        className={`bg-gray-900 border ${borderColor} rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold text-lg ${titleColor}`}>📜 {titleText}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 text-sm">AI 正在编写故事...</p>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <p
              className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap cursor-pointer"
              onClick={handleSkip}
              title={typing ? '点击跳过打字动画' : undefined}
            >
              {displayed}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

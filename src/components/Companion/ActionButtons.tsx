import React from 'react'
import type { ActionId } from '../../../electron/services/companion/types'

interface Props {
  actions: ActionId[]
  onAction: (id: ActionId) => void
}

const LABEL: Record<ActionId, string> = {
  rest: '☕ 休息',
  sleep: '😴 小睡',
  recommend_liked: '🎯 推荐想做',
  recommend_task: '🌤️ 轻松任务',
  add_task: '➕ 加任务',
  view_plot: '📜 看故事',
  record_mood: '🎭 记心情',
}

const ActionButtons: React.FC<Props> = ({ actions, onAction }) => {
  if (actions.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {actions.map((a) => (
        <button
          key={a}
          onClick={(e) => { e.stopPropagation(); onAction(a) }}
          style={{
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(30,30,50,0.7)',
            color: '#ccc',
            fontSize: 11,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          {LABEL[a] ?? a}
        </button>
      ))}
    </div>
  )
}

export default ActionButtons

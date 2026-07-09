import React from 'react'
import { Coffee, MaskHappy, MoonStars, Plus, Scroll, Sun, Target } from '@phosphor-icons/react'
import type { ActionId } from '../../../electron/services/companion/types'

interface Props {
  actions: ActionId[]
  onAction: (id: ActionId) => void
}

const LABEL: Record<ActionId, { icon: JSX.Element; text: string }> = {
  rest: { icon: <Coffee size={12} />, text: '休息' },
  sleep: { icon: <MoonStars size={12} />, text: '小睡' },
  recommend_liked: { icon: <Target size={12} />, text: '推荐想做' },
  recommend_task: { icon: <Sun size={12} />, text: '轻松任务' },
  add_task: { icon: <Plus size={12} />, text: '加任务' },
  view_plot: { icon: <Scroll size={12} />, text: '看故事' },
  record_mood: { icon: <MaskHappy size={12} />, text: '记心情' }
}

const ActionButtons: React.FC<Props> = ({ actions, onAction }) => {
  if (actions.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {actions.map((a) => (
        <button
          key={a}
          onClick={(e) => {
            e.stopPropagation()
            onAction(a)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid rgba(138, 109, 59, 0.45)',
            background: 'rgba(32, 24, 17, 0.85)',
            color: '#cbbda0',
            fontSize: 11,
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          {LABEL[a]?.icon}
          {LABEL[a]?.text ?? a}
        </button>
      ))}
    </div>
  )
}

export default ActionButtons

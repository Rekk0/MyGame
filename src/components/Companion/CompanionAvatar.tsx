import React from 'react'
import type { WorldStyle } from '../../types/player'
import type { Mood, EnergyTier } from '../../../electron/services/companion/types'

export interface CompanionAvatarProps {
  worldStyle: WorldStyle
  mood: Mood
  energyTier: EnergyTier
}

const MOOD_COLORS: Record<Mood, string> = {
  neutral: '#888',
  happy: '#4ade80',
  tired: '#facc15',
  worried: '#f87171',
  alert: '#ef4444',
}

const ENERGY_GLOW: Record<EnergyTier, string> = {
  high: 'rgba(74,222,128,0.4)',
  mid: 'rgba(250,204,21,0.3)',
  low: 'rgba(239,68,68,0.3)',
}

const CompanionAvatar: React.FC<CompanionAvatarProps> = ({ mood, energyTier }) => {
  const color = MOOD_COLORS[mood]
  const glow = ENERGY_GLOW[energyTier]

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ filter: `drop-shadow(0 0 6px ${glow})` }}>
      <circle cx="40" cy="35" r="22" fill={color} opacity={0.85} />
      <circle cx="33" cy="32" r="3" fill="#111" />
      <circle cx="47" cy="32" r="3" fill="#111" />
      {mood === 'happy' && <path d="M32 40 Q40 48 48 40" fill="none" stroke="#111" strokeWidth="2" />}
      {mood === 'worried' && <path d="M32 42 Q40 36 48 42" fill="none" stroke="#111" strokeWidth="2" />}
      {mood === 'tired' && <path d="M32 38 L48 38" fill="none" stroke="#111" strokeWidth="2" />}
      {mood === 'alert' && <ellipse cx="40" cy="42" rx="4" ry="2.5" fill="#111" />}
      {mood === 'neutral' && <path d="M33 40 L47 40" fill="none" stroke="#111" strokeWidth="2" />}
      {/* body */}
      <ellipse cx="40" cy="68" rx="18" ry="10" fill={color} opacity={0.6} />
    </svg>
  )
}

export default CompanionAvatar

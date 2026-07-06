import React from 'react'
import CompanionAvatar from './CompanionAvatar'
import SpeechBubble from './SpeechBubble'
import ActionButtons from './ActionButtons'
import type { CompanionReply, ActionId, Mood, EnergyTier } from '../../../electron/services/companion/types'
import type { WorldStyle } from '../../types/player'

interface Props {
  reply: CompanionReply
  worldStyle: WorldStyle
  energyTier: EnergyTier
  onAction: (id: ActionId) => void
}

export const mapSeverityMood = (mood: Mood): Mood => mood

const Companion: React.FC<Props> = ({ reply, worldStyle, energyTier, onAction }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 16,
      userSelect: 'none',
    }}
  >
    <CompanionAvatar worldStyle={worldStyle} mood={reply.mood} energyTier={energyTier} />
    <SpeechBubble line={reply.line} visible={true} />
    <ActionButtons actions={reply.actions} onAction={onAction} />
  </div>
)

export default Companion

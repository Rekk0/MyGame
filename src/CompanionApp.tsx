import React, { useEffect, useState } from 'react'
import { useCompanionStore } from './stores/companionStore'
import Companion from './components/Companion'
import { energyTier } from '../electron/services/companion/policy'
import type { CompanionReply, ActionId, EnergyTier } from '../electron/services/companion/types'
import type { WorldStyle } from './types/player'

const CompanionApp: React.FC = () => {
  const reply = useCompanionStore((s) => s.reply)
  const setReply = useCompanionStore((s) => s.setReply)
  const [playerInfo, setPlayerInfo] = useState<{ worldStyle: WorldStyle; energy: number }>({
    worldStyle: 'realistic', energy: 100,
  })

  useEffect(() => {
    const unsub = window.companionAPI.onReply((r: unknown) => {
      const rep = r as CompanionReply
      setReply(rep)
    })
    window.playerAPI?.get().then((p) => {
      if (p) setPlayerInfo({ worldStyle: p.worldStyle, energy: p.ep })
    })
    return unsub
  }, [setReply])

  const tier: EnergyTier = energyTier(playerInfo.energy)
  const defaultReply: CompanionReply = {
    line: '骑士，今日出征否？', actions: ['add_task'], mood: 'neutral', fromAI: false,
  }
  const activeReply = reply ?? defaultReply

  const handleAction = (id: ActionId): void => {
    window.companionAPI.runAction(id)
  }

  return (
    <Companion
      reply={activeReply}
      worldStyle={playerInfo.worldStyle}
      energyTier={tier}
      onAction={handleAction}
    />
  )
}

export default CompanionApp

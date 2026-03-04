import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement, AchievementTier } from '../../types/achievement'

const TIER_STYLES: Record<AchievementTier, { border: string; label: string; glow: string }> = {
  common: { border: 'border-gray-400', label: '普通', glow: 'shadow-gray-400/50' },
  rare: { border: 'border-blue-400', label: '稀有', glow: 'shadow-blue-400/50' },
  epic: { border: 'border-purple-400', label: '史诗', glow: 'shadow-purple-400/50' },
  legendary: { border: 'border-yellow-400', label: '传说', glow: 'shadow-yellow-400/50' },
  Ultra: { border: 'border-red-400', label: 'Ultra', glow: 'shadow-red-400/50' },
}

interface Props {
  achievement: Achievement
}

export function AchievementPopup({ achievement }: Props): JSX.Element {
  const style = TIER_STYLES[achievement.tier]

  return (
    <div className="flex h-screen w-screen items-start justify-center pt-16 pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={achievement.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`border-2 ${style.border} shadow-lg ${style.glow} rounded-xl bg-gray-900/95 px-8 py-5 flex flex-col items-center gap-2 min-w-72 max-w-md`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">成就解锁</p>
          <p className={`text-sm font-bold ${style.border.replace('border-', 'text-')}`}>
            ✦ {style.label} ✦
          </p>
          <p className="text-xl font-bold text-white">{achievement.title}</p>
          <p className="text-sm text-gray-300 text-center">{achievement.description}</p>
          {achievement.unlockText && (
            <p className="mt-1 text-sm italic text-gray-400 text-center">"{achievement.unlockText}"</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

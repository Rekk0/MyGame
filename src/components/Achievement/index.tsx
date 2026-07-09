import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement, AchievementTier } from '../../types/achievement'

const TIER_STYLES: Record<
  AchievementTier,
  { border: string; text: string; label: string; glow: string }
> = {
  common: {
    border: 'border-ink-faint',
    text: 'text-ink',
    label: '普通',
    glow: 'shadow-ink-faint/40'
  },
  rare: {
    border: 'border-arcane',
    text: 'text-arcane',
    label: '稀有',
    glow: 'shadow-arcane/50'
  },
  epic: {
    border: 'border-spirit',
    text: 'text-spirit',
    label: '史诗',
    glow: 'shadow-spirit/50'
  },
  legendary: {
    border: 'border-gold',
    text: 'text-gold',
    label: '传说',
    glow: 'shadow-gold/50'
  },
  Ultra: {
    border: 'border-crimson',
    text: 'text-crimson',
    label: 'Ultra',
    glow: 'shadow-crimson/50'
  }
}

interface Props {
  achievement: Achievement
}

export function AchievementPopup({ achievement }: Props): JSX.Element {
  const style = TIER_STYLES[achievement.tier]

  return (
    <div className="pointer-events-none flex h-screen w-screen items-start justify-center pt-16">
      <AnimatePresence>
        <motion.div
          key={achievement.id}
          initial={{ y: -80, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className={`border-2 ${style.border} shadow-lg ${style.glow} flex min-w-72 max-w-md flex-col items-center gap-2 rounded-lg bg-panel/95 px-8 py-5`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-dim">成就解锁</p>
          <p className={`text-sm font-bold ${style.text}`}>✦ {style.label} ✦</p>
          <p className="font-display text-xl font-bold text-ink-hi">{achievement.title}</p>
          <p className="text-center text-sm text-ink">{achievement.description}</p>
          {achievement.unlockText && (
            <p className="mt-1 text-center text-sm italic text-ink-dim">
              "{achievement.unlockText}"
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { ModalShell } from '../shared/Panel'
import { useSkillStore } from '../../stores/skillStore'
import { useT } from '../../utils/i18n'

/** P5b「即将习得」预览弹窗：逐个展示 AI 生成技能，确认学习 / 婉拒。 */
export function SkillRevealModal(): JSX.Element | null {
  const t = useT()
  const previews = useSkillStore((s) => s.previews)
  const acceptHead = useSkillStore((s) => s.acceptHead)
  const rejectHead = useSkillStore((s) => s.rejectHead)
  const clearPreviews = useSkillStore((s) => s.clearPreviews)
  const [busy, setBusy] = useState(false)

  const head = previews[0]
  if (!head) return null

  const run = async (fn: () => Promise<void>): Promise<void> => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalShell title={t('skillRevealTitle')} onClose={clearPreviews} className="w-[22rem]">
      <div className="px-5 pb-5 pt-4">
        <div className="flex flex-col items-center text-center">
          <Sparkle size={36} weight="fill" className="text-gold" />
          <div className="mt-2 font-display text-2xl font-bold text-gold">{head.name}</div>
          <div className="mt-1 text-xs text-ink-dim">{head.category}</div>
          <div className="mt-3 text-sm text-ink">{head.description}</div>
          <div className="mt-3 text-xs italic text-spirit/80">{t('skillRevealFlavor')}</div>
          {previews.length > 1 && (
            <div className="mt-2 text-xs text-ink-dim tabular-nums">1 / {previews.length}</div>
          )}
        </div>
        <div className="mt-5 flex gap-3">
          <button
            disabled={busy}
            onClick={() => void run(rejectHead)}
            className="flex-1 rounded-md border border-edge px-3 py-2 text-sm text-ink-dim transition-colors hover:text-ink-hi disabled:opacity-50"
          >
            {t('rejectSkill')}
          </button>
          <button
            disabled={busy}
            onClick={() => void run(acceptHead)}
            className="flex-1 rounded-md bg-gold/20 px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/30 disabled:opacity-50"
          >
            {t('acceptSkill')}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

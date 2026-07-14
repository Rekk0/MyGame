import { ArrowUp } from '@phosphor-icons/react'
import { ModalShell } from '../shared/Panel'
import { useSkillStore } from '../../stores/skillStore'
import { useT } from '../../utils/i18n'

/** 技能升级庆祝弹窗：由主进程广播的 SKILL_LEVELED_UP 触发，跨页面可弹。 */
export function SkillLevelUpModal(): JSX.Element | null {
  const t = useT()
  const levelUp = useSkillStore((s) => s.levelUp)
  const clearLevelUp = useSkillStore((s) => s.clearLevelUp)

  if (!levelUp) return null

  return (
    <ModalShell title={t('skillLevelUpTitle')} onClose={clearLevelUp} className="w-[22rem]">
      <div className="px-5 pb-5 pt-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            {levelUp.iconSvg ? (
              <div
                className="h-11 w-11 text-gold-bright"
                dangerouslySetInnerHTML={{ __html: levelUp.iconSvg }}
              />
            ) : (
              <ArrowUp size={32} weight="bold" className="text-gold-bright" />
            )}
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-gold">{levelUp.name}</div>
          <div className="mt-1 flex items-center gap-1 text-sm font-medium text-gold-bright">
            <ArrowUp size={13} weight="bold" />
            <span className="tabular-nums">Lv.{levelUp.level}</span>
          </div>
          <div className="mt-3 text-sm text-ink">{levelUp.description}</div>
          {levelUp.newTrait && (
            <div className="mt-3 w-full rounded-md border border-spirit/30 bg-spirit/10 px-3 py-2">
              <div className="text-xs font-medium text-spirit">{t('skillLevelUpNewTrait')}</div>
              <div className="mt-0.5 text-sm text-spirit/90">{levelUp.newTrait}</div>
            </div>
          )}
        </div>
        <button
          onClick={clearLevelUp}
          className="mt-5 w-full rounded-md bg-gold/20 px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/30"
        >
          {t('skillLevelUpConfirm')}
        </button>
      </div>
    </ModalShell>
  )
}

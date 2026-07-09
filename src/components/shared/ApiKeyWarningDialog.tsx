import { Warning } from '@phosphor-icons/react'
import { ModalShell } from './Panel'

const GUIDE_URL = 'http://truedawn.xyz/mygame-alpha-test/api-guide.html'

interface Props {
  onClose: () => void
}

export function ApiKeyWarningDialog({ onClose }: Props): JSX.Element {
  const handleLinkClick = (): void => {
    window.shellAPI.openExternal(GUIDE_URL)
  }

  return (
    <ModalShell
      title={
        <span className="flex items-center gap-2">
          <Warning size={18} weight="fill" />
          配置提醒
        </span>
      }
      onClose={onClose}
      className="mx-4 w-full max-w-sm"
    >
      <div className="px-5 pb-5 pt-3">
        <p className="mb-4 text-sm leading-relaxed text-ink">
          请注意，当前测试版本需要您手动配置 API key，否则 AI 服务无法运行！关于如何获取 API key
          和进行配置的指引请进入下方链接查看。
        </p>
        <button
          onClick={handleLinkClick}
          className="break-all text-left text-sm text-arcane underline hover:brightness-125"
        >
          {GUIDE_URL}
        </button>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border border-edge bg-panel-raised px-4 py-1.5 text-sm text-ink transition-colors hover:border-edge-strong hover:text-ink-hi"
          >
            我知道了
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

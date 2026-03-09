const GUIDE_URL = 'http://truedawn.xyz/mygame-alpha-test/api-guide.html'

interface Props {
  onClose: () => void
}

export function ApiKeyWarningDialog({ onClose }: Props): JSX.Element {
  const handleLinkClick = (): void => {
    window.shellAPI.openExternal(GUIDE_URL)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border border-yellow-600/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-yellow-400 font-bold text-base">⚠️ 配置提醒</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white ml-4">✕</button>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed mb-4">
          请注意，当前测试版本需要您手动配置 API key，否则 AI 服务无法运行！关于如何获取 API key 和进行配置的指引请进入下方链接查看。
        </p>
        <button
          onClick={handleLinkClick}
          className="text-cyan-400 hover:text-cyan-300 text-sm underline break-all text-left"
        >
          {GUIDE_URL}
        </button>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-sm"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}

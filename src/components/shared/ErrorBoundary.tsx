import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * ErrorBoundary — 兜底渲染错误，避免整个窗口白屏。
 * 捕获子树渲染异常后展示可恢复的错误面板（含堆栈），并打印到控制台。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] 渲染异常：', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="rpg-scene flex min-h-screen items-center justify-center p-6">
        <div className="rpg-frame-ornate flex w-full max-w-lg flex-col gap-4 rounded-lg bg-panel p-6">
          <p className="font-display text-xl font-bold text-crimson">界面出错了</p>
          <p className="text-sm text-ink-dim">
            界面在渲染时抛出了异常。下方是错误详情，可点击「重试」尝试恢复。
          </p>
          <pre className="max-h-64 overflow-auto rounded border border-edge bg-abyss-deep p-3 text-xs text-ink">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
          <button
            onClick={this.handleReset}
            className="self-start rounded border border-edge-strong bg-gradient-to-b from-gold-bright to-gold px-4 py-1.5 text-sm text-on-gold hover:brightness-110"
          >
            重试
          </button>
        </div>
      </div>
    )
  }
}

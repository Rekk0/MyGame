interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

const variantClasses = {
  primary:
    'bg-gradient-to-b from-gold-bright to-gold text-on-gold border-edge-strong hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
  secondary: 'bg-transparent hover:border-edge-strong hover:text-ink-hi text-ink border-edge',
  danger:
    'bg-gradient-to-b from-crimson to-crimson-deep text-ink-hi border-crimson-deep hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-1.5 rounded border text-sm font-medium transition-all active:translate-y-px',
        variantClasses[variant],
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className
      ].join(' ')}
    >
      {children}
    </button>
  )
}

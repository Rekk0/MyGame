interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-transparent hover:bg-gray-700 text-gray-200 border-gray-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-1.5 rounded border text-sm font-medium transition-colors',
        variantClasses[variant],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}

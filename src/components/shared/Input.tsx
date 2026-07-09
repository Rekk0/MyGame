interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  autoFocus?: boolean
}

export function Input({
  value,
  onChange,
  placeholder,
  onKeyDown,
  autoFocus
}: InputProps): JSX.Element {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      className="w-full rounded border border-edge bg-abyss-deep px-3 py-2 text-sm text-ink-hi placeholder:text-ink-faint shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] focus:border-edge-strong focus:outline-none"
    />
  )
}

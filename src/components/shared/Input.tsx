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
  autoFocus,
}: InputProps): JSX.Element {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
    />
  )
}

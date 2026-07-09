import { useState } from 'react'
import { CaretDown, CaretRight } from '@phosphor-icons/react'

interface Ratings {
  E?: number
  D?: number
  L?: number
}

interface Props {
  onChange: (ratings: Ratings | undefined) => void
}

export default function RatingSliders({ onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [E, setE] = useState<number | undefined>(undefined)
  const [D, setD] = useState<number | undefined>(undefined)
  const [L, setL] = useState<number | undefined>(undefined)
  const [touched, setTouched] = useState(false)

  function update(field: 'E' | 'D' | 'L', value: number) {
    setTouched(true)
    if (field === 'E') setE(value)
    if (field === 'D') setD(value)
    if (field === 'L') setL(value)
    const next = { E, D, L, [field]: value }
    const hasAny = next.E !== undefined || next.D !== undefined || next.L !== undefined
    onChange(hasAny ? next : undefined)
  }

  return (
    <div className="text-xs text-ink-dim">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 transition-colors hover:text-ink-hi"
      >
        {open ? <CaretDown size={10} weight="bold" /> : <CaretRight size={10} weight="bold" />}
        <span>评分</span>
        {touched && !open && <span className="text-gold">*</span>}
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-2 pl-2">
          <label className="flex items-center gap-2">
            <span className="w-16">精力 0-100</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={E ?? 50}
              onChange={(e) => update('E', Number(e.target.value))}
              className="h-1 flex-1 accent-(--rpg-ep)"
            />
            <span className="w-6 text-right tabular-nums">{E ?? 50}</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-16">驱动力 0-10</span>
            <input
              type="range"
              min={0}
              max={10}
              value={D ?? 5}
              onChange={(e) => update('D', Number(e.target.value))}
              className="h-1 flex-1 accent-(--rpg-will)"
            />
            <span className="w-6 text-right tabular-nums">{D ?? 5}</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-16">喜欢 0-10</span>
            <input
              type="range"
              min={0}
              max={10}
              value={L ?? 5}
              onChange={(e) => update('L', Number(e.target.value))}
              className="h-1 flex-1 accent-(--rpg-spirit)"
            />
            <span className="w-6 text-right tabular-nums">{L ?? 5}</span>
          </label>
        </div>
      )}
    </div>
  )
}

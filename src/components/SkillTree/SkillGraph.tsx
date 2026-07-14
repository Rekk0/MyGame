import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { Skill } from '../../types/skill'
import { computeLayout, VW, VH } from './layout'
import { SkillNode } from './SkillNode'
import { SkillLinks } from './SkillLinks'
import { SkillBackdrop } from './SkillBackdrop'

interface Props {
  skills: Skill[]
  selectedId: string | null
  onSelect: (skill: Skill | null) => void
}

export function SkillGraph({ skills, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transform, setTransform] = useState('')

  const posKey = skills.map((s) => `${s.id}:${s.category}`).join(',')
  const pos = useMemo(() => computeLayout(skills, VW, VH), [posKey])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (e) => setTransform(e.transform.toString()))
    d3.select(svg).call(zoom)
    return () => {
      d3.select(svg).on('.zoom', null)
    }
  }, [])

  const links = skills.filter((s) => s.parentSkillId && pos.has(s.parentSkillId) && pos.has(s.id))

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      height="100%"
      style={{ display: 'block', touchAction: 'none', userSelect: 'none', cursor: 'grab' }}
    >
      <SkillBackdrop />
      <rect x={0} y={0} width={VW} height={VH} fill="transparent" onClick={() => onSelect(null)} />
      <g transform={transform}>
        <SkillLinks skills={links} pos={pos} />
        {skills.map((s) => {
          const p = pos.get(s.id)
          if (!p) return null
          return (
            <SkillNode
              key={s.id}
              skill={s}
              x={p.x}
              y={p.y}
              selected={s.id === selectedId}
              onSelect={() => onSelect(s)}
            />
          )
        })}
      </g>
    </svg>
  )
}

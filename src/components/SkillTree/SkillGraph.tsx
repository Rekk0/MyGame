import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { Skill } from '../../types/skill'
import { SkillNode } from './SkillNode'

const W = 660
const H = 400
const PAD = 55

interface Props {
  skills: Skill[]
  onSelect: (skill: Skill | null) => void
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string
}
type PosMap = Map<string, { x: number; y: number }>

export function SkillGraph({ skills, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [pos, setPos] = useState<PosMap>(new Map())
  const nodesRef = useRef<SimNode[]>([])
  const simRef = useRef<d3.Simulation<SimNode, never> | null>(null)
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null)
  const nodeJustSelectedRef = useRef(false)

  useEffect(() => {
    if (skills.length === 0) return
    const nodes: SimNode[] = skills.map((s) => ({
      id: s.id,
      x: W / 2 + (Math.random() - 0.5) * 300,
      y: H / 2 + (Math.random() - 0.5) * 200
    }))
    nodesRef.current = nodes
    const links = skills
      .filter((s) => s.parentSkillId)
      .map((s) => ({ source: s.parentSkillId!, target: s.id }))
    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, { source: string; target: string }>(links)
          .id((d) => d.id)
          .distance(160)
      )
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(60))
    sim.on('tick', () => {
      nodes.forEach((n) => {
        n.x = Math.max(PAD, Math.min(W - PAD, n.x!))
        n.y = Math.max(PAD, Math.min(H - PAD, n.y!))
      })
      setPos(new Map(nodes.map((n) => [n.id, { x: n.x!, y: n.y! }])))
    })
    simRef.current = sim
    return () => {
      sim.stop()
    }
  }, [skills.map((s) => s.id).join(',')])

  const getSvgPt = (e: React.PointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  const handleNodeDown = (e: React.PointerEvent<SVGGElement>, id: string) => {
    e.stopPropagation()
    const node = nodesRef.current.find((n) => n.id === id)
    if (!node) return
    dragRef.current = { id, moved: false }
    node.fx = node.x
    node.fy = node.y
    simRef.current?.alphaTarget(0.3).restart()
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const handleSvgMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return
    dragRef.current.moved = true
    const pt = getSvgPt(e)
    if (!pt) return
    const node = nodesRef.current.find((n) => n.id === dragRef.current!.id)
    if (!node) return
    node.fx = Math.max(PAD, Math.min(W - PAD, pt.x))
    node.fy = Math.max(PAD, Math.min(H - PAD, pt.y))
    simRef.current?.alphaTarget(0.3).restart()
  }

  const handleSvgUp = () => {
    if (!dragRef.current) return
    const { id, moved } = dragRef.current
    const node = nodesRef.current.find((n) => n.id === id)
    if (node) {
      node.fx = null
      node.fy = null
    }
    simRef.current?.alphaTarget(0)
    if (!moved) {
      const skill = skills.find((s) => s.id === id)
      if (skill) {
        nodeJustSelectedRef.current = true
        onSelect(skill)
      }
    }
    dragRef.current = null
  }

  const skillMap = new Map(skills.map((s) => [s.id, s]))
  const links = skills.filter((s) => s.parentSkillId && skillMap.has(s.parentSkillId))

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (nodeJustSelectedRef.current) {
      nodeJustSelectedRef.current = false
      return
    }
    if (e.target === e.currentTarget) {
      onSelect(null)
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      style={{ display: 'block', touchAction: 'none', userSelect: 'none' }}
      onPointerMove={handleSvgMove}
      onPointerUp={handleSvgUp}
      onClick={handleSvgClick}
    >
      {links.map((s) => {
        const from = pos.get(s.parentSkillId!),
          to = pos.get(s.id)
        if (!from || !to) return null
        return (
          <line
            key={`l-${s.id}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--rpg-edge-strong)"
            strokeWidth={2}
            opacity={0.55}
          />
        )
      })}
      {skills.map((s) => {
        const p = pos.get(s.id)
        if (!p) return null
        return (
          <g
            key={s.id}
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => handleNodeDown(e, s.id)}
            onClick={(e) => e.stopPropagation()}
          >
            <SkillNode skill={s} x={p.x} y={p.y} onSelect={() => {}} />
          </g>
        )
      })}
    </svg>
  )
}

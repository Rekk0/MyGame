import type { WorldStyle } from '../../types/player'

interface WorldEmblemProps {
  style: WorldStyle
  size?: number
}

/**
 * WorldEmblem — 六种世界观的静态几何 SVG 徽记。
 * 这是全项目唯一手绘 SVG 组件（豁免 Phosphor 图标规则）。
 * 主色使用 --rpg-world-accent（P3 占位为 gold，P5 按世界观联动）。
 */
export function WorldEmblem({ style, size = 64 }: WorldEmblemProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="shrink-0"
      aria-label={`${style} emblem`}
    >
      {renderEmblem(style)}
    </svg>
  )
}

function renderEmblem(style: WorldStyle): JSX.Element {
  switch (style) {
    case 'realistic':
      return <Realistic />
    case 'wuxia':
      return <Wuxia />
    case 'xianxia':
      return <Xianxia />
    case 'fantasy':
      return <Fantasy />
    case 'scifi':
      return <Scifi />
    case 'apocalypse':
      return <Apocalypse />
  }
}

/* ---- 战争 · 冷钢：外圆 + 三条平行斜棱 ---- */
function Realistic(): JSX.Element {
  return (
    <g stroke="var(--rpg-world-accent)" fill="none" strokeWidth={2} strokeLinecap="round">
      <circle cx={32} cy={32} r={28} />
      <g stroke="var(--rpg-edge-strong)" strokeWidth={1.5} transform="rotate(45 32 32)">
        <line x1={20} y1={32} x2={44} y2={32} />
        <line x1={20} y1={40} x2={44} y2={40} />
        <line x1={20} y1={48} x2={44} y2={48} />
      </g>
    </g>
  )
}

/* ---- 武侠 · 青竹：外圆 + 居中竖直剑形 ---- */
function Wuxia(): JSX.Element {
  return (
    <g stroke="var(--rpg-world-accent)" fill="none" strokeWidth={2} strokeLinecap="round">
      <circle cx={32} cy={32} r={28} />
      {/* blade */}
      <line x1={32} y1={10} x2={32} y2={46} strokeWidth={2.5} />
      {/* guard */}
      <line x1={22} y1={38} x2={42} y2={38} strokeWidth={2} />
      {/* grip */}
      <line x1={32} y1={46} x2={32} y2={54} stroke="var(--rpg-edge-strong)" strokeWidth={1.5} />
    </g>
  )
}

/* ---- 仙侠 · 云青：同心双圆 + 上指三角 ---- */
function Xianxia(): JSX.Element {
  return (
    <g stroke="var(--rpg-world-accent)" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={32} cy={32} r={28} />
      <circle cx={32} cy={32} r={18} stroke="var(--rpg-edge-strong)" strokeWidth={1} />
      {/* upward triangle */}
      <polygon points="32,8 24,20 40,20" fill="var(--rpg-world-accent)" stroke="none" />
      <polygon points="32,8 24,20 40,20" fill="none" stroke="var(--rpg-world-accent)" strokeWidth={1} />
    </g>
  )
}

/* ---- 奇幻 · 秘紫：盾形轮廓 + 四角星芒 ---- */
function Fantasy(): JSX.Element {
  return (
    <g stroke="var(--rpg-world-accent)" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {/* shield */}
      <path d="M32 6 L54 14 L54 36 C54 48 32 58 32 58 C32 58 10 48 10 36 L10 14 Z" />
      {/* four-point star */}
      <g stroke="var(--rpg-edge-strong)" strokeWidth={1.5}>
        <line x1={32} y1={14} x2={32} y2={44} />
        <line x1={18} y1={28} x2={46} y2={28} />
        <line x1={22} y1={18} x2={42} y2={38} />
        <line x1={42} y1={18} x2={22} y2={38} />
      </g>
    </g>
  )
}

/* ---- 科幻 · 荧青：正六边形 + 内接下指三角 ---- */
function Scifi(): JSX.Element {
  const r = 28
  const cx = 32
  const cy = 32
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
  return (
    <g stroke="var(--rpg-world-accent)" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points={pts} />
      {/* downward triangle */}
      <polygon
        points="14,24 50,24 32,50"
        stroke="var(--rpg-edge-strong)"
        strokeWidth={1.5}
      />
    </g>
  )
}

/* ---- 末日 · 锈橙：60° 缺口弧 + 中心点 ---- */
function Apocalypse(): JSX.Element {
  // r=28, center 32,32. Gap at top (60°), arc sweeps the remaining 300°.
  return (
    <g stroke="var(--rpg-world-accent)" fill="none" strokeWidth={2} strokeLinecap="round">
      <path d="M 46 7.8 A 28 28 0 1 1 18 7.8" />
      <circle cx={32} cy={32} r={4} fill="var(--rpg-world-accent)" stroke="none" />
    </g>
  )
}

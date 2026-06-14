import { ZONES } from '../../utils/training.js'

export default function ZoneBadge({ zone, showName = false, size = 'sm' }) {
  const z = ZONES[zone] || ZONES.UT1
  const pad = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'

  return (
    <span
      className={`zone-pill font-bold ${pad}`}
      style={{ backgroundColor: z.color + '25', color: z.color, border: `1px solid ${z.color}55` }}
    >
      {z.label}{showName ? ` · ${z.name}` : ''}
    </span>
  )
}

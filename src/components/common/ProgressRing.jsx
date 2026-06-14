export default function ProgressRing({ percent = 0, size = 80, stroke = 7, color = '#FF6B35', label, sublabel }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(1, Math.max(0, percent / 100))

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      {label && (
        <div className="text-center -mt-1">
          <div className="text-sm font-bold text-sunset-text">{label}</div>
          {sublabel && <div className="text-xs text-sunset-muted">{sublabel}</div>}
        </div>
      )}
    </div>
  )
}

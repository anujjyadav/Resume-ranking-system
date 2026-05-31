export default function ScoreGauge({ score, size = 96, label = 'Match' }) {
  const r = 38
  const cx = 52
  const cy = 52
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference * (1 - clamped / 100)

  const getColor = (s) => {
    if (s >= 75) return '#057642'  // LinkedIn green
    if (s >= 55) return '#0A66C2'  // LinkedIn blue
    if (s >= 35) return '#915907'  // LinkedIn amber
    return '#B24020'               // LinkedIn red
  }
  const color = getColor(clamped)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 104 104">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E0DFDC" strokeWidth="8" />
        <circle
          className="gauge-ring"
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text
          x={cx} y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700 }}
        >
          {clamped}%
        </text>
        <text
          x={cx} y={cy + 17}
          textAnchor="middle"
          fill="#767676"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 500 }}
        >
          {label}
        </text>
      </svg>
    </div>
  )
}

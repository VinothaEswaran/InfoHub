function colorForScore(score: number) {
  if (score < 35) return '#34d399'
  if (score < 65) return '#fbbf24'
  return '#fb7185'
}

export default function RiskMeter({ score, size = 140 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score)) / 100
  const offset = circumference * (1 - progress)
  const color = colorForScore(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={10} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-semibold text-white">{Math.round(score)}</span>
        <span className="text-xs text-white/50">/ 100 risk</span>
      </div>
    </div>
  )
}

import clsx from 'clsx'

function levelFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score < 35) return 'low'
  if (score < 65) return 'medium'
  return 'high'
}

export default function RiskBadge({ score }: { score: number }) {
  const level = levelFromScore(score)
  const label = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' }[level]

  return (
    <span
      className={clsx('badge', {
        'badge-low': level === 'low',
        'badge-medium': level === 'medium',
        'badge-high': level === 'high',
      })}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label} · {Math.round(score)}
    </span>
  )
}

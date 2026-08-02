import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-lg bg-white/[0.06]', className)} />
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-16" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

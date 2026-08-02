import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BellAlertIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { notificationsApi } from '../services/api'
import type { NotificationItem } from '../types'

const TYPE_ICON: Record<string, typeof BellAlertIcon> = {
  breach: BellAlertIcon,
  deadline: ClockIcon,
  deletion_approved: CheckCircleIcon,
  deletion_failed: XCircleIcon,
  ai_recommendation: LightBulbIcon,
  info: InformationCircleIcon,
}

const TYPE_COLOR: Record<string, string> = {
  breach: 'bg-rose-400/15 text-rose-300',
  deadline: 'bg-amber-400/15 text-amber-300',
  deletion_approved: 'bg-emerald-400/15 text-emerald-300',
  deletion_failed: 'bg-rose-400/15 text-rose-300',
  ai_recommendation: 'bg-cyan/15 text-cyan',
  info: 'bg-purple/15 text-purple-light',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data as NotificationItem[]),
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Notifications</h2>
          <p className="mt-1 text-sm text-white/50">Breaches, deadlines, deletion updates, and AI recommendations.</p>
        </div>
        <button onClick={() => markAllReadMutation.mutate()} className="btn-ghost text-sm">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {isLoading && <div className="glass-card h-24 animate-pulse" />}
        {notifications?.map((n) => {
          const Icon = TYPE_ICON[n.type] ?? InformationCircleIcon
          return (
            <div
              key={n.id}
              className={`glass-card flex items-start gap-4 p-5 transition ${!n.read ? 'border-purple/30' : ''}`}
            >
              <div className={`rounded-xl p-2.5 ${TYPE_COLOR[n.type] ?? TYPE_COLOR.info}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                  <span className="shrink-0 text-xs text-white/30">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/60">{n.message}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="shrink-0 self-center rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  Mark read
                </button>
              )}
            </div>
          )
        })}
        {!isLoading && notifications?.length === 0 && (
          <div className="glass-card p-10 text-center text-sm text-white/40">You're all caught up.</div>
        )}
      </div>
    </div>
  )
}

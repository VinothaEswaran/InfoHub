import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline'
import { deletionApi, companiesApi } from '../services/api'
import type { DeletionRequest, Company } from '../types'

const STATUS_STYLE: Record<string, string> = {
  sent: 'badge-medium',
  awaiting: 'badge-medium',
  resolved: 'badge-low',
  escalated: 'badge-high',
}

const STATUSES = ['sent', 'awaiting', 'resolved', 'escalated'] as const

export default function DeletionRequests() {
  const queryClient = useQueryClient()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['deletion-requests'],
    queryFn: () => deletionApi.list().then((r) => r.data as DeletionRequest[]),
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list().then((r) => r.data as Company[]),
  })

  const companyName = (id: string) => companies?.find((c) => c.id === id)?.name ?? 'Unknown company'

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => deletionApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deletion-requests'] }),
  })

  const daysUntil = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">Deletion Requests</h2>
        <p className="mt-1 text-sm text-white/50">
          Generated from the Data Ledger — track jurisdiction, deadlines, and resolution status here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATUSES.map((s) => {
          const count = requests?.filter((r) => r.status === s).length ?? 0
          return (
            <div key={s} className="glass-card p-4 text-center">
              <p className="font-display text-2xl font-semibold">{count}</p>
              <p className="mt-1 text-xs capitalize text-white/40">{s}</p>
            </div>
          )
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/30">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Jurisdiction</th>
                <th className="px-5 py-3 font-medium">Sent</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Letter</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/40">
                    Loading requests…
                  </td>
                </tr>
              )}
              {requests?.map((r) => {
                const days = daysUntil(r.deadline)
                return (
                  <tr key={r.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5 font-medium">{companyName(r.company_id)}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs">{r.jurisdiction}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{new Date(r.sent_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 ${days < 0 ? 'text-rose-300' : days <= 5 ? 'text-amber-300' : 'text-white/60'}`}>
                        <ClockIcon className="h-4 w-4" />
                        {new Date(r.deadline).toLocaleDateString()} {days >= 0 ? `(${days}d left)` : '(overdue)'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={r.status}
                        onChange={(e) => statusMutation.mutate({ id: r.id, status: e.target.value })}
                        className={`badge ${STATUS_STYLE[r.status]} cursor-pointer border-0 bg-transparent capitalize`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-navy text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <a
                        href={deletionApi.download(r.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan hover:underline"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" /> Download
                      </a>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && requests?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/40">
                    No deletion requests yet — generate one from a company's detail page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

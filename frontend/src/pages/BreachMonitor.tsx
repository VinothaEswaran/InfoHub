import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BellAlertIcon, CheckCircleIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline'
import { breachesApi, companiesApi } from '../services/api'
import type { BreachRecord, Company } from '../types'

const SEVERITY_STYLE: Record<string, string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-high',
}

export default function BreachMonitor() {
  const queryClient = useQueryClient()

  const { data: breaches, isLoading } = useQuery({
    queryKey: ['breaches'],
    queryFn: () => breachesApi.list().then((r) => r.data as BreachRecord[]),
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list().then((r) => r.data as Company[]),
  })

  const companyName = (id: string) => companies?.find((c) => c.id === id)?.name ?? 'Unknown company'

  const resolveMutation = useMutation({
    mutationFn: (id: string) => breachesApi.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['breaches'] }),
  })

  const scanAllMutation = useMutation({
    mutationFn: async () => {
      if (!companies) return
      await Promise.all(companies.map((c) => breachesApi.scan(c.id)))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['breaches'] }),
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Breach Monitor</h2>
          <p className="mt-1 text-sm text-white/50">Powered by HaveIBeenPwned — set HIBP_API_KEY for live data.</p>
        </div>
        <button
          onClick={() => scanAllMutation.mutate()}
          disabled={scanAllMutation.isPending}
          className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60"
        >
          <MagnifyingGlassCircleIcon className="h-4 w-4" />
          {scanAllMutation.isPending ? 'Scanning…' : 'Scan all companies'}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/30">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Breach Date</th>
                <th className="px-5 py-3 font-medium">Compromised Data</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Resolved</th>
                <th className="px-5 py-3 font-medium text-right">Notify</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/40">
                    Loading breach records…
                  </td>
                </tr>
              )}
              {breaches?.map((b) => (
                <tr key={b.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 font-medium">{companyName(b.company_id)}</td>
                  <td className="px-5 py-3.5 text-white/60">{new Date(b.breach_date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {b.compromised_data.map((d) => (
                        <span key={d} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/60">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${SEVERITY_STYLE[b.severity] ?? 'badge-medium'}`}>{b.severity}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {b.resolved ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-300">
                        <CheckCircleIcon className="h-4 w-4" /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => resolveMutation.mutate(b.id)}
                        className="inline-flex items-center gap-1.5 text-amber-300 hover:underline"
                      >
                        <BellAlertIcon className="h-4 w-4" /> Mark resolved
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-white/40">
                    {b.user_notified ? 'Notified' : 'Pending'}
                  </td>
                </tr>
              ))}
              {!isLoading && breaches?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/40">
                    No breaches found yet — click "Scan all companies" to check now.
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

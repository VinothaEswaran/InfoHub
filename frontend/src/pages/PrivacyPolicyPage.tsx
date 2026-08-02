import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SparklesIcon, LinkIcon } from '@heroicons/react/24/outline'
import { policiesApi, companiesApi } from '../services/api'

export default function PrivacyPolicyPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const [url, setUrl] = useState('')
  const queryClient = useQueryClient()

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companiesApi.get(companyId!).then((r) => r.data),
    enabled: !!companyId,
  })

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', companyId],
    queryFn: () => policiesApi.get(companyId!).then((r) => r.data),
    enabled: !!companyId,
    retry: false,
  })

  const analyzeMutation = useMutation({
    mutationFn: () => policiesApi.analyze({ company_id: companyId!, source_url: url || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policy', companyId] }),
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">
          Privacy Policy · <span className="text-white/50">{company?.name}</span>
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Paste the privacy policy URL and InfoHub's AI will summarize it in plain language.
        </p>
      </div>

      <div className="glass-card flex flex-wrap items-center gap-3 p-5">
        <div className="relative flex-1 min-w-[240px]">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`https://${company?.website ?? 'company.com'}/privacy`}
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="btn-primary !px-5 !py-2.5 text-sm disabled:opacity-60"
        >
          <SparklesIcon className="h-4 w-4" /> {analyzeMutation.isPending ? 'Analyzing…' : 'Analyze with AI'}
        </button>
      </div>

      {isLoading && <div className="glass-card h-48 animate-pulse" />}

      {policy && (
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h3 className="mb-2 font-display text-sm font-semibold text-white/80">AI Summary</h3>
            <p className="text-sm leading-relaxed text-white/70">{policy.ai_summary}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="mb-3 font-display text-sm font-semibold text-white/80">Collected Data</h3>
              <div className="flex flex-wrap gap-2">
                {policy.collected_data_summary.map((d: string) => (
                  <span key={d} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/70">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="mb-2 font-display text-sm font-semibold text-white/80">Retention Period</h3>
              <p className="text-sm text-white/60">{policy.retention_summary}</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="mb-2 font-display text-sm font-semibold text-white/80">Third-Party Sharing</h3>
              <p className="text-sm text-white/60">{policy.third_party_sharing_summary}</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="mb-3 font-display text-sm font-semibold text-white/80">User Rights</h3>
              <ul className="space-y-1.5 text-sm text-white/60">
                {policy.user_rights_summary.map((r: string) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-card flex items-center justify-between p-6">
            <h3 className="font-display text-sm font-semibold text-white/80">Overall Risk Level</h3>
            <span
              className={`badge ${
                policy.risk_level === 'low' ? 'badge-low' : policy.risk_level === 'medium' ? 'badge-medium' : 'badge-high'
              }`}
            >
              {policy.risk_level}
            </span>
          </div>
        </div>
      )}

      {!isLoading && !policy && (
        <div className="glass-card p-10 text-center text-sm text-white/40">
          No policy analyzed yet — paste a URL above and click "Analyze with AI".
        </div>
      )}
    </div>
  )
}

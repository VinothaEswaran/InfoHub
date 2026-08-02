import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  GlobeAltIcon,
  ShareIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { companiesApi, riskApi, breachesApi, deletionApi } from '../services/api'
import RiskMeter from '../components/RiskMeter'
import RiskBadge from '../components/RiskBadge'
import type { BreachRecord } from '../types'

const DATA_ICON_MAP: Record<string, typeof EnvelopeIcon> = {
  'Email address': EnvelopeIcon,
  'Phone number': PhoneIcon,
  'Physical address': MapPinIcon,
  'Location data': MapPinIcon,
  'Payment details': CreditCardIcon,
  'Cookies & tracking identifiers': GlobeAltIcon,
}

export default function CompanyDetails() {
  const { companyId } = useParams<{ companyId: string }>()
  const queryClient = useQueryClient()

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companiesApi.get(companyId!).then((r) => r.data),
    enabled: !!companyId,
  })

  const { data: breaches } = useQuery({
    queryKey: ['breaches', companyId],
    queryFn: () => breachesApi.list().then((r) => (r.data as BreachRecord[]).filter((b) => b.company_id === companyId)),
    enabled: !!companyId,
  })

  const recomputeMutation = useMutation({
    mutationFn: () => riskApi.recompute(companyId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company', companyId] }),
  })

  const generateLetterMutation = useMutation({
    mutationFn: (jurisdiction: string) => deletionApi.create({ company_id: companyId!, jurisdiction }),
  })

  if (isLoading || !company) {
    return <div className="glass-card h-64 animate-pulse" />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple/40 to-cyan/40 text-lg font-semibold">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{company.name}</h2>
            <p className="text-sm text-white/50">{company.industry} · {company.website}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/data-ledger/${companyId}/policy`} className="btn-secondary !px-4 !py-2 text-sm">
            <SparklesIcon className="h-4 w-4" /> AI Policy Summary
          </Link>
          <button onClick={() => recomputeMutation.mutate()} className="btn-primary !px-4 !py-2 text-sm">
            Recompute Risk
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Risk meter */}
        <div className="glass-card flex flex-col items-center justify-center gap-3 p-6">
          <RiskMeter score={company.risk_score} />
          <RiskBadge score={company.risk_score} />
        </div>

        {/* Data collected */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold text-white/80">Data Collected</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {company.collected_data.map((d: string) => {
              const Icon = DATA_ICON_MAP[d] ?? GlobeAltIcon
              return (
                <div key={d} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-cyan" />
                  <span className="text-xs text-white/70">{d}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-white/40" />
              Retention: {company.retention_period_months} months
            </div>
            <div className="flex items-center gap-2">
              <ShareIcon className="h-4 w-4 text-white/40" />
              Third-party sharing: {company.third_party_sharing ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>

      {/* Known breaches */}
      <div className="glass-card p-6">
        <h3 className="mb-4 font-display text-sm font-semibold text-white/80">Known Breaches</h3>
        {breaches && breaches.length > 0 ? (
          <div className="space-y-3">
            {breaches.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{new Date(b.breach_date).toLocaleDateString()}</p>
                  <p className="text-xs text-white/40">{b.compromised_data.join(', ')}</p>
                </div>
                <span className={`badge ${b.severity === 'low' ? 'badge-low' : b.severity === 'medium' ? 'badge-medium' : 'badge-high'}`}>
                  {b.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">No known breaches for this company. Great news!</p>
        )}
      </div>

      {/* Generate deletion request */}
      <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h3 className="font-display text-sm font-semibold text-white/80">Generate Deletion Request</h3>
          <p className="mt-1 text-xs text-white/40">Choose a jurisdiction to generate a legally compliant letter.</p>
        </div>
        <div className="flex gap-2">
          {['GDPR', 'DPDP', 'CCPA'].map((j) => (
            <button
              key={j}
              onClick={() => generateLetterMutation.mutate(j)}
              className="btn-secondary !px-4 !py-2 text-sm"
            >
              <DocumentTextIcon className="h-4 w-4" /> {j}
            </button>
          ))}
        </div>
      </div>
      {generateLetterMutation.isSuccess && (
        <p className="text-sm text-emerald-300">
          Deletion request generated — track its status on the{' '}
          <Link to="/deletion-requests" className="underline">
            Deletion Requests
          </Link>{' '}
          page.
        </p>
      )}
    </div>
  )
}

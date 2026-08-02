import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CircleStackIcon,
  ShieldExclamationIcon,
  BellAlertIcon,
  ClockIcon,
  HeartIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { dashboardApi, companiesApi } from '../services/api'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import RiskTrendChart from '../components/charts/RiskTrendChart'
import DataCategoriesPie from '../components/charts/DataCategoriesPie'
import DeletionTimelineChart from '../components/charts/DeletionTimelineChart'
import { CardSkeleton, TableRowSkeleton } from '../components/Skeletons'
import type { Company } from '../types'

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.overview().then((r) => r.data),
  })

  const { data: riskTrend } = useQuery({
    queryKey: ['risk-trend'],
    queryFn: () => dashboardApi.riskTrend().then((r) => r.data),
  })

  const { data: dataCategories } = useQuery({
    queryKey: ['data-categories'],
    queryFn: () => dashboardApi.dataCategories().then((r) => r.data),
  })

  const { data: deletionTimeline } = useQuery({
    queryKey: ['deletion-timeline'],
    queryFn: () => dashboardApi.deletionTimeline().then((r) => r.data),
  })

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies', { sort_by: 'risk_score' }],
    queryFn: () => companiesApi.list({ sort_by: 'risk_score' }).then((r) => r.data as Company[]),
  })

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {overviewLoading ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Companies Holding My Data" value={overview?.companies_tracking ?? 0} icon={CircleStackIcon} accent="purple" />
            <StatCard label="Average Risk Score" value={overview?.average_risk_score ?? 0} icon={ShieldExclamationIcon} accent="cyan" decimals={1} />
            <StatCard label="Recent Breaches" value={overview?.recent_breaches ?? 0} icon={BellAlertIcon} accent="purple" />
            <StatCard label="Pending Requests" value={overview?.pending_requests ?? 0} icon={ClockIcon} accent="cyan" />
            <StatCard label="Privacy Health Score" value={overview?.privacy_health_score ?? 0} icon={HeartIcon} accent="purple" suffix="%" decimals={1} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="mb-1 font-display text-sm font-semibold text-white/80">Risk Trend</h3>
          <p className="mb-3 text-xs text-white/40">Average privacy risk score across your tracked companies</p>
          <RiskTrendChart data={riskTrend ?? []} />
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-1 font-display text-sm font-semibold text-white/80">Data Categories</h3>
          <p className="mb-3 text-xs text-white/40">What kinds of data companies hold on you</p>
          <DataCategoriesPie data={dataCategories ?? []} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-1 font-display text-sm font-semibold text-white/80">Deletion Request Timeline</h3>
          <p className="mb-3 text-xs text-white/40">Requests sent, resolved, and escalated over time</p>
          <DeletionTimelineChart data={deletionTimeline ?? []} />
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-1 font-display text-sm font-semibold text-white/80">Monthly Privacy Score</h3>
          <p className="mb-3 text-xs text-white/40">100 − average risk, tracked monthly</p>
          <RiskTrendChart
            data={(riskTrend ?? []).map((d: { month: string; avg_risk: number }) => ({
              month: d.month,
              avg_risk: Math.round(100 - d.avg_risk),
            }))}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-white/80">Recent Activity</h3>
          <Link to="/data-ledger" className="text-xs font-medium text-cyan hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/30">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Risk</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {companiesLoading &&
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}
              {companies?.slice(0, 6).map((c) => (
                <tr key={c.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 font-medium">{c.name}</td>
                  <td className="px-5 py-3.5">
                    <RiskBadge score={c.risk_score} />
                  </td>
                  <td className="px-5 py-3.5">
                    {c.breach_status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 text-rose-300">
                        <BellAlertIcon className="h-4 w-4" /> Breach found
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-300">
                        <CheckBadgeIcon className="h-4 w-4" /> Clean
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link to={`/data-ledger/${c.id}`} className="text-xs font-medium text-cyan hover:underline">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

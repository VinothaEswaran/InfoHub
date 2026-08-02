import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { LightBulbIcon } from '@heroicons/react/24/outline'
import { companiesApi, dashboardApi, riskApi } from '../services/api'
import RiskMeter from '../components/RiskMeter'
import RiskBadge from '../components/RiskBadge'
import RiskTrendChart from '../components/charts/RiskTrendChart'
import type { Company, RiskAssessment } from '../types'

function colorForScore(score: number) {
  if (score < 35) return '#34d399'
  if (score < 65) return '#fbbf24'
  return '#fb7185'
}

export default function RiskAnalysis() {
  const { data: companies } = useQuery({
    queryKey: ['companies', { sort_by: 'risk_score' }],
    queryFn: () => companiesApi.list({ sort_by: 'risk_score' }).then((r) => r.data as Company[]),
  })

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.overview().then((r) => r.data),
  })

  const { data: riskTrend } = useQuery({
    queryKey: ['risk-trend'],
    queryFn: () => dashboardApi.riskTrend().then((r) => r.data),
  })

  const { data: topRisk } = useQuery({
    queryKey: ['top-risk'],
    queryFn: () => riskApi.topRisk().then((r) => r.data as RiskAssessment[]),
  })

  const comparisonData = (companies ?? []).slice(0, 8).map((c) => ({ name: c.name, score: c.risk_score }))
  const highRiskCompanies = (companies ?? []).filter((c) => c.risk_score >= 60).slice(0, 5)

  const recommendations = Array.from(
    new Set((topRisk ?? []).flatMap((r) => r.recommendations)),
  ).slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass-card flex flex-col items-center justify-center gap-3 p-6">
          <h3 className="font-display text-sm font-semibold text-white/80">Overall Risk Meter</h3>
          <RiskMeter score={overview?.average_risk_score ?? 0} />
          <p className="text-xs text-white/40">Privacy Health Score: {overview?.privacy_health_score ?? 0}%</p>
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="mb-1 font-display text-sm font-semibold text-white/80">Company Comparison</h3>
          <p className="mb-3 text-xs text-white/40">Risk score across your top tracked companies</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0E1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {comparisonData.map((d, i) => (
                  <Cell key={i} fill={colorForScore(d.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="mb-1 font-display text-sm font-semibold text-white/80">Risk Timeline</h3>
        <p className="mb-3 text-xs text-white/40">How your average risk has trended over time</p>
        <RiskTrendChart data={riskTrend ?? []} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold text-white/80">Top High-Risk Companies</h3>
          <div className="space-y-3">
            {highRiskCompanies.length === 0 && (
              <p className="text-sm text-white/40">No high-risk companies right now — nice work.</p>
            )}
            {highRiskCompanies.map((c) => (
              <Link
                key={c.id}
                to={`/data-ledger/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-purple/40"
              >
                <span className="text-sm font-medium">{c.name}</span>
                <RiskBadge score={c.risk_score} />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white/80">
            <LightBulbIcon className="h-4 w-4 text-cyan" /> AI Recommendations
          </h3>
          <ul className="space-y-3">
            {recommendations.length === 0 && (
              <p className="text-sm text-white/40">Recompute risk on a few companies to generate recommendations.</p>
            )}
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-light" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

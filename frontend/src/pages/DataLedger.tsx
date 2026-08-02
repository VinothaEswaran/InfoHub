import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, TrashIcon, EyeIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'
import { companiesApi, deletionApi } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import { TableRowSkeleton } from '../components/Skeletons'
import AddCompanyModal, { type NewCompanyInput } from '../components/AddCompanyModal'
import type { Company } from '../types'

export default function DataLedger() {
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [sortBy, setSortBy] = useState('risk_score')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies', { search, industry, sortBy }],
    queryFn: () =>
      companiesApi.list({ search: search || undefined, industry: industry || undefined, sort_by: sortBy }).then(
        (r) => r.data as Company[],
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companiesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })

  const generateLetterMutation = useMutation({
    mutationFn: (companyId: string) => deletionApi.create({ company_id: companyId, jurisdiction: 'GDPR' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deletion-requests'] }),
  })

  const createMutation = useMutation({
    mutationFn: (data: NewCompanyInput) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setIsModalOpen(false)
    },
  })

  const industries = Array.from(new Set(companies?.map((c) => c.industry) ?? []))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field !w-auto text-sm">
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !w-auto text-sm">
            <option value="risk_score">Sort: Risk score</option>
            <option value="name">Sort: Name</option>
            <option value="created_at">Sort: Date added</option>
          </select>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary !px-4 !py-2 text-sm">
            <PlusIcon className="h-4 w-4" /> Add company
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/30">
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Collected Data</th>
                <th className="px-5 py-3 font-medium">Retention</th>
                <th className="px-5 py-3 font-medium">Risk Score</th>
                <th className="px-5 py-3 font-medium">Breach Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}
              {companies?.map((c) => (
                <tr key={c.id} className="border-t border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple/30 to-cyan/30 text-xs font-semibold">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/60">{c.industry}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.collected_data.slice(0, 2).map((d) => (
                        <span key={d} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/60">
                          {d}
                        </span>
                      ))}
                      {c.collected_data.length > 2 && (
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-white/40">
                          +{c.collected_data.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/60">{c.retention_period_months} mo</td>
                  <td className="px-5 py-3.5">
                    <RiskBadge score={c.risk_score} />
                  </td>
                  <td className="px-5 py-3.5">
                    {c.breach_status === 'active' ? (
                      <span className="text-rose-300">Active breach</span>
                    ) : (
                      <span className="text-emerald-300">Clean</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/data-ledger/${c.id}`} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => generateLetterMutation.mutate(c.id)}
                        className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                        title="Generate deletion letter"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        className="rounded-lg p-2 text-white/50 hover:bg-rose-500/10 hover:text-rose-300"
                        title="Delete entry"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && companies?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-white/40">
                    No companies match your filters yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCompanyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}

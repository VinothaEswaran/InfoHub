import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export interface NewCompanyInput {
  name: string
  industry: string
  website: string
  collected_data: string[]
  retention_period_months: number
  third_party_sharing: boolean
}

const DATA_OPTIONS = [
  'Email address',
  'Phone number',
  'Physical address',
  'Location data',
  'Payment details',
  'Cookies & tracking identifiers',
  'IP address',
  'Biometric data',
]

const INDUSTRY_OPTIONS = [
  'Social Media',
  'E-Commerce',
  'Entertainment',
  'Professional Network',
  'Transportation',
  'Travel',
  'Cloud Storage',
  'Food Delivery',
  'Finance',
  'Healthcare',
  'Other',
]

interface AddCompanyModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: NewCompanyInput) => void
  isSubmitting?: boolean
}

export default function AddCompanyModal({ open, onClose, onSubmit, isSubmitting }: AddCompanyModalProps) {
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0])
  const [website, setWebsite] = useState('')
  const [selectedData, setSelectedData] = useState<string[]>(['Email address'])
  const [retention, setRetention] = useState(24)
  const [thirdParty, setThirdParty] = useState(false)

  if (!open) return null

  const toggleData = (item: string) => {
    setSelectedData((prev) => (prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      industry,
      website: website.trim(),
      collected_data: selectedData,
      retention_period_months: retention,
      third_party_sharing: thirdParty,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg bg-navy-light p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Add a company</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/50">Company name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Netflix"
              className="input-field"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field">
                {INDUSTRY_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="netflix.com"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/50">Data they collect</label>
            <div className="flex flex-wrap gap-2">
              {DATA_OPTIONS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleData(d)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selectedData.includes(d)
                      ? 'border-purple bg-purple/20 text-white'
                      : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                Retention (months): {retention}
              </label>
              <input
                type="range"
                min={1}
                max={72}
                value={retention}
                onChange={(e) => setRetention(Number(e.target.value))}
                className="w-full accent-purple"
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={thirdParty}
                onChange={(e) => setThirdParty(e.target.checked)}
                className="h-4 w-4 accent-purple"
              />
              Shares with third parties
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
              {isSubmitting ? 'Adding…' : 'Add company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

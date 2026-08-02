import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  UserCircleIcon,
  BellIcon,
  SwatchIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline'

const SECTIONS = [
  { id: 'account', label: 'Google Account', icon: UserCircleIcon },
  { id: 'notifications', label: 'Notification Preferences', icon: BellIcon },
  { id: 'theme', label: 'Theme', icon: SwatchIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
]

export default function Settings() {
  const { user } = useAuth()
  const [active, setActive] = useState('account')
  const [prefs, setPrefs] = useState({ breaches: true, deadlines: true, ai: false })

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      <div className="glass-card h-fit space-y-1 p-3 lg:col-span-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`sidebar-link w-full ${active === s.id ? 'sidebar-link-active' : ''}`}
          >
            <s.icon className="h-5 w-5" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 lg:col-span-3">
        {active === 'account' && (
          <div className="space-y-5">
            <h3 className="font-display text-lg font-semibold">Google Account</h3>
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan text-lg font-semibold">
                {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="font-medium">{user?.full_name}</p>
                <p className="text-sm text-white/50">{user?.email}</p>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium text-white/70">Connected Emails</h4>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
                {user?.email} <span className="ml-2 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">Primary</span>
              </div>
            </div>
          </div>
        )}

        {active === 'notifications' && (
          <div className="space-y-5">
            <h3 className="font-display text-lg font-semibold">Notification Preferences</h3>
            {[
              { key: 'breaches', label: 'New breach alerts' },
              { key: 'deadlines', label: 'Upcoming deadline reminders' },
              { key: 'ai', label: 'AI recommendations' },
            ].map((p) => (
              <label key={p.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-sm text-white/70">{p.label}</span>
                <input
                  type="checkbox"
                  checked={prefs[p.key as keyof typeof prefs]}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                  className="h-5 w-5 accent-purple"
                />
              </label>
            ))}
          </div>
        )}

        {active === 'theme' && (
          <div className="space-y-5">
            <h3 className="font-display text-lg font-semibold">Theme</h3>
            <div className="flex gap-4">
              <div className="glass-card flex-1 border-purple/50 p-6 text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-navy" />
                <p className="text-sm font-medium">Dark (active)</p>
              </div>
              <div className="glass-card-light flex-1 p-6 text-center opacity-60">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white border" />
                <p className="text-sm font-medium">Light</p>
              </div>
            </div>
          </div>
        )}

        {active === 'security' && (
          <div className="space-y-5">
            <h3 className="font-display text-lg font-semibold">Security</h3>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <KeyIcon className="h-5 w-5 text-white/50" />
                <span className="text-sm text-white/70">Password</span>
              </div>
              <button className="btn-ghost text-sm">Change</button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <DevicePhoneMobileIcon className="h-5 w-5 text-white/50" />
                <span className="text-sm text-white/70">Active sessions</span>
              </div>
              <button className="btn-ghost text-sm">Manage</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, BellIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { notificationsApi } from '../services/api'

export default function Navbar({ title }: { title: string }) {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(true)

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
  })
  const unreadCount = notifications?.filter((n: { read: boolean }) => !n.read).length ?? 0

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/5 bg-navy/70 px-6 py-4 backdrop-blur-xl">
      <div>
        <h1 className="font-display text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search companies, requests..."
            className="input-field !py-2 pl-9 text-sm"
          />
        </div>

        <button
          onClick={() => setDarkMode((d) => !d)}
          className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:text-white"
          aria-label="Toggle theme"
        >
          {darkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>

        <Link
          to="/notifications"
          className="relative rounded-xl border border-white/10 p-2 text-white/60 transition hover:text-white"
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan text-[10px] font-bold text-navy">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link to="/settings" className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan text-xs font-semibold">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="hidden text-sm font-medium text-white/80 md:block">{user?.full_name}</span>
        </Link>
      </div>
    </header>
  )
}

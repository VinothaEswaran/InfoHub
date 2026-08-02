import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  Squares2X2Icon,
  CircleStackIcon,
  ShieldExclamationIcon,
  BellAlertIcon,
  DocumentTextIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/data-ledger', label: 'My Data Ledger', icon: CircleStackIcon },
  { to: '/risk-analysis', label: 'Risk Analysis', icon: ShieldExclamationIcon },
  { to: '/breach-monitor', label: 'Breach Monitor', icon: BellAlertIcon },
  { to: '/deletion-requests', label: 'Deletion Requests', icon: DocumentTextIcon },
  { to: '/notifications', label: 'Notifications', icon: BellIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-navy/60 px-4 py-6 backdrop-blur-xl lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple to-cyan">
          <ShieldCheckIcon className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-lg font-semibold text-white">InfoHub</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'sidebar-link-active')}
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} className="sidebar-link mt-2 w-full text-left">
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        Logout
      </button>
    </aside>
  )
}

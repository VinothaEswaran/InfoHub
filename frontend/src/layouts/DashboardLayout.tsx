import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/data-ledger': 'My Data Ledger',
  '/risk-analysis': 'Risk Analysis',
  '/breach-monitor': 'Breach Monitor',
  '/deletion-requests': 'Deletion Requests',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
}

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/data-ledger/') && pathname.endsWith('/policy')) return 'Privacy Policy'
  if (pathname.startsWith('/data-ledger/')) return 'Company Details'
  return 'InfoHub'
}

export default function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-navy bg-grid-glow">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={titleFor(location.pathname)} />
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

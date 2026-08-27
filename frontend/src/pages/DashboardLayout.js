import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShield, FiGrid, FiDatabase, FiBarChart2, FiAlertTriangle,
  FiFileText, FiBell, FiSettings, FiLogOut, FiSearch,
  FiMoon, FiSun, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const NAV_ITEMS = [
  { to: '/dashboard',          icon: FiGrid,         label: 'Dashboard' },
  { to: '/data-ledger',        icon: FiDatabase,     label: 'My Data Ledger' },
  { to: '/risk-analysis',      icon: FiBarChart2,    label: 'Risk Analysis' },
  { to: '/breach-monitor',     icon: FiAlertTriangle,label: 'Breach Monitor' },
  { to: '/deletion-requests',  icon: FiFileText,     label: 'Deletion Requests' },
  { to: '/notifications',      icon: FiBell,         label: 'Notifications' },
  { to: '/settings',           icon: FiSettings,     label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    notificationAPI.getUnreadCount()
      .then(r => setUnread(r.data.data?.count || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      notificationAPI.getUnreadCount()
        .then(r => setUnread(r.data.data?.count || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`flex flex-col h-full ${mobile ? 'w-64' : 'w-64'}`}
      style={{ background: '#0d1528', borderRight: '1px solid rgba(108,63,197,0.15)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(108,63,197,0.15)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
          <FiShield className="text-white" size={18} />
        </div>
        <span className="text-white font-bold text-lg"
          style={{ fontFamily: '"Times New Roman",Times,serif' }}>InfoHub</span>
        {mobile && (
          <button className="ml-auto text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group
              ${isActive
                ? 'nav-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            }
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-primary-light' : 'text-slate-400 group-hover:text-white'} />
                <span>{label}</span>
                {label === 'Notifications' && unread > 0 && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: '#6C3FC5', fontFamily: '"Times New Roman",Times,serif' }}>
                    {unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 pt-2 space-y-1"
        style={{ borderTop: '1px solid rgba(108,63,197,0.15)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(108,63,197,0.08)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)' }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>
              {user?.displayName || 'User'}
            </p>
            <p className="text-slate-500 text-xs truncate"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400
            hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          style={{ fontFamily: '"Times New Roman",Times,serif' }}>
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0f1e' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-shrink-0">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
          style={{
            background: '#0d1528',
            borderBottom: '1px solid rgba(108,63,197,0.15)',
          }}>
          {/* Mobile hamburger */}
          <button className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>

          {/* Page title — injected by each page via document.title or a context */}
          <h1 className="text-white font-bold text-xl hidden md:block"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Dashboard
          </h1>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search companies, requests..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(108,63,197,0.2)',
                fontFamily: '"Times New Roman",Times,serif',
              }}
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Theme toggle (visual only) */}
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <FiMoon size={16} />
            </button>

            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              onClick={() => navigate('/notifications')}>
              <FiBell size={16} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ background: '#6C3FC5', fontSize: '10px' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)' }}
              onClick={() => navigate('/settings')}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FiBell, FiAlertTriangle, FiClock, FiInfo, FiShield, FiCheckCircle } from 'react-icons/fi';
import { notificationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const font = '"Times New Roman",Times,serif';

const TYPE_CONFIG = {
  BreachAlert:        { icon: FiAlertTriangle, color: '#E53935', bg: 'rgba(229,57,53,0.1)',   label: 'Breach Alert' },
  DeadlineReminder:   { icon: FiClock,         color: '#FFB300', bg: 'rgba(255,179,0,0.1)',   label: 'Deadline Reminder' },
  StatusUpdate:       { icon: FiInfo,           color: '#00BFA6', bg: 'rgba(0,191,166,0.1)',  label: 'Status Update' },
  AIRecommendation:   { icon: FiShield,         color: '#6C3FC5', bg: 'rgba(108,63,197,0.1)', label: 'AI Recommendation' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    notificationAPI.getAll()
      .then(r => setNotifications(r.data.data || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all read'); }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>Notifications</h1>
          <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
            style={{ background: 'rgba(108,63,197,0.2)', border: '1px solid rgba(108,63,197,0.3)', fontFamily: font }}>
            <FiCheckCircle size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl flex flex-col items-center gap-4"
          style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(108,63,197,0.1)' }}>
            <FiBell size={32} style={{ color: '#6C3FC5' }} />
          </div>
          <p className="text-white font-semibold text-lg" style={{ fontFamily: font }}>No notifications yet</p>
          <p className="text-slate-400 text-sm text-center" style={{ fontFamily: font }}>
            You'll be notified about breaches, deletion deadlines, and AI insights here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unread section */}
          {notifications.filter(n => !n.isRead).length > 0 && (
            <>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-1"
                style={{ fontFamily: font }}>Unread</p>
              {notifications.filter(n => !n.isRead).map(n => (
                <NotifCard key={n.id} n={n} onRead={handleMarkRead} navigate={navigate} />
              ))}
            </>
          )}
          {/* Read section */}
          {notifications.filter(n => n.isRead).length > 0 && (
            <>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-1 mt-4"
                style={{ fontFamily: font }}>Earlier</p>
              {notifications.filter(n => n.isRead).map(n => (
                <NotifCard key={n.id} n={n} onRead={handleMarkRead} navigate={navigate} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NotifCard({ n, onRead, navigate }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.AIRecommendation;
  const Icon = cfg.icon;
  return (
    <div
      onClick={() => { if (!n.isRead) onRead(n.id); if (n.actionUrl) navigate(n.actionUrl); }}
      className="glass-card p-4 rounded-2xl flex items-start gap-4 cursor-pointer hover:border-primary/40 transition-all"
      style={{
        border: n.isRead ? '1px solid rgba(108,63,197,0.1)' : '1px solid rgba(108,63,197,0.35)',
        background: n.isRead ? 'transparent' : 'rgba(108,63,197,0.04)',
        opacity: n.isRead ? 0.7 : 1,
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: cfg.bg }}>
        <Icon size={18} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="badge text-xs mr-2"
              style={{ background: cfg.bg, color: cfg.color, fontFamily: font }}>{cfg.label}</span>
            {!n.isRead && (
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#6C3FC5' }} />
            )}
          </div>
          <p className="text-slate-500 text-xs flex-shrink-0" style={{ fontFamily: font }}>
            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
          </p>
        </div>
        <p className="text-white text-sm font-semibold mt-1.5" style={{ fontFamily: font }}>{n.title}</p>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed" style={{ fontFamily: font }}>{n.body}</p>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { FiDatabase, FiShield, FiAlertTriangle, FiFileText, FiHeart } from 'react-icons/fi';
import { dashboardAPI, riskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const font = '"Times New Roman",Times,serif';

function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="glass-card p-5 rounded-2xl kpi-card flex items-center justify-between"
      style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: font }}>{label}</p>
        <p className="text-white text-3xl font-bold" style={{ fontFamily: font }}>{value ?? '—'}</p>
        {sub && <p className="text-slate-500 text-xs mt-1" style={{ fontFamily: font }}>{sub}</p>}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  );
}

const CHART_COLORS = ['#6C3FC5', '#00BFA6', '#FFB300', '#E53935', '#43A047', '#8B5CF6'];

const CATEGORY_LABELS = {
  email: 'Email', location: 'Location', financial: 'Financial',
  health: 'Health', browsing: 'Browsing', social: 'Social', device: 'Device',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getSummary(),
      dashboardAPI.getActivity(),
      riskAPI.getHistory(),
      riskAPI.getBreakdown(),
    ]).then(([s, a, rh, bd]) => {
      setSummary(s.data.data);
      setActivity(a.data.data || []);
      setRiskHistory(rh.data.data || []);
      setBreakdown(bd.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Build category pie data from breakdown
  const categoryMap = {};
  breakdown.forEach(c => {
    try {
      const cats = JSON.parse(c.dataCategories || '[]');
      cats.forEach(cat => { categoryMap[cat] = (categoryMap[cat] || 0) + 1; });
    } catch {}
  });
  const categoryData = Object.entries(categoryMap).map(([k, v]) => ({
    name: CATEGORY_LABELS[k] || k, value: v,
  }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
            Welcome back, {user?.displayName || 'there'} — here's your privacy overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard label="Companies Holding My Data" value={summary?.companiesCount ?? 0}
          icon={FiDatabase} color="#6C3FC5" />
        <KpiCard label="Average Risk Score" value={summary?.avgRiskScore ?? '0.0'}
          icon={FiShield} color="#FFB300" />
        <KpiCard label="Recent Breaches" value={summary?.recentBreaches ?? 0}
          icon={FiAlertTriangle} color="#E53935" />
        <KpiCard label="Pending Requests" value={summary?.pendingRequests ?? 0}
          icon={FiFileText} color="#00BFA6" />
        <KpiCard label="Privacy Health Score" value={`${summary?.healthScore ?? 100.0}%`}
          icon={FiHeart} color="#43A047" sub="Higher is better" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend */}
        <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <h2 className="text-white font-semibold mb-1" style={{ fontFamily: font }}>Risk Trend</h2>
          <p className="text-slate-500 text-xs mb-5" style={{ fontFamily: font }}>
            Average privacy risk score across your tracked companies
          </p>
          {riskHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={riskHistory}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontFamily: font }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11, fontFamily: font }} />
                <Tooltip
                  contentStyle={{ background: '#0d1528', border: '1px solid #6C3FC5', borderRadius: 8, fontFamily: font }}
                  labelStyle={{ color: '#fff' }} itemStyle={{ color: '#00BFA6' }} />
                <Line type="monotone" dataKey="score" stroke="#6C3FC5" strokeWidth={2.5}
                  dot={{ fill: '#6C3FC5', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-600 text-sm" style={{ fontFamily: font }}>Not enough history yet</p>
            </div>
          )}
        </div>

        {/* Data Categories */}
        <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <h2 className="text-white font-semibold mb-1" style={{ fontFamily: font }}>Data Categories</h2>
          <p className="text-slate-500 text-xs mb-5" style={{ fontFamily: font }}>
            What kinds of data companies hold on you
          </p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1528', border: '1px solid #6C3FC5', borderRadius: 8, fontFamily: font }}
                  itemStyle={{ color: '#fff' }} />
                <Legend wrapperStyle={{ fontFamily: font, fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-600 text-sm" style={{ fontFamily: font }}>No categories tracked yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deletion Timeline */}
        <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <h2 className="text-white font-semibold mb-1" style={{ fontFamily: font }}>Deletion Request Timeline</h2>
          <p className="text-slate-500 text-xs mb-5" style={{ fontFamily: font }}>
            Requests sent, resolved, and escalated over time
          </p>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={breakdown.slice(0, 8)}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: font }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: font }} />
                <Tooltip contentStyle={{ background: '#0d1528', border: '1px solid #6C3FC5', borderRadius: 8, fontFamily: font }}
                  itemStyle={{ color: '#fff' }} />
                <Bar dataKey="score" fill="#6C3FC5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="text-slate-600 text-sm" style={{ fontFamily: font }}>No requests yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <h2 className="text-white font-semibold mb-1" style={{ fontFamily: font }}>Monthly Privacy Score</h2>
          <p className="text-slate-500 text-xs mb-5" style={{ fontFamily: font }}>
            100 — average risk, tracked monthly
          </p>
          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {activity.length > 0 ? activity.slice(0, 6).map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs mt-0.5 px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{
                    background: item.type === 'BreachAlert' ? '#E5393522' : '#6C3FC522',
                    color: item.type === 'BreachAlert' ? '#E53935' : '#8B5CF6',
                    fontFamily: font,
                  }}>
                  {item.type?.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate" style={{ fontFamily: font }}>{item.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: font }}>
                    {item.time ? new Date(item.time).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-slate-600 text-sm text-center py-8" style={{ fontFamily: font }}>
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

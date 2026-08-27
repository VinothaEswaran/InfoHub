import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Dashboard KPI card.
 * Props: label, value, icon (React component), color (hex), sub (optional subtitle)
 */
export default function KpiCard({ label, value, icon: Icon, color = '#6C3FC5', sub }) {
  return (
    <div
      className="glass-card p-5 rounded-2xl kpi-card flex items-center justify-between"
      style={{ border: '1px solid rgba(108,63,197,0.18)' }}
    >
      <div>
        <p
          className="text-slate-400 text-xs uppercase tracking-widest mb-1"
          style={{ fontFamily: font }}
        >
          {label}
        </p>
        <p className="text-white text-3xl font-bold" style={{ fontFamily: font }}>
          {value ?? '—'}
        </p>
        {sub && (
          <p className="text-slate-500 text-xs mt-1" style={{ fontFamily: font }}>
            {sub}
          </p>
        )}
      </div>

      {Icon && (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      )}
    </div>
  );
}

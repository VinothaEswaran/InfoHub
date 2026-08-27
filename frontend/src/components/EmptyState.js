import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Generic empty state card.
 * Props: icon (React component), title, description, action (optional node)
 */
export default function EmptyState({ icon: Icon, title, description, action, iconColor = '#6C3FC5' }) {
  return (
    <div
      className="glass-card p-12 rounded-2xl flex flex-col items-center gap-4 text-center"
      style={{ border: '1px solid rgba(108,63,197,0.18)' }}
    >
      {Icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: `${iconColor}18` }}
        >
          <Icon size={32} style={{ color: iconColor }} />
        </div>
      )}
      <p className="text-white font-semibold text-lg" style={{ fontFamily: font }}>
        {title}
      </p>
      {description && (
        <p
          className="text-slate-400 text-sm max-w-sm leading-relaxed"
          style={{ fontFamily: font }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

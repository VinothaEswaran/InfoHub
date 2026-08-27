import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Settings-style section card with icon header.
 * Props: icon (React component), title, children
 */
export default function SectionCard({ icon: Icon, title, children }) {
  return (
    <div
      className="glass-card p-6 rounded-2xl"
      style={{ border: '1px solid rgba(108,63,197,0.18)' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(108,63,197,0.2)' }}
        >
          <Icon size={18} style={{ color: '#8B5CF6' }} />
        </div>
        <h2 className="text-white font-semibold text-base" style={{ fontFamily: font }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

import React from 'react';

/**
 * Standard glass-style card container.
 * Props: children, className, style, padding (default 'p-6')
 */
export default function GlassCard({ children, className = '', style = {}, padding = 'p-6' }) {
  return (
    <div
      className={`glass-card rounded-2xl ${padding} ${className}`}
      style={{ border: '1px solid rgba(108,63,197,0.18)', ...style }}
    >
      {children}
    </div>
  );
}

import React, { useEffect } from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Reusable modal dialog.
 * Props: open, onClose, title, children, maxWidth (default 'max-w-md')
 */
export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl p-6 animate-slide-up`}
        style={{ background: '#0d1528', border: '1px solid rgba(108,63,197,0.35)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-white font-bold text-lg"
            style={{ fontFamily: font }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
              hover:text-white hover:bg-white/10 transition-all text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        {children}
      </div>
    </div>
  );
}

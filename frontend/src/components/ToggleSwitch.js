import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Toggle switch with label and optional description.
 * Props: label, desc, value (bool), onChange (fn), disabled
 */
export default function ToggleSwitch({ label, desc, value = false, onChange, disabled = false }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid rgba(108,63,197,0.08)' }}
    >
      <div>
        <p className="text-white text-sm" style={{ fontFamily: font }}>
          {label}
        </p>
        {desc && (
          <p className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: font }}>
            {desc}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: value ? '#6C3FC5' : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

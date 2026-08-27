import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Primary gradient action button.
 * Props: children, onClick, disabled, loading, type ('button'|'submit'), className
 */
export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white
        font-semibold text-sm hover:opacity-90 hover:scale-[1.01] disabled:opacity-60
        transition-all ${className}`}
      style={{
        background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)',
        fontFamily: font,
      }}
    >
      {loading ? (
        <>
          <span
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  );
}

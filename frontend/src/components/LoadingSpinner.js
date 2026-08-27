import React from 'react';

/**
 * Centered loading spinner.
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function LoadingSpinner({ size = 'md' }) {
  const dim = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' }[size] || 'w-10 h-10';
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[160px]">
      <div
        className={`${dim} border-4 border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: '#6C3FC5', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

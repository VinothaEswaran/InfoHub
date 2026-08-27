import React from 'react';

const font = '"Times New Roman",Times,serif';

/**
 * Consistent page heading with optional action button.
 * Props: title, subtitle, action (node — e.g. a <button>)
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1
          className="text-white text-2xl font-bold"
          style={{ fontFamily: font }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-slate-400 text-sm mt-1"
            style={{ fontFamily: font }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

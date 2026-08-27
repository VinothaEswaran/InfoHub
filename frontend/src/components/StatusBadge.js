import React from 'react';

const font = '"Times New Roman",Times,serif';

const STATUS_STYLES = {
  Draft:        { bg: 'rgba(108,63,197,0.15)', color: '#8B5CF6' },
  Sent:         { bg: 'rgba(0,191,166,0.15)',  color: '#00BFA6' },
  Acknowledged: { bg: 'rgba(255,179,0,0.15)',  color: '#FFB300' },
  Completed:    { bg: 'rgba(67,160,71,0.15)',   color: '#43A047' },
  Overdue:      { bg: 'rgba(229,57,53,0.15)',   color: '#E53935' },
  Low:          { bg: 'rgba(67,160,71,0.15)',   color: '#43A047' },
  Medium:       { bg: 'rgba(255,179,0,0.15)',   color: '#FFB300' },
  High:         { bg: 'rgba(255,112,67,0.15)',  color: '#FF7043' },
  Critical:     { bg: 'rgba(229,57,53,0.15)',   color: '#E53935' },
};

/**
 * Generic status / label badge.
 * Props: label (string)
 */
export default function StatusBadge({ label }) {
  const style = STATUS_STYLES[label] || { bg: 'rgba(108,63,197,0.15)', color: '#8B5CF6' };
  return (
    <span
      className="badge text-xs"
      style={{ background: style.bg, color: style.color, fontFamily: font }}
    >
      {label}
    </span>
  );
}

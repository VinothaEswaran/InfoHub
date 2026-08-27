import React from 'react';

const font = '"Times New Roman",Times,serif';

const RISK_COLORS = {
  Low:      '#43A047',
  Medium:   '#FFB300',
  High:     '#FF7043',
  Critical: '#E53935',
};

/**
 * Coloured risk level badge.
 * Props: level — 'Low' | 'Medium' | 'High' | 'Critical'
 */
export default function RiskBadge({ level = 'Low' }) {
  const color = RISK_COLORS[level] || '#6C3FC5';
  return (
    <span
      className="badge"
      style={{
        background: `${color}22`,
        color,
        fontFamily: font,
      }}
    >
      {level}
    </span>
  );
}

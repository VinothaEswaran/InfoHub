import React, { useEffect, useState } from 'react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line
} from 'recharts';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { riskAPI } from '../services/api';

const font = '"Times New Roman",Times,serif';
const RISK_COLORS = { Low: '#43A047', Medium: '#FFB300', High: '#FF7043', Critical: '#E53935' };

function getRiskColor(score) {
  if (score < 25) return '#43A047';
  if (score < 50) return '#FFB300';
  if (score < 75) return '#FF7043';
  return '#E53935';
}

function RiskGauge({ score }) {
  const color = getRiskColor(score);
  const data = [{ value: score, fill: color }, { value: 100 - score, fill: 'rgba(255,255,255,0.05)' }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="100%"
            startAngle={180} endAngle={0} data={data}>
            <RadialBar dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <p className="text-4xl font-bold" style={{ color, fontFamily: font }}>{score.toFixed(1)}</p>
          <p className="text-slate-400 text-xs" style={{ fontFamily: font }}>/ 100</p>
        </div>
      </div>
    </div>
  );
}

export default function RiskAnalysis() {
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [recs, setRecs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      riskAPI.getSummary(),
      riskAPI.getBreakdown(),
      riskAPI.getRecommendations(),
      riskAPI.getHistory(),
    ]).then(([s, b, r, h]) => {
      setSummary(s.data.data);
      setBreakdown(b.data.data || []);
      setRecs(r.data.data || []);
      setHistory(h.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const score = summary?.overallScore ?? 0;
  const riskLevel = summary?.riskLevel ?? 'Low';
  const healthScore = summary?.healthScore ?? 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>Risk Analysis</h1>
        <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
          Your complete privacy risk breakdown and AI recommendations
        </p>
      </div>

      {/* Top row — gauge + score cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall risk gauge */}
        <div className="glass-card p-6 rounded-2xl col-span-1 flex flex-col items-center"
          style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <p className="text-white font-semibold mb-4" style={{ fontFamily: font }}>Overall Privacy Risk</p>
          <RiskGauge score={score} />
          <span className="mt-3 px-4 py-1 rounded-full text-sm font-semibold"
            style={{ background: `${getRiskColor(score)}22`, color: getRiskColor(score), fontFamily: font }}>
            {riskLevel} Risk
          </span>
          <p className="text-slate-500 text-xs mt-2 text-center" style={{ fontFamily: font }}>
            Privacy Health Score: <strong className="text-white">{healthScore}%</strong>
          </p>
        </div>

        {/* Score cards */}
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Overall Risk Score', value: score.toFixed(1), icon: FiShield, color: getRiskColor(score) },
            { label: 'Privacy Health', value: `${healthScore}%`, icon: FiCheckCircle, color: '#43A047' },
            { label: 'Score Change', value: `${summary?.change >= 0 ? '+' : ''}${summary?.change?.toFixed(1) ?? '0.0'}`, icon: FiInfo, color: '#FFB300' },
            { label: 'Companies Tracked', value: breakdown.length, icon: FiAlertTriangle, color: '#6C3FC5' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-5 rounded-2xl flex items-center gap-4"
              style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}22` }}>
                <Icon style={{ color }} size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-xs" style={{ fontFamily: font }}>{label}</p>
                <p className="text-white text-2xl font-bold" style={{ fontFamily: font, color }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company risk breakdown + history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <h2 className="text-white font-semibold mb-5" style={{ fontFamily: font }}>Company Risk Comparison</h2>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={breakdown.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11, fontFamily: font }} />
                <YAxis type="category" dataKey="name" width={90}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: font }} />
                <Tooltip contentStyle={{ background: '#0d1528', border: '1px solid #6C3FC5', borderRadius: 8, fontFamily: font }}
                  itemStyle={{ color: '#fff' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {breakdown.slice(0, 10).map((entry, i) => (
                    <Cell key={i} fill={getRiskColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-slate-600 text-sm" style={{ fontFamily: font }}>No companies tracked yet</p>
            </div>
          )}
        </div>

        {/* Risk trend */}
        <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <h2 className="text-white font-semibold mb-5" style={{ fontFamily: font }}>90-Day Risk Trend</h2>
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontFamily: font }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11, fontFamily: font }} />
                <Tooltip contentStyle={{ background: '#0d1528', border: '1px solid #6C3FC5', borderRadius: 8, fontFamily: font }}
                  labelStyle={{ color: '#fff' }} itemStyle={{ color: '#00BFA6' }} />
                <Line type="monotone" dataKey="score" stroke="#6C3FC5" strokeWidth={2.5}
                  dot={{ fill: '#6C3FC5', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-slate-600 text-sm" style={{ fontFamily: font }}>Not enough history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
        <h2 className="text-white font-semibold mb-5" style={{ fontFamily: font }}>AI Recommendations</h2>
        {recs.length > 0 ? (
          <div className="space-y-3">
            {recs.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(108,63,197,0.08)', border: '1px solid rgba(108,63,197,0.2)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#6C3FC5', fontSize: 12, fontFamily: font, color: '#fff', fontWeight: 'bold' }}>
                  {i + 1}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed" style={{ fontFamily: font }}>{rec}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4" style={{ fontFamily: font }}>
            Add companies to your ledger to get personalised AI recommendations.
          </p>
        )}
      </div>
    </div>
  );
}

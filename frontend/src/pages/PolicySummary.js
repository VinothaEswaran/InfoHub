import React, { useState } from 'react';
import { FiSearch, FiShield, FiAlertTriangle, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import { aiAPI } from '../services/api';
import { toast } from 'react-toastify';

const font = '"Times New Roman",Times,serif';

export default function PolicySummary() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!url.trim()) { toast.error('Please enter a URL'); return; }
    setLoading(true);
    setSummary(null);
    try {
      const r = await aiAPI.summarize(url.trim());
      setSummary(r.data.data);
      toast.success('Policy analysed successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to analyse policy');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>AI Privacy Policy Summary</h1>
        <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
          Paste any privacy policy URL and get a plain-language AI summary in seconds
        </p>
      </div>

      {/* URL input */}
      <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
        <form onSubmit={handleSummarize} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://company.com/privacy-policy"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.25)', fontFamily: font }} />
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analysing…
              </span>
            ) : 'Analyse'}
          </button>
        </form>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl animate-pulse"
              style={{ border: '1px solid rgba(108,63,197,0.12)' }}>
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-full mb-2" />
              <div className="h-3 bg-slate-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {summary && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* Plain summary */}
          {summary.plain_summary && (
            <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(0,191,166,0.25)' }}>
              <div className="flex items-center gap-2 mb-3">
                <FiShield size={18} style={{ color: '#00BFA6' }} />
                <h3 className="text-white font-semibold" style={{ fontFamily: font }}>Plain Language Summary</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed" style={{ fontFamily: font }}>{summary.plain_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Data collected */}
            {summary.data_collected?.length > 0 && (
              <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FiUsers size={16} style={{ color: '#8B5CF6' }} />
                  <h3 className="text-white font-semibold text-sm" style={{ fontFamily: font }}>Data Collected</h3>
                </div>
                <ul className="space-y-1.5">
                  {summary.data_collected.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-light flex-shrink-0" />
                      <span className="text-slate-300 text-xs" style={{ fontFamily: font }}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* User rights */}
            {summary.user_rights?.length > 0 && (
              <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FiCheckCircle size={16} style={{ color: '#43A047' }} />
                  <h3 className="text-white font-semibold text-sm" style={{ fontFamily: font }}>Your Rights</h3>
                </div>
                <ul className="space-y-1.5">
                  {summary.user_rights.map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-slate-300 text-xs" style={{ fontFamily: font }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Third-party sharing */}
            {summary.third_party_sharing && (
              <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FiUsers size={16} style={{ color: '#FFB300' }} />
                  <h3 className="text-white font-semibold text-sm" style={{ fontFamily: font }}>Third-Party Sharing</h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed" style={{ fontFamily: font }}>{summary.third_party_sharing}</p>
              </div>
            )}

            {/* Retention */}
            {summary.retention_period && (
              <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FiClock size={16} style={{ color: '#00BFA6' }} />
                  <h3 className="text-white font-semibold text-sm" style={{ fontFamily: font }}>Data Retention</h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed" style={{ fontFamily: font }}>{summary.retention_period}</p>
              </div>
            )}
          </div>

          {/* Risk flags */}
          {summary.risk_flags?.length > 0 && (
            <div className="glass-card p-5 rounded-2xl" style={{ border: '1px solid rgba(229,57,53,0.3)' }}>
              <div className="flex items-center gap-2 mb-4">
                <FiAlertTriangle size={18} style={{ color: '#E53935' }} />
                <h3 className="text-white font-semibold" style={{ fontFamily: font }}>
                  Risk Flags ({summary.risk_flags.length})
                </h3>
              </div>
              <div className="space-y-3">
                {summary.risk_flags.map((flag, i) => (
                  <div key={i} className="p-4 rounded-xl"
                    style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)' }}>
                    <p className="text-red-400 text-sm font-semibold mb-1" style={{ fontFamily: font }}>⚠ {flag.clause}</p>
                    <p className="text-slate-300 text-xs leading-relaxed" style={{ fontFamily: font }}>{flag.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!summary && !loading && (
        <div className="glass-card p-12 rounded-2xl flex flex-col items-center gap-4 text-center"
          style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(108,63,197,0.1)' }}>
            <FiShield size={32} style={{ color: '#6C3FC5' }} />
          </div>
          <p className="text-white font-semibold text-lg" style={{ fontFamily: font }}>Analyse a Privacy Policy</p>
          <p className="text-slate-400 text-sm max-w-sm" style={{ fontFamily: font }}>
            Enter any company's privacy policy URL above and our AI will extract key information in plain language — no legal expertise needed.
          </p>
        </div>
      )}
    </div>
  );
}

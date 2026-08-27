import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiCheckCircle, FiShield } from 'react-icons/fi';
import { breachAPI } from '../services/api';
import { toast } from 'react-toastify';

const font = '"Times New Roman",Times,serif';
const SEV_COLORS = { Low: '#43A047', Medium: '#FFB300', High: '#FF7043', Critical: '#E53935' };

export default function BreachMonitor() {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = () => {
    setLoading(true);
    breachAPI.getAll()
      .then(r => setBreaches(r.data.data || []))
      .catch(() => toast.error('Failed to load breaches'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const r = await breachAPI.check();
      toast.info(r.data.message || 'Breach check complete');
      load();
    } catch { toast.error('Breach check failed'); }
    finally { setChecking(false); }
  };

  const handleAck = async (id) => {
    try {
      await breachAPI.acknowledge(id);
      setBreaches(bs => bs.map(b => b.id === id ? { ...b, acknowledged: true } : b));
      toast.success('Breach acknowledged');
    } catch { toast.error('Failed to acknowledge'); }
  };

  const unacked = breaches.filter(b => !b.acknowledged).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>Breach Monitor</h1>
          <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
            {unacked > 0 ? `${unacked} unacknowledged breach${unacked > 1 ? 'es' : ''}` : 'All breaches acknowledged'}
          </p>
        </div>
        <button onClick={handleCheck} disabled={checking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
          <FiRefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Checking…' : 'Check for Breaches'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Breaches', value: breaches.length, color: '#E53935', icon: FiAlertTriangle },
          { label: 'Unacknowledged', value: unacked, color: '#FFB300', icon: FiAlertTriangle },
          { label: 'Acknowledged', value: breaches.length - unacked, color: '#43A047', icon: FiCheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-card p-5 rounded-2xl flex items-center gap-4"
            style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: `${color}22` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="text-slate-400 text-xs" style={{ fontFamily: font }}>{label}</p>
              <p className="text-white text-2xl font-bold" style={{ fontFamily: font }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breach cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : breaches.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl flex flex-col items-center gap-4"
          style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(67,160,71,0.15)' }}>
            <FiShield size={32} style={{ color: '#43A047' }} />
          </div>
          <p className="text-white font-semibold text-lg" style={{ fontFamily: font }}>No breaches detected</p>
          <p className="text-slate-400 text-sm text-center" style={{ fontFamily: font }}>
            Click "Check for Breaches" to scan your email against known data breaches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {breaches.map(b => {
            let dataExposed = [];
            try { dataExposed = JSON.parse(b.dataExposed || '[]'); }
            catch { dataExposed = b.dataExposed ? [b.dataExposed] : []; }
            const sev = b.severity || 'Medium';
            return (
              <div key={b.id}
                className={`glass-card p-5 rounded-2xl transition-all ${b.acknowledged ? 'opacity-60' : ''}`}
                style={{ border: `1px solid ${b.acknowledged ? 'rgba(108,63,197,0.1)' : `${SEV_COLORS[sev]}44`}` }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${SEV_COLORS[sev]}22` }}>
                      <FiAlertTriangle size={20} style={{ color: SEV_COLORS[sev] }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-base" style={{ fontFamily: font }}>
                          {b.companyName}
                        </h3>
                        <span className="badge text-xs"
                          style={{ background: `${SEV_COLORS[sev]}22`, color: SEV_COLORS[sev], fontFamily: font }}>
                          {sev}
                        </span>
                        {b.acknowledged && (
                          <span className="badge text-xs"
                            style={{ background: 'rgba(67,160,71,0.15)', color: '#43A047', fontFamily: font }}>
                            Acknowledged
                          </span>
                        )}
                      </div>
                      {b.domain && <p className="text-slate-500 text-xs mb-2" style={{ fontFamily: font }}>{b.domain}</p>}
                      <p className="text-slate-400 text-xs mb-3" style={{ fontFamily: font }}>
                        Breach date: {b.breachDate ? new Date(b.breachDate).toLocaleDateString() : 'Unknown'} ·
                        Detected: {b.detectedAt ? new Date(b.detectedAt).toLocaleDateString() : '—'}
                      </p>
                      {dataExposed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {dataExposed.map((d, i) => (
                            <span key={i} className="badge text-xs"
                              style={{ background: 'rgba(229,57,53,0.1)', color: '#ff8a80', fontFamily: font }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {!b.acknowledged && (
                    <button onClick={() => handleAck(b.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 hover:opacity-90 transition-all"
                      style={{ background: 'rgba(67,160,71,0.15)', color: '#43A047', border: '1px solid rgba(67,160,71,0.3)', fontFamily: font }}>
                      <FiCheckCircle size={14} /> Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

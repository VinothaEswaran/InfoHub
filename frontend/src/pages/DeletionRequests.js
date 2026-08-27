import React, { useEffect, useState } from 'react';
import { FiPlus, FiDownload, FiEdit2, FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { deletionAPI, companyAPI } from '../services/api';
import { toast } from 'react-toastify';

const font = '"Times New Roman",Times,serif';
const STATUS_STYLES = {
  Draft:        { bg: 'rgba(108,63,197,0.15)', color: '#8B5CF6' },
  Sent:         { bg: 'rgba(0,191,166,0.15)',  color: '#00BFA6' },
  Acknowledged: { bg: 'rgba(255,179,0,0.15)',  color: '#FFB300' },
  Completed:    { bg: 'rgba(67,160,71,0.15)',   color: '#43A047' },
  Overdue:      { bg: 'rgba(229,57,53,0.15)',   color: '#E53935' },
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
        style={{ background: '#0d1528', border: '1px solid rgba(108,63,197,0.3)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg" style={{ fontFamily: font }}>{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const STATUSES = ['Draft', 'Sent', 'Acknowledged', 'Completed', 'Overdue'];

export default function DeletionRequests() {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genModal, setGenModal] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [form, setForm] = useState({ companyId: '', jurisdiction: 'GDPR' });
  const [newStatus, setNewStatus] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([deletionAPI.getAll(), companyAPI.getAllList()])
      .then(([r, c]) => {
        setRequests(r.data.data || []);
        setCompanies(c.data.data || []);
      }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!form.companyId) { toast.error('Select a company'); return; }
    try {
      await deletionAPI.generate({ companyId: parseInt(form.companyId), jurisdiction: form.jurisdiction });
      toast.success('Deletion letter generated!');
      setGenModal(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to generate'); }
  };

  const handleStatusUpdate = async () => {
    try {
      await deletionAPI.updateStatus(statusModal.id, newStatus);
      toast.success('Status updated');
      setStatusModal(null);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDownload = async (id) => {
    try {
      const r = await deletionAPI.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `deletion_request_${id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download PDF'); }
  };

  const counts = {
    total: requests.length,
    pending: requests.filter(r => ['Draft', 'Sent'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'Completed').length,
    overdue: requests.filter(r => r.status === 'Overdue').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>Deletion Requests</h1>
          <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
            Legally compliant deletion letters under GDPR, DPDP & CCPA
          </p>
        </div>
        <button onClick={() => setGenModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
          <FiPlus size={16} /> New Request
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: counts.total, color: '#6C3FC5', icon: FiEdit2 },
          { label: 'Pending', value: counts.pending, color: '#FFB300', icon: FiClock },
          { label: 'Completed', value: counts.completed, color: '#43A047', icon: FiCheckCircle },
          { label: 'Overdue', value: counts.overdue, color: '#E53935', icon: FiAlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-card p-5 rounded-2xl flex items-center gap-3"
            style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}22` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-slate-400 text-xs" style={{ fontFamily: font }}>{label}</p>
              <p className="text-white text-2xl font-bold" style={{ fontFamily: font }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Requests list */}
      <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(108,63,197,0.15)', background: 'rgba(108,63,197,0.05)' }}>
                {['Company', 'Jurisdiction', 'Status', 'Deadline', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-400 text-xs font-semibold uppercase tracking-wider"
                    style={{ fontFamily: font }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm" style={{ fontFamily: font }}>
                  No deletion requests yet. Click "New Request" to generate one.
                </td></tr>
              ) : requests.map((req, i) => {
                const style = STATUS_STYLES[req.status] || STATUS_STYLES.Draft;
                const daysLeft = req.deadline
                  ? Math.ceil((new Date(req.deadline) - new Date()) / 86400000)
                  : null;
                return (
                  <tr key={req.id}
                    style={{ borderBottom: '1px solid rgba(108,63,197,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-semibold text-sm" style={{ fontFamily: font }}>
                        {req.company?.name || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge text-xs"
                        style={{ background: 'rgba(108,63,197,0.15)', color: '#8B5CF6', fontFamily: font }}>
                        {req.jurisdiction}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge text-xs"
                        style={{ background: style.bg, color: style.color, fontFamily: font }}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white text-xs" style={{ fontFamily: font }}>
                          {req.deadline ? new Date(req.deadline).toLocaleDateString() : '—'}
                        </p>
                        {daysLeft !== null && req.status === 'Sent' && (
                          <p className="text-xs mt-0.5" style={{ color: daysLeft < 7 ? '#E53935' : '#94a3b8', fontFamily: font }}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs" style={{ fontFamily: font }}>
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {req.pdfPath && (
                          <button onClick={() => handleDownload(req.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10 transition-all" title="Download PDF">
                            <FiDownload size={14} />
                          </button>
                        )}
                        <button onClick={() => { setStatusModal(req); setNewStatus(req.status); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-light hover:bg-primary/10 transition-all" title="Update Status">
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate modal */}
      <Modal open={genModal} onClose={() => setGenModal(false)} title="Generate Deletion Letter">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>Select Company *</label>
            <select value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.25)', fontFamily: font }}>
              <option value="">— Select a company —</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>Jurisdiction</label>
            <select value={form.jurisdiction} onChange={e => setForm({ ...form, jurisdiction: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.25)', fontFamily: font }}>
              <option value="GDPR">GDPR — EU (30 days)</option>
              <option value="DPDP">DPDP — India (30 days)</option>
              <option value="CCPA">CCPA — California (45 days)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setGenModal(false)}
              className="flex-1 py-2.5 rounded-xl text-slate-400 border border-slate-700 hover:text-white text-sm"
              style={{ fontFamily: font }}>Cancel</button>
            <button onClick={handleGenerate}
              className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
              Generate PDF
            </button>
          </div>
        </div>
      </Modal>

      {/* Status update modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Request Status">
        <p className="text-slate-300 text-sm mb-4" style={{ fontFamily: font }}>
          Update status for: <strong className="text-white">{statusModal?.company?.name}</strong>
        </p>
        <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.25)', fontFamily: font }}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-3">
          <button onClick={() => setStatusModal(null)}
            className="flex-1 py-2.5 rounded-xl text-slate-400 border border-slate-700 hover:text-white text-sm"
            style={{ fontFamily: font }}>Cancel</button>
          <button onClick={handleStatusUpdate}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
            Update
          </button>
        </div>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { companyAPI, deletionAPI } from '../services/api';
import { toast } from 'react-toastify';

const font = '"Times New Roman",Times,serif';

const RISK_COLORS = { Low: '#43A047', Medium: '#FFB300', High: '#FF7043', Critical: '#E53935' };
const DATA_CATS = ['email', 'location', 'financial', 'health', 'browsing', 'social', 'device', 'phone', 'name'];

function RiskBadge({ level }) {
  return (
    <span className="badge" style={{
      background: `${RISK_COLORS[level] || '#6C3FC5'}22`,
      color: RISK_COLORS[level] || '#6C3FC5',
      fontFamily: font,
    }}>{level || 'Low'}</span>
  );
}

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

const emptyForm = { name: '', website: '', privacyPolicyUrl: '', dataCategories: [] };

export default function DataLedger() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [delModal, setDelModal] = useState(null);
  const [genModal, setGenModal] = useState(null);
  const [jurisdiction, setJurisdiction] = useState('GDPR');

  const load = () => {
    setLoading(true);
    companyAPI.getAll({ search, page, size, sortBy: 'addedAt' })
      .then(r => {
        setCompanies(r.data.data?.content || []);
        setTotal(r.data.data?.totalElements || 0);
      }).catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, page]);

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setModalOpen(true); };
  const openEdit = (c) => {
    setEditTarget(c);
    let cats = [];
    try { cats = JSON.parse(c.dataCategories || '[]'); } catch {}
    setForm({ name: c.name, website: c.website || '', privacyPolicyUrl: c.privacyPolicyUrl || '', dataCategories: cats });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Company name is required'); return; }
    const payload = { ...form, dataCategories: JSON.stringify(form.dataCategories) };
    try {
      if (editTarget) { await companyAPI.update(editTarget.id, payload); toast.success('Company updated'); }
      else { await companyAPI.create(payload); toast.success('Company added'); }
      setModalOpen(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving company'); }
  };

  const handleDelete = async (id) => {
    try { await companyAPI.delete(id); toast.success('Company deleted'); setDelModal(null); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleGenerate = async () => {
    try {
      await deletionAPI.generate({ companyId: genModal.id, jurisdiction });
      toast.success('Deletion letter generated!');
      setGenModal(null);
    } catch { toast.error('Failed to generate letter'); }
  };

  const toggleCat = (cat) => {
    setForm(f => ({
      ...f,
      dataCategories: f.dataCategories.includes(cat)
        ? f.dataCategories.filter(c => c !== cat)
        : [...f.dataCategories, cat],
    }));
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>My Data Ledger</h1>
          <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
            {total} compan{total === 1 ? 'y' : 'ies'} tracking your personal data
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
          <FiPlus size={16} /> Add Company
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search companies..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.2)', fontFamily: font }} />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(108,63,197,0.15)', background: 'rgba(108,63,197,0.05)' }}>
                {['Company', 'Data Categories', 'Risk Score', 'Risk Level', 'Added', 'Actions'].map(h => (
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
              ) : companies.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm" style={{ fontFamily: font }}>
                  No companies found. Click "Add Company" to get started.
                </td></tr>
              ) : companies.map((c, i) => {
                let cats = [];
                try { cats = JSON.parse(c.dataCategories || '[]'); } catch {}
                return (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid rgba(108,63,197,0.08)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white font-semibold text-sm" style={{ fontFamily: font }}>{c.name}</p>
                        {c.website && <p className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: font }}>{c.website}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cats.slice(0, 4).map(cat => (
                          <span key={cat} className="badge text-xs"
                            style={{ background: 'rgba(108,63,197,0.15)', color: '#8B5CF6', fontFamily: font }}>
                            {cat}
                          </span>
                        ))}
                        {cats.length > 4 && <span className="text-slate-500 text-xs" style={{ fontFamily: font }}>+{cats.length - 4}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white text-sm font-semibold" style={{ fontFamily: font }}>
                        {c.riskScore?.toFixed(1) ?? '0.0'}
                      </span>
                    </td>
                    <td className="px-5 py-4"><RiskBadge level={c.riskLevel} /></td>
                    <td className="px-5 py-4 text-slate-400 text-xs" style={{ fontFamily: font }}>
                      {c.addedAt ? new Date(c.addedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-light hover:bg-primary/10 transition-all" title="Edit">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => setGenModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10 transition-all" title="Generate Deletion Letter">
                          <FiFileText size={14} />
                        </button>
                        <button onClick={() => setDelModal(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid rgba(108,63,197,0.15)' }}>
            <p className="text-slate-400 text-xs" style={{ fontFamily: font }}>
              Showing {page * size + 1}–{Math.min((page + 1) * size, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all">
                <FiChevronLeft size={16} />
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Company' : 'Add Company'}>
        <div className="space-y-4">
          {[
            { label: 'Company Name *', key: 'name', placeholder: 'e.g. Google' },
            { label: 'Website', key: 'website', placeholder: 'https://...' },
            { label: 'Privacy Policy URL', key: 'privacyPolicyUrl', placeholder: 'https://...privacy' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>{label}</label>
              <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.25)', fontFamily: font }} />
            </div>
          ))}
          <div>
            <label className="block text-slate-400 text-xs mb-2" style={{ fontFamily: font }}>Data Categories</label>
            <div className="flex flex-wrap gap-2">
              {DATA_CATS.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCat(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: form.dataCategories.includes(cat) ? '#6C3FC5' : 'rgba(108,63,197,0.1)',
                    color: form.dataCategories.includes(cat) ? '#fff' : '#8B5CF6',
                    border: `1px solid ${form.dataCategories.includes(cat) ? '#6C3FC5' : 'rgba(108,63,197,0.3)'}`,
                    fontFamily: font,
                  }}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-slate-400 border border-slate-700 hover:text-white transition-all text-sm"
              style={{ fontFamily: font }}>Cancel</button>
            <button onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
              {editTarget ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!delModal} onClose={() => setDelModal(null)} title="Delete Company">
        <p className="text-slate-300 text-sm mb-6" style={{ fontFamily: font }}>
          Are you sure you want to remove this company from your ledger? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDelModal(null)}
            className="flex-1 py-2.5 rounded-xl text-slate-400 border border-slate-700 hover:text-white text-sm"
            style={{ fontFamily: font }}>Cancel</button>
          <button onClick={() => handleDelete(delModal)}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: '#E53935', fontFamily: font }}>Delete</button>
        </div>
      </Modal>

      {/* Generate letter modal */}
      <Modal open={!!genModal} onClose={() => setGenModal(null)} title="Generate Deletion Letter">
        <p className="text-slate-300 text-sm mb-4" style={{ fontFamily: font }}>
          Generate a legally compliant deletion request letter for <strong className="text-white">{genModal?.name}</strong>.
        </p>
        <label className="block text-slate-400 text-xs mb-2" style={{ fontFamily: font }}>Jurisdiction</label>
        <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(108,63,197,0.25)', fontFamily: font }}>
          <option value="GDPR">GDPR — EU (30 days)</option>
          <option value="DPDP">DPDP — India (30 days)</option>
          <option value="CCPA">CCPA — California (45 days)</option>
        </select>
        <div className="flex gap-3">
          <button onClick={() => setGenModal(null)}
            className="flex-1 py-2.5 rounded-xl text-slate-400 border border-slate-700 hover:text-white text-sm"
            style={{ fontFamily: font }}>Cancel</button>
          <button onClick={handleGenerate}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
            Generate PDF
          </button>
        </div>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FiUser, FiLock, FiBell, FiMoon, FiDownload, FiSave, FiShield } from 'react-icons/fi';
import { settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const font = '"Times New Roman",Times,serif';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="glass-card p-6 rounded-2xl" style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(108,63,197,0.2)' }}>
          <Icon size={18} style={{ color: '#8B5CF6' }} />
        </div>
        <h2 className="text-white font-semibold text-base" style={{ fontFamily: font }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid rgba(108,63,197,0.08)' }}>
      <div>
        <p className="text-white text-sm" style={{ fontFamily: font }}>{label}</p>
        {desc && <p className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: font }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
        style={{ background: value ? '#6C3FC5' : 'rgba(255,255,255,0.1)' }}>
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

const inputClass = `w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none`;
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(108,63,197,0.25)',
  fontFamily: font,
};

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(null);
  const [account, setAccount] = useState({ displayName: '', theme: 'dark' });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    settingsAPI.get()
      .then(r => {
        const d = r.data.data;
        setSettings(d);
        setAccount({ displayName: d.displayName || '', theme: d.theme || 'dark' });
      }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (key, fn) => {
    setSaving(s => ({ ...s, [key]: true }));
    try { await fn(); toast.success('Saved'); }
    catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  };

  const handleAccountSave = () => save('account', async () => {
    await settingsAPI.updateAccount(account);
    updateUser({ displayName: account.displayName });
    settingsAPI.get().then(r => setSettings(r.data.data));
  });

  const handleSecuritySave = () => {
    if (security.newPassword !== security.confirm) { toast.error('Passwords do not match'); return; }
    save('security', async () => {
      await settingsAPI.updateSecurity({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSecurity({ currentPassword: '', newPassword: '', confirm: '' });
    });
  };

  const handleNotifChange = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    settingsAPI.updateNotifications({ [key]: val }).catch(() => toast.error('Failed to update'));
  };

  const handleExport = async () => {
    try {
      const r = await settingsAPI.export();
      const blob = new Blob([JSON.stringify(r.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'infohub_data_export.json'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: font }}>Settings</h1>
        <p className="text-slate-400 text-sm mt-1" style={{ fontFamily: font }}>
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Account */}
      <Section icon={FiUser} title="Account">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>Display Name</label>
            <input value={account.displayName} onChange={e => setAccount({ ...account, displayName: e.target.value })}
              placeholder="Your name" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>Email</label>
            <input value={settings?.email || ''} disabled
              className={inputClass} style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>Theme</label>
            <select value={account.theme} onChange={e => setAccount({ ...account, theme: e.target.value })}
              className={inputClass} style={inputStyle}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <button onClick={handleAccountSave} disabled={saving.account}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
            <FiSave size={14} /> {saving.account ? 'Saving…' : 'Save Account'}
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section icon={FiLock} title="Security">
        <div className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword', placeholder: '••••••••' },
            { label: 'New Password', key: 'newPassword', placeholder: '••••••••' },
            { label: 'Confirm New Password', key: 'confirm', placeholder: '••••••••' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-slate-400 text-xs mb-1.5" style={{ fontFamily: font }}>{label}</label>
              <input type="password" value={security[key]}
                onChange={e => setSecurity({ ...security, [key]: e.target.value })}
                placeholder={placeholder} className={inputClass} style={inputStyle} />
            </div>
          ))}
          <Toggle
            label="Two-Factor Authentication"
            desc="Add an extra layer of security to your account"
            value={settings?.twoFactorEnabled || false}
            onChange={val => {
              setSettings(s => ({ ...s, twoFactorEnabled: val }));
              settingsAPI.updateSecurity({ twoFactorEnabled: String(val) }).catch(() => {});
            }}
          />
          <button onClick={handleSecuritySave} disabled={saving.security}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: font }}>
            <FiShield size={14} /> {saving.security ? 'Saving…' : 'Update Security'}
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={FiBell} title="Notification Preferences">
        <div className="space-y-0">
          <Toggle label="Email Breach Alerts"
            desc="Receive email when a new breach is detected"
            value={settings?.emailBreachAlerts ?? true}
            onChange={val => handleNotifChange('emailBreachAlerts', val)} />
          <Toggle label="Email Deadline Reminders"
            desc="Receive reminders before deletion request deadlines"
            value={settings?.emailDeadlineReminders ?? true}
            onChange={val => handleNotifChange('emailDeadlineReminders', val)} />
          <Toggle label="In-App Notifications"
            desc="Show notification badge and alerts in dashboard"
            value={settings?.inAppNotifications ?? true}
            onChange={val => handleNotifChange('inAppNotifications', val)} />
        </div>
      </Section>

      {/* Theme */}
      <Section icon={FiMoon} title="Appearance">
        <div className="grid grid-cols-3 gap-3">
          {['dark', 'light', 'system'].map(t => (
            <button key={t} onClick={() => setAccount({ ...account, theme: t })}
              className="py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all"
              style={{
                background: account.theme === t ? '#6C3FC5' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${account.theme === t ? '#6C3FC5' : 'rgba(108,63,197,0.2)'}`,
                color: account.theme === t ? '#fff' : '#94a3b8',
                fontFamily: font,
              }}>{t}</button>
          ))}
        </div>
      </Section>

      {/* Data Export */}
      <Section icon={FiDownload} title="Data & Privacy">
        <p className="text-slate-400 text-sm mb-4" style={{ fontFamily: font }}>
          Download a copy of all your InfoHub data in machine-readable JSON format (GDPR Article 20).
        </p>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ background: 'rgba(0,191,166,0.15)', border: '1px solid rgba(0,191,166,0.3)', color: '#00BFA6', fontFamily: font }}>
          <FiDownload size={14} /> Export My Data
        </button>
      </Section>
    </div>
  );
}

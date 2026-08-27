import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function NetworkCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const nodes = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 3 + 2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(108,63,197,${0.45 * (1 - d / 110)})`; ctx.lineWidth = 0.7; ctx.stroke();
        }
      }));
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,191,166,0.75)'; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
      });
      const { token, email, displayName, userId } = res.data.data;
      login({ email, displayName, userId }, token);
      toast.success('Account created! Welcome to InfoHub.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all
    placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary`;
  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    fontFamily: '"Times New Roman",Times,serif',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d1528 0%,#111827 100%)' }}>
        <NetworkCanvas />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 float"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
            <FiShield className="text-white" size={36} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Start your privacy journey
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Join thousands of people who have taken back control of their digital footprint with InfoHub.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { v: 'GDPR', label: 'Compliant' },
              { v: 'DPDP', label: 'Compliant' },
              { v: 'CCPA', label: 'Compliant' },
              { v: 'AI', label: 'Powered' },
            ].map(item => (
              <div key={item.v} className="glass-card px-4 py-3 rounded-xl text-center"
                style={{ border: '1px solid rgba(108,63,197,0.25)' }}>
                <p className="text-white font-bold text-sm"
                  style={{ fontFamily: '"Times New Roman",Times,serif' }}>{item.v}</p>
                <p className="text-slate-400 text-xs"
                  style={{ fontFamily: '"Times New Roman",Times,serif' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
              <FiShield className="text-white" size={18} />
            </div>
            <span className="text-white font-bold text-xl"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>InfoHub</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>Create account</h1>
          <p className="text-slate-400 mb-8 text-sm"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Set up your privacy dashboard in minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" name="displayName" value={form.displayName} onChange={handleChange}
                placeholder="Full name" required
                className={inputClass} style={{ ...inputStyle, paddingLeft: '2.75rem' }} />
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="Email address" required
                className={inputClass} style={{ ...inputStyle, paddingLeft: '2.75rem' }} />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                onChange={handleChange} placeholder="Password (min 6 characters)" required
                className={inputClass} style={{ ...inputStyle, paddingLeft: '2.75rem', paddingRight: '3rem' }} />
              <button type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Confirm */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type={showPwd ? 'text' : 'password'} name="confirm" value={form.confirm}
                onChange={handleChange} placeholder="Confirm password" required
                className={inputClass} style={{ ...inputStyle, paddingLeft: '2.75rem' }} />
            </div>

            <p className="text-slate-600 text-xs"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>
              By creating an account you agree to our{' '}
              <a href="#" className="text-primary-light hover:underline">Terms</a> and{' '}
              <a href="#" className="text-primary-light hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-base
                transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)',
                fontFamily: '"Times New Roman",Times,serif',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

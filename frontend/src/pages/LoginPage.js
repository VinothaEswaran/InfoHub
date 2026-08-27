import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Animated network canvas (left panel) ── */
function NetworkCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
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
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(108,63,197,${0.45 * (1 - d / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        });
      });
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,191,166,0.75)';
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'demo@infohub.app', password: 'demo1234' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, email, displayName, userId } = res.data.data;
      login({ email, displayName, userId }, token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
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
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d1528 0%,#111827 100%)' }}>
        <NetworkCanvas />
        <div className="relative z-10 text-center px-12">
          {/* Shield icon */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 float"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
            <FiShield className="text-white" size={36} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Your privacy command center
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Every company that holds your data, every risk they carry, and every legal right you can
            exercise — all in one secure dashboard.
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
              <FiShield className="text-white" size={18} />
            </div>
            <span className="text-white font-bold text-xl"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>InfoHub</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>Welcome back</h1>
          <p className="text-slate-400 mb-8 text-sm"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Sign in to continue to your dashboard.
          </p>

          {/* Google button */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-6 font-medium text-sm
              bg-white text-gray-800 hover:bg-gray-100 transition-all"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}
            onClick={() => toast.info('Google OAuth not configured in demo')}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <hr className="flex-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <span className="text-slate-500 text-xs" style={{ fontFamily: '"Times New Roman",Times,serif' }}>or continue with email</span>
            <hr className="flex-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="Email address" required
                className={inputClass} style={{ ...inputStyle, paddingLeft: '2.75rem' }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type={showPwd ? 'text' : 'password'}
                name="password" value={form.password} onChange={handleChange}
                placeholder="Password" required
                className={inputClass} style={{ ...inputStyle, paddingLeft: '2.75rem', paddingRight: '3rem' }}
              />
              <button type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-primary-light text-xs hover:underline"
                style={{ fontFamily: '"Times New Roman",Times,serif' }}>Forgot password?</a>
            </div>

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
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-light hover:underline">Sign up</Link>
          </p>
          <p className="text-center text-slate-600 text-xs mt-3"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Demo login is pre-filled — just hit Sign In.
          </p>
        </div>
      </div>
    </div>
  );
}

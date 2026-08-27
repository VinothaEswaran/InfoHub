import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiDatabase, FiAlertTriangle, FiFileText,
  FiClock, FiBarChart2, FiPlay, FiArrowRight, FiMenu, FiX
} from 'react-icons/fi';

/* ── Animated canvas network background ── */
function NetworkCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
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
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(108,63,197,${0.4 * (1 - d / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,191,166,0.7)';
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />;
}

/* ── Navbar ── */
function Navbar({ onGetStarted }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(108,63,197,0.15)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
          <FiShield className="text-white" size={18} />
        </div>
        <span className="text-white font-bold text-xl" style={{ fontFamily: '"Times New Roman",Times,serif' }}>InfoHub</span>
      </div>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {['Features', 'Impact', 'Docs'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            className="text-slate-300 hover:text-white transition-colors text-sm"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>{item}</a>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-4">
        <button onClick={() => navigate('/login')}
          className="px-5 py-2 rounded-full border border-slate-600 text-white hover:border-primary transition-all text-sm"
          style={{ fontFamily: '"Times New Roman",Times,serif' }}>Sign In</button>
      </div>
      {/* Mobile hamburger */}
      <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 p-6 flex flex-col gap-4"
          style={{ background: 'rgba(10,15,30,0.97)' }}>
          {['Features', 'Impact', 'Docs'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              className="text-slate-300 hover:text-white text-base"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>{item}</a>
          ))}
          <button onClick={() => navigate('/login')}
            className="mt-2 px-5 py-2 rounded-full border border-slate-600 text-white text-sm"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>Sign In</button>
        </div>
      )}
    </nav>
  );
}

/* ── Section 1: Hero ── */
function HeroSection({ onGetStarted }) {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center hero-bg overflow-hidden" id="hero">
      <NetworkCanvas />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-xs text-primary-light mb-8"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            GDPR · DPDP · CCPA compliant
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Take Back Control of
          </h1>
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 gradient-text"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Your Personal Data
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Monitor where your data is stored, understand privacy risks, receive AI-powered privacy insights, detect breaches, and automate legal deletion requests from one intelligent dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
              style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: '"Times New Roman",Times,serif' }}>
              Get Started <FiArrowRight />
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-7 py-3 rounded-full border border-slate-600 text-white text-base hover:border-accent transition-all"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>
              <FiPlay size={14} /> Live Demo
            </button>
            <a href="#features"
              className="text-slate-400 hover:text-white text-base transition-colors"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>Learn More</a>
          </div>
        </div>

        {/* Right — Privacy Score Card */}
        <div className="animate-slide-up flex justify-center">
          <div className="w-full max-w-sm glass-card p-6 rounded-2xl"
            style={{ border: '1px solid rgba(108,63,197,0.3)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-slate-400 text-xs mb-1" style={{ fontFamily: '"Times New Roman",Times,serif' }}>Privacy Score</p>
                <p className="text-accent text-2xl font-bold" style={{ fontFamily: '"Times New Roman",Times,serif' }}>84</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FiShield className="text-primary-light" size={20} />
              </div>
            </div>
            {/* Mini network visual */}
            <div className="rounded-xl overflow-hidden mb-5 relative h-32"
              style={{ background: 'linear-gradient(135deg,rgba(108,63,197,0.15),rgba(0,191,166,0.08))' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}
                      className="absolute w-2 h-2 rounded-full bg-accent opacity-70 float"
                      style={{
                        left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 35}px`,
                        top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 35}px`,
                        animationDelay: `${i * 0.5}s`
                      }} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiShield className="text-primary-light" size={28} />
                  </div>
                </div>
              </div>
            </div>
            {/* Company tracking list */}
            {[
              { name: 'Meta', status: 'Tracking active', color: '#E53935' },
              { name: 'Amazon', status: 'Tracking active', color: '#FFB300' },
              { name: 'Spotify', status: 'Tracking active', color: '#43A047' },
            ].map(item => (
              <div key={item.name}
                className="flex items-center justify-between py-3 border-t"
                style={{ borderColor: 'rgba(108,63,197,0.15)' }}>
                <span className="text-white text-sm font-medium" style={{ fontFamily: '"Times New Roman",Times,serif' }}>{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs" style={{ fontFamily: '"Times New Roman",Times,serif' }}>{item.status}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Section 2: Features ── */
const FEATURES = [
  { icon: FiDatabase, title: 'Personal Data Ledger', desc: 'Maintain a centralised record of every company holding your personal information.' },
  { icon: FiShield, title: 'AI Privacy Policy Summary', desc: 'AI reads long privacy policies and generates simple human-readable summaries.' },
  { icon: FiBarChart2, title: 'Privacy Risk Score', desc: 'Analyse every company based on breach history, retention policies, and transparency.' },
  { icon: FiAlertTriangle, title: 'Breach Monitoring', desc: 'Monitor public data breaches and notify users immediately.' },
  { icon: FiFileText, title: 'Deletion Request Generator', desc: 'Generate legally compliant GDPR, DPDP, and CCPA deletion request letters.' },
  { icon: FiClock, title: 'Deadline Tracker', desc: 'Automatically monitor company response deadlines and escalation timelines.' },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-8"
      style={{ background: 'linear-gradient(180deg,#0a0f1e 0%,#0d1528 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-primary-light text-sm font-semibold tracking-widest mb-3 uppercase"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>Platform Capabilities</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Everything you need to own<br />your data
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title}
              className="glass-card p-7 rounded-2xl hover:border-primary/50 transition-all cursor-default group kpi-card"
              style={{ border: '1px solid rgba(108,63,197,0.18)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: 'rgba(108,63,197,0.2)' }}>
                <Icon className="text-primary-light" size={22} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2"
                style={{ fontFamily: '"Times New Roman",Times,serif' }}>{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed"
                style={{ fontFamily: '"Times New Roman",Times,serif' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 3: Stats + CTA ── */
const STATS = [
  { value: '2,400+', label: 'Companies Tracking Your Data' },
  { value: '38%', label: 'Average Privacy Risk Reduction' },
  { value: '12,900+', label: 'Known Breaches Monitored' },
  { value: '9,300+', label: 'Deletion Requests Resolved' },
];

function StatsSection() {
  const navigate = useNavigate();
  return (
    <section id="impact" className="py-24 px-8"
      style={{ background: 'linear-gradient(180deg,#0d1528 0%,#0a0f1e 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Stats card */}
        <div className="glass-card rounded-2xl p-10 mb-12 grid grid-cols-2 lg:grid-cols-4 gap-8"
          style={{ border: '1px solid rgba(108,63,197,0.2)' }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center md:text-left">
              <p className="text-white text-4xl font-bold mb-2"
                style={{ fontFamily: '"Times New Roman",Times,serif' }}>{value}</p>
              <p className="text-slate-400 text-sm"
                style={{ fontFamily: '"Times New Roman",Times,serif' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className="glass-card rounded-2xl p-14 text-center"
          style={{ border: '1px solid rgba(108,63,197,0.2)' }}>
          <h2 className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Ready to see who has your data?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>
            Set up your privacy dashboard in minutes — no credit card, no legalese, just clarity.
          </p>
          <button onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-semibold text-lg hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#8B5CF6)', fontFamily: '"Times New Roman",Times,serif' }}>
            Get Started <FiArrowRight />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(108,63,197,0.15)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6C3FC5,#00BFA6)' }}>
            <FiShield className="text-white" size={14} />
          </div>
          <span className="text-white font-semibold text-sm"
            style={{ fontFamily: '"Times New Roman",Times,serif' }}>InfoHub</span>
        </div>
        <p className="text-slate-500 text-sm"
          style={{ fontFamily: '"Times New Roman",Times,serif' }}>
          © 2026 InfoHub. GDPR · DPDP · CCPA compliant.
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Docs'].map(l => (
            <a key={l} href="#" className="text-slate-500 hover:text-white text-sm transition-colors"
              style={{ fontFamily: '"Times New Roman",Times,serif' }}>{l}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main export ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
    </div>
  );
}

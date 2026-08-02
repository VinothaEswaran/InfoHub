import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CircleStackIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BellIcon,
  DocumentTextIcon,
  ClockIcon,
  PlayCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import AnimatedNetwork from '../components/AnimatedNetwork'

const FEATURES = [
  {
    title: 'Personal Data Ledger',
    description: 'Maintain a centralized record of every company holding your personal information.',
    icon: CircleStackIcon,
  },
  {
    title: 'AI Privacy Policy Summary',
    description: 'AI reads long privacy policies and generates simple human-readable summaries.',
    icon: CpuChipIcon,
  },
  {
    title: 'Privacy Risk Score',
    description: 'Analyze every company based on breach history, retention policies, and transparency.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Breach Monitoring',
    description: 'Monitor public data breaches and notify users immediately.',
    icon: BellIcon,
  },
  {
    title: 'Deletion Request Generator',
    description: 'Generate legally compliant GDPR, DPDP, and CCPA deletion request letters.',
    icon: DocumentTextIcon,
  },
  {
    title: 'Deadline Tracker',
    description: 'Automatically monitor company response deadlines and escalation timelines.',
    icon: ClockIcon,
  },
]

const STATS = [
  { label: 'Companies Tracking Your Data', value: '2,400+' },
  { label: 'Average Privacy Risk Reduction', value: '38%' },
  { label: 'Known Breaches Monitored', value: '12,900+' },
  { label: 'Deletion Requests Resolved', value: '9,300+' },
]

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-navy bg-grid-glow">
      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple to-cyan">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-semibold">InfoHub</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#stats" className="transition hover:text-white">Impact</a>
          <a href="#" className="transition hover:text-white">Docs</a>
        </div>
        <Link to="/login" className="btn-secondary !px-5 !py-2 text-sm">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 pb-24 pt-12 lg:flex-row lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-cyan">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
            GDPR · DPDP · CCPA compliant
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Take Back Control of{' '}
            <span className="bg-gradient-to-r from-purple-light to-cyan bg-clip-text text-transparent">
              Your Personal Data
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/60">
            Monitor where your data is stored, understand privacy risks, receive AI-powered privacy
            insights, detect breaches, and automate legal deletion requests from one intelligent dashboard.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/login" className="btn-primary">
              Get Started <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <button className="btn-secondary">
              <PlayCircleIcon className="h-5 w-5" /> Live Demo
            </button>
            <a href="#features" className="btn-ghost">
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Right side illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 aspect-square w-full max-w-md shrink-0"
        >
          <div className="glass-card relative h-full w-full overflow-hidden p-6">
            <AnimatedNetwork className="absolute inset-0 h-full w-full opacity-70" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="badge badge-low">Privacy Score 84</span>
                <ShieldCheckIcon className="h-6 w-6 text-cyan" />
              </div>
              <div className="space-y-3">
                {['Meta', 'Amazon', 'Spotify'].map((c, i) => (
                  <motion.div
                    key={c}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-navy/60 px-4 py-3 backdrop-blur"
                  >
                    <span className="text-sm font-medium">{c}</span>
                    <span className="text-xs text-white/40">Tracking active</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-xl">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan">Platform capabilities</p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Everything you need to own your data
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card group p-6 transition hover:border-purple/40"
            >
              <div className="mb-4 inline-flex rounded-xl bg-purple/15 p-3 text-purple-light transition group-hover:bg-purple/25">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="glass-card grid grid-cols-2 gap-8 p-10 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <p className="font-display text-3xl font-semibold text-white sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="glass-card flex flex-col items-center gap-6 p-12 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to see who has your data?</h2>
          <p className="max-w-lg text-white/55">
            Set up your privacy dashboard in minutes — no credit card, no legalese, just clarity.
          </p>
          <Link to="/login" className="btn-primary">
            Get Started <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} InfoHub. Built for privacy-first individuals.
      </footer>
    </div>
  )
}

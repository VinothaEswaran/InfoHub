import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import AnimatedNetwork from '../components/AnimatedNetwork'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('demo@infohub.app')
  const [password, setPassword] = useState('DemoPass123!')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, fullName, password)
      }
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Left: illustration */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy lg:flex">
        <AnimatedNetwork className="absolute inset-0 h-full w-full opacity-60" nodeCount={34} />
        <div className="relative z-10 max-w-md px-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple to-cyan shadow-glow">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Your privacy command center</h2>
          <p className="mt-3 text-white/50">
            Every company that holds your data, every risk they carry, and every legal right you can
            exercise — all in one secure dashboard.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === 'login' ? 'Sign in to continue to your dashboard.' : 'Create your InfoHub account.'}
          </p>

          <a
            href={authApi.googleLoginUrl()}
            className="btn-secondary mt-6 w-full !bg-white !text-navy hover:!bg-white/90"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z" />
              <path fill="#FBBC05" d="M5.84 13.09A6.6 6.6 0 015.5 11c0-.73.13-1.43.34-2.09V6.06H2.18A11 11 0 001 11c0 1.77.42 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.06l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" />
            </svg>
            Sign in with Google
          </a>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30">or continue with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                />
              </div>
            )}
            <div className="relative">
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-medium text-cyan hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="mt-3 text-center text-xs text-white/25">
            Demo login is pre-filled — just hit Sign in (run <code>python seed.py</code> first).
          </p>
        </motion.div>
      </div>
    </div>
  )
}

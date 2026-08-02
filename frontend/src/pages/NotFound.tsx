import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy bg-grid-glow text-center">
      <p className="font-display text-6xl font-semibold text-purple-light">404</p>
      <p className="text-white/50">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  )
}

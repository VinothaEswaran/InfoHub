import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ComponentType, SVGProps } from 'react'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent?: 'purple' | 'cyan'
  decimals?: number
}

function useCountUp(target: number, decimals = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let frame: number
    const duration = 900
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value.toFixed(decimals)
}

export default function StatCard({ label, value, suffix = '', icon: Icon, accent = 'purple', decimals = 0 }: StatCardProps) {
  const displayValue = useCountUp(value, decimals)

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-card relative overflow-hidden p-5"
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${
          accent === 'purple' ? 'bg-purple/30' : 'bg-cyan/25'
        }`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-white">
            {displayValue}
            {suffix}
          </p>
        </div>
        <div
          className={`rounded-xl p-2 ${accent === 'purple' ? 'bg-purple/15 text-purple-light' : 'bg-cyan/15 text-cyan'}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}

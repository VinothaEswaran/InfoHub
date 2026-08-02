import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Node {
  x: number
  y: number
  r: number
  delay: number
}

function generateNodes(count: number, seed: number): Node[] {
  const nodes: Node[] = []
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = 0; i < count; i++) {
    nodes.push({ x: rand() * 100, y: rand() * 100, r: 1.5 + rand() * 2.5, delay: rand() * 4 })
  }
  return nodes
}

function distance(a: Node, b: Node) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export default function AnimatedNetwork({ nodeCount = 26, className = '' }: { nodeCount?: number; className?: string }) {
  const nodes = useMemo(() => generateNodes(nodeCount, 42), [nodeCount])

  const edges = useMemo(() => {
    const result: { a: Node; b: Node }[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (distance(nodes[i], nodes[j]) < 24) {
          result.push({ a: nodes[i], b: nodes[j] })
        }
      }
    }
    return result
  }, [nodes])

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="edge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5B3DF5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          stroke="url(#edge-gradient)"
          strokeWidth={0.15}
        />
      ))}

      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r * 0.3}
          fill={i % 3 === 0 ? '#00D9FF' : '#5B3DF5'}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: n.delay, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

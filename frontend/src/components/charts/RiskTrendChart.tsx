import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Point {
  month: string
  avg_risk: number
}

export default function RiskTrendChart({ data }: { data: Point[] }) {
  if (!data?.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-white/30">Not enough history yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ background: '#0E1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
          labelStyle={{ color: 'white' }}
        />
        <Line type="monotone" dataKey="avg_risk" stroke="#00D9FF" strokeWidth={2.5} dot={{ r: 3, fill: '#00D9FF' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

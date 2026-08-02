import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface Row {
  month: string
  sent?: number
  awaiting?: number
  resolved?: number
  escalated?: number
}

export default function DeletionTimelineChart({ data }: { data: Row[] }) {
  if (!data?.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-white/30">No deletion requests yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: '#0E1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />
        <Bar dataKey="resolved" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
        <Bar dataKey="awaiting" stackId="a" fill="#fbbf24" />
        <Bar dataKey="sent" stackId="a" fill="#00D9FF" />
        <Bar dataKey="escalated" stackId="a" fill="#fb7185" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

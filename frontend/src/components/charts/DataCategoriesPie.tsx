import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Slice {
  category: string
  count: number
}

const COLORS = ['#5B3DF5', '#00D9FF', '#7C63F8', '#5EE9FF', '#34d399', '#fbbf24', '#fb7185']

export default function DataCategoriesPie({ data }: { data: Slice[] }) {
  if (!data?.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-white/30">No categories tracked yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#0E1F3A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

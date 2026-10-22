import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Dataset, DateRange } from '../../types'
import { categoryData, chartData, sourceData } from '../../utilities/analytics'
import { money, number } from '../../utilities/format'
import { EmptyState } from '../../shared/States'
import { ArrowUpRight, CircleHelp } from 'lucide-react'
const palette = ['#6b5ce7', '#9990f1', '#bcb5f7', '#d5d0fb', '#ebe8fd']
const tooltipStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text)',
  fontSize: 12,
  boxShadow: '0 8px 30px #00000010',
}
export function RevenueChart({
  data,
  range,
  mode = 'revenue',
}: {
  data: Dataset
  range: DateRange
  mode?: 'revenue' | 'orders' | 'customers'
}) {
  const rows = chartData(data, range)
  const isRevenue = mode === 'revenue'
  const total = rows.reduce((sum, row) => sum + row[mode], 0)
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label={`${mode} by date. ${rows.length} days. Total ${isRevenue ? money(total * 100) : number(total)}.`}
    >
      {!total ? (
        <EmptyState
          title={`No ${mode} in this period`}
          description="Choose another date range to explore your data."
        />
      ) : (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={rows} margin={{ top: 15, right: 10, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${mode}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7262ec" stopOpacity={0.23} />
                <stop offset="100%" stopColor="#7262ec" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={45}
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              dy={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              tickFormatter={(value) =>
                isRevenue ? `$${value >= 1000 ? `${value / 1000}k` : value}` : String(value)
              }
              dx={-2}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                isRevenue ? money(Number(value) * 100, true) : value,
                name === 'previous' ? 'Previous period' : 'Current period',
              ]}
              labelStyle={{ color: 'var(--muted)', marginBottom: 6 }}
            />
            {isRevenue && (
              <Area
                type="monotone"
                dataKey="previous"
                stroke="#c8c3e9"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
              />
            )}
            <Area
              type="monotone"
              dataKey={mode}
              stroke="#7966ed"
              strokeWidth={2.5}
              fill={`url(#fill-${mode})`}
              activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
export function OrdersChart({ data, range }: { data: Dataset; range: DateRange }) {
  const rows = chartData(data, range)
  return (
    <div className="chart-wrap" role="img" aria-label="Daily non-cancelled order count">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={rows} margin={{ top: 15, right: 10, left: -26, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={45}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            dy={10}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--surface-alt)' }} />
          <Bar
            name="Orders"
            dataKey="orders"
            fill="#8b7aef"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
export function CategoryChart({ data, range }: { data: Dataset; range: DateRange }) {
  const rows = categoryData(data, range)
  const total = rows.reduce((sum, item) => sum + item.value, 0)
  return (
    <section className="panel category-panel">
      <div className="panel-heading">
        <div>
          <h2>Sales by category</h2>
          <p>Where your revenue comes from</p>
        </div>
        <span className="muted" title="Revenue from completed and processing orders">
          <CircleHelp size={16} />
        </span>
      </div>
      {!total ? (
        <EmptyState title="No category sales" />
      ) : (
        <>
          <div
            className="donut-container"
            role="img"
            aria-label={rows.map((row) => `${row.name}: ${money(row.value)}`).join(', ')}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="72%"
                  outerRadius="95%"
                  paddingAngle={4}
                  cornerRadius={4}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {rows.map((row, i) => (
                    <Cell key={row.name} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => money(Number(value), true)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span>Total sales</span>
              <strong>{money(total, true)}</strong>
            </div>
          </div>
          <div className="category-legend">
            {rows.map((row, i) => (
              <div key={row.name}>
                <span>
                  <i style={{ background: palette[i % palette.length] }} />
                  {row.name}
                </span>
                <strong>
                  {((row.value / total) * 100).toFixed(1)}
                  <span className="muted">%</span>
                </strong>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
export function SourcesChart({ data, range }: { data: Dataset; range: DateRange }) {
  const rows = sourceData(data, range)
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  return (
    <section className="panel sources-panel">
      <div className="panel-heading">
        <div>
          <h2>Customer sources</h2>
          <p>New customers by acquisition channel</p>
        </div>
        <ArrowUpRight size={17} className="muted" />
      </div>
      {!total ? (
        <EmptyState title="No new customers" />
      ) : (
        <>
          <div className="source-total">
            <strong>{total}</strong>
            <span>new customers</span>
          </div>
          <div className="source-stacked">
            {rows.map((row, i) => (
              <span
                key={row.name}
                style={{
                  width: `${(row.value / total) * 100}%`,
                  background: palette[i % palette.length],
                }}
                title={`${row.name}: ${row.value}`}
              />
            ))}
          </div>
          <div className="source-list">
            {rows.map((row, i) => (
              <div key={row.name}>
                <span>
                  <i style={{ background: palette[i % palette.length] }} />
                  {row.name}
                </span>
                <span>
                  <strong>{row.value}</strong>
                  <small>{Math.round((row.value / total) * 100)}%</small>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

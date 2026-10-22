import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  ShoppingBag,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { calculateKpis, chartData } from '../../utilities/analytics'
import { money, number } from '../../utilities/format'
import type { Dataset, DateRange } from '../../types'
import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
export function KpiCards({ data, range }: { data: Dataset; range: DateRange }) {
  const kpi = calculateKpis(data, range)
  const days = differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1
  const previous = calculateKpis(data, {
    from: format(subDays(parseISO(range.from), days), 'yyyy-MM-dd'),
    to: format(subDays(parseISO(range.from), 1), 'yyyy-MM-dd'),
  })
  const chart = chartData(data, range)
  const cards: {
    label: string
    value: string
    icon: LucideIcon
    current: number
    previous: number
    trend: number[]
  }[] = [
    {
      label: 'Total revenue',
      value: money(kpi.revenue),
      icon: CircleDollarSign,
      current: kpi.revenue,
      previous: previous.revenue,
      trend: chart.map((r) => r.revenue),
    },
    {
      label: 'Total orders',
      value: number(kpi.totalOrders),
      icon: ShoppingBag,
      current: kpi.totalOrders,
      previous: previous.totalOrders,
      trend: chart.map((r) => r.orders),
    },
    {
      label: 'Average order value',
      value: money(kpi.aov),
      icon: Wallet,
      current: kpi.aov,
      previous: previous.aov,
      trend: chart.map((r) => (r.orders ? r.revenue / r.orders : 0)),
    },
    {
      label: 'New customers',
      value: number(kpi.newCustomers),
      icon: Users,
      current: kpi.newCustomers,
      previous: previous.newCustomers,
      trend: chart.map((r) => r.customers),
    },
  ]
  return (
    <div className="kpi-grid">
      {cards.map((card, i) => {
        const change = card.previous ? ((card.current - card.previous) / card.previous) * 100 : null
        const up = (change ?? 0) >= 0
        const Icon = card.icon
        return (
          <section className="kpi-card" key={card.label}>
            <div className="kpi-label">
              <span>{card.label}</span>
              <span className={`kpi-icon tone-${i}`}>
                <Icon size={17} />
              </span>
            </div>
            <strong className="kpi-value">{card.value}</strong>
            <div className="kpi-bottom">
              <div>
                <span className={`trend ${up ? 'positive' : 'negative'}`}>
                  {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{' '}
                  {change === null ? '—' : `${Math.abs(change).toFixed(1)}%`}
                </span>
                <span className="comparison">vs. previous period</span>
              </div>
              <div className={`sparkline spark-${i}`} aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={card.trend.map((value) => ({ value }))}>
                    <defs>
                      <linearGradient id={`spark${i}`} x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={i === 1 ? '#688ee6' : '#9d87eb'}
                          stopOpacity={0.2}
                        />
                        <stop offset="100%" stopColor="#9d87eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="value"
                      type="monotone"
                      stroke={i === 1 ? '#7a9de8' : '#9b87e9'}
                      strokeWidth={1.6}
                      fill={`url(#spark${i})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

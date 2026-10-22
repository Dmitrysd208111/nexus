import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Download,
  Info,
  Plus,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { WorkspaceGate } from '../shared/WorkspaceGate'
import { PageHeading } from '../shared/PageHeading'
import { DateFilter } from '../shared/DateFilter'
import { KpiCards } from '../features/analytics/KpiCards'
import { CategoryChart, RevenueChart, SourcesChart } from '../features/analytics/Charts'
import { useDateFilter } from '../features/analytics/filterStore'
import { calculateKpis, withinRange, orderTotal } from '../utilities/analytics'
import { money } from '../utilities/format'
import { downloadCsv } from '../utilities/csv'
import { exportOrders } from '../features/records/export'
import { EntityEditor } from '../features/records/EntityForms'
import { RecordDetails } from '../features/records/RecordDetails'
import { Badge } from '../shared/Badge'
import { Avatar } from '../shared/Avatar'
import { EmptyState } from '../shared/States'
import type { Dataset, Order } from '../types'
function Overview({ data }: { data: Dataset }) {
  const { range } = useDateFilter()
  const [create, setCreate] = useState(false)
  const [details, setDetails] = useState<Order | null>(null)
  const [editing, setEditing] = useState<Order | null>(null)
  const kpi = calculateKpis(data, range)
  const orders = data.orders
    .filter((o) => withinRange(o.date, range))
    .sort((a, b) => b.date.localeCompare(a.date))
  return (
    <>
      <PageHeading
        title="Overview"
        description="A clear view of what’s moving your business forward."
        eyebrow="LET’S MAKE TODAY COUNT"
      >
        <button
          className="button secondary"
          onClick={() =>
            downloadCsv(`nexus-orders-${range.from}-${range.to}.csv`, exportOrders(orders, data), [
              'order_id',
              'customer',
              'email',
              'date',
              'status',
              'total_usd',
              'items',
              'notes',
            ])
          }
        >
          <Download size={16} />
          Export report
        </button>
        <button className="button primary" onClick={() => setCreate(true)}>
          <Plus size={17} />
          Create order
        </button>
      </PageHeading>
      <div className="overview-filter-row">
        <div className="live-label">
          <span className="status-dot" />
          <span>Business performance</span>
          <span className="subtle-pill">Live demo</span>
        </div>
        <DateFilter />
      </div>
      <KpiCards data={data} range={range} />
      <div className="dashboard-chart-grid">
        <section className="panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>
                Revenue overview
                <span
                  className="info-icon"
                  title="Completed + processing orders, compared with the preceding period."
                >
                  <Info size={14} />
                </span>
              </h2>
              <p>Your revenue performance over time</p>
            </div>
            <Link className="icon-button" aria-label="Explore revenue analytics" to="/analytics">
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="revenue-summary">
            <strong>{money(kpi.revenue)}</strong>
            <span
              className={`trend ${kpi.growth === null || kpi.growth >= 0 ? 'positive' : 'negative'}`}
            >
              {kpi.growth !== null && kpi.growth < 0 ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}{' '}
              {kpi.growth === null ? 'No prior revenue' : `${Math.abs(kpi.growth).toFixed(1)}%`}
            </span>
            <div className="chart-legend">
              <span>
                <i />
                Current period
              </span>
              <span>
                <i />
                Previous period
              </span>
            </div>
          </div>
          <RevenueChart data={data} range={range} />
          <div className="chart-footer">
            <span>Recognized revenue · USD</span>
            <Link to="/analytics">
              View analytics
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
        <CategoryChart data={data} range={range} />
      </div>
      <div className="performance-strip">
        <div>
          <span className="pulse-icon">
            <TrendingUp size={18} />
          </span>
          <div>
            <span>Revenue growth</span>
            <strong>
              {kpi.growth === null ? '—' : `${kpi.growth >= 0 ? '+' : ''}${kpi.growth.toFixed(1)}%`}
            </strong>
          </div>
          <p>Compared with the previous equal-length period</p>
        </div>
        <div>
          <span className="pulse-icon blue">
            <Zap size={18} />
          </span>
          <div>
            <span>Conversion rate</span>
            <strong>{kpi.conversion === null ? '—' : `${kpi.conversion.toFixed(2)}%`}</strong>
          </div>
          <p>{kpi.sessions.toLocaleString()} demo sessions in this period</p>
        </div>
      </div>
      <div className="dashboard-bottom-grid">
        <section className="panel recent-orders">
          <div className="panel-heading">
            <div className="heading-with-count">
              <h2>Recent orders</h2>
              <span className="count-pill">{orders.length}</span>
            </div>
            <Link to="/orders" className="button secondary small-button">
              View all orders
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="align-right">Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => {
                  const customer = data.customers.find((c) => c.id === order.customerId)
                  return (
                    <tr key={order.id}>
                      <td>
                        <button className="record-link" onClick={() => setDetails(order)}>
                          #{order.id.replace('NX-', '')}
                        </button>
                      </td>
                      <td>
                        <button
                          className="customer-cell cell-button"
                          onClick={() => setDetails(order)}
                        >
                          <Avatar name={customer?.name ?? 'Unknown'} size="small" />
                          <span>
                            <strong>{customer?.name}</strong>
                            <span>{customer?.company}</span>
                          </span>
                        </button>
                      </td>
                      <td>
                        <Badge value={order.status} />
                      </td>
                      <td className="align-right amount-cell">{money(orderTotal(order))}</td>
                      <td className="muted nowrap">{format(parseISO(order.date), 'MMM d')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!orders.length && <EmptyState title="No orders in this period" />}
          <div className="recent-footer">
            <span className="status-dot" />
            Saved locally. Always up to date.
          </div>
        </section>
        <SourcesChart data={data} range={range} />
      </div>
      <div className="workspace-footer">
        <span>
          NEXUS Intelligence<span className="footer-divider">/</span>A little clarity. A lot of
          possibility.
        </span>
        <span>
          <span className="status-dot" />
          Workspace operational
        </span>
      </div>
      {(create || editing) && (
        <EntityEditor
          type="orders"
          record={editing ?? undefined}
          data={data}
          onClose={() => {
            setCreate(false)
            setEditing(null)
          }}
        />
      )}{' '}
      {details && (
        <RecordDetails
          type="orders"
          record={details}
          data={data}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setEditing(details)
            setDetails(null)
          }}
        />
      )}
    </>
  )
}
export default function OverviewPage() {
  return <WorkspaceGate>{(data) => <Overview data={data} />}</WorkspaceGate>
}

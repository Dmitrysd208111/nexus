import { Download, Info } from 'lucide-react'
import { WorkspaceGate } from '../shared/WorkspaceGate'
import { PageHeading } from '../shared/PageHeading'
import { DateFilter } from '../shared/DateFilter'
import { KpiCards } from '../features/analytics/KpiCards'
import {
  CategoryChart,
  OrdersChart,
  RevenueChart,
  SourcesChart,
} from '../features/analytics/Charts'
import { useDateFilter } from '../features/analytics/filterStore'
import { calculateKpis, chartData } from '../utilities/analytics'
import { downloadCsv } from '../utilities/csv'
import type { Dataset } from '../types'
function Analytics({ data }: { data: Dataset }) {
  const { range } = useDateFilter()
  const kpi = calculateKpis(data, range)
  return (
    <>
      <PageHeading
        title="Analytics"
        eyebrow="FROM DATA TO DIRECTION"
        description="Go deeper into the numbers behind your business."
      >
        <button
          className="button secondary"
          onClick={() =>
            downloadCsv('nexus-daily-analytics.csv', chartData(data, range), [
              'date',
              'label',
              'revenue',
              'previous',
              'orders',
              'customers',
            ])
          }
        >
          <Download size={16} />
          Export daily data
        </button>
      </PageHeading>
      <div className="overview-filter-row">
        <span className="section-label">Performance explorer</span>
        <DateFilter />
      </div>
      <KpiCards data={data} range={range} />
      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue over time</h2>
              <p>Current period and previous period · USD</p>
            </div>
          </div>
          <RevenueChart data={data} range={range} />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Order volume</h2>
              <p>Non-cancelled orders placed each day</p>
            </div>
          </div>
          <OrdersChart data={data} range={range} />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>New customer growth</h2>
              <p>Customers by the date they joined your workspace</p>
            </div>
          </div>
          <RevenueChart data={data} range={range} mode="customers" />
        </section>
        <SourcesChart data={data} range={range} />
        <CategoryChart data={data} range={range} />
        <section className="panel metric-definitions">
          <div className="panel-heading">
            <div>
              <h2>The numbers, explained</h2>
              <p>One consistent source of truth</p>
            </div>
            <Info size={18} />
          </div>
          <dl>
            <div>
              <dt>Revenue growth</dt>
              <dd>{kpi.growth === null ? 'Not available' : `${kpi.growth.toFixed(2)}%`}</dd>
              <p>
                Revenue change against the previous equal-length period. No prior revenue means no
                percentage baseline.
              </p>
            </div>
            <div>
              <dt>Conversion rate</dt>
              <dd>{kpi.conversion === null ? 'Not available' : `${kpi.conversion.toFixed(2)}%`}</dd>
              <p>
                Non-cancelled orders ÷ {kpi.sessions.toLocaleString()} seeded demo sessions. No
                sessions means no conversion baseline.
              </p>
            </div>
            <div>
              <dt>Average order value</dt>
              <dd>{kpi.recognizedOrders} revenue orders</dd>
              <p>
                Completed + processing revenue ÷ number of completed + processing orders. Pending
                and cancelled orders contribute no revenue.
              </p>
            </div>
          </dl>
        </section>
      </div>
    </>
  )
}
export default function AnalyticsPage() {
  return <WorkspaceGate>{(data) => <Analytics data={data} />}</WorkspaceGate>
}

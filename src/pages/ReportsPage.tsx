import { useState } from 'react'
import { BarChart3, Check, Download, FileSpreadsheet, FileText, Users } from 'lucide-react'
import { WorkspaceGate } from '../shared/WorkspaceGate'
import { PageHeading } from '../shared/PageHeading'
import { DateFilter } from '../shared/DateFilter'
import { useDateFilter } from '../features/analytics/filterStore'
import { calculateKpis, categoryData, chartData, withinRange } from '../utilities/analytics'
import { downloadCsv } from '../utilities/csv'
import { exportCustomers, exportOrders, exportProducts } from '../features/records/export'
import type { Dataset } from '../types'
import { useToast } from '../shared/Toast'
function Reports({ data }: { data: Dataset }) {
  const { range } = useDateFilter()
  const [exported, setExported] = useState<string[]>([])
  const toast = useToast()
  const kpi = calculateKpis(data, range)
  const reports = [
    {
      id: 'summary',
      title: 'Business summary',
      description: 'All six KPIs with their revenue and session baselines.',
      icon: BarChart3,
      count: '1 summary',
      rows: [
        {
          from: range.from,
          to: range.to,
          revenue_usd: (kpi.revenue / 100).toFixed(2),
          orders: kpi.totalOrders,
          average_order_value_usd: (kpi.aov / 100).toFixed(2),
          new_customers: kpi.newCustomers,
          revenue_growth_percent: kpi.growth?.toFixed(2) ?? '',
          conversion_percent: kpi.conversion?.toFixed(2) ?? '',
          sessions: kpi.sessions,
        },
      ],
    },
    {
      id: 'orders',
      title: 'Order transactions',
      description: 'Every order, customer and line item in your selected period.',
      icon: FileSpreadsheet,
      count: `${data.orders.filter((o) => withinRange(o.date, range)).length} orders`,
      rows: exportOrders(
        data.orders.filter((o) => withinRange(o.date, range)),
        data,
      ),
    },
    {
      id: 'customers',
      title: 'New customers',
      description: 'Customer details and acquisition sources for this period.',
      icon: Users,
      count: `${data.customers.filter((c) => withinRange(c.createdAt, range)).length} customers`,
      rows: exportCustomers(data.customers.filter((c) => withinRange(c.createdAt, range))),
    },
    {
      id: 'daily',
      title: 'Daily performance',
      description: 'Revenue, order volume and new customers by day.',
      icon: BarChart3,
      count: `${chartData(data, range).length} days`,
      rows: chartData(data, range),
    },
    {
      id: 'categories',
      title: 'Category sales',
      description: 'Recognized revenue broken down by product category.',
      icon: FileText,
      count: `${categoryData(data, range).length} categories`,
      rows: categoryData(data, range).map((r) => ({
        category: r.name,
        revenue_usd: (r.value / 100).toFixed(2),
      })),
    },
    {
      id: 'products',
      title: 'Product catalog',
      description: 'The complete current catalog, prices and stock. All dates.',
      icon: FileSpreadsheet,
      count: `${data.products.length} products`,
      rows: exportProducts(data.products),
    },
  ]
  return (
    <>
      <PageHeading
        title="Reports"
        eyebrow="TAKE YOUR INSIGHTS FURTHER"
        description="Useful reports. Clean exports. Ready when you are."
      />
      <div className="overview-filter-row">
        <span className="section-label">Choose a report to download</span>
        <DateFilter />
      </div>
      <div className="report-grid">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <section className="panel report-card" key={report.id}>
              <div className="report-card-top">
                <span className="report-icon">
                  <Icon size={23} />
                </span>
                <span className="subtle-pill">CSV</span>
              </div>
              <h2>{report.title}</h2>
              <p>{report.description}</p>
              <div className="report-card-bottom">
                <span>{report.count}</span>
                <button
                  className="button secondary"
                  onClick={() => {
                    downloadCsv(
                      `nexus-${report.id}-${range.from}-${range.to}.csv`,
                      report.rows,
                      report.rows.length
                        ? undefined
                        : report.id === 'orders'
                          ? ['order_id', 'customer', 'date', 'status', 'total_usd']
                          : report.id === 'customers'
                            ? ['customer_id', 'name', 'email', 'source', 'joined']
                            : ['category', 'revenue_usd'],
                    )
                    setExported((current) => [...current, report.id])
                    toast(`${report.title} exported`)
                  }}
                >
                  {exported.includes(report.id) ? <Check size={15} /> : <Download size={15} />}
                  Download
                </button>
              </div>
            </section>
          )
        })}
      </div>
      <div className="info-banner">
        <FileText size={20} />
        <p>
          Exports reflect your current local workspace. Amounts are in USD, dates use ISO format,
          and CSV values are escaped for spreadsheet applications.
        </p>
      </div>
    </>
  )
}
export default function ReportsPage() {
  return <WorkspaceGate>{(data) => <Reports data={data} />}</WorkspaceGate>
}

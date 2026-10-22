import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Box, CircleAlert, Filter, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { WorkspaceGate } from '../shared/WorkspaceGate'
import { PageHeading } from '../shared/PageHeading'
import { DataTable } from '../shared/DataTable'
import { Badge } from '../shared/Badge'
import { Avatar } from '../shared/Avatar'
import { Modal } from '../shared/Modal'
import { useToast } from '../shared/Toast'
import { EntityEditor } from '../features/records/EntityForms'
import { RecordDetails } from '../features/records/RecordDetails'
import { exportCustomers, exportOrders, exportProducts } from '../features/records/export'
import type { Customer, Dataset, EntityMap, EntityType, Order, Product } from '../types'
import { categories, orderStatuses, sources } from '../types'
import { api } from '../services/api'
import { workspaceKey } from '../hooks/useWorkspace'
import { earnsRevenue, orderTotal, withinRange } from '../utilities/analytics'
import { money } from '../utilities/format'
import { downloadCsv } from '../utilities/csv'
import { presetRange } from '../features/analytics/filterStore'
type Row = {
  id: string
  title: string
  subtitle: string
  detail: string
  status: string
  amount: number
  date: string
  record: EntityMap[EntityType]
}
function Records({ type, data }: { type: EntityType; data: Dataset }) {
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('All')
  const [period, setPeriod] = useState('all')
  const [customRange, setCustomRange] = useState(presetRange(30))
  const [editor, setEditor] = useState<{ record?: EntityMap[EntityType] } | null>(null)
  const [details, setDetails] = useState<EntityMap[EntityType] | null>(null)
  const [deleting, setDeleting] = useState<EntityMap[EntityType] | null>(null)
  const client = useQueryClient()
  const toast = useToast()
  const remove = useMutation({
    mutationFn: (id: string) => api.remove(type, id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workspaceKey })
      setDeleting(null)
      toast('Record deleted successfully')
    },
  })
  const label = { orders: 'order', customers: 'customer', products: 'product' }[type]
  const title = { orders: 'Orders', customers: 'Customers', products: 'Products' }[type]
  const descriptions = {
    orders: 'Keep every order moving, from first purchase to fulfillment.',
    customers: 'Your customer relationships, all in one place.',
    products: 'Manage your catalog and keep your next bestseller in stock.',
  }
  const customerFilter = params.get('customer')
  const productFilter = params.get('product')
  const recordFilter = params.get('record')
  const rows = useMemo<Row[]>(() => {
    if (type === 'orders')
      return data.orders
        .filter(
          (o) =>
            (filter === 'All' || o.status === filter) &&
            (!customerFilter || o.customerId === customerFilter) &&
            (!productFilter || o.items.some((i) => i.productId === productFilter)) &&
            (!recordFilter || o.id === recordFilter) &&
            (period === 'all' ||
              withinRange(o.date, period === 'custom' ? customRange : presetRange(Number(period)))),
        )
        .map((o) => {
          const customer = data.customers.find((c) => c.id === o.customerId)
          return {
            id: o.id,
            title: customer?.name ?? 'Unknown customer',
            subtitle: customer?.email ?? '',
            detail: o.id,
            status: o.status,
            amount: orderTotal(o),
            date: o.date,
            record: o,
          }
        })
    if (type === 'customers')
      return data.customers
        .filter(
          (c) =>
            (filter === 'All' || c.source === filter) && (!recordFilter || c.id === recordFilter),
        )
        .map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.email,
          detail: c.company,
          status: c.source,
          amount: data.orders
            .filter((o) => o.customerId === c.id && earnsRevenue(o))
            .reduce((sum, o) => sum + orderTotal(o), 0),
          date: c.createdAt,
          record: c,
        }))
    return data.products
      .filter(
        (p) =>
          (filter === 'All' ||
            p.category === filter ||
            (filter === 'Low stock' && p.stock < 10) ||
            p.status === filter) &&
          (!recordFilter || p.id === recordFilter),
      )
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.sku,
        detail: p.category,
        status: p.status,
        amount: p.price,
        date: p.createdAt,
        record: p,
      }))
  }, [data, type, filter, period, customRange, customerFilter, productFilter, recordFilter])
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      ...(type === 'orders'
        ? [
            {
              accessorKey: 'id',
              header: 'Order ID',
              cell: ({ row }: { row: { original: Row } }) => (
                <button className="record-link" onClick={() => setDetails(row.original.record)}>
                  #{row.original.id.replace('NX-', '')}
                </button>
              ),
            },
          ]
        : []),
      {
        accessorKey: 'title',
        header:
          type === 'orders' ? 'Customer' : type === 'customers' ? 'Customer name' : 'Product name',
        accessorFn: (row) => `${row.title} ${row.subtitle}`,
        cell: ({ row }) => (
          <button
            className="customer-cell cell-button"
            onClick={() => setDetails(row.original.record)}
          >
            {type === 'products' ? (
              <span className="product-icon">
                <Box size={19} />
              </span>
            ) : (
              <Avatar name={row.original.title} />
            )}
            <span>
              <strong>{row.original.title}</strong>
              <span>{row.original.subtitle}</span>
            </span>
          </button>
        ),
      },
      {
        accessorKey: 'status',
        header: type === 'customers' ? 'Source' : 'Status',
        cell: ({ row }) =>
          type === 'customers' ? (
            <span className="source-pill">{row.original.status}</span>
          ) : (
            <Badge value={row.original.status} />
          ),
      },
      ...(type !== 'orders'
        ? [{ accessorKey: 'detail', header: type === 'products' ? 'Category' : 'Company' }]
        : []),
      {
        accessorKey: 'amount',
        header:
          type === 'products' ? 'Price' : type === 'customers' ? 'Lifetime revenue' : 'Amount',
        cell: ({ getValue }) => <span className="amount-cell">{money(getValue<number>())}</span>,
      },
      type === 'products'
        ? {
            id: 'stock',
            accessorFn: (row) => (row.record as Product).stock,
            header: 'Stock',
            cell: ({ getValue }) => (
              <span className={getValue<number>() < 10 ? 'stock-low' : 'muted'}>
                {getValue<number>()} in stock
              </span>
            ),
          }
        : {
            accessorKey: 'date',
            header: type === 'orders' ? 'Date' : 'Joined',
            cell: ({ getValue }) => (
              <span className="muted nowrap">
                {format(parseISO(getValue<string>()), 'MMM d, yyyy')}
              </span>
            ),
          },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="row-actions">
            <button
              className="icon-button"
              aria-label={`Edit ${row.original.id}`}
              onClick={() => setEditor({ record: row.original.record })}
            >
              <Pencil size={15} />
            </button>
            <button
              className="icon-button danger-hover"
              aria-label={`Delete ${row.original.id}`}
              onClick={() => {
                remove.reset()
                setDeleting(row.original.record)
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    [type, remove],
  )
  const filters =
    type === 'orders'
      ? ['All', ...orderStatuses]
      : type === 'customers'
        ? ['All', ...sources]
        : ['All', ...categories, 'Low stock', 'Draft']
  function exportRows(values: Row[]) {
    const records = values.map((row) => row.record)
    const exported =
      type === 'orders'
        ? exportOrders(records as Order[], data)
        : type === 'customers'
          ? exportCustomers(records as Customer[])
          : exportProducts(records as Product[])
    downloadCsv(
      `nexus-${type}.csv`,
      exported,
      exported.length ? undefined : ['id', 'name', 'status'],
    )
    toast(`Exported ${values.length} ${type}`)
  }
  return (
    <>
      <PageHeading title={title} description={descriptions[type]} eyebrow="YOUR WORKSPACE">
        <button className="button primary" onClick={() => setEditor({})}>
          <Plus size={17} />
          Add {label}
        </button>
      </PageHeading>
      <div className="resource-summary">
        <div>
          <strong>{data[type].length}</strong>
          <span>Total {type}</span>
        </div>
        <div>
          <strong>
            {type === 'orders'
              ? money(
                  data.orders.filter(earnsRevenue).reduce((sum, o) => sum + orderTotal(o), 0),
                  true,
                )
              : type === 'customers'
                ? data.customers.filter((c) => withinRange(c.createdAt, presetRange(30))).length
                : data.products.filter((p) => p.status === 'Active').length}
          </strong>
          <span>
            {type === 'orders'
              ? 'Recognized revenue · all time'
              : type === 'customers'
                ? 'New in the last 30 days'
                : 'Active products'}
          </span>
        </div>
        <div>
          <strong>
            {type === 'orders'
              ? data.orders.filter((o) => o.status === 'Pending').length
              : type === 'customers'
                ? new Set(data.customers.map((c) => c.country)).size
                : data.products.filter((p) => p.stock < 10).length}
          </strong>
          <span>
            {type === 'orders'
              ? 'Awaiting payment'
              : type === 'customers'
                ? 'Countries represented'
                : 'Low stock products'}
          </span>
        </div>
      </div>
      <section className="panel records-panel">
        <div className="resource-filters">
          <div className="filter-tabs">
            {filters.map((value) => (
              <button
                key={value}
                className={filter === value ? 'active' : ''}
                onClick={() => setFilter(value)}
              >
                {value === 'All' ? `All ${type}` : value}
                {value === 'All' && <span>{data[type].length}</span>}
              </button>
            ))}
          </div>
          {type === 'orders' && (
            <label className="inline-select">
              <Filter size={14} />
              <select
                aria-label="Filter orders by date"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">All dates</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom dates</option>
              </select>
            </label>
          )}
        </div>
        {type === 'orders' && period === 'custom' && (
          <div className="custom-order-range">
            <label className="field">
              From
              <input
                type="date"
                value={customRange.from}
                max={customRange.to}
                onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
              />
            </label>
            <label className="field">
              To
              <input
                type="date"
                value={customRange.to}
                min={customRange.from}
                onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
              />
            </label>
          </div>
        )}
        {(customerFilter || productFilter || recordFilter) && (
          <div className="active-filter">
            <span>
              Showing{' '}
              {recordFilter
                ? `record ${recordFilter}`
                : customerFilter
                  ? `orders for ${data.customers.find((c) => c.id === customerFilter)?.name ?? customerFilter}`
                  : `orders containing ${data.products.find((p) => p.id === productFilter)?.name ?? productFilter}`}
            </span>
            <button className="button text-button" onClick={() => setParams({})}>
              <X size={14} />
              Clear filter
            </button>
          </div>
        )}
        <DataTable
          data={rows}
          columns={columns}
          searchPlaceholder={`Search ${type}…`}
          onExport={exportRows}
        />
      </section>
      <p className="page-footnote">
        <span className="status-dot" />
        All changes are saved to your browser automatically.
      </p>
      {editor && (
        <EntityEditor
          type={type}
          record={editor.record}
          data={data}
          onClose={() => setEditor(null)}
        />
      )}{' '}
      {details && (
        <RecordDetails
          type={type}
          record={details}
          data={data}
          onClose={() => setDetails(null)}
          onEdit={() => {
            setEditor({ record: details })
            setDetails(null)
          }}
        />
      )}{' '}
      {deleting && (
        <Modal
          title={`Delete ${label}?`}
          description="This action permanently removes the record from this browser."
          onClose={() => setDeleting(null)}
        >
          <div className="delete-warning">
            <CircleAlert size={22} />
            <div>
              <strong>{'name' in deleting ? deleting.name : deleting.id}</strong>
              <p>Records linked to existing orders are protected to preserve your sales history.</p>
            </div>
          </div>
          {remove.isError && (
            <p className="form-error" role="alert">
              {remove.error.message}
            </p>
          )}
          <div className="modal-footer">
            <button
              className="button secondary"
              onClick={() => setDeleting(null)}
              disabled={remove.isPending}
            >
              Cancel
            </button>
            <button
              className="button danger"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleting.id)}
            >
              {remove.isPending ? 'Deleting…' : `Delete ${label}`}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
export default function RecordsPage({ type }: { type: EntityType }) {
  return <WorkspaceGate>{(data) => <Records key={type} type={type} data={data} />}</WorkspaceGate>
}

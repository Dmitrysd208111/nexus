import { addDays, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import type { Dataset, DateRange, Order, OrderStatus } from '../types'
export const orderTotal = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
export const earnsRevenue = (order: Order) =>
  order.status === 'Completed' || order.status === 'Processing'
export const withinRange = (date: string, range: DateRange) =>
  date >= range.from && date <= range.to
export function filterOrders(
  orders: Order[],
  {
    search = '',
    status = 'All',
    range,
  }: { search?: string; status?: OrderStatus | 'All'; range?: DateRange } = {},
) {
  return orders.filter(
    (o) =>
      (!search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerId.toLowerCase().includes(search.toLowerCase())) &&
      (status === 'All' || o.status === status) &&
      (!range || withinRange(o.date, range)),
  )
}
export function calculateKpis(data: Dataset, range: DateRange) {
  const orders = data.orders.filter((o) => withinRange(o.date, range))
  const recognized = orders.filter(earnsRevenue)
  const revenue = recognized.reduce((sum, order) => sum + orderTotal(order), 0)
  const totalOrders = orders.filter((o) => o.status !== 'Cancelled').length
  const days = Math.max(1, differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1)
  const previousRange = {
    from: format(subDays(parseISO(range.from), days), 'yyyy-MM-dd'),
    to: format(subDays(parseISO(range.from), 1), 'yyyy-MM-dd'),
  }
  const previousRevenue = data.orders
    .filter((o) => withinRange(o.date, previousRange) && earnsRevenue(o))
    .reduce((sum, order) => sum + orderTotal(order), 0)
  const sessions = data.visits
    .filter((v) => withinRange(v.date, range))
    .reduce((sum, v) => sum + v.sessions, 0)
  return {
    revenue,
    totalOrders,
    aov: recognized.length ? revenue / recognized.length : 0,
    newCustomers: data.customers.filter((c) => withinRange(c.createdAt, range)).length,
    growth: previousRevenue ? ((revenue - previousRevenue) / previousRevenue) * 100 : null,
    conversion: sessions ? (totalOrders / sessions) * 100 : null,
    sessions,
    previousRevenue,
    recognizedOrders: recognized.length,
  }
}
export function chartData(data: Dataset, range: DateRange) {
  const days = Math.max(
    0,
    Math.min(3660, differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1),
  )
  const previousStart = subDays(parseISO(range.from), days)
  return Array.from({ length: days }, (_, i) => {
    const date = format(addDays(parseISO(range.from), i), 'yyyy-MM-dd')
    const previousDate = format(addDays(previousStart, i), 'yyyy-MM-dd')
    const orders = data.orders.filter((o) => o.date === date)
    return {
      date,
      label: format(parseISO(date), 'MMM d'),
      revenue: orders.filter(earnsRevenue).reduce((sum, o) => sum + orderTotal(o), 0) / 100,
      previous:
        data.orders
          .filter((o) => o.date === previousDate && earnsRevenue(o))
          .reduce((sum, o) => sum + orderTotal(o), 0) / 100,
      orders: orders.filter((o) => o.status !== 'Cancelled').length,
      customers: data.customers.filter((c) => c.createdAt === date).length,
    }
  })
}
export function categoryData(data: Dataset, range: DateRange) {
  const totals = new Map<string, number>()
  data.orders
    .filter((o) => withinRange(o.date, range) && earnsRevenue(o))
    .forEach((o) =>
      o.items.forEach((item) => {
        const category = data.products.find((p) => p.id === item.productId)?.category ?? 'Other'
        totals.set(category, (totals.get(category) ?? 0) + item.unitPrice * item.quantity)
      }),
    )
  return [...totals].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}
export function sourceData(data: Dataset, range: DateRange) {
  const totals = new Map<string, number>()
  data.customers
    .filter((c) => withinRange(c.createdAt, range))
    .forEach((c) => totals.set(c.source, (totals.get(c.source) ?? 0) + 1))
  return [...totals].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

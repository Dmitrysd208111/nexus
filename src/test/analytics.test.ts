import { describe, expect, it } from 'vitest'
import {
  calculateKpis,
  categoryData,
  chartData,
  filterOrders,
  orderTotal,
  sourceData,
} from '../utilities/analytics'
import { dataset, order } from './fixtures'
import { createSeed } from '../services/seed'
const range = { from: '2026-10-01', to: '2026-10-22' }
describe('business metrics', () => {
  it('uses line snapshots and excludes pending/cancelled revenue', () => {
    const result = calculateKpis(dataset(), range)
    expect(result.revenue).toBe(3000)
    expect(result.totalOrders).toBe(2)
    expect(result.aov).toBe(3000)
    expect(result.newCustomers).toBe(1)
    expect(result.growth).toBe(100)
    expect(result.conversion).toBe(2)
  })
  it('keeps KPIs, daily series and categories mathematically consistent', () => {
    const data = createSeed(new Date(2026, 9, 22))
    const kpi = calculateKpis(data, range)
    expect(
      chartData(data, range).reduce((sum, row) => sum + Math.round(row.revenue * 100), 0),
    ).toBe(kpi.revenue)
    expect(categoryData(data, range).reduce((sum, row) => sum + row.value, 0)).toBe(kpi.revenue)
    expect(sourceData(data, range).reduce((sum, row) => sum + row.value, 0)).toBe(kpi.newCustomers)
    expect(chartData(data, range).reduce((sum, row) => sum + row.orders, 0)).toBe(kpi.totalOrders)
  })
  it('handles empty data without NaN or misleading growth/conversion', () => {
    const data = { ...dataset(), orders: [], customers: [], visits: [] }
    expect(calculateKpis(data, range)).toMatchObject({
      revenue: 0,
      totalOrders: 0,
      aov: 0,
      newCustomers: 0,
      growth: null,
      conversion: null,
    })
    expect(categoryData(data, range)).toEqual([])
    expect(sourceData(data, range)).toEqual([])
    expect(chartData(data, range)).toHaveLength(22)
  })
  it('includes both boundary dates and excludes outside dates', () => {
    const orders = [
      order({ id: 'A', date: range.from }),
      order({ id: 'B', date: range.to }),
      order({ id: 'C', date: '2026-09-30' }),
      order({ id: 'D', date: '2026-10-23' }),
    ]
    expect(filterOrders(orders, { range }).map((o) => o.id)).toEqual(['A', 'B'])
  })
  it('combines case-insensitive search, status and dates', () => {
    const orders = [order({ id: 'NX-Alpha' }), order({ id: 'NX-Beta', status: 'Pending' })]
    expect(filterOrders(orders, { search: 'alpha', status: 'Completed', range })).toHaveLength(1)
    expect(filterOrders(orders, { search: 'alpha', status: 'Cancelled' })).toEqual([])
  })
  it('uses quantity and stored unit price even after product prices change', () => {
    const data = dataset()
    data.products[0]!.price = 9000
    expect(orderTotal(data.orders[0]!)).toBe(3000)
    expect(calculateKpis(data, range).revenue).toBe(3000)
  })
  it('changes revenue and dependent metrics when order status changes', () => {
    const data = dataset()
    data.orders[1]!.status = 'Processing'
    expect(calculateKpis(data, range).revenue).toBe(6000)
    data.orders[0]!.status = 'Cancelled'
    expect(calculateKpis(data, range).revenue).toBe(3000)
    expect(calculateKpis(data, range).totalOrders).toBe(1)
  })
  it('has valid references, dates and unique line items in the seed', () => {
    const data = createSeed(new Date(2026, 9, 22))
    for (const o of data.orders) {
      const customer = data.customers.find((c) => c.id === o.customerId)
      expect(customer).toBeDefined()
      expect(customer!.createdAt <= o.date).toBe(true)
      expect(new Set(o.items.map((i) => i.productId)).size).toBe(o.items.length)
      for (const item of o.items)
        expect(data.products.some((p) => p.id === item.productId)).toBe(true)
    }
  })
})

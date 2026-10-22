import { describe, expect, it } from 'vitest'
import { toCsv } from '../utilities/csv'
import { exportOrders } from '../features/records/export'
import { dataset } from './fixtures'
describe('CSV export', () => {
  it('escapes quotes, commas and newlines using UTF-8 BOM and CRLF', () => {
    expect(toCsv([{ name: 'Alex, "A"', note: 'line\nbreak' }])).toBe(
      '\uFEFF"name","note"\r\n"Alex, ""A""","line\nbreak"',
    )
  })
  it('neutralizes spreadsheet formula injection', () => {
    for (const value of ['=SUM(A1)', '+cmd', '-test', '@evil', '  =1+1'])
      expect(toCsv([{ value }])).toContain(`"'${value}"`)
  })
  it('exports a header even when there are no rows', () => {
    expect(toCsv([], ['order_id', 'total_usd'])).toBe('\uFEFF"order_id","total_usd"')
    expect(toCsv([])).toBe('\uFEFF')
  })
  it('flattens line items and serializes amounts as USD', () => {
    const data = dataset()
    expect(exportOrders([data.orders[0]!], data)[0]).toMatchObject({
      order_id: 'NX-1',
      customer: 'Alex Morgan',
      total_usd: '30.00',
      items: 'Pro Plan x2 @ 15.00',
    })
  })
})

import type { Dataset, Order } from '../types'
export const order = (overrides: Partial<Order> = {}): Order => ({
  id: 'NX-1',
  customerId: 'CUS-1',
  date: '2026-10-10',
  status: 'Completed',
  notes: '',
  items: [{ productId: 'PRD-1', quantity: 2, unitPrice: 1500 }],
  ...overrides,
})
export const dataset = (): Dataset => ({
  version: 1,
  seededAt: '2026-10-22',
  customers: [
    {
      id: 'CUS-1',
      name: 'Alex Morgan',
      email: 'alex@test.com',
      company: 'Acme',
      country: 'US',
      source: 'Direct',
      createdAt: '2026-10-01',
    },
  ],
  products: [
    {
      id: 'PRD-1',
      name: 'Pro Plan',
      sku: 'NX-001',
      category: 'Software',
      price: 1500,
      stock: 10,
      status: 'Active',
      createdAt: '2026-09-01',
    },
  ],
  orders: [
    order(),
    order({ id: 'NX-2', status: 'Pending' }),
    order({ id: 'NX-3', status: 'Cancelled' }),
    order({
      id: 'NX-4',
      date: '2026-09-10',
      items: [{ productId: 'PRD-1', quantity: 1, unitPrice: 1500 }],
    }),
  ],
  visits: [{ date: '2026-10-10', sessions: 100 }],
})

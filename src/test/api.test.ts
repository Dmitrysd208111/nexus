import { beforeEach, describe, expect, it } from 'vitest'
import { api, simulateFailure } from '../services/api'
import { updateDataset, readDataset } from '../services/database'
import { dataset } from './fixtures'
beforeEach(async () => {
  await updateDataset((data) => Object.assign(data, dataset()))
})
describe('persistent mock API', () => {
  it('creates, persists, edits and deletes a customer', async () => {
    await api.save('customers', {
      name: 'Olivia Test',
      email: 'olivia@test.co',
      company: 'Layers',
      country: 'Canada',
      source: 'Referral',
      createdAt: '2026-10-02',
    })
    let data = await readDataset()
    const customer = data.customers.find((c) => c.email === 'olivia@test.co')!
    expect(customer.id).toMatch(/^CUS-/)
    await api.save('customers', { ...customer, name: 'Olivia Updated' }, customer.id)
    data = await api.getWorkspace()
    expect(data.customers.find((c) => c.id === customer.id)?.name).toBe('Olivia Updated')
    await api.remove('customers', customer.id)
    expect((await readDataset()).customers).toHaveLength(1)
  })
  it('creates and edits an order without losing its line items', async () => {
    const data = dataset()
    const input = {
      ...data.orders[0]!,
      items: [{ productId: 'PRD-1', quantity: 3, unitPrice: 1500 }],
    }
    await api.save('orders', input)
    const created = (await readDataset()).orders.find(
      (o) => o.id !== 'NX-1' && o.id !== 'NX-2' && o.id !== 'NX-3' && o.id !== 'NX-4',
    )!
    expect(created.items[0]?.quantity).toBe(3)
    await api.save('orders', { ...created, status: 'Cancelled' }, created.id)
    expect((await readDataset()).orders.find((o) => o.id === created.id)?.status).toBe('Cancelled')
    await api.remove('orders', created.id)
    expect((await readDataset()).orders).toHaveLength(4)
  })
  it('creates and edits a product while preserving historical order prices', async () => {
    const product = dataset().products[0]!
    await api.save('products', { ...product, price: 9999 }, product.id)
    expect((await readDataset()).products[0]?.price).toBe(9999)
    expect((await readDataset()).orders[0]?.items[0]?.unitPrice).toBe(1500)
    await api.save('products', { ...product, name: 'Fresh Product', sku: 'NEW-1' })
    const fresh = (await readDataset()).products.find((p) => p.sku === 'NEW-1')!
    await api.remove('products', fresh.id)
    expect((await readDataset()).products).toHaveLength(1)
  })
  it('rejects duplicate emails and SKUs atomically', async () => {
    const data = dataset()
    await expect(
      api.save('customers', { ...data.customers[0]!, email: 'ALEX@test.com' }),
    ).rejects.toThrow('already exists')
    await expect(api.save('products', data.products[0]!)).rejects.toThrow('already exists')
    expect((await readDataset()).customers).toHaveLength(1)
  })
  it('protects referenced customers and products', async () => {
    await expect(api.remove('customers', 'CUS-1')).rejects.toThrow('has orders')
    await expect(api.remove('products', 'PRD-1')).rejects.toThrow('used in orders')
    expect((await readDataset()).products).toHaveLength(1)
  })
  it('rejects nonexistent references, invalid dates and impossible join dates', async () => {
    const order = dataset().orders[0]!
    await expect(api.save('orders', { ...order, customerId: 'missing' })).rejects.toThrow(
      'existing customer',
    )
    await expect(api.save('orders', { ...order, date: '2026-02-31' })).rejects.toThrow('valid date')
    await expect(api.save('orders', { ...order, date: '2026-09-30' })).rejects.toThrow('before')
    await expect(
      api.save('orders', {
        ...order,
        items: [{ productId: 'missing', quantity: 1, unitPrice: 100 }],
      }),
    ).rejects.toThrow('no longer exists')
  })
  it('serializes concurrent writes without dropping records', async () => {
    await Promise.all([
      api.save('products', { ...dataset().products[0]!, sku: 'A-1' }),
      api.save('products', { ...dataset().products[0]!, sku: 'B-2' }),
    ])
    expect((await readDataset()).products).toHaveLength(3)
  })
  it('supports an explicit one-shot error followed by a successful retry', async () => {
    simulateFailure()
    await expect(api.getWorkspace()).rejects.toThrow('try again')
    expect((await api.getWorkspace()).version).toBe(1)
  })
})

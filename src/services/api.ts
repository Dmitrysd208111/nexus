import { isValid, parseISO } from 'date-fns'
import { customerSchema, orderSchema, productSchema } from '../schemas'
import type { EntityMap, EntityType } from '../types'
import { readDataset, updateDataset } from './database'
let failNext = false
export const simulateFailure = () => {
  failNext = true
}
async function request() {
  await new Promise((resolve) => setTimeout(resolve, import.meta.env.MODE === 'test' ? 0 : 320))
  if (failNext) {
    failNext = false
    throw new Error('The demo request could not be completed. Please try again.')
  }
}
export const api = {
  async getWorkspace() {
    await request()
    return readDataset()
  },
  async save<T extends EntityType>(
    type: T,
    input: Omit<EntityMap[T], 'id'>,
    id?: string,
  ): Promise<void> {
    await request()
    const schema = { orders: orderSchema, customers: customerSchema, products: productSchema }[type]
    const validated = schema.parse(input)
    await updateDataset((data) => {
      const rows = data[type] as EntityMap[T][]
      const existing = id ? rows.find((row) => row.id === id) : undefined
      if (id && !existing) throw new Error('This record no longer exists. Refresh and try again.')
      if (type === 'customers') {
        const customer = customerSchema.parse(validated)
        if (
          data.customers.some(
            (c) => c.id !== id && c.email.toLowerCase() === customer.email.toLowerCase(),
          )
        )
          throw new Error('A customer with this email already exists.')
        if (!isValid(parseISO(customer.createdAt))) throw new Error('Choose a valid date.')
        if (id && data.orders.some((o) => o.customerId === id && o.date < customer.createdAt))
          throw new Error('Join date cannot be later than an existing order.')
      }
      if (type === 'products') {
        const product = productSchema.parse(validated)
        if (
          data.products.some(
            (p) => p.id !== id && p.sku.toLowerCase() === product.sku.toLowerCase(),
          )
        )
          throw new Error('A product with this SKU already exists.')
      }
      if (type === 'orders') {
        const order = orderSchema.parse(validated)
        const customer = data.customers.find((c) => c.id === order.customerId)
        if (!customer) throw new Error('Choose an existing customer.')
        if (!isValid(parseISO(order.date))) throw new Error('Choose a valid date.')
        if (order.date < customer.createdAt)
          throw new Error('Order date cannot be before the customer joined.')
        for (const item of order.items) {
          const product = data.products.find((p) => p.id === item.productId)
          if (!product) throw new Error('One of the selected products no longer exists.')
          if (
            product.status === 'Draft' &&
            !data.orders.find((o) => o.id === id)?.items.some((i) => i.productId === product.id)
          )
            throw new Error('Draft products cannot be added to orders.')
        }
      }
      const record = {
        ...validated,
        id:
          id ??
          `${{ orders: 'NX', customers: 'CUS', products: 'PRD' }[type]}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      } as EntityMap[T]
      if (existing) rows[rows.indexOf(existing)] = record
      else rows.unshift(record)
    })
  },
  async remove(type: EntityType, id: string) {
    await request()
    await updateDataset((data) => {
      if (type === 'customers' && data.orders.some((o) => o.customerId === id))
        throw new Error('This customer has orders. Reassign or delete those orders first.')
      if (type === 'products' && data.orders.some((o) => o.items.some((i) => i.productId === id)))
        throw new Error(
          'This product is used in orders. Set its status to Draft to keep its history.',
        )
      const index = data[type].findIndex((row) => row.id === id)
      if (index === -1) throw new Error('This record has already been deleted.')
      data[type].splice(index, 1)
    })
  },
}

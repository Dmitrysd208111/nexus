import type { Customer, Dataset, Order, Product } from '../../types'
import { orderTotal } from '../../utilities/analytics'
export const exportOrders = (orders: Order[], data: Dataset) =>
  orders.map((o) => ({
    order_id: o.id,
    customer: data.customers.find((c) => c.id === o.customerId)?.name ?? o.customerId,
    email: data.customers.find((c) => c.id === o.customerId)?.email ?? '',
    date: o.date,
    status: o.status,
    total_usd: (orderTotal(o) / 100).toFixed(2),
    items: o.items
      .map(
        (i) =>
          `${data.products.find((p) => p.id === i.productId)?.name ?? i.productId} x${i.quantity} @ ${(i.unitPrice / 100).toFixed(2)}`,
      )
      .join('; '),
    notes: o.notes,
  }))
export const exportCustomers = (customers: Customer[]) =>
  customers.map((c) => ({
    customer_id: c.id,
    name: c.name,
    email: c.email,
    company: c.company,
    country: c.country,
    source: c.source,
    joined: c.createdAt,
  }))
export const exportProducts = (products: Product[]) =>
  products.map((p) => ({
    product_id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price_usd: (p.price / 100).toFixed(2),
    stock: p.stock,
    status: p.status,
  }))

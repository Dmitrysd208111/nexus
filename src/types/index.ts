export type OrderStatus = 'Completed' | 'Processing' | 'Pending' | 'Cancelled'
export type Source = 'Organic search' | 'Direct' | 'Social media' | 'Referral' | 'Email'
export interface Customer {
  id: string
  name: string
  email: string
  company: string
  country: string
  source: Source
  createdAt: string
}
export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: 'Active' | 'Draft'
  createdAt: string
}
export interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}
export interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  date: string
  notes: string
}
export interface Visit {
  date: string
  sessions: number
}
export interface Dataset {
  version: 1
  customers: Customer[]
  products: Product[]
  orders: Order[]
  visits: Visit[]
  seededAt: string
}
export type EntityType = 'orders' | 'customers' | 'products'
export interface EntityMap {
  orders: Order
  customers: Customer
  products: Product
}
export interface DateRange {
  from: string
  to: string
}
export const orderStatuses: OrderStatus[] = ['Completed', 'Processing', 'Pending', 'Cancelled']
export const sources: Source[] = ['Organic search', 'Direct', 'Social media', 'Referral', 'Email']
export const categories = ['Software', 'Electronics', 'Accessories', 'Office', 'Services']

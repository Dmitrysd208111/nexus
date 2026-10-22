import { format, subDays } from 'date-fns'
import type { Dataset, Order, Product } from '../types'
import { sources } from '../types'

export function createSeed(now = new Date()): Dataset {
  let state = 49231
  const random = () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)]!
  const day = (days: number) => format(subDays(now, days), 'yyyy-MM-dd')
  const names = [
    'Olivia Rhye',
    'Phoenix Baker',
    'Lana Steiner',
    'Demi Wilkinson',
    'Drew Cano',
    'Natali Craig',
    'Orlando Diggs',
    'Andi Lane',
    'Kate Morrison',
    'Alex Morgan',
    'Sofia Chen',
    'Liam Wilson',
    'Mia Thompson',
    'Noah Williams',
    'Emma Davis',
    'James Lee',
    'Ava Martinez',
    'Lucas Brown',
    'Isabella Garcia',
    'Ethan Taylor',
  ]
  const companies = [
    'Layers',
    'Sisyphus',
    'Circooles',
    'Catalog',
    'Quotient',
    'Hourglass',
    'Spherule',
    'Capsule',
    'Command+R',
    'Acme Studio',
    'Linear Labs',
    'Northstar',
  ]
  const customers = Array.from({ length: 96 }, (_, i) => ({
    id: `CUS-${String(i + 1).padStart(4, '0')}`,
    name:
      i < names.length
        ? names[i]!
        : `${pick(['Amelia', 'Daniel', 'Harper', 'Henry', 'Grace', 'Leo', 'Chloe', 'Jack', 'Sarah', 'Oliver'])} ${pick(['Anderson', 'Scott', 'Turner', 'Mitchell', 'Walker', 'Young', 'Wright', 'King', 'Roberts', 'Lewis'])}`,
    email:
      i < names.length
        ? `${names[i]!.toLowerCase().replace(' ', '.')}@${companies[i % companies.length]!.toLowerCase().replace(/[^a-z]/g, '')}.co`
        : `member${i + 1}@${companies[i % companies.length]!.toLowerCase().replace(/[^a-z]/g, '')}.co`,
    company: companies[i % companies.length]!,
    country: pick([
      'United States',
      'United Kingdom',
      'Germany',
      'Canada',
      'Netherlands',
      'Australia',
    ]),
    source: pick(sources),
    createdAt: day(i < 30 ? 120 + Math.floor(random() * 80) : Math.floor(random() * 110)),
  }))
  const catalog: [string, string, number, number][] = [
    ['Studio Pro License', 'Software', 24900, 999],
    ['Analytics Enterprise', 'Software', 59900, 999],
    ['Wireless Headphones', 'Electronics', 17900, 84],
    ['Mechanical Keyboard', 'Electronics', 12900, 42],
    ['USB-C Docking Station', 'Electronics', 14900, 37],
    ['Workspace Essentials', 'Office', 8900, 126],
    ['Monitor Stand', 'Office', 6900, 62],
    ['Laptop Sleeve', 'Accessories', 4900, 156],
    ['Pro Mouse', 'Electronics', 7900, 93],
    ['Cloud Storage Annual', 'Software', 19900, 999],
    ['Design System Kit', 'Software', 14900, 999],
    ['Team Onboarding', 'Services', 79900, 999],
    ['Desk Organizer', 'Office', 3900, 8],
    ['Braided USB-C Cable', 'Accessories', 2900, 203],
    ['Strategy Consultation', 'Services', 49900, 999],
    ['Webcam 4K', 'Electronics', 13900, 4],
    ['Travel Adapter', 'Accessories', 5900, 71],
    ['Focus Desk Lamp', 'Office', 9900, 28],
  ]
  const products: Product[] = catalog.map(([name, category, price, stock], i) => ({
    id: `PRD-${String(i + 1).padStart(3, '0')}`,
    name,
    sku: `NX-${category.slice(0, 3).toUpperCase()}-${100 + i}`,
    category,
    price,
    stock,
    status: 'Active',
    createdAt: day(200),
  }))
  const orders: Order[] = Array.from({ length: 840 }, (_, i) => {
    const age = Math.floor(random() ** 1.2 * 120)
    const date = day(age)
    const eligible = customers.filter((c) => c.createdAt <= date)
    const customer = pick(eligible)
    const product = pick(products)
    const second = pick(products.filter((p) => p.id !== product.id))
    return {
      id: `NX-${10400 + i}`,
      customerId: customer.id,
      date,
      status: pick<Order['status']>([
        'Completed',
        'Completed',
        'Completed',
        'Completed',
        'Processing',
        'Pending',
        'Cancelled',
      ]),
      items: [
        { productId: product.id, quantity: 1 + Math.floor(random() * 3), unitPrice: product.price },
        ...(random() > 0.65
          ? [{ productId: second.id, quantity: 1, unitPrice: second.price }]
          : []),
      ],
      notes: '',
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
  return {
    version: 1,
    customers,
    products,
    orders,
    visits: Array.from({ length: 240 }, (_, i) => ({
      date: day(i),
      sessions: 180 + Math.floor(random() * 130),
    })),
    seededAt: day(0),
  }
}

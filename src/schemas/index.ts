import { z } from 'zod'
import { categories, orderStatuses, sources } from '../types'
export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(80),
  email: z.string().trim().email('Enter a valid email address').max(120),
  company: z.string().trim().min(1, 'Company is required').max(80),
  country: z.string().trim().min(2, 'Country is required').max(80),
  source: z.enum(sources as [(typeof sources)[number], ...(typeof sources)[number][]]),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
})
export const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(100),
  sku: z.string().trim().min(2, 'SKU is required').max(40),
  category: z.enum(categories as [string, ...string[]]),
  price: z
    .number()
    .finite()
    .positive('Price must be greater than zero')
    .max(10000000, 'Maximum price is $100,000'),
  stock: z.number().int('Use a whole number').min(0, 'Stock cannot be negative').max(1000000),
  status: z.enum(['Active', 'Draft']),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
export const orderSchema = z.object({
  customerId: z.string().min(1, 'Choose a customer'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  status: z.enum(
    orderStatuses as [(typeof orderStatuses)[number], ...(typeof orderStatuses)[number][]],
  ),
  notes: z.string().max(1000),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Choose a product'),
        quantity: z.number().int('Use a whole number').min(1, 'Minimum quantity is 1').max(999),
        unitPrice: z.number().int().positive('Price must be positive').max(10000000),
      }),
    )
    .min(1, 'Add at least one product')
    .refine(
      (items) => new Set(items.map((i) => i.productId)).size === items.length,
      'Choose each product only once',
    ),
})

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EntityEditor } from '../features/records/EntityForms'
import { ToastProvider } from '../shared/Toast'
import { customerSchema, orderSchema, productSchema } from '../schemas'
import { dataset } from './fixtures'
describe('record validation', () => {
  it('shows accessible field errors when a customer form is submitted empty', async () => {
    const user = userEvent.setup()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastProvider>
          <EntityEditor type="customers" data={dataset()} onClose={() => undefined} />
        </ToastProvider>
      </QueryClientProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Create record' }))
    expect(await screen.findByText('Enter at least 2 characters')).toBeVisible()
    expect(screen.getByText('Enter a valid email address')).toBeVisible()
    expect(screen.getByText('Company is required')).toBeVisible()
    expect(screen.getByRole('textbox', { name: /^Full name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
  it('rejects zero/negative prices, negative stock and fractional quantities', () => {
    expect(productSchema.safeParse({ ...dataset().products[0]!, price: 0 }).success).toBe(false)
    expect(productSchema.safeParse({ ...dataset().products[0]!, stock: -1 }).success).toBe(false)
    expect(
      orderSchema.safeParse({
        ...dataset().orders[0]!,
        items: [{ productId: 'PRD-1', quantity: 1.2, unitPrice: 100 }],
      }).success,
    ).toBe(false)
  })
  it('requires a valid email, at least one item, and unique products', () => {
    expect(customerSchema.safeParse({ ...dataset().customers[0]!, email: 'wrong' }).success).toBe(
      false,
    )
    expect(orderSchema.safeParse({ ...dataset().orders[0]!, items: [] }).success).toBe(false)
    const item = dataset().orders[0]!.items[0]!
    expect(orderSchema.safeParse({ ...dataset().orders[0]!, items: [item, item] }).success).toBe(
      false,
    )
  })
})

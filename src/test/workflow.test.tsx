import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EntityEditor } from '../features/records/EntityForms'
import { ToastProvider } from '../shared/Toast'
import { dataset } from './fixtures'
import { readDataset, updateDataset } from '../services/database'
function editor(type: 'customers' | 'orders', onClose: () => void) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ToastProvider>
        <EntityEditor type={type} data={dataset()} onClose={onClose} />
      </ToastProvider>
    </QueryClientProvider>,
  )
}
describe('forms to persistent records', () => {
  it('submits a valid customer form and persists the result', async () => {
    await updateDataset((data) => Object.assign(data, dataset()))
    const user = userEvent.setup()
    const close = vi.fn()
    editor('customers', close)
    await user.type(screen.getByRole('textbox', { name: 'Full name' }), 'Taylor Reed')
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'taylor@test.co')
    await user.type(screen.getByRole('textbox', { name: 'Company' }), 'Northstar')
    await user.click(screen.getByRole('button', { name: 'Create record' }))
    await waitFor(() => expect(close).toHaveBeenCalledOnce())
    expect((await readDataset()).customers.find((c) => c.email === 'taylor@test.co')?.name).toBe(
      'Taylor Reed',
    )
  })
  it('selects a catalog product, calculates quantity total and persists a completed order', async () => {
    await updateDataset((data) => Object.assign(data, dataset()))
    const user = userEvent.setup()
    const close = vi.fn()
    editor('orders', close)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Customer' }), 'CUS-1')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Product' }), 'PRD-1')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'Completed')
    const quantity = screen.getByRole('spinbutton', { name: 'Qty' })
    await user.clear(quantity)
    await user.type(quantity, '3')
    expect(screen.getByText('$45.00')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Create record' }))
    await waitFor(() => expect(close).toHaveBeenCalledOnce())
    const created = (await readDataset()).orders[0]!
    expect(created.status).toBe('Completed')
    expect(created.items).toEqual([{ productId: 'PRD-1', quantity: 3, unitPrice: 1500 }])
  })
})

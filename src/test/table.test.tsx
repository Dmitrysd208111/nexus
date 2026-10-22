import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../shared/DataTable'
const rows = Array.from({ length: 12 }, (_, i) => ({
  id: `R-${i}`,
  name: `Record ${String(i).padStart(2, '0')}`,
  amount: 12 - i,
}))
const columns: ColumnDef<(typeof rows)[number]>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'amount', header: 'Amount' },
]
describe('shared table workflows', () => {
  it('paginates and resets the page for a search, then shows an empty state', async () => {
    const user = userEvent.setup()
    render(<DataTable data={rows} columns={columns} />)
    expect(screen.getByText('1–8 of 12 records')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('9–12 of 12 records')).toBeVisible()
    await user.type(screen.getByRole('textbox', { name: 'Search table' }), 'Record 01')
    expect(screen.getByText('1–1 of 1 records')).toBeVisible()
    await user.clear(screen.getByRole('textbox', { name: 'Search table' }))
    await user.type(screen.getByRole('textbox', { name: 'Search table' }), 'nonexistent')
    expect(screen.getByText('Nothing here just yet')).toBeVisible()
  })
  it('sorts data and exports selected rows rather than the entire collection', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    render(<DataTable data={rows} columns={columns} onExport={onExport} />)
    await user.click(screen.getByRole('button', { name: 'Amount' }))
    await user.click(screen.getByRole('button', { name: 'Amount' }))
    const cells = screen.getAllByRole('row')
    expect(cells[1]).toHaveTextContent('Record 11')
    await user.click(screen.getByRole('checkbox', { name: 'Select R-11' }))
    await user.click(screen.getByRole('button', { name: 'Export selected' }))
    expect(onExport).toHaveBeenCalledWith([rows[11]])
  })
})

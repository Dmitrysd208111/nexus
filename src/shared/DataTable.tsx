import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
} from 'lucide-react'
import { EmptyState } from './States'
export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  onExport,
  initialPageSize = 8,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  searchPlaceholder?: string
  onExport?: (rows: T[]) => void
  initialPageSize?: number
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const [selection, setSelection] = useState<RowSelectionState>({})
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search, rowSelection: selection },
    initialState: { pagination: { pageSize: initialPageSize } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onRowSelectionChange: setSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  })
  const selected = table.getFilteredSelectedRowModel().rows
  const total = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  return (
    <div className="data-table">
      <div className="table-toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            aria-label="Search table"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              table.setPageIndex(0)
            }}
          />
          {search && (
            <button aria-label="Clear search" className="icon-button" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="table-toolbar-right">
          {selected.length > 0 && <span className="muted small">{selected.length} selected</span>}
          {onExport && (
            <button
              className="button secondary"
              onClick={() =>
                onExport(
                  (selected.length ? selected : table.getSortedRowModel().rows).map(
                    (row) => row.original,
                  ),
                )
              }
            >
              <Download size={15} />
              <span>Export {selected.length ? 'selected' : 'CSV'}</span>
            </button>
          )}
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="select-column">
                <input
                  type="checkbox"
                  aria-label="Select all rows on page"
                  checked={table.getIsAllPageRowsSelected()}
                  onChange={table.getToggleAllPageRowsSelectedHandler()}
                />
              </th>
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <th
                  key={header.id}
                  aria-sort={
                    header.column.getIsSorted() === 'asc'
                      ? 'ascending'
                      : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : undefined
                  }
                >
                  {header.column.getCanSort() ? (
                    <button
                      className="sort-button"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ArrowUp size={13} />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={12} />
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-selected={row.getIsSelected()}>
                <td className="select-column">
                  <input
                    aria-label={`Select ${row.id}`}
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                  />
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!total && <EmptyState />}
      <div className="table-pagination">
        <span>
          {total
            ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, total)}`
            : '0'}{' '}
          of {total} records
        </span>
        <div className="pagination-actions">
          <label>
            Rows per page
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[8, 15, 30].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <button
            className="icon-button bordered"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="page-number">
            {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <button
            className="icon-button bordered"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

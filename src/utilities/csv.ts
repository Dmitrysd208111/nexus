export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  const headers = columns ?? Object.keys(rows[0] ?? {})
  const cell = (value: unknown) => {
    let text = String(value ?? '')
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`
    return `"${text.replace(/"/g, '""')}"`
  }
  return (
    '\uFEFF' +
    [
      headers.map(cell).join(','),
      ...rows.map((row) => headers.map((key) => cell(row[key])).join(',')),
    ].join('\r\n')
  )
}
export function downloadCsv(filename: string, rows: Record<string, unknown>[], columns?: string[]) {
  const url = URL.createObjectURL(
    new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

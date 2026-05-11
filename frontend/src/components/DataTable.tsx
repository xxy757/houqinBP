import type { ReactNode } from 'react'

interface DataTableProps<T> {
  columns: {
    key: string
    title: string
    className?: string
    style?: React.CSSProperties
    render?: (row: T, index: number) => ReactNode
  }[]
  data: T[]
  rowKey?: (row: T, index: number) => string | number
  onRowClick?: (row: T, index: number) => void
  rowClassName?: string
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.className} style={col.style}>
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={rowKey ? rowKey(row, i) : i}
            className={rowClassName}
            onClick={() => onRowClick?.(row, i)}
          >
            {columns.map((col) => (
              <td key={col.key} className={col.className} style={col.style}>
                {col.render ? col.render(row, i) : String((row as Record<string, unknown>)[col.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

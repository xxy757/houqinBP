import type { ChangeEvent } from 'react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  onChange: (page: number, pageSize: number) => void
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200]

export default function Pagination({ page, pageSize, total, pageSizeOptions = PAGE_SIZE_OPTIONS, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(1, Number(e.target.value))
  }

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', fontSize: 13, color: 'var(--color-gray-500)',
      flexWrap: 'wrap', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>显示 {start}-{end}，共 {total} 条</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          style={{
            padding: '3px 6px', border: '1px solid var(--color-gray-200)', borderRadius: 4,
            fontSize: 12, color: 'var(--color-gray-500)', cursor: 'pointer',
          }}
        >
          {pageSizeOptions.map(n => (
            <option key={n} value={n}>{n}条/页</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1, pageSize)}
          style={{
            padding: '4px 10px', border: '1px solid var(--color-gray-200)', borderRadius: 4,
            fontSize: 12, cursor: page <= 1 ? 'default' : 'pointer',
            background: page <= 1 ? 'var(--color-gray-50)' : '#fff',
            color: page <= 1 ? 'var(--color-gray-300)' : 'var(--color-gray-700)',
          }}
        >
          ‹ 上一页
        </button>
        {getPageNumbers().map((p, i) =>
          typeof p === 'string' ? (
            <span key={`dots-${i}`} style={{ padding: '4px 6px', fontSize: 12, color: 'var(--color-gray-400)' }}>...</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p, pageSize)}
              style={{
                padding: '4px 8px', border: '1px solid var(--color-gray-200)', borderRadius: 4,
                fontSize: 12, cursor: 'pointer', minWidth: 32,
                background: p === page ? 'var(--color-primary)' : '#fff',
                color: p === page ? '#fff' : 'var(--color-gray-700)',
                fontWeight: p === page ? 600 : 400,
              }}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1, pageSize)}
          style={{
            padding: '4px 10px', border: '1px solid var(--color-gray-200)', borderRadius: 4,
            fontSize: 12, cursor: page >= totalPages ? 'default' : 'pointer',
            background: page >= totalPages ? 'var(--color-gray-50)' : '#fff',
            color: page >= totalPages ? 'var(--color-gray-300)' : 'var(--color-gray-700)',
          }}
        >
          下一页 ›
        </button>
      </div>
    </div>
  )
}

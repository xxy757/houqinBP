import type { KeyboardEvent, ChangeEvent } from 'react'

interface SearchBarProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

export default function SearchBar({ value, placeholder = '搜索...', onChange, onSearch, onClear }: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          padding: '6px 10px', border: '1px solid var(--g200)', borderRadius: 4,
          fontSize: 13, width: 220, outline: 'none',
        }}
      />
      <button
        className="btn btn-o"
        onClick={onSearch}
        style={{ fontSize: 13, padding: '6px 12px' }}
      >
        🔍 搜索
      </button>
      {value && (
        <button
          className="btn btn-o"
          onClick={onClear}
          style={{ fontSize: 13, padding: '6px 12px', color: 'var(--g500)' }}
        >
          ✕ 清除
        </button>
      )}
    </div>
  )
}

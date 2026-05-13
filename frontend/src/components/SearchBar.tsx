import type { KeyboardEvent, ChangeEvent } from 'react'
import { IconSearch, IconClose } from './Icons'

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
        className="form-input"
        style={{ width: 220 }}
      />
      <button className="btn btn-secondary" onClick={onSearch}>
        <IconSearch size={14} />搜索
      </button>
      {value && (
        <button className="btn btn-ghost" onClick={onClear}>
          <IconClose size={14} />清除
        </button>
      )}
    </div>
  )
}

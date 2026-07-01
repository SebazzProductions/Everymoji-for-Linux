import { useRef, useEffect, useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        onChange('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onChange])

  return (
    <div className="px-3 pt-2.5 pb-1.5">
      <div className={`search-shell relative group transition-all duration-300 ${focused ? 'is-focused' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Emoji suchen…"
          className="search-input relative w-full h-10 pl-4 pr-9 rounded-[999px] text-[13px] focus:outline-none transition-all duration-200"
        />
        {!value && !focused && (
          <kbd className="shortcut-badge absolute right-3 top-1/2 -translate-y-1/2 text-[10px] rounded px-1.5 py-0.5 font-mono">
            /
          </kbd>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="search-clear absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-150"
          >
            <svg width="8" height="8" viewBox="0 0 8 8">
              <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

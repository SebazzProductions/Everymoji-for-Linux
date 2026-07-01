import ThemeToggle from './ThemeToggle'

interface TitleBarProps {
  selectedEmoji: string | null
  themeIcon: string
  themeLabel: string
  nextThemeLabel: string
  onCycleTheme: () => void
}

export default function TitleBar({
  selectedEmoji,
  themeIcon,
  themeLabel,
  nextThemeLabel,
  onCycleTheme
}: TitleBarProps) {
  return (
    <div
      className="titlebar-shell flex items-center justify-between h-10 px-3.5 select-none"
      style={{
        WebkitAppRegion: 'drag'
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative">
          <span className="text-lg leading-none drop-shadow-sm">
            {selectedEmoji || '✨'}
          </span>
          {selectedEmoji && (
            <span className="titlebar-dot absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full" />
          )}
        </div>
        <span className="titlebar-title truncate text-[13px] font-semibold tracking-wide">
          Everymoji
        </span>
      </div>
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <ThemeToggle
          icon={themeIcon}
          label={themeLabel}
          nextLabel={nextThemeLabel}
          onToggle={onCycleTheme}
        />
        <button
          type="button"
          onClick={() => window.api.windowMinimize()}
          className="chrome-button group w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" className="transition-transform group-hover:scale-x-125">
            <rect width="10" height="1" fill="currentColor" rx="0.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => window.api.windowClose()}
          className="chrome-button chrome-button--close group w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="transition-transform group-hover:rotate-90 duration-200">
            <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

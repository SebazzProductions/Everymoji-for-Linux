import { useRef, useEffect, useState } from 'react'
import type { EmojiGroup } from '../hooks/useEmojis'

interface CategoryTabsProps {
  groups: EmojiGroup[]
  activeGroup: string
  onGroupChange: (name: string) => void
  hasFavorites: boolean
  hasRecent: boolean
}

const SPECIAL_TABS = [
  { name: '__favorites', icon: '⭐', label: 'Favoriten' },
  { name: '__recent', icon: '🕐', label: 'Zuletzt' }
]

export default function CategoryTabs({
  groups,
  activeGroup,
  onGroupChange,
  hasFavorites,
  hasRecent
}: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeBtn = container.querySelector('[data-active="true"]') as HTMLElement
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth
      })
    }
  }, [activeGroup, hasFavorites, hasRecent])

  return (
    <div className="tab-section relative px-1.5 pt-1 pb-0">
      <div
        ref={containerRef}
        className="tab-strip relative flex items-center gap-1 overflow-x-auto scrollbar-none py-1"
      >
        {hasFavorites && (
          <TabButton
            icon={SPECIAL_TABS[0].icon}
            label={SPECIAL_TABS[0].label}
            active={activeGroup === SPECIAL_TABS[0].name}
            onClick={() => onGroupChange(SPECIAL_TABS[0].name)}
          />
        )}
        {hasRecent && (
          <TabButton
            icon={SPECIAL_TABS[1].icon}
            label={SPECIAL_TABS[1].label}
            active={activeGroup === SPECIAL_TABS[1].name}
            onClick={() => onGroupChange(SPECIAL_TABS[1].name)}
          />
        )}
        {groups.map((g) => (
          <TabButton
            key={g.name}
            icon={g.icon}
            label={g.name}
            active={activeGroup === g.name}
            onClick={() => onGroupChange(g.name)}
          />
        ))}
        <div
          className="tab-indicator absolute bottom-0 h-[2px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left + 4,
            width: Math.max(indicatorStyle.width - 8, 0)
          }}
        />
      </div>
      <div className="tab-divider h-px" />
    </div>
  )
}

function TabButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      title={label}
      className={`tab-button relative flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[15px] transition-all duration-200 ${active ? 'tab-button--active' : ''}`}
    >
      <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
        {icon}
      </span>
    </button>
  )
}

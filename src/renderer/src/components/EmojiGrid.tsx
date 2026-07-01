import { useCallback, useRef } from 'react'
import type { EmojiEntry } from '../hooks/useEmojis'
import { applySkintone } from '../hooks/useEmojis'

interface EmojiGridProps {
  emojis: EmojiEntry[]
  selectedEmoji: string | null
  skinTone: number
  onSelect: (emoji: string, entry: EmojiEntry) => void
  onDoubleClick: (emoji: string) => void
  isFavorite: (emoji: string) => boolean
  onToggleFavorite: (emoji: string) => void
}

export default function EmojiGrid({
  emojis,
  selectedEmoji,
  skinTone,
  onSelect,
  onDoubleClick,
  isFavorite,
  onToggleFavorite
}: EmojiGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  const getDisplayEmoji = useCallback(
    (entry: EmojiEntry) => {
      if (entry.skin_tone_support && skinTone > 0) {
        return applySkintone(entry.emoji, skinTone)
      }
      return entry.emoji
    },
    [skinTone]
  )

  if (emojis.length === 0) {
    return (
      <div className="empty-state flex-1 flex flex-col items-center justify-center gap-2 animate-fade-in-up">
        <span className="text-3xl opacity-40">🔍</span>
        <span className="text-[13px]">Keine Emojis gefunden</span>
      </div>
    )
  }

  return (
    <div className="emoji-scroller flex-1 overflow-y-auto px-2.5 py-2">
      <div ref={gridRef} className="emoji-grid grid grid-cols-8 gap-[6px]">
        {emojis.map((entry) => {
          const display = getDisplayEmoji(entry)
          const isSelected = selectedEmoji === display
          const isFav = isFavorite(entry.emoji)
          return (
            <button
              key={entry.slug}
              title={entry.name}
              onClick={() => onSelect(display, entry)}
              onDoubleClick={() => onDoubleClick(display)}
              onContextMenu={(e) => {
                e.preventDefault()
                onToggleFavorite(entry.emoji)
              }}
              className={`emoji-cell group relative w-full aspect-square flex items-center justify-center text-[22px] rounded-[18px] transition-all duration-150 ease-out ${isSelected ? 'emoji-cell--selected z-10' : ''}`}
            >
              <span className="emoji-symbol transition-transform duration-150">
                {display}
              </span>
              {isFav && (
                <span className="emoji-favorite absolute -top-0.5 -right-0.5 w-3 h-3 text-[7px] leading-none flex items-center justify-center rounded-full">
                  ⭐
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

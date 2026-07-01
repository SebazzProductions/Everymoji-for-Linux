import { useState, useCallback } from 'react'
import TitleBar from './components/TitleBar'
import SearchBar from './components/SearchBar'
import CategoryTabs from './components/CategoryTabs'
import EmojiGrid from './components/EmojiGrid'
import SkinTonePicker from './components/SkinTonePicker'
import SendButton from './components/SendButton'
import { useEmojis, type EmojiEntry } from './hooks/useEmojis'
import { useFavorites } from './hooks/useFavorites'
import { useRecent } from './hooks/useRecent'
import { useTheme } from './hooks/useTheme'

function App(): React.JSX.Element {
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState('Smileys & Emotion')
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<EmojiEntry | null>(null)

  const { groups, filteredEmojis, skinTone, setSkinTone } = useEmojis(search, activeGroup)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recent, addRecent } = useRecent()
  const { currentTheme, nextTheme, themeId, cycleTheme } = useTheme()

  // Determine which emojis to show based on active tab
  const displayEmojis = (() => {
    if (search) return filteredEmojis
    if (activeGroup === '__favorites') {
      return favorites.map((emoji) => ({
        emoji,
        name: emoji,
        slug: emoji,
        skin_tone_support: false
      }))
    }
    if (activeGroup === '__recent') {
      return recent.map((emoji) => ({
        emoji,
        name: emoji,
        slug: emoji,
        skin_tone_support: false
      }))
    }
    return filteredEmojis
  })()

  const handleSelect = useCallback((emoji: string, entry: EmojiEntry) => {
    setSelectedEmoji(emoji)
    setSelectedEntry(entry)
  }, [])

  const handleSend = useCallback(async () => {
    if (!selectedEmoji) return
    const success = await window.api.sendEmoji(selectedEmoji)
    if (success) {
      addRecent(selectedEmoji)
    }
  }, [selectedEmoji, addRecent])

  const handleDoubleClick = useCallback(
    async (emoji: string) => {
      setSelectedEmoji(emoji)
      const success = await window.api.sendEmoji(emoji)
      if (success) {
        addRecent(emoji)
      }
    },
    [addRecent]
  )

  return (
    <div className="app-shell animate-scale-in" data-theme={themeId}>
      <div className="app-frame">
        <TitleBar
          selectedEmoji={selectedEmoji}
          themeIcon={currentTheme.icon}
          themeLabel={currentTheme.shortLabel}
          nextThemeLabel={nextTheme.label}
          onCycleTheme={cycleTheme}
        />
        <SearchBar value={search} onChange={setSearch} />
        <CategoryTabs
          groups={groups}
          activeGroup={activeGroup}
          onGroupChange={setActiveGroup}
          hasFavorites={favorites.length > 0}
          hasRecent={recent.length > 0}
        />
        {selectedEntry?.skin_tone_support && (
          <SkinTonePicker skinTone={skinTone} onChange={setSkinTone} />
        )}
        <EmojiGrid
          emojis={displayEmojis}
          selectedEmoji={selectedEmoji}
          skinTone={skinTone}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
        <SendButton selectedEmoji={selectedEmoji} onSend={handleSend} />
      </div>
    </div>
  )
}

export default App

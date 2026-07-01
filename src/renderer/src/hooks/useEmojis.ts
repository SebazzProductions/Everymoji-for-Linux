import { useState, useMemo } from 'react'
import emojiDataByGroup from 'unicode-emoji-json/data-by-group.json'

export interface EmojiEntry {
  emoji: string
  name: string
  slug: string
  skin_tone_support: boolean
}

export interface EmojiGroup {
  name: string
  icon: string
  emojis: EmojiEntry[]
}

const GROUP_ICONS: Record<string, string> = {
  'Smileys & Emotion': '😀',
  'People & Body': '🤝',
  'Animals & Nature': '🐾',
  'Food & Drink': '🍕',
  'Travel & Places': '🚗',
  Activities: '⚽',
  Objects: '💡',
  Symbols: '❤️',
  Flags: '🏁',
  'Component': '🔧'
}

const SKIN_TONES = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}']
const SKIN_TONE_LABELS = ['Standard', 'Hell', 'Mittelhell', 'Mittel', 'Mitteldunkel', 'Dunkel']

interface RawEmoji {
  emoji: string
  name: string
  slug: string
  skin_tone_support: boolean
  unicode_version: string
  emoji_version: string
}

interface RawGroup {
  name: string
  slug: string
  emojis: RawEmoji[]
}

function buildGroups(): EmojiGroup[] {
  const data = emojiDataByGroup as RawGroup[]

  return data
    .filter((g) => g.slug !== 'component')
    .map((g) => ({
      name: g.name,
      icon: GROUP_ICONS[g.name] || '📋',
      emojis: g.emojis.map((e) => ({
        emoji: e.emoji,
        name: e.name,
        slug: e.slug,
        skin_tone_support: e.skin_tone_support
      }))
    }))
}

const ALL_GROUPS = buildGroups()

export function applySkintone(emoji: string, toneIndex: number): string {
  if (toneIndex === 0) return emoji
  const tone = SKIN_TONES[toneIndex]
  // Insert skin tone modifier after the first code point
  const codePoints = [...emoji]
  if (codePoints.length === 0) return emoji
  return codePoints[0] + tone + codePoints.slice(1).join('')
}

export { SKIN_TONES, SKIN_TONE_LABELS }

export function useEmojis(search: string, activeGroup: string) {
  const [skinTone, setSkinTone] = useState(0)

  const groups = ALL_GROUPS

  const filteredEmojis = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (query) {
      const all: EmojiEntry[] = []
      for (const group of groups) {
        for (const e of group.emojis) {
          if (e.name.includes(query) || e.slug.includes(query)) {
            all.push(e)
          }
        }
      }
      return all
    }

    const group = groups.find((g) => g.name === activeGroup)
    return group ? group.emojis : []
  }, [search, activeGroup, groups])

  return { groups, filteredEmojis, skinTone, setSkinTone }
}

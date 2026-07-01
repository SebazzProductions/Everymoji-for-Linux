import { useCallback, useEffect, useMemo, useState } from 'react'

export type ThemeId = 'glass' | 'glass-a11y' | 'candy' | 'candy-a11y' | 'minimal'

export interface AppTheme {
  id: ThemeId
  label: string
  shortLabel: string
  icon: string
}

const STORAGE_KEY = 'everymoji-theme'

export const APP_THEMES: AppTheme[] = [
  { id: 'glass', label: 'Glass Bloom', shortLabel: 'Glass', icon: '◌' },
  { id: 'glass-a11y', label: 'Glass A11y', shortLabel: 'A11y Dark', icon: '◎' },
  { id: 'candy', label: 'Candy Cloud', shortLabel: 'Candy', icon: '◍' },
  { id: 'candy-a11y', label: 'Candy A11y', shortLabel: 'A11y Light', icon: '◉' },
  { id: 'minimal', label: 'Minimal', shortLabel: 'Minimal', icon: '○' }
]

function isThemeId(value: string | null): value is ThemeId {
  return APP_THEMES.some((theme) => theme.id === value)
}

function loadThemeId(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemeId(stored) ? stored : 'glass'
  } catch {
    return 'glass'
  }
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(loadThemeId)

  useEffect(() => {
    document.documentElement.dataset.theme = themeId
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  const currentIndex = useMemo(
    () => APP_THEMES.findIndex((theme) => theme.id === themeId),
    [themeId]
  )

  const currentTheme = APP_THEMES[currentIndex] ?? APP_THEMES[0]
  const nextTheme = APP_THEMES[(currentIndex + 1) % APP_THEMES.length]

  const cycleTheme = useCallback(() => {
    setThemeId((prev) => {
      const index = APP_THEMES.findIndex((theme) => theme.id === prev)
      return APP_THEMES[(index + 1) % APP_THEMES.length].id
    })
  }, [])

  return {
    currentTheme,
    nextTheme,
    themeId,
    themes: APP_THEMES,
    setThemeId,
    cycleTheme
  }
}

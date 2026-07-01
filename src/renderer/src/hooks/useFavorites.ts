import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'everymoji-favorites'
const MAX_FAVORITES = 50

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveFavorites(favs: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const toggleFavorite = useCallback((emoji: string) => {
    setFavorites((prev) => {
      if (prev.includes(emoji)) {
        return prev.filter((e) => e !== emoji)
      }
      if (prev.length >= MAX_FAVORITES) {
        return [emoji, ...prev.slice(0, MAX_FAVORITES - 1)]
      }
      return [emoji, ...prev]
    })
  }, [])

  const isFavorite = useCallback(
    (emoji: string) => favorites.includes(emoji),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}

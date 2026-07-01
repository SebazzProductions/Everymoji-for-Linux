import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'everymoji-recent'
const MAX_RECENT = 30

function loadRecent(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecent(items: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useRecent() {
  const [recent, setRecent] = useState<string[]>(loadRecent)

  useEffect(() => {
    saveRecent(recent)
  }, [recent])

  const addRecent = useCallback((emoji: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((e) => e !== emoji)
      return [emoji, ...filtered].slice(0, MAX_RECENT)
    })
  }, [])

  return { recent, addRecent }
}

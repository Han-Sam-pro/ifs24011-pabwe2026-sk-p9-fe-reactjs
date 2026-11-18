import { useCallback, useEffect, useState } from 'react'

export const THEME_KEY = 'delcom_blog_theme'
export const ACCENT_KEY = 'delcom_blog_accent'

export const ACCENTS = {
  indigo: '#4f46e5',
  emerald: '#059669',
  rose: '#e11d48',
  amber: '#d97706',
  sky: '#0284c7',
}

// Custom hook tema gelap/terang dan warna aksen (disimpan di localStorage).
export default function useTheme() {
  const [theme, setTheme] = useState(() => (localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'))
  const [accent, setAccentState] = useState(() => {
    const saved = localStorage.getItem(ACCENT_KEY)
    return ACCENTS[saved] ? saved : 'indigo'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', ACCENTS[accent])
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const cycleAccent = useCallback(() => {
    setAccentState((current) => {
      const keys = Object.keys(ACCENTS)
      return keys[(keys.indexOf(current) + 1) % keys.length]
    })
  }, [])

  const setAccent = useCallback((name) => {
    if (ACCENTS[name]) setAccentState(name)
  }, [])

  return { theme, isDark: theme === 'dark', toggleTheme, accent, setAccent, cycleAccent }
}

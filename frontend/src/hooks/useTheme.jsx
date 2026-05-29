import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'll_theme'
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'night' ? 'night' : 'day'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next === 'night' ? 'night' : 'day')
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'day' ? 'night' : 'day'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isNight: theme === 'night' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

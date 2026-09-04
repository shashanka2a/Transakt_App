import React, { createContext, useContext, useState } from 'react'
import { ThemeColors, lightColors, darkColors } from './theme/colors'

export type ThemeMode = 'dark' | 'light'

interface ThemeContextType {
  theme: ThemeMode
  colors: ThemeColors
  toggle: () => void
  setTheme: (t: ThemeMode) => void
  isDark: boolean
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggle: () => {},
  setTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const isDark = theme === 'dark'
  const colors = isDark ? darkColors : lightColors

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, colors, toggle, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

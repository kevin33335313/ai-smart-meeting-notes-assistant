"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SettingsContextType {
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
  focusMode: boolean
  showMindMap: boolean
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setTheme: (theme: 'light' | 'dark') => void
  setFocusMode: (enabled: boolean) => void
  setShowMindMap: (show: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [focusMode, setFocusMode] = useState(false)
  const [showMindMap, setShowMindMap] = useState(true)

  // 從localStorage載入設定
  useEffect(() => {
    const savedSettings = localStorage.getItem('noteSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setFontSize(settings.fontSize || 'medium')
      setTheme(settings.theme || 'light')
      setFocusMode(settings.focusMode || false)
      setShowMindMap(settings.showMindMap !== false)
    }
  }, [])

  // 保存設定到localStorage
  useEffect(() => {
    const settings = { fontSize, theme, focusMode, showMindMap }
    localStorage.setItem('noteSettings', JSON.stringify(settings))
    
    // 應用主題到document
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize, theme, focusMode, showMindMap])

  return (
    <SettingsContext.Provider value={{
      fontSize, theme, focusMode, showMindMap,
      setFontSize, setTheme, setFocusMode, setShowMindMap
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
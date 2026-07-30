'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Locale } from '@/lib/i18n'

// Locale Context
type LocaleContextType = {
  locale: Locale
  changeLocale: (l: Locale) => void
  t: typeof translations.uz
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: 'uz',
  changeLocale: () => {},
  t: translations.uz,
})

export function useT() {
  return useContext(LocaleContext)
}

function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('uz')

  useEffect(() => {
    const saved = localStorage.getItem('uz_locale') as Locale
    if (saved && ['uz', 'ru', 'en'].includes(saved)) {
      setLocale(saved)
    }
  }, [])

  const changeLocale = (l: Locale) => {
    setLocale(l)
    localStorage.setItem('uz_locale', l)
  }

  return (
    <LocaleContext.Provider value={{ locale, changeLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { translations, type Locale } from '@/lib/i18n'

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('uz')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && ['uz', 'ru', 'en'].includes(saved)) {
      setLocale(saved)
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = translations[locale]

  return { locale, changeLocale, t }
}

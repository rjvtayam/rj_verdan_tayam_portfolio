import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(
    () => document.documentElement.dataset.theme ?? 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0a0a0c' : '#f4f2ec')
    if (!localStorage.getItem('accent')) {
      document.documentElement.dataset.accent = theme === 'dark' ? 'lime' : 'flame'
    }
    window.dispatchEvent(new Event('theme:changed'))
  }, [theme])

  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme ?? 'light')
    window.addEventListener('theme:changed', sync)
    return () => window.removeEventListener('theme:changed', sync)
  }, [])

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="brutal-flat flex h-10 w-10 items-center justify-center bg-surface transition-colors hover:bg-accent hover:text-accent-ink"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

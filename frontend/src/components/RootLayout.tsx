import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import AnalyticsOverlay from './AnalyticsOverlay'
import BackToTop from './BackToTop'
import BootIntro from './BootIntro'
import CommandPalette from './CommandPalette'
import CustomCursor from './CustomCursor'
import LeftRail from './LeftRail'
import ProfileOverlay from './ProfileOverlay'
import ReadingProgress from './ReadingProgress'
import RightRail from './RightRail'
import Footer from './Footer'
import Header from './Header'
import { metaFor } from '../lib/seo'

export default function RootLayout() {
  const { pathname } = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [panel, setPanel] = useState<'profile' | 'analytics' | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  useEffect(() => {
    const { title, description } = metaFor(pathname)
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  }, [pathname])

  useEffect(() => {
    const onProfile = () => setPanel('profile')
    const onAnalytics = () => setPanel('analytics')
    window.addEventListener('hud:profile', onProfile)
    window.addEventListener('hud:analytics', onAnalytics)
    return () => {
      window.removeEventListener('hud:profile', onProfile)
      window.removeEventListener('hud:analytics', onAnalytics)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    const onOpen = () => setPaletteOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('palette:open', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('palette:open', onOpen)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <BootIntro />
      <CustomCursor />
      <LeftRail />
      <RightRail />
      <BackToTop />
      <ReadingProgress />
      <CommandPalette key={paletteOpen ? 'palette-open' : 'palette-closed'} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      {panel === 'profile' && <ProfileOverlay onClose={() => setPanel(null)} />}
      {panel === 'analytics' && <AnalyticsOverlay onClose={() => setPanel(null)} />}
    </div>
  )
}

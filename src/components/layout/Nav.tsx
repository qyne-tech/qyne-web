import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '../primitives/Logo'
import { buttonVariants } from '../primitives/Button'
import { NAV_LINKS, appUrl } from '../../lib/site'
import { cn } from '../../lib/utils'
import { EASE } from '../animations/ScrollReveal'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm transition-colors',
    isActive ? 'text-ink' : 'text-muted hover:text-ink',
  )

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const [prevPath, setPrevPath] = useState(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes. Reset-on-route-change is
  // done during render (React's "adjusting state on prop change" pattern) rather
  // than in an effect, which avoids a cascading re-render.
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setOpen(false)
  }

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-nav border-b transition-colors duration-300',
        scrolled || open
          ? 'border-border bg-bg/85 backdrop-blur-md'
          : 'border-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-12"
      >
        <Logo />

        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} to={link.href} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={appUrl('/login')}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden lg:inline-flex')}
          >
            Log in
          </a>
          <a
            href={appUrl('/signup')}
            className={cn(buttonVariants({ size: 'sm' }), 'hidden lg:inline-flex')}
          >
            Sign up
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden border-t border-border bg-bg lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5 sm:px-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-3 text-[15px] transition-colors',
                      isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <a
                href={appUrl('/login')}
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'mt-2 w-full')}
              >
                Log in
              </a>
              <a
                href={appUrl('/signup')}
                className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
              >
                Sign up
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

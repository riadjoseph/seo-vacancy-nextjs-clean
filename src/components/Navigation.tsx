'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { User, LogOut, Menu, X } from 'lucide-react'
import { SunshineIcon } from '@/components/ui/sunshine-icon'
import { useAuth } from '@/lib/auth-context'
import { ThemeToggle } from '@/components/theme-toggle'

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])
  
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <SunshineIcon className="h-6 w-6 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">SEO & GEO Jobs Europe</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              All Jobs
            </Link>
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/tools"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            {/** Removed desktop Search link */}
            
            {!loading && (
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <Link href="/my-jobs">
                      <Button variant="outline" size="sm" className="gap-1">
                        <User className="h-4 w-4" />
                        My Jobs
                      </Button>
                    </Link>
                    <Link href="/post-job">
                      <Button size="sm">
                        Post Job
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={signOut}
                      className="gap-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/magic-link">
                      <Button size="sm">
                        Post Job
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/blog" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start">Blog</Button>
              </Link>
              <Link href="/tools" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full justify-start">Tools</Button>
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/my-jobs" onClick={closeMobileMenu}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <User className="h-4 w-4" />
                          My Jobs
                        </Button>
                      </Link>
                      <Link href="/post-job" onClick={closeMobileMenu}>
                        <Button className="w-full">
                          Post Job
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => { signOut(); closeMobileMenu(); }}
                        className="w-full justify-start gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/magic-link" onClick={closeMobileMenu}>
                        <Button className="w-full">
                          Post Job
                        </Button>
                      </Link>
                    </>
                  )}
                  <div className="px-4">
                    <ThemeToggle />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

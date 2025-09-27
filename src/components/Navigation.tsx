'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { User, LogOut, Menu, X } from 'lucide-react'
import { SunshineIcon } from '@/components/ui/sunshine-icon'
import { useAuth } from '@/lib/auth-context'
import { createTagSlug } from '@/utils/tagUtils'
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
            <SunshineIcon className="h-6 w-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Wake Up Happy</span>
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

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-secondary-foreground mb-4">
              <SunshineIcon className="h-6 w-6 text-yellow-400" />
              <span>Wake Up Happy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Find your next SEO and tech career opportunity across Europe.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-secondary-foreground mb-4">Specializations</h3>
            <ul className="space-y-2 text-sm">
              {[
                'SEO Strategy & Management',
                'Technical SEO',
                'Enterprise SEO',
                'Analytics & Data SEO',
                'Local SEO',
              ].map((label) => (
                <li key={label}>
                  <Link href={`/tag/${createTagSlug(label)}`} className="hover:text-secondary-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-secondary-foreground mb-4">Popular Cities</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs/city/london" className="hover:text-secondary-foreground">London SEO Jobs</Link></li>
              <li><Link href="/jobs/city/berlin" className="hover:text-secondary-foreground">Berlin SEO Jobs</Link></li>
              <li><Link href="/jobs/city/amsterdam" className="hover:text-secondary-foreground">Amsterdam SEO Jobs</Link></li>
              <li><Link href="/jobs/city/paris" className="hover:text-secondary-foreground">Paris SEO Jobs</Link></li>
              <li><Link href="/jobs/city/barcelona" className="hover:text-secondary-foreground">Barcelona SEO Jobs</Link></li>
              <li><Link href="/jobs/city/madrid" className="hover:text-secondary-foreground">Madrid SEO Jobs</Link></li>
              <li><Link href="/jobs/city/munich" className="hover:text-secondary-foreground">Munich SEO Jobs</Link></li>
              <li><Link href="/jobs/city/leeds" className="hover:text-secondary-foreground">Leeds SEO Jobs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-secondary-foreground mb-4">Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-secondary-foreground">Blog</Link></li>
              <li><Link href="/tools" className="hover:text-secondary-foreground">Tools</Link></li>
              <li><Link href="/auth/magic-link" className="hover:text-secondary-foreground">Post a Job</Link></li>
              <li><Link href="/about" className="hover:text-secondary-foreground">About</Link></li>
              <li><Link href="/contact" className="hover:text-secondary-foreground">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-secondary-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-secondary-foreground">Terms of Service</Link></li>
              <li><a href="https://buymeacoffee.com/riadjoseph" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-foreground">☕ Buy Me a Coffee</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Wake Up Happy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

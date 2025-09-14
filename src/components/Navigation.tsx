'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, User, LogOut, Menu, X } from 'lucide-react'
import { SunshineIcon } from '@/components/ui/sunshine-icon'
import { useAuth } from '@/lib/auth-context'
import { createTagSlug } from '@/utils/tagUtils'

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
    <nav className="border-b bg-white">
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
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              All Jobs
            </Link>
            <Link 
              href="/blog" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/tools" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <SunshineIcon className="h-6 w-6 text-yellow-400" />
              <span>Wake Up Happy</span>
            </div>
            <p className="text-sm text-gray-400">
              Find your next SEO and tech career opportunity across Europe.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Specializations</h3>
            <ul className="space-y-2 text-sm">
              {[
                'SEO Strategy & Management',
                'Technical SEO',
                'Enterprise SEO',
                'Analytics & Data SEO',
                'Local SEO',
              ].map((label) => (
                <li key={label}>
                  <Link href={`/tag/${createTagSlug(label)}`} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Popular Cities</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs/city/london" className="hover:text-white">London SEO Jobs</Link></li>
              <li><Link href="/jobs/city/berlin" className="hover:text-white">Berlin SEO Jobs</Link></li>
              <li><Link href="/jobs/city/amsterdam" className="hover:text-white">Amsterdam SEO Jobs</Link></li>
              <li><Link href="/jobs/city/paris" className="hover:text-white">Paris SEO Jobs</Link></li>
              <li><Link href="/jobs/city/barcelona" className="hover:text-white">Barcelona SEO Jobs</Link></li>
              <li><Link href="/jobs/city/madrid" className="hover:text-white">Madrid SEO Jobs</Link></li>
              <li><Link href="/jobs/city/munich" className="hover:text-white">Munich SEO Jobs</Link></li>
              <li><Link href="/jobs/city/leeds" className="hover:text-white">Leeds SEO Jobs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/tools" className="hover:text-white">Tools</Link></li>
              <li><Link href="/auth/magic-link" className="hover:text-white">Post a Job</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Wake Up Happy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

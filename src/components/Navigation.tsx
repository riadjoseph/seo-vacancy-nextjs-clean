'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, User, LogOut } from 'lucide-react'
import { SunshineIcon } from '@/components/ui/sunshine-icon'
import { useAuth } from '@/lib/auth-context'

export function Navigation() {
  const { user, loading, signOut } = useAuth()
  
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <SunshineIcon className="h-6 w-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Wake Up Happy</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              All Jobs
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            
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
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
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
        </div>
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
            <h3 className="font-semibold text-white mb-4">Job Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs/tag/seo" className="hover:text-white">SEO Jobs</Link></li>
              <li><Link href="/jobs/tag/marketing" className="hover:text-white">Marketing Jobs</Link></li>
              <li><Link href="/jobs/tag/javascript" className="hover:text-white">JavaScript Jobs</Link></li>
              <li><Link href="/jobs/tag/remote" className="hover:text-white">Remote Jobs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Popular Cities</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs/city/london" className="hover:text-white">London</Link></li>
              <li><Link href="/jobs/city/berlin" className="hover:text-white">Berlin</Link></li>
              <li><Link href="/jobs/city/amsterdam" className="hover:text-white">Amsterdam</Link></li>
              <li><Link href="/jobs/city/paris" className="hover:text-white">Paris</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
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
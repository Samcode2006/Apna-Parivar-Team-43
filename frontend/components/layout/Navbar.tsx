'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, Home, Users, Heart, Mail, LogIn, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context-new'
import { useRouter } from 'next/navigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const navLinks = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'Features', href: '#features', icon: Users },
    { name: 'How It Works', href: '#how', icon: Heart },
    { name: 'Contact', href: '#contact', icon: Mail },
  ]

  const [activeId, setActiveId] = useState('home')
  const [theme, setTheme] = useState<'dark' | 'shadcn'>('dark')

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.slice(1)
      const el = document.getElementById(id)
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 64
        window.scrollTo({ top: y, behavior: 'smooth' })
        setActiveId(id)
      }
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'shadcn') {
        setTheme('shadcn')
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('shadcn')
      } else if (stored === 'dark') {
        setTheme('dark')
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('shadcn')
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          setTheme('dark')
          document.documentElement.classList.add('dark')
        } else {
          setTheme('shadcn')
          document.documentElement.classList.add('shadcn')
        }
      }
    } catch (e) {
      //
    }

    const sectionIds = ['home', 'features', 'how', 'testimonials', 'contact']
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = 80
          const scrollPos = window.scrollY + offset
          let current = 'home'
          for (const id of sectionIds) {
            const el = document.getElementById(id)
            if (el) {
              const top = el.offsetTop
              if (scrollPos >= top) {
                current = id
              }
            }
          }
          setActiveId(current)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'shadcn' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch (e) {}

    if (next === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('shadcn')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('shadcn')
    }
  }

  return (
    <nav className='fixed w-full top-0 z-50 bg-background border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <Link href='/' className='flex items-center space-x-2 group'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-black/50 transition-shadow'>
              <Image src={theme === 'shadcn' ? '/logolight.png' : '/logo.png'} alt='Apna Parivar Logo' width={42} height={42} className="w-8 h-8" />
            </div>
            <span className='text-xl font-bold hidden sm:inline text-foreground'>Apna Parivar</span>
          </Link>

          <div className='hidden md:flex items-center space-x-8'>
            {!isAuthenticated && navLinks.map((link) => {
              const Icon = link.icon
              const id = link.href.startsWith('#') ? link.href.slice(1) : ''
              const isActive = id && activeId === id
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-all duration-200 group ${
                    isActive ? 'text-foreground font-semibold bg-white/6 border border-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/2'
                  }`}
                >
                  <Icon size={18} className={`transition-colors ${isActive ? 'text-foreground' : 'group-hover:text-foreground'}`} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>

          <div className='flex items-center space-x-4'>
            <button
              onClick={toggleTheme}
              className='inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-sidebar/5 transition-colors'
              aria-label='Toggle theme'
            >
              {theme === 'dark' ? (
                <Sun size={18} className='text-foreground' />
              ) : (
                <Moon size={18} className='text-foreground' />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href={
                    user?.role === 'super_admin' ? '/admin' :
                    user?.role === 'family_admin' ? '/admin/dashboard' :
                    '/families'
                  }
                  className='hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-semibold bg-blue-600 text-white hover:bg-blue-700'
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>

                <div className='hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800'>
                  <div className='flex flex-col items-end text-sm'>
                    <span className='font-medium text-gray-900 dark:text-white'>{user?.email}</span>
                    <span className='text-xs text-gray-600 dark:text-gray-400 capitalize'>{user?.role?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className='hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-semibold bg-red-600 text-white hover:bg-red-700'
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-semibold ${
                  theme === 'shadcn' ? 'bg-foreground text-primary-foreground hover:shadow-lg hover:shadow-black/30' : 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30'
                }`}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className='md:hidden inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-sidebar/5 transition-colors'
              aria-label='Toggle navigation menu'
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='md:hidden bg-background border-t border-border'>
          <div className='px-4 py-4 space-y-2'>
            <div className='flex items-center justify-end px-2'>
              <button
                onClick={toggleTheme}
                className='inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/5'
              >
                {theme === 'dark' ? (
                  <Sun size={18} className='text-white' />
                ) : (
                  <Moon size={18} className='text-[#0f172a]' />
                )}
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <div className='px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg'>
                  <div className='text-sm font-medium text-gray-900 dark:text-white'>{user?.email}</div>
                  <div className='text-xs text-gray-600 dark:text-gray-400 capitalize'>{user?.role?.replace(/_/g, ' ')}</div>
                </div>

                <Link
                  href="/dashboard"
                  className='flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all'
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className='w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all'
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const id = link.href.startsWith('#') ? link.href.slice(1) : ''
                  const isActive = id && activeId === id
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive ? 'bg-white/6 text-foreground font-semibold border border-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.name}</span>
                    </Link>
                  )
                })}

                <Link
                  href="/login"
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all mt-4 font-semibold ${
                    theme === 'shadcn' ? 'bg-foreground text-primary-foreground' : 'bg-primary text-primary-foreground'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

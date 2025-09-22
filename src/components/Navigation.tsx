'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppIcons } from './icons/AppIcons'
import { useState } from 'react'

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pathname = usePathname()

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: AppIcons.Home,
      color: 'text-blue-600'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: AppIcons.Dashboard,
      color: 'text-blue-600'
    },
    {
      name: 'Students',
      href: '/students',
      icon: AppIcons.Students,
      color: 'text-blue-600'
    },
    {
      name: 'Guests',
      href: '/guests',
      icon: AppIcons.Guests,
      color: 'text-green-600'
    },
    {
      name: 'Professors',
      href: '/professors',
      icon: AppIcons.Professors,
      color: 'text-purple-600'
    },
    {
      name: 'Compose',
      href: '/compose',
      icon: AppIcons.Send,
      color: 'text-orange-600'
    },
    {
      name: 'Analytics',
      href: '/invitations',
      icon: AppIcons.Dashboard,
      color: 'text-indigo-600'
    }
  ]

  return (
    <nav className="bg-white shadow-xl sticky top-0 z-50 border-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
              <AppIcons.Rocket size={24} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Invitation System
              </span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg border-2 border-blue-200 transform scale-105'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-md hover:scale-105 border-2 border-transparent'
                  }`}
                >
                  <div className={`p-1 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-200' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <IconComponent 
                      size={16} 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'text-blue-700' 
                          : `${item.color} group-hover:scale-110`
                      }`}
                    />
                  </div>
                  <span className={`text-sm sm:text-base transition-all duration-300 ${
                    isActive 
                      ? 'font-semibold' 
                      : 'font-medium group-hover:font-semibold'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                  
                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    !isActive ? 'opacity-0 group-hover:opacity-10 bg-gradient-to-r from-blue-600 to-indigo-600' : ''
                  }`}></div>
                </Link>
              )
            })}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:shadow-md"
            >
              {isMobileMenuOpen ? (
                <AppIcons.Close size={20} className="text-gray-700" />
              ) : (
                <AppIcons.Menu size={20} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 sm:py-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="flex flex-col gap-2 sm:gap-3">
              {navItems.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 mx-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-lg border-2 border-blue-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:shadow-md border-2 border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-200' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent 
                        size={18} 
                        className={`transition-all duration-300 ${
                          isActive 
                            ? 'text-blue-700' 
                            : `${item.color} group-hover:scale-110`
                        }`}
                      />
                    </div>
                    <span className={`text-base sm:text-lg transition-all duration-300 ${
                      isActive 
                        ? 'font-semibold' 
                        : 'font-medium group-hover:font-semibold'
                    }`}>
                      {item.name}
                    </span>
                    
                    {/* Active indicator for mobile */}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>

  )
}

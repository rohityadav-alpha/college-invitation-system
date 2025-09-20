'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppIcons } from './icons/AppIcons'

export default function Navigation() {
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
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <AppIcons.Rocket size={28} className="text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              College Invitation System
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent 
                    size={18} 
                    className={isActive ? 'text-blue-700' : item.color} 
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

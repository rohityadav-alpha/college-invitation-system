'use client'
import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('admin-token')
    setIsAdmin(!!adminToken)
    setLoading(false)
  }, [])

  const login = async (password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.setItem('admin-token', result.token)
        setIsAdmin(true)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin-token')
    setIsAdmin(false)
  }

  return { isAdmin, loading, login, logout }
}

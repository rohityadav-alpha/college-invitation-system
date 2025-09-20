'use client'
import { useState } from 'react'
import AdminProtection from '@/components/AdminProtection'

export default function EmailTestPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const sendTestEmail = async () => {
    if (!email) {
      setResult('Please enter an email address')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ ${data.message}`)
      } else {
        setResult(`❌ ${data.error}`)
      }
    } catch (error) {
      setResult('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminProtection> 
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Email Service Test</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter test email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          
          <button
            onClick={sendTestEmail}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
          
          {result && (
            <div className={`p-3 rounded-lg ${
              result.includes('✅') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminProtection>
  )
}

'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import RouteGenerator from '@/components/RouteGenerator'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-6 pt-6">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold text-indigo-900 mb-2">
              🗺️ Wanderwise
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              AI-Powered Walking Tours • v0.3
            </p>
            <Link 
              href="/routes"
              className="inline-block text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View My Saved Routes →
            </Link>
          </div>
          
          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <RouteGenerator />
      </div>
    </div>
  )
}
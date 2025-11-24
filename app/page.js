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
        <div className="mb-6 pt-6">
          {/* Title - centered on mobile, left on desktop */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-2">
              🗺️ Wanderwise
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-3">
              AI-Powered Walking Tours • v0.3
            </p>
            <Link 
              href="/routes"
              className="inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm md:text-base"
            >
              View My Saved Routes →
            </Link>
          </div>
          
          {/* User menu - full width on mobile, compact on desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-600">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 break-all">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm whitespace-nowrap"
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
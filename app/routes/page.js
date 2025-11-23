'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { MapPin, Clock, Activity, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function SavedRoutes() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoutes(data || [])
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }

  // DELETE FUNCTION
  const deleteRoute = async (routeId, routeName) => {
    if (!confirm(`Are you sure you want to delete "${routeName}"? This cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId)

      if (error) throw error

      // Remove from local state
      setRoutes(routes.filter(route => route.id !== routeId))
      alert('Route deleted successfully')
    } catch (error) {
      console.error('Error deleting route:', error)
      alert('Failed to delete route. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-6">
          <Link 
            href="/"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            My Saved Routes
          </h1>
          <p className="text-gray-600">
            {routes.length} {routes.length === 1 ? 'route' : 'routes'} saved
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your routes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && routes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No saved routes yet!
            </p>
            <Link 
              href="/"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Generate Your First Route
            </Link>
          </div>
        )}

        {/* Routes Grid */}
        {!loading && routes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <div 
                key={route.id}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow relative"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteRoute(route.id, route.route_name)
                  }}
                  className="absolute top-4 right-4 bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors z-10"
                  title="Delete route"
                >
                  🗑️
                </button>

                {/* Make everything except delete button clickable */}
                <Link 
                  href={`/routes/${route.id}`}
                  className="block"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-12">
                      <h2 className="text-2xl font-bold text-indigo-900 mb-1">
                        {route.route_name}
                      </h2>
                      <p className="text-gray-600 font-medium">
                        {route.city}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-400 flex-shrink-0" size={24} />
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {route.overview}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                      <MapPin size={16} className="text-indigo-600" />
                      <span className="font-medium">{route.total_distance}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <Clock size={16} className="text-green-600" />
                      <span className="font-medium">{route.estimated_time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <Activity size={16} className="text-orange-600" />
                      <span className="font-medium">{route.difficulty}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    {route.interests} • Saved {new Date(route.created_at).toLocaleDateString()}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
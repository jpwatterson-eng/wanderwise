'use client'
import { use, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { MapPin, Clock, Activity } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-8 text-center" style={{ height: '500px' }}>
      <p className="text-gray-600">Loading map...</p>
    </div>
  )
})

export default function SharedRoute({ params }) {
  const { token } = use(params)
  const { user } = useAuth()
  const [route, setRoute] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    loadSharedRoute()
  }, [token])

  const loadSharedRoute = async () => {
    try {
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('share_token', token)
        .eq('is_shared', true)
        .single()

      if (routeError) throw routeError

      const { data: stopsData, error: stopsError } = await supabase
        .from('stops')
        .select('*')
        .eq('route_id', routeData.id)
        .order('stop_number', { ascending: true })

      if (stopsError) throw stopsError

      setRoute(routeData)
      setStops(stopsData || [])
    } catch (error) {
      console.error('Error loading shared route:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToMyRoutes = async () => {
    if (!user) {
      alert('Please sign in to copy this route to your account')
      return
    }

    setCopying(true)
    try {
      // Create a copy of the route
      const { data: newRoute, error: routeError } = await supabase
        .from('routes')
        .insert({
          user_id: user.id,
          route_name: `${route.route_name} (Copy)`,
          city: route.city,
          total_distance: route.total_distance,
          estimated_time: route.estimated_time,
          difficulty: route.difficulty,
          overview: route.overview,
          fitness_level: route.fitness_level,
          duration: route.duration,
          interests: route.interests,
          tips: route.tips,
          is_shared: false
        })
        .select()
        .single()

      if (routeError) throw routeError

      // Copy all stops
      const newStops = stops.map(stop => ({
        route_id: newRoute.id,
        stop_number: stop.stop_number,
        name: stop.name,
        description: stop.description,
        duration: stop.duration,
        walk_to_next: stop.walk_to_next,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude
      }))

      const { error: stopsError } = await supabase
        .from('stops')
        .insert(newStops)

      if (stopsError) throw stopsError

      alert('Route copied to your account! Redirecting...')
      window.location.href = `/routes/${newRoute.id}`
    } catch (error) {
      console.error('Error copying route:', error)
      alert('Failed to copy route. Please try again.')
    } finally {
      setCopying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-12 text-center">
          <p className="text-gray-600">Loading shared route...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-12 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Route Not Found</h1>
          <p className="text-gray-600 mb-6">
            This route doesn't exist or is no longer being shared.
          </p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Go to Wanderwise →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-6 flex items-center justify-between">
          <Link 
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Wanderwise Home
          </Link>
          
          {user && (
            <button
              onClick={copyToMyRoutes}
              disabled={copying}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {copying ? 'Copying...' : '📥 Copy to My Routes'}
            </button>
          )}
          
          {!user && (
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign In to Copy
            </Link>
          )}
        </div>

        {/* Shared badge */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-700 text-sm">
            📤 This route has been shared with you. {user ? 'Click "Copy to My Routes" to add it to your account and edit it.' : 'Sign in to copy this route to your account.'}
          </p>
        </div>

        {/* Route Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-indigo-900 mb-2">
              {route.route_name}
            </h1>
            <p className="text-gray-600 text-lg mb-4">{route.overview}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <MapPin size={18} className="text-indigo-600" />
                <span className="font-medium">{route.total_distance}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <Clock size={18} className="text-green-600" />
                <span className="font-medium">{route.estimated_time}</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                <Activity size={18} className="text-orange-600" />
                <span className="font-medium">{route.difficulty}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Route for:</span> {route.city} • {route.interests} • {route.fitness_level} • {route.duration} hours
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Route Map</h2>
            <RouteMap stops={stops} />
          </div>

          {/* Stops */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Route</h2>
            <div className="space-y-4">
              {stops.map((stop) => (
                <div key={stop.id} className="relative pl-8 pb-6 border-l-2 border-indigo-200 last:border-l-0 last:pb-0">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {stop.stop_number}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {stop.name}
                    </h3>
                    {stop.address && (
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {stop.address}
                      </p>
                    )}
                    <p className="text-gray-600 mb-3">{stop.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>⏱️ {stop.duration}</span>
                      {stop.walk_to_next && (
                        <span>🚶 {stop.walk_to_next} to next stop</span>
                      )}
                    </div>
                    {(stop.latitude && stop.longitude) && (
                      <div className="mt-3 flex items-center gap-3">
                        <p className="text-xs text-gray-400">
                          Coordinates: {stop.latitude}, {stop.longitude}
                        </p>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Get Directions →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {route.tips && route.tips.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">💡 Pro Tips</h2>
              <ul className="space-y-2">
                {route.tips.map((tip, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
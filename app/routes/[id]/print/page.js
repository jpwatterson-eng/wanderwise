'use client'
import { use, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PrintRoute({ params }) {
  const { id } = use(params)
  const [route, setRoute] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRouteDetails()
  }, [id])

  const loadRouteDetails = async () => {
    try {
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single()

      if (routeError) throw routeError

      const { data: stopsData, error: stopsError } = await supabase
        .from('stops')
        .select('*')
        .eq('route_id', id)
        .order('stop_number', { ascending: true })

      if (stopsError) throw stopsError

      setRoute(routeData)
      setStops(stopsData || [])
    } catch (error) {
      console.error('Error loading route:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-open print dialog after content loads
    if (!loading && route) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, route])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p>Loading route for export...</p>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p>Route not found</p>
      </div>
    )
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @page {
            margin: 1cm;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 21cm;
            margin: 2rem auto;
            padding: 2rem;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      <div className="print-container">
        {/* Screen-only controls */}
        <div className="no-print mb-6 flex gap-4 border-b pb-4">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={() => window.close()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        {/* Header */}
        <header className="mb-8 border-b-2 border-gray-300 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {route.route_name}
          </h1>
          <div className="text-lg text-gray-700 mb-4">
            <strong>{route.city}</strong> • {route.interests}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Distance:</strong> {route.total_distance}
            </div>
            <div>
              <strong>Time:</strong> {route.estimated_time}
            </div>
            <div>
              <strong>Difficulty:</strong> {route.difficulty}
            </div>
          </div>
        </header>

        {/* Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">{route.overview}</p>
        </section>

        {/* Route Details */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Route Details</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Fitness Level:</strong> {route.fitness_level}</p>
            <p><strong>Duration:</strong> {route.duration} hours</p>
            <p><strong>Generated:</strong> {new Date(route.created_at).toLocaleDateString()}</p>
          </div>
        </section>

        {/* Stops */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Walking Route</h2>
          
          {stops.map((stop, idx) => (
            <div 
              key={stop.id} 
              className={`mb-6 pb-6 border-b border-gray-200 ${idx > 2 && idx % 3 === 0 ? 'page-break' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {stop.stop_number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {stop.name}
                  </h3>
                  {stop.address && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {stop.address}
                    </p>
                  )}
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {stop.description}
                  </p>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>⏱️ <strong>Time here:</strong> {stop.duration}</span>
                    {stop.walk_to_next && (
                      <span>🚶 <strong>To next stop:</strong> {stop.walk_to_next}</span>
                    )}
                  </div>
                  {stop.latitude && stop.longitude && (
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates: {stop.latitude}, {stop.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Pro Tips */}
        {route.tips && route.tips.length > 0 && (
          <section className="mb-8 bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">💡 Pro Tips</h2>
            <ul className="space-y-2">
              {route.tips.map((tip, idx) => (
                <li key={idx} className="text-gray-700 flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-gray-300 text-sm text-gray-500 text-center">
          <p>Generated by Wanderwise • {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Have a wonderful walk in {route.city}!</p>
        </footer>
      </div>
    </>
  )
}
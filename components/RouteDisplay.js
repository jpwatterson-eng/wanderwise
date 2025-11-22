'use client'
import { useState } from 'react'
import { MapPin, Clock, Activity, Save, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RouteDisplay({ route, formData }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveRoute = async () => {
    setSaving(true)
    
    try {
      // Insert route into routes table
      const { data: routeRecord, error: routeError } = await supabase
        .from('routes')
        .insert({
          route_name: route.routeName,
          city: formData.city,
          total_distance: route.totalDistance,
          estimated_time: route.estimatedTime,
          difficulty: route.difficulty,
          overview: route.overview,
          fitness_level: formData.fitness,
          duration: formData.duration,
          interests: formData.interests,
          tips: route.tips
        })
        .select()
        .single()  // returns the created record (with its ID)

      if (routeError) throw routeError

      // Insert all stops
      const stopsToInsert = route.stops.map(stop => ({
        route_id: routeRecord.id,
        stop_number: stop.number,
        name: stop.name,
        description: stop.description,
        duration: stop.duration,
        walk_to_next: stop.walkToNext,
        address: stop.address || null,
        latitude: stop.latitude || null,
        longitude: stop.longitude || null
      }))

      const { error: stopsError } = await supabase
        .from('stops')
        .insert(stopsToInsert)

      if (stopsError) throw stopsError

      setSaved(true)
      console.log('Route saved successfully!')
    } catch (error) {
      console.error('Error saving route:', error)
      alert('Failed to save route. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!route) return null

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-3xl font-bold text-indigo-900">
            {route.routeName}
          </h2>
          
          {/* Save Button */}
          <button
            onClick={saveRoute}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              saved 
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400'
            }`}
          >
            {saved ? (
              <>
                <Check size={18} />
                Saved!
              </>
            ) : saving ? (
              <>
                <Save size={18} className="animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Route
              </>
            )}
          </button>
        </div>
        
        <p className="text-gray-600 text-lg mb-4">{route.overview}</p>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
            <MapPin size={18} className="text-indigo-600" />
            <span className="font-medium">{route.totalDistance}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
            <Clock size={18} className="text-green-600" />
            <span className="font-medium">{route.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
            <Activity size={18} className="text-orange-600" />
            <span className="font-medium">{route.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Stops */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Route</h3>
        <div className="space-y-4">
          {route.stops.map((stop, idx) => (
            <div key={idx} className="relative pl-8 pb-6 border-l-2 border-indigo-200 last:border-l-0 last:pb-0">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {stop.number}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  {stop.name}
                </h4>
                <p className="text-gray-600 mb-3">{stop.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>⏱️ {stop.duration}</span>
                  {stop.walkToNext && (
                    <span>🚶 {stop.walkToNext} to next stop</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2">
          {route.tips.map((tip, idx) => (
            <li key={idx} className="text-gray-700 flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
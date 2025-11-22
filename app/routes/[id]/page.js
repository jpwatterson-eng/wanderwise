'use client'
import { use, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MapPin, Clock, Activity, ArrowLeft } from 'lucide-react'
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

export default function RouteDetail({ params }) {
  // Unwrap params using React.use()
  const { id } = use(params)
  
  const [route, setRoute] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)  // ADD THIS
  const [editedRoute, setEditedRoute] = useState(null)  // ADD THIS
  const [editedStops, setEditedStops] = useState([])  // ADD THIS
  const [saving, setSaving] = useState(false)  // ADD THIS 

  // move from above 18/11/2025 despite previous issues

  useEffect(() => {
    loadRouteDetails()
  }, [id])

  const loadRouteDetails = async () => {
    try {
      // Load route
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single()

      if (routeError) throw routeError

      // Load stops for this route
      const { data: stopsData, error: stopsError } = await supabase
        .from('stops')
        .select('*')
        .eq('route_id', id)
        .order('stop_number', { ascending: true })

      if (stopsError) throw stopsError

      console.log('Loaded route from database:', routeData)
      console.log('Loaded stops from database:', stopsData)

      setRoute(routeData)
      setStops(stopsData || [])
    } catch (error) {
      console.error('Error loading route:', error)
    } finally {
      setLoading(false)
    }
  }

const enterEditMode = () => {
    // Create copies for editing
    setEditedRoute({ ...route })
    setEditedStops(stops.map(stop => ({ ...stop })))
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setEditedRoute(null)
    setEditedStops([])
  }

  const updateStop = (stopId, field, value) => {
    setEditedStops(prevStops =>
      prevStops.map(stop =>
        stop.id === stopId ? { ...stop, [field]: value } : stop
      )
    )
  }

  const updateRoute = (field, value) => {
    setEditedRoute(prev => ({ ...prev, [field]: value }))
  }

  const deleteStop = (stopId) => {
    if (!confirm('Are you sure you want to delete this stop?')) {
      return
    }
    
    // Remove from edited stops
    const remainingStops = editedStops.filter(stop => stop.id !== stopId)
    
    // Renumber remaining stops
    const renumberedStops = remainingStops.map((stop, index) => ({
      ...stop,
      stop_number: index + 1
    }))
    
    setEditedStops(renumberedStops)
  }

  const moveStopUp = (stopId) => {
    const index = editedStops.findIndex(stop => stop.id === stopId)
    if (index <= 0) return // Already at top
    
    const newStops = [...editedStops]
    // Swap with previous stop
    ;[newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]]
    
    // Renumber
    const renumberedStops = newStops.map((stop, idx) => ({
      ...stop,
      stop_number: idx + 1
    }))
    
    setEditedStops(renumberedStops)
  }

  const moveStopDown = (stopId) => {
    const index = editedStops.findIndex(stop => stop.id === stopId)
    if (index >= editedStops.length - 1) return // Already at bottom
    
    const newStops = [...editedStops]
    // Swap with next stop
    ;[newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]]
    
    // Renumber
    const renumberedStops = newStops.map((stop, idx) => ({
      ...stop,
      stop_number: idx + 1
    }))
    
    setEditedStops(renumberedStops)
  }

  const addNewStop = () => {
    const newStopNumber = editedStops.length + 1
    const newStop = {
      id: `temp-${Date.now()}`, // Temporary ID
      route_id: id,
      stop_number: newStopNumber,
      name: 'New Stop',
      description: 'Add description here',
      duration: '30 minutes',
      walk_to_next: '10 minutes',
      address: '',
      latitude: null,
      longitude: null,
      isNew: true // Flag to know it needs INSERT not UPDATE
    }
    
    setEditedStops([...editedStops, newStop])
  }

const saveChanges = async () => {
    setSaving(true)
    console.log('=== Starting save process ===')
    console.log('Route ID:', id)
    console.log('Route to save:', editedRoute)
    console.log('Stops to save:', editedStops)
    
    try {
      // Update route
      console.log('Updating route in Supabase...')
      const { data, error: routeError } = await supabase
        .from('routes')
        .update({
          route_name: editedRoute.route_name,
          overview: editedRoute.overview,
          total_distance: editedRoute.total_distance,
          estimated_time: editedRoute.estimated_time,
          difficulty: editedRoute.difficulty,
          tips: editedRoute.tips
        })
        .eq('id', id)
        .select()

      console.log('Route update response:', { data, error: routeError })
      
      if (routeError) {
        console.error('Route update failed:', routeError)
        throw routeError
      }

      // Handle deleted stops - delete any original stops not in editedStops
      const editedStopIds = editedStops
        .filter(stop => !stop.isNew)
        .map(stop => stop.id)
      
      const originalStopIds = stops.map(stop => stop.id)
      const deletedStopIds = originalStopIds.filter(id => !editedStopIds.includes(id))
      
      if (deletedStopIds.length > 0) {
        console.log('Deleting stops:', deletedStopIds)
        const { error: deleteError } = await supabase
          .from('stops')
          .delete()
          .in('id', deletedStopIds)
        
        if (deleteError) {
          console.error('Delete stops failed:', deleteError)
          throw deleteError
        }
      }

      // Update or insert stops
      console.log('Processing stops...')
      for (const stop of editedStops) {
        if (stop.isNew) {
          // Insert new stop
          console.log(`Inserting new stop ${stop.stop_number}:`, stop.name)
          
          const { data: insertData, error: insertError } = await supabase
            .from('stops')
            .insert({
              route_id: id,
              stop_number: stop.stop_number,
              name: stop.name,
              description: stop.description,
              duration: stop.duration,
              walk_to_next: stop.walk_to_next,
              address: stop.address,
              latitude: stop.latitude,
              longitude: stop.longitude
            })
            .select()

          console.log(`New stop ${stop.stop_number} response:`, { data: insertData, error: insertError })
          
          if (insertError) {
            console.error(`Insert stop ${stop.stop_number} failed:`, insertError)
            throw insertError
          }
        } else {
          // Update existing stop
          console.log(`Updating stop ${stop.stop_number}:`, stop.name)
          
          const { data: stopData, error: stopError } = await supabase
            .from('stops')
            .update({
              stop_number: stop.stop_number, // Update number in case of reordering
              name: stop.name,
              description: stop.description,
              duration: stop.duration,
              walk_to_next: stop.walk_to_next,
              address: stop.address,
              latitude: stop.latitude,
              longitude: stop.longitude
            })
            .eq('id', stop.id)
            .select()

          console.log(`Stop ${stop.stop_number} response:`, { data: stopData, error: stopError })
          
          if (stopError) {
            console.error(`Stop ${stop.stop_number} update failed:`, stopError)
            throw stopError
          }
        }
      }

      console.log('All updates successful! Reloading...')
      
      // Reload data and exit edit mode
      await loadRouteDetails()
      setEditMode(false)
      setEditedRoute(null)
      setEditedStops([])
      
      console.log('=== Save complete ===')
      alert('Changes saved successfully!')
      
    } catch (error) {
      console.error('=== Error during save ===', error)
      alert(`Failed to save changes: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // DELETE FUNCTION
  const deleteRoute = async () => {
    if (!confirm(`Are you sure you want to delete "${route.route_name}"? This cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Route deleted successfully')
      // Redirect to routes list
      window.location.href = '/routes'
    } catch (error) {
      console.error('Error deleting route:', error)
      alert('Failed to delete route. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-12 text-center">
          <p className="text-gray-600">Loading route...</p>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-12 text-center">
          <p className="text-gray-600 mb-4">Route not found</p>
          <Link href="/routes" className="text-indigo-600 hover:text-indigo-800">
            ← Back to My Routes
          </Link>
        </div>
      </div>
    )
  }

  // Use edited data if in edit mode, otherwise use original data
  const displayRoute = editMode ? editedRoute : route
  const displayStops = editMode ? editedStops : stops

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 pt-6 flex items-center justify-between">
          <Link 
            href="/routes"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ArrowLeft size={20} />
            Back to My Routes
          </Link>

          {/* Edit/Save/Cancel/Export Buttons */}
          {!editMode ? (
            <div className="flex gap-2">
              <button
                onClick={enterEditMode}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit Route
              </button>
              <a 
                href={`/routes/${id}/print`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Export / Print
              </a>
              <button
                onClick={deleteRoute}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ml-auto"
              >
                🗑️ Delete Route
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Route Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            {editMode ? (
              <input
                type="text"
                value={displayRoute.route_name}
                onChange={(e) => updateRoute('route_name', e.target.value)}
                className="text-3xl font-bold text-indigo-900 mb-2 w-full border border-gray-300 rounded px-2 py-1"
              />
            ) : (
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                {displayRoute.route_name}
              </h1>
            )}

            {editMode ? (
              <textarea
                value={displayRoute.overview}
                onChange={(e) => updateRoute('overview', e.target.value)}
                className="text-gray-600 text-lg mb-4 w-full border border-gray-300 rounded px-2 py-1 min-h-[60px]"
              />
            ) : (
              <p className="text-gray-600 text-lg mb-4">{displayRoute.overview}</p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <MapPin size={18} className="text-indigo-600" />
                {editMode ? (
                  <input
                    type="text"
                    value={displayRoute.total_distance}
                    onChange={(e) => updateRoute('total_distance', e.target.value)}
                    className="font-medium w-24 border border-gray-300 rounded px-1"
                  />
                ) : (
                  <span className="font-medium">{displayRoute.total_distance}</span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <Clock size={18} className="text-green-600" />
                {editMode ? (
                  <input
                    type="text"
                    value={displayRoute.estimated_time}
                    onChange={(e) => updateRoute('estimated_time', e.target.value)}
                    className="font-medium w-32 border border-gray-300 rounded px-1"
                  />
                ) : (
                  <span className="font-medium">{displayRoute.estimated_time}</span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                <Activity size={18} className="text-orange-600" />
                {editMode ? (
                  <select
                    value={displayRoute.difficulty}
                    onChange={(e) => updateRoute('difficulty', e.target.value)}
                    className="font-medium border border-gray-300 rounded px-1"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                ) : (
                  <span className="font-medium">{displayRoute.difficulty}</span>
                )}
              </div>
            </div>

            {/* Generation Details */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Generated for:</span> {displayRoute.city} • {displayRoute.interests} • {displayRoute.fitness_level} • {displayRoute.duration} hours
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Saved on {new Date(displayRoute.created_at).toLocaleDateString()} at {new Date(displayRoute.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* ADD MAP HERE */}
          {!editMode && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Route Map</h2>
              <RouteMap stops={displayStops} />
            </div>
          )}

          {/* Stops */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Route</h2>
            {displayStops.length === 0 ? (
              <p className="text-gray-500">No stops found for this route.</p>
            ) : (
              <div className="space-y-4">
                {displayStops.map((stop, idx) => (
<div key={stop.id} className="relative pl-8 pb-6 border-l-2 border-indigo-200 last:border-l-0 last:pb-0">
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {stop.stop_number}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {editMode ? (
                        <>
                          {/* ADD REORDER AND DELETE CONTROLS HERE - AT THE TOP OF EDIT MODE */}
                          <div className="flex gap-2 mb-3 pb-3 border-b border-gray-300">
                            <button
                              onClick={() => moveStopUp(stop.id)}
                              disabled={idx === 0}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑ Move Up
                            </button>
                            <button
                              onClick={() => moveStopDown(stop.id)}
                              disabled={idx === displayStops.length - 1}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓ Move Down
                            </button>
                            <button
                              onClick={() => deleteStop(stop.id)}
                              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 ml-auto"
                              title="Delete stop"
                            >
                              🗑️ Delete
                            </button>
                          </div>

                          {/* EXISTING EDIT FIELDS - KEEP ALL OF THESE */}
                          <input
                            type="text"
                            value={stop.name}
                            onChange={(e) => updateStop(stop.id, 'name', e.target.value)}
                            className="font-semibold text-lg text-gray-900 mb-2 w-full border border-gray-300 rounded px-2 py-1"
                          />
                          <textarea
                            value={stop.description}
                            onChange={(e) => updateStop(stop.id, 'description', e.target.value)}
                            className="text-gray-600 mb-3 w-full border border-gray-300 rounded px-2 py-1 min-h-[80px]"
                          />
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span>⏱️</span>
                              <input
                                type="text"
                                value={stop.duration}
                                onChange={(e) => updateStop(stop.id, 'duration', e.target.value)}
                                className="w-24 border border-gray-300 rounded px-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span>🚶</span>
                              <input
                                type="text"
                                value={stop.walk_to_next || ''}
                                onChange={(e) => updateStop(stop.id, 'walk_to_next', e.target.value)}
                                className="w-32 border border-gray-300 rounded px-1"
                                placeholder="Walk time"
                              />
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <input
                              type="text"
                              value={stop.address || ''}
                              onChange={(e) => updateStop(stop.id, 'address', e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                              placeholder="Address"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.000001"
                                value={stop.latitude || ''}
                                onChange={(e) => updateStop(stop.id, 'latitude', parseFloat(e.target.value))}
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                placeholder="Latitude"
                              />
                              <input
                                type="number"
                                step="0.000001"
                                value={stop.longitude || ''}
                                onChange={(e) => updateStop(stop.id, 'longitude', parseFloat(e.target.value))}
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                placeholder="Longitude"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
                      
          {/* Add New Stop Button (Edit Mode Only) */}
          {editMode && (
            <button
              onClick={addNewStop}
              className="w-full bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Add New Stop
            </button>
          )}

          </div>

          {/* Tips */}
          {displayRoute.tips && displayRoute.tips.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">💡 Pro Tips</h2>
              <ul className="space-y-2">
                {displayRoute.tips.map((tip, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => {
                          const newTips = [...displayRoute.tips]
                          newTips[idx] = e.target.value
                          updateRoute('tips', newTips)
                        }}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span>{tip}</span>
                    )}
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
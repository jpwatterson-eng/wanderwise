'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import RouteDisplay from './RouteDisplay'

export default function RouteGenerator() {
  // State for form inputs
  const [formData, setFormData] = useState({
    city: '',
    interests: '',
    fitness: 'moderate',
    duration: '2'
  })
  
  // State for generated route
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(true)

  const generateRoute = async () => {
    // Validation
    if (!formData.city || !formData.interests) {
      setError('Please fill in city and interests')
      return
    }

    setLoading(true)
    setError(null)
    setRoute(null)

    try {
      // Call our API route instead of calling Anthropic directly
      const response = await fetch('/api/generate-route', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: formData.city,
          interests: formData.interests,
          fitness: formData.fitness,
          duration: formData.duration
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const routeData = await response.json()
      setRoute(routeData)
      setShowForm(false)
    } catch (err) {
      console.error("Error generating route:", err)
      setError("Failed to generate route. Please try again.")
    } finally {
      setLoading(false)
    }
  }

 return (
    <div>
      {/* Conditional Rendering: Show form OR summary */}
      {showForm ? (
        /* Full Form View */
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Design Your Perfect Walk
          </h2>
          
          <div className="space-y-6">
            {/* City Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which city? 🌍
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="e.g., Paris, Tokyo, New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Interests Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you interested in? 🎨
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                placeholder="e.g., history and architecture, food and local culture"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Fitness Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitness Level 💪
              </label>
              <select
                value={formData.fitness}
                onChange={(e) => setFormData({...formData, fitness: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="easy">Easy - Leisurely pace, minimal hills</option>
                <option value="moderate">Moderate - Comfortable pace, some inclines</option>
                <option value="challenging">Challenging - Brisk pace, hills ok</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How much time? ⏱️
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">1 hour - Quick highlights</option>
                <option value="2">2 hours - Good overview</option>
                <option value="3">3 hours - Deep exploration</option>
                <option value="4">4+ hours - Full day adventure</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateRoute}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Crafting your perfect route...
                </>
              ) : (
                <>
                  Generate My Route ✨
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Compact Summary View */
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{formData.city}</span> • {formData.interests}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formData.fitness} • {formData.duration} hours
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="ml-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors whitespace-nowrap"
            >
              New Route
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Route Display */}
      <RouteDisplay route={route} formData={formData} />
    </div>
  )
}
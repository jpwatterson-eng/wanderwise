import Link from 'next/link'
import RouteGenerator from '@/components/RouteGenerator'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-6">
          <h1 className="text-5xl font-bold text-indigo-900 mb-2">
            🗺️ Wanderwise
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            AI-Powered Walking Tours • v1.0
          </p>
          <Link  
            href="/routes"
            className="inline-block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View My Saved Routes →
          </Link>
     
        </div>
        
        <RouteGenerator />
      </div>
    </div>
  )
}
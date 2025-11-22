'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to fit map bounds to all markers
function FitBounds({ positions }) {
  const map = useMap()
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [positions, map])
  
  return null
}

export default function RouteMap({ stops }) {
  // Filter stops that have coordinates
  const stopsWithCoords = stops.filter(stop => stop.latitude && stop.longitude)
  
  if (stopsWithCoords.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          No coordinates available for this route.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Generate a new route to get coordinates, or add them manually in edit mode.
        </p>
      </div>
    )
  }

  // Create array of coordinates for the route line
  const routeCoordinates = stopsWithCoords.map(stop => [stop.latitude, stop.longitude])
  
  // Calculate center point (average of all coordinates)
  const centerLat = stopsWithCoords.reduce((sum, stop) => sum + parseFloat(stop.latitude), 0) / stopsWithCoords.length
  const centerLng = stopsWithCoords.reduce((sum, stop) => sum + parseFloat(stop.longitude), 0) / stopsWithCoords.length

  // Create custom numbered markers
  const createNumberedIcon = (number) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: #4F46E5;
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${number}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw route line */}
        <Polyline
          positions={routeCoordinates}
          color="#4F46E5"
          weight={4}
          opacity={0.7}
        />
        
        {/* Add numbered markers for each stop */}
        {stopsWithCoords.map((stop, idx) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createNumberedIcon(stop.stop_number)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-base mb-1">{stop.name}</h3>
                {stop.address && (
                  <p className="text-sm text-gray-600 mb-2">{stop.address}</p>
                )}
                <p className="text-xs text-gray-500">Stop {stop.stop_number}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Fit map to show all markers */}
        <FitBounds positions={routeCoordinates} />
      </MapContainer>
    </div>
  )
}
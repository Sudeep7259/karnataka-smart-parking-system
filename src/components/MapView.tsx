"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation as NavigationIcon, Star, Zap, AlertTriangle } from "lucide-react";

// Fix for default marker icons in react-leaflet
const userIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyI+PC9jaXJjbGU+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Create custom marker with symbol
function createSymbolMarker(bgColor: string, symbol: string, textColor: string = "white", borderColor: string = "black"): L.Icon {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
        <path d="M20 0c-11 0-20 9-20 20 0 11 20 28 20 28s20-17 20-28c0-11-9-20-20-20z" 
              fill="${bgColor}" 
              stroke="${borderColor}" 
              stroke-width="3"/>
        <text x="20" y="26" 
              text-anchor="middle" 
              font-family="Arial Black, Impact, sans-serif" 
              font-size="16" 
              font-weight="900" 
              fill="${textColor}" 
              stroke="${borderColor}" 
              stroke-width="0.5">${symbol}</text>
      </svg>
    `)}`,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48]
  });
}

// Symbol-based markers for different parking types
const carIcon = createSymbolMarker("#22c55e", "🚗", "white", "black");
const bikeIcon = createSymbolMarker("#3b82f6", "🏍️", "white", "black");
const truckIcon = createSymbolMarker("#8b5cf6", "🚚", "white", "black");
const evIcon = createSymbolMarker("#10b981", "⚡", "yellow", "black");
const coveredIcon = createSymbolMarker("#f59e0b", "🏠", "white", "black");
const valetIcon = createSymbolMarker("#fbbf24", "👔", "black", "black");
const disabledIcon = createSymbolMarker("#06b6d4", "♿", "white", "black");
const securityIcon = createSymbolMarker("#64748b", "🛡️", "white", "black");

// Status-based markers with letters
const availableIconA = createSymbolMarker("#22c55e", "A", "white", "black");
const limitedIconL = createSymbolMarker("#f97316", "L", "white", "black");
const bookedIconF = createSymbolMarker("#ef4444", "F", "white", "black");
const premiumIconP = createSymbolMarker("#ffd700", "P", "black", "black");

// Selected/highlighted
const selectedIcon = createSymbolMarker("#22c55e", "★", "yellow", "white");

interface ParkingSpace {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price: number;
  availableSpots: number;
  totalSpots: number;
  rating: number;
  reviews: number;
  features?: string[];
  distance?: number;
}

interface MapViewProps {
  userLocation: { lat: number; lng: number } | null;
  parkingSpaces: ParkingSpace[];
  selectedSpace: ParkingSpace | null;
  onSpaceSelect: (space: ParkingSpace) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
}

// Determine parking space status based on availability
function getParkingStatus(space: ParkingSpace): 'available' | 'limited' | 'booked' | 'premium' {
  const availabilityPercent = (space.availableSpots / space.totalSpots) * 100;
  
  // Check if it's a premium spot (has special features)
  const premiumFeatures = ['EV Charging', 'Covered', 'Valet', 'Premium', 'VIP'];
  const isPremium = space.features?.some(f => 
    premiumFeatures.some(pf => f.toLowerCase().includes(pf.toLowerCase()))
  );
  
  if (isPremium && availabilityPercent > 0) {
    return 'premium';
  }
  
  if (space.availableSpots === 0) {
    return 'booked';
  }
  
  if (availabilityPercent <= 20) {
    return 'limited';
  }
  
  return 'available';
}

// Get the appropriate icon based on features and status
function getIconForSpace(space: ParkingSpace, isSelected: boolean): L.Icon {
  if (isSelected) {
    return selectedIcon;
  }
  
  const features = space.features?.map(f => f.toLowerCase()) || [];
  
  // Priority order for feature-based icons
  if (features.some(f => f.includes('valet'))) {
    return valetIcon;
  }
  if (features.some(f => f.includes('ev charging') || f.includes('electric'))) {
    return evIcon;
  }
  if (features.some(f => f.includes('covered') || f.includes('indoor'))) {
    return coveredIcon;
  }
  if (features.some(f => f.includes('disabled') || f.includes('handicap') || f.includes('wheelchair'))) {
    return disabledIcon;
  }
  if (features.some(f => f.includes('security') || f.includes('cctv') || f.includes('guard'))) {
    return securityIcon;
  }
  if (features.some(f => f.includes('truck') || f.includes('heavy vehicle'))) {
    return truckIcon;
  }
  if (features.some(f => f.includes('bike') || f.includes('motorcycle') || f.includes('two wheeler'))) {
    return bikeIcon;
  }
  if (features.some(f => f.includes('car') || f.includes('four wheeler'))) {
    return carIcon;
  }
  
  // Fall back to status-based icons with letters
  const status = getParkingStatus(space);
  
  switch (status) {
    case 'premium':
      return premiumIconP;
    case 'booked':
      return bookedIconF;
    case 'limited':
      return limitedIconL;
    case 'available':
    default:
      return availableIconA;
  }
}

// Get status badge
function getStatusBadge(space: ParkingSpace) {
  const status = getParkingStatus(space);
  
  switch (status) {
    case 'premium':
      return <Badge className="bg-yellow-500 text-black border-2 border-black dark:border-white font-bold"><Zap className="h-3 w-3 mr-1" />PREMIUM</Badge>;
    case 'booked':
      return <Badge variant="destructive" className="border-2 border-black dark:border-white font-bold">FULL</Badge>;
    case 'limited':
      return <Badge className="bg-orange-500 border-2 border-black dark:border-white font-bold"><AlertTriangle className="h-3 w-3 mr-1" />LIMITED</Badge>;
    case 'available':
    default:
      return <Badge className="bg-green-600 border-2 border-black dark:border-white font-bold">AVAILABLE</Badge>;
  }
}

export default function MapView({ userLocation, parkingSpaces, selectedSpace, onSpaceSelect }: MapViewProps) {
  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bangalore
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  const navigateToSpace = (space: ParkingSpace) => {
    if (space.latitude && space.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Your Location</p>
                </div>
              </Popup>
            </Marker>
            {/* 5km radius circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={5000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}

        {/* Parking Space Markers */}
        {parkingSpaces.map((space) => {
          if (!space.latitude || !space.longitude) return null;
          
          const isSelected = selectedSpace?.id === space.id;
          const icon = getIconForSpace(space, isSelected);

          return (
            <Marker
              key={space.id}
              position={[space.latitude, space.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSpaceSelect(space)
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-base flex-1 uppercase">{space.name}</h3>
                    {getStatusBadge(space)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1 font-medium">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{space.address}</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground font-bold uppercase">Available</div>
                      <div className={`font-black text-lg ${space.availableSpots === 0 ? 'text-red-600' : space.availableSpots <= (space.totalSpots * 0.2) ? 'text-orange-600' : 'text-green-600'}`}>
                        {space.availableSpots}/{space.totalSpots}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-bold uppercase">Price</div>
                      <div className="font-black text-lg">₹{space.price}/hr</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs bg-yellow-400 px-2 py-1 border-2 border-black dark:border-white w-fit">
                    <Star className="h-3 w-3 fill-black text-black" />
                    <span className="font-bold text-black">{space.rating.toFixed(1)}</span>
                    <span className="font-medium text-black">
                      ({space.reviews})
                    </span>
                  </div>

                  {space.distance !== undefined && (
                    <p className="text-xs font-bold mb-3 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {space.distance.toFixed(1)} km away
                    </p>
                  )}

                  {space.features && space.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {space.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs font-bold border-2 uppercase">
                          {feature}
                        </Badge>
                      ))}
                      {space.features.length > 3 && (
                        <Badge variant="outline" className="text-xs font-bold border-2">
                          +{space.features.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full border-2 border-black dark:border-white font-bold uppercase"
                    onClick={() => navigateToSpace(space)}
                  >
                    <NavigationIcon className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-black border-4 border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] z-[1000]">
        <h4 className="font-black text-sm mb-3 uppercase border-b-2 border-black dark:border-white pb-2">Map Legend</h4>
        
        <div className="space-y-3">
          {/* Feature-Based Symbols */}
          <div>
            <p className="text-xs font-black uppercase mb-2 text-muted-foreground">Features</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">⚡</div>
                <span className="font-bold">EV Charging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">🏠</div>
                <span className="font-bold">Covered Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">👔</div>
                <span className="font-bold">Valet Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">♿</div>
                <span className="font-bold">Disabled Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">🛡️</div>
                <span className="font-bold">Security/CCTV</span>
              </div>
            </div>
          </div>

          {/* Vehicle Types */}
          <div className="pt-3 border-t-2 border-black dark:border-white">
            <p className="text-xs font-black uppercase mb-2 text-muted-foreground">Vehicle Types</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">🚗</div>
                <span className="font-bold">Car Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">🏍️</div>
                <span className="font-bold">Bike Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 flex items-center justify-center text-lg">🚚</div>
                <span className="font-bold">Truck Parking</span>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="pt-3 border-t-2 border-black dark:border-white">
            <p className="text-xs font-black uppercase mb-2 text-muted-foreground">Availability</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 rounded-full bg-green-600 border-2 border-black dark:border-white flex items-center justify-center font-black text-white text-sm">A</div>
                <span className="font-bold">Available (20%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 rounded-full bg-orange-500 border-2 border-black dark:border-white flex items-center justify-center font-black text-white text-sm">L</div>
                <span className="font-bold">Limited (&lt;20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 rounded-full bg-red-600 border-2 border-black dark:border-white flex items-center justify-center font-black text-white text-sm">F</div>
                <span className="font-bold">Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 rounded-full bg-yellow-500 border-2 border-black flex items-center justify-center font-black text-black text-sm">P</div>
                <span className="font-bold">Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-lg">★</div>
                <span className="font-bold">Selected</span>
              </div>
            </div>
          </div>

          {/* User Location */}
          <div className="pt-3 border-t-2 border-black dark:border-white">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-bold">Your Location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
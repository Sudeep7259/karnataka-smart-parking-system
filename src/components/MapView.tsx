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

// Available parking (green) - plenty of spots
const availableIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjJjNTVlIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTIxIDEwYzAgNy05IDEzLTkgMTNzLTktNi05LTEzYTkgOSAwIDAgMCAxOCAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Limited availability (orange) - few spots left
const limitedIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZjk3MzE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTIxIDEwYzAgNy05IDEzLTkgMTNzLTktNi05LTEzYTkgOSAwIDAgMCAxOCAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Fully booked (red) - no spots available
const bookedIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZWYzNDRhIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTIxIDEwYzAgNy05IDEzLTkgMTNzLTktNi05LTEzYTkgOSAwIDAgMCAxOCAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IndoaXRlIi8+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Premium parking (gold/purple) - special features
const premiumIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmZkNzAwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAwIDE4IDBaIi8+PHBhdGggZD0iTTEyIDdhMyAzIDAgMCAxIDMgM3YzYTMgMyAwIDAgMS02IDBWMTBhMyAzIDAgMCAxIDMtM1oiIGZpbGw9IiMwMDAiLz48L3N2Zz4=",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Selected/highlighted (larger green)
const selectedIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMjJjNTVlIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMSAxMGMwIDctOSAxMy05IDEzczktNiA5LTEzYTkgOSAwIDAgMC0xOCAwYzAgNyA5IDEzIDkgMTNzOS02IDktMTNaIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iNCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

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

// Get the appropriate icon based on status
function getIconForSpace(space: ParkingSpace, isSelected: boolean): L.Icon {
  if (isSelected) {
    return selectedIcon;
  }
  
  const status = getParkingStatus(space);
  
  switch (status) {
    case 'premium':
      return premiumIcon;
    case 'booked':
      return bookedIcon;
    case 'limited':
      return limitedIcon;
    case 'available':
    default:
      return availableIcon;
  }
}

// Get status badge
function getStatusBadge(space: ParkingSpace) {
  const status = getParkingStatus(space);
  
  switch (status) {
    case 'premium':
      return <Badge className="bg-yellow-500 text-black"><Zap className="h-3 w-3 mr-1" />Premium</Badge>;
    case 'booked':
      return <Badge variant="destructive">Fully Booked</Badge>;
    case 'limited':
      return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Limited</Badge>;
    case 'available':
    default:
      return <Badge className="bg-green-600">Available</Badge>;
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
                <div className="min-w-[200px] p-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base flex-1">{space.name}</h3>
                    {getStatusBadge(space)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{space.address}</span>
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Available</div>
                      <div className={`font-semibold ${space.availableSpots === 0 ? 'text-red-600' : space.availableSpots <= (space.totalSpots * 0.2) ? 'text-orange-600' : 'text-green-600'}`}>
                        {space.availableSpots}/{space.totalSpots}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-semibold">₹{space.price}/hr</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{space.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({space.reviews} reviews)
                    </span>
                  </div>

                  {space.distance !== undefined && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {space.distance.toFixed(1)} km away
                    </p>
                  )}

                  {space.features && space.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {space.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
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
      <div className="absolute bottom-4 right-4 bg-white dark:bg-black border-2 border-black dark:border-white p-4 rounded-lg shadow-lg z-[1000] manga-panel">
        <h4 className="font-bold text-sm mb-3 uppercase">Map Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-medium">Available (20%+ spots)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-medium">Limited (&lt;20% spots)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-medium">Fully Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-black flex items-center justify-center">
              <Zap className="w-3 h-3 text-black" />
            </div>
            <span className="font-medium">Premium Parking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-medium">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
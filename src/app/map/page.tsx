"use client";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Navigation as NavigationIcon,
  Locate,
  Star,
  DollarSign,
  Share2,
  Bookmark,
  Filter,
  X,
  Clock,
  Car,
  Bike,
  Zap,
  ArrowRight,
  Phone,
  MessageCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Dynamic import for map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="text-center">
        <Car className="h-12 w-12 animate-bounce mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
});

interface ParkingSpace {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price: number;
  peakPrice?: number;
  offPeakPrice?: number;
  availableSpots: number;
  totalSpots: number;
  rating: number;
  reviews: number;
  vehicleTypes: string[];
  features: string[];
  distance?: number;
  image?: string;
}

interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'office' | 'custom';
}

export default function MapFinder() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<ParkingSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [vehicleFilter, setVehicleFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedParkingLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  // Fetch parking spaces from API
  const fetchParkingSpaces = async (lat?: number, lng?: number) => {
    setIsLoadingSpaces(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/parking-spaces", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const spaces = await response.json();
        
        // Calculate distance if user location is available
        const spacesWithDistance = spaces.map((space: ParkingSpace) => {
          if (lat && lng && space.latitude && space.longitude) {
            const distance = calculateDistance(lat, lng, space.latitude, space.longitude);
            return { ...space, distance };
          }
          return space;
        });
        
        setParkingSpaces(spacesWithDistance);
      }
    } catch (error) {
      console.error("Error fetching parking spaces:", error);
      toast.error("Failed to load parking spaces");
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  // Get user's current location
  const locateUser = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        toast.success("Location detected!");
        fetchParkingSpaces(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get your location. Please enable location services.");
        setIsLocating(false);
        // Fallback to Bangalore center
        setUserLocation({ lat: 12.9716, lng: 77.5946 });
        fetchParkingSpaces(12.9716, 77.5946);
      }
    );
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter and sort parking spaces
  useEffect(() => {
    let filtered = [...parkingSpaces];

    // Filter by radius
    if (userLocation) {
      filtered = filtered.filter(space => {
        if (!space.distance) return true;
        return space.distance <= searchRadius;
      });
    }

    // Filter by vehicle type
    if (vehicleFilter.length > 0) {
      filtered = filtered.filter(space =>
        vehicleFilter.some(type => space.vehicleTypes?.includes(type))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredSpaces(filtered);
  }, [parkingSpaces, searchRadius, vehicleFilter, sortBy, userLocation]);

  // Auto-locate on mount
  useEffect(() => {
    locateUser();
  }, []);

  const toggleVehicleFilter = (type: string) => {
    setVehicleFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const navigateToSpace = (space: ParkingSpace) => {
    if (space.latitude && space.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}&travelmode=driving`;
      window.open(url, '_blank');
      toast.success("Opening navigation in Google Maps");
    } else {
      toast.error("Location coordinates not available");
    }
  };

  const shareLocation = (space: ParkingSpace) => {
    const shareText = `Check out ${space.name} - ${space.address}. Available parking: ${space.availableSpots} spots. ₹${space.price}/hour`;
    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${space.latitude},${space.longitude}`;
    
    if (navigator.share) {
      navigator.share({
        title: space.name,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Location link copied to clipboard!");
  };

  const saveLocation = (space: ParkingSpace, type: 'home' | 'office' | 'custom' = 'custom') => {
    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name: space.name,
      latitude: space.latitude,
      longitude: space.longitude,
      type
    };
    
    const updated = [...savedLocations, newLocation];
    setSavedLocations(updated);
    localStorage.setItem('savedParkingLocations', JSON.stringify(updated));
    toast.success(`Saved ${space.name} to favorites`);
  };

  const findNearestCheapest = () => {
    if (filteredSpaces.length === 0) {
      toast.error("No parking spaces available in your area");
      return;
    }

    // Find spaces with good balance of distance and price
    const scored = filteredSpaces.map(space => ({
      space,
      score: (space.distance || 0) * 0.5 + space.price * 0.5
    }));
    
    scored.sort((a, b) => a.score - b.score);
    const best = scored[0].space;
    
    setSelectedSpace(best);
    toast.success(`Found best option: ${best.name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-full md:w-96 border-r overflow-y-auto bg-background">
          <div className="p-4 border-b bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Find Parking</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredSpaces.length} spaces available
                </p>
              </div>
              <Button
                onClick={locateUser}
                disabled={isLocating}
                size="sm"
                className="gap-2"
              >
                <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Locating...' : 'Locate Me'}
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={findNearestCheapest}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Best Option
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Filters</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Radius */}
                  <div>
                    <Label className="text-xs">Search Radius: {searchRadius} km</Label>
                    <Slider
                      value={[searchRadius]}
                      onValueChange={(value) => setSearchRadius(value[0])}
                      min={1}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <Label className="text-xs mb-2 block">Vehicle Type</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={vehicleFilter.includes('2-wheeler') ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleVehicleFilter('2-wheeler')}
                      >
                        <Bike className="h-3 w-3 mr-1" />
                        2-Wheeler
                      </Badge>
                      <Badge
                        variant={vehicleFilter.includes('4-wheeler') ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleVehicleFilter('4-wheeler')}
                      >
                        <Car className="h-3 w-3 mr-1" />
                        4-Wheeler
                      </Badge>
                      <Badge
                        variant={vehicleFilter.includes('EV') ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleVehicleFilter('EV')}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        EV Charging
                      </Badge>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <Label className="text-xs mb-2 block">Sort By</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={sortBy === 'distance' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSortBy('distance')}
                      >
                        Distance
                      </Badge>
                      <Badge
                        variant={sortBy === 'price' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSortBy('price')}
                      >
                        Price
                      </Badge>
                      <Badge
                        variant={sortBy === 'rating' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSortBy('rating')}
                      >
                        Rating
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Parking Spaces List */}
          <div className="p-4 space-y-4">
            {isLoadingSpaces ? (
              <div className="text-center py-8">
                <Car className="h-8 w-8 animate-bounce mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading parking spaces...</p>
              </div>
            ) : filteredSpaces.length === 0 ? (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No parking spaces found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search radius
                </p>
                <Button onClick={() => setSearchRadius(20)}>
                  Expand Search
                </Button>
              </Card>
            ) : (
              filteredSpaces.map((space) => (
                <Card
                  key={space.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedSpace?.id === space.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedSpace(space)}
                >
                  {space.image && (
                    <div
                      className="h-32 bg-cover bg-center rounded-t-lg"
                      style={{ backgroundImage: `url(${space.image})` }}
                    />
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{space.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {space.address}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareLocation(space);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveLocation(space);
                          }}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Available</div>
                        <div className="font-semibold text-sm">
                          {space.availableSpots}/{space.totalSpots}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Price</div>
                        <div className="font-semibold text-sm">₹{space.price}/hr</div>
                      </div>
                      {space.distance !== undefined && (
                        <div>
                          <div className="text-xs text-muted-foreground">Distance</div>
                          <div className="font-semibold text-sm">
                            {space.distance.toFixed(1)} km
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{space.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({space.reviews} reviews)
                      </span>
                    </div>

                    {space.features && space.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {space.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToSpace(space);
                        }}
                      >
                        <NavigationIcon className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div className="hidden md:block flex-1 relative">
          <MapComponent
            userLocation={userLocation}
            parkingSpaces={filteredSpaces}
            selectedSpace={selectedSpace}
            onSpaceSelect={setSelectedSpace}
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import Navigation from "@/components/Navigation";
import WalletCard from "@/components/WalletCard";
import AchievementsCard from "@/components/AchievementsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UPIPayment } from "@/components/UPIPayment";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Star,
  Car,
  Shield,
  CreditCard,
  Navigation as NavigationIcon,
  Filter,
  Wallet,
  XCircle,
  Edit,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle2,
  Locate,
  X,
  ArrowUpDown,
  Zap,
  MapIcon
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomerDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDuration, setBookingDuration] = useState(1);
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedBookingForUpload, setSelectedBookingForUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const fileInputRef = useRef(null);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [filterRadius, setFilterRadius] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/customer");
    }
  }, [session, isPending, router]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
        toast.success("Location detected! Showing nearby parking spaces");
        
        // Update spaces with distance
        const updatedSpaces = spaces.map(space => {
          if (space.latitude && space.longitude) {
            const distance = calculateDistance(latitude, longitude, space.latitude, space.longitude);
            return { ...space, distance };
          }
          return space;
        });
        
        // Sort by distance
        updatedSpaces.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        setSpaces(updatedSpaces);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get your location. Please enable location services.");
        setIsLocating(false);
      }
    );
  };

  // Fetch parking spaces
  const fetchSpaces = async () => {
    try {
      setIsLoadingSpaces(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/parking-spaces?status=active&limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch parking spaces");
      }

      const data = await response.json();
      setSpaces(data);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      toast.error("Failed to load parking spaces");
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoadingBookings(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/bookings?customer_id=${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchSpaces();
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session?.user?.id]);

  // Handle Google Maps navigation
  const handleNavigate = (booking) => {
    const space = spaces.find(s => s.id === booking.parkingSpaceId);
    if (!space) {
      toast.error("Parking space details not found");
      return;
    }

    if (space.latitude && space.longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`;
      window.open(mapsUrl, "_blank");
    } else {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.location || space.address || space.name)}`;
      window.open(searchUrl, "_blank");
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      setIsCancelling(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          cancellation_reason: cancellationReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      setCancelDialogOpen(false);
      setCancellationReason("");
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle booking modification
  const handleModifyBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      booking_id: selectedBooking.id,
    };

    const newDate = formData.get("date");
    const newStartTime = formData.get("startTime");
    const newEndTime = formData.get("endTime");

    if (newDate) updates.date = newDate;
    if (newStartTime) updates.startTime = newStartTime;
    if (newEndTime) updates.endTime = newEndTime;

    try {
      setIsModifying(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/bookings/modify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to modify booking");
      }

      toast.success("Booking modified successfully");
      setModifyDialogOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error modifying booking:", error);
      toast.error(error.message || "Failed to modify booking");
    } finally {
      setIsModifying(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Only .jpg, .png, and .pdf files are allowed");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
  };

  // Handle screenshot upload submission
  const handleUploadScreenshot = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const bookingIdToUse = selectedBookingForUpload?.id || pendingBookingId;
    if (!bookingIdToUse) {
      toast.error("No booking selected");
      return;
    }

    try {
      setIsUploading(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const screenshotUrl = reader.result;

        const token = localStorage.getItem("bearer_token");
        const response = await fetch("/api/bookings/upload-screenshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booking_id: bookingIdToUse,
            screenshot_url: screenshotUrl,
            transaction_id: transactionId.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload screenshot");
        }

        toast.success("Payment proof uploaded successfully! Your booking is pending verification.");
        setUploadDialogOpen(false);
        setBookingDialogOpen(false);
        setSelectedBookingForUpload(null);
        setPendingBookingId(null);
        setUploadedFile(null);
        setTransactionId("");
        setBookingStep(1);
        setSelectedSpace(null);
        setBookingDate("");
        setBookingStartTime("");
        fetchBookings();
        
        // Show info about next steps
        toast.info("Admin will verify your payment and confirm your booking shortly.");
      };
      reader.readAsDataURL(uploadedFile);
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      toast.error(error.message || "Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  // Get availability status
  const getAvailabilityStatus = (space) => {
    const spots = space.availableSpots || 0;
    if (spots === 0) return { text: "Full", color: "bg-destructive", textColor: "text-destructive" };
    if (spots <= 2) return { text: "Limited", color: "bg-orange-500", textColor: "text-orange-500" };
    return { text: "Available", color: "bg-green-600", textColor: "text-green-600" };
  };

  // Apply filters and sorting
  const getFilteredAndSortedSpaces = () => {
    let filtered = spaces.filter(space => 
      searchLocation === "" || 
      space.location?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      space.city?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      space.name?.toLowerCase().includes(searchLocation.toLowerCase())
    );

    // Filter by radius
    if (filterRadius !== "all" && userLocation) {
      const radius = parseFloat(filterRadius);
      filtered = filtered.filter(space => 
        space.distance !== undefined && space.distance <= radius
      );
    }

    // Filter by vehicle type
    if (vehicleTypeFilter !== "all") {
      filtered = filtered.filter(space => 
        space.features?.some(f => 
          f.toLowerCase().includes(vehicleTypeFilter.toLowerCase())
        )
      );
    }

    // Sort
    switch (sortBy) {
      case "distance":
        filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "availability":
        filtered.sort((a, b) => (b.availableSpots || 0) - (a.availableSpots || 0));
        break;
    }

    return filtered;
  };

  const filteredSpaces = getFilteredAndSortedSpaces();

  const handleBooking = (space) => {
    setSelectedSpace(space);
    setBookingStep(1);
  };

  const calculateTotal = () => {
    if (!selectedSpace) return 0;
    return selectedSpace.price * bookingDuration;
  };

  const handlePaymentComplete = async () => {
    if (!session?.user?.id || !selectedSpace || !bookingDate || !bookingStartTime) {
      toast.error("Please fill in all booking details");
      return;
    }

    try {
      // Calculate end time based on duration
      const startMinutes = parseInt(bookingStartTime.split(':')[0]) * 60 + parseInt(bookingStartTime.split(':')[1]);
      const endMinutes = startMinutes + (bookingDuration * 60);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      // Create booking with PENDING status - requires payment verification
      const token = localStorage.getItem("bearer_token");
      const bookingPayload = {
        customerId: session.user.id,
        parkingSpaceId: selectedSpace.id,
        customerName: session.user.name || "Customer",
        date: bookingDate,
        startTime: bookingStartTime,
        endTime: endTime,
        duration: `${bookingDuration} hours`,
        amount: calculateTotal(),
        status: "pending" // Changed from "confirmed" to "pending"
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      const newBooking = await response.json();
      
      // Store the booking ID and show upload dialog
      setPendingBookingId(newBooking.id);
      setBookingStep(3); // Move to upload step
      
      toast.success("Booking created! Please upload your payment proof to complete.");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking");
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'verified':
        return <Badge className="bg-green-600 border-2 border-black"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="border-2 border-black"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="border-2 border-black"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  // Clear location
  const clearLocation = () => {
    setUserLocation(null);
    setSpaces(spaces.map(s => ({ ...s, distance: undefined })));
    toast.info("Location cleared");
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">LOADING...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Location */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 uppercase">FIND PARKING</h1>
              <p className="text-muted-foreground font-medium">Search across Karnataka</p>
            </div>
            <div className="flex gap-2">
              {userLocation && (
                <Button
                  onClick={clearLocation}
                  variant="outline"
                  size="lg"
                  className="gap-2 font-bold border-2"
                >
                  <X className="h-5 w-5" />
                  CLEAR
                </Button>
              )}
              <Button
                onClick={locateUser}
                disabled={isLocating}
                size="lg"
                className="gap-2 font-bold border-2 border-black dark:border-white"
              >
                <Locate className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
                {isLocating ? 'LOCATING...' : 'LOCATE ME'}
              </Button>
            </div>
          </div>

          {/* Location Status Banner */}
          {userLocation && (
            <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-none bg-black dark:bg-white flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-lg uppercase">Location Active</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Showing {filteredSpaces.length} parking spaces sorted by distance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Wallet & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WalletCard />
          <AchievementsCard />
        </div>

        {/* Search & Filter Bar */}
        <Card className="mb-8 border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Main Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by location, city, or name..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-10 border-2 border-black dark:border-white font-medium"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full border-2 border-black dark:border-white font-bold"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-4 border-t-2 border-black dark:border-white">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-bold uppercase mb-2 block">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="border-2 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="distance">Distance</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="availability">Availability</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold uppercase mb-2 block">Radius</Label>
                      <Select value={filterRadius} onValueChange={setFilterRadius} disabled={!userLocation}>
                        <SelectTrigger className="border-2 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="1">Within 1 km</SelectItem>
                          <SelectItem value="3">Within 3 km</SelectItem>
                          <SelectItem value="5">Within 5 km</SelectItem>
                          <SelectItem value="10">Within 10 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold uppercase mb-2 block">Vehicle Type</Label>
                      <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                        <SelectTrigger className="border-2 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        className="w-full border-2 font-bold"
                        onClick={() => {
                          setFilterRadius("all");
                          setVehicleTypeFilter("all");
                          setSortBy("distance");
                          setSearchLocation("");
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        RESET
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="border-2 border-black dark:border-white">
            <TabsTrigger value="available" className="font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              Available Spaces
            </TabsTrigger>
            <TabsTrigger value="bookings" className="font-bold uppercase data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black">
              My Bookings
            </TabsTrigger>
          </TabsList>

          {/* Available Spaces Tab */}
          <TabsContent value="available" className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted border-2 border-black dark:border-white">
              <div>
                <p className="font-bold text-lg">
                  {filteredSpaces.length} PARKING SPACES
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {userLocation && "Sorted by distance • "}
                  {sortBy === "price-low" && "Sorted by price (low to high) • "}
                  {sortBy === "price-high" && "Sorted by price (high to low) • "}
                  {sortBy === "rating" && "Sorted by rating • "}
                  {sortBy === "availability" && "Sorted by availability • "}
                  {filterRadius !== "all" && `Within ${filterRadius}km`}
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-2 font-bold" asChild>
                <a href="/map" target="_blank">
                  <MapIcon className="mr-2 h-4 w-4" />
                  MAP VIEW
                </a>
              </Button>
            </div>

            {isLoadingSpaces ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredSpaces.length === 0 ? (
              <Card className="p-12 text-center border-4 border-black dark:border-white">
                <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2 uppercase">No Parking Spaces Found</h3>
                <p className="text-muted-foreground font-medium mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={() => {
                  setFilterRadius("all");
                  setVehicleTypeFilter("all");
                  setSearchLocation("");
                }} className="font-bold">
                  CLEAR ALL FILTERS
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpaces.map((space) => {
                  const status = getAvailabilityStatus(space);
                  return (
                    <Card 
                      key={space.id} 
                      className="overflow-hidden border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                    >
                      <div 
                        className="h-48 bg-muted bg-cover bg-center relative flex items-center justify-center border-b-4 border-black dark:border-white"
                        style={space.imageUrl ? { backgroundImage: `url(${space.imageUrl})` } : {}}
                      >
                        {!space.imageUrl && (
                          <Car className="h-16 w-16 text-muted-foreground" />
                        )}
                        
                        {/* Availability Badge */}
                        <Badge className={`absolute top-3 right-3 ${status.color} border-2 border-black dark:border-white font-bold px-3 py-1`}>
                          {space.availableSpots || 0} {status.text.toUpperCase()}
                        </Badge>
                        
                        {/* Distance Badge */}
                        {space.distance !== undefined && (
                          <Badge className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black font-bold px-3 py-1">
                            <Zap className="h-3 w-3 mr-1" />
                            {space.distance.toFixed(1)} KM
                          </Badge>
                        )}
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2 uppercase font-black">{space.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-sm font-medium">
                              <MapPin className="h-4 w-4" />
                              {space.location}
                            </CardDescription>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex items-center gap-1 bg-yellow-400 border-2 border-black dark:border-white px-2 py-1">
                            <Star className="h-4 w-4 fill-black text-black" />
                            <span className="text-sm font-bold text-black">{space.rating || 0}</span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">({space.reviews || 0} reviews)</span>
                        </div>

                        {/* Features */}
                        {space.features && space.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 py-3 border-t-2 border-black dark:border-white">
                            {space.features.slice(0, 3).map((feature, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs font-bold border-2 uppercase"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {space.features.length > 3 && (
                              <Badge variant="outline" className="text-xs font-bold border-2">
                                +{space.features.length - 3} MORE
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Price & Booking */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-black dark:border-white">
                          <div>
                            <div className="text-3xl font-black">₹{space.price}</div>
                            <div className="text-xs font-bold text-muted-foreground uppercase">{space.priceType || 'per hour'}</div>
                          </div>
                          <Dialog open={bookingDialogOpen && selectedSpace?.id === space.id} onOpenChange={(open) => {
                            setBookingDialogOpen(open);
                            if (!open) {
                              setBookingStep(1);
                              setSelectedSpace(null);
                              setBookingDate("");
                              setBookingStartTime("");
                              setPendingBookingId(null);
                              setUploadedFile(null);
                              setTransactionId("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                onClick={() => {
                                  handleBooking(space);
                                  setBookingDialogOpen(true);
                                }}
                                className="font-bold border-2 border-black dark:border-white"
                              >
                                BOOK NOW
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-black dark:border-white">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase">Book Parking</DialogTitle>
                                <DialogDescription className="font-medium">
                                  {bookingStep === 3 ? "Upload payment proof to complete" : `Complete booking for ${space.name}`}
                                </DialogDescription>
                              </DialogHeader>

                              {bookingStep === 1 && (
                                <div className="space-y-6">
                                  <div className="p-4 bg-muted border-2 border-black dark:border-white">
                                    <h3 className="font-bold mb-4 uppercase text-lg">Booking Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-bold mb-2 block uppercase">Date</label>
                                        <div className="relative">
                                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            type="date"
                                            className="pl-10 border-2 font-medium"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-bold mb-2 block uppercase">Start Time</label>
                                        <div className="relative">
                                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            type="time"
                                            className="pl-10 border-2 font-medium"
                                            value={bookingStartTime}
                                            onChange={(e) => setBookingStartTime(e.target.value)}
                                            required
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="text-sm font-bold mb-2 block uppercase">Duration (hours)</label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={bookingDuration}
                                          onChange={(e) => setBookingDuration(Number(e.target.value))}
                                          className="border-2 font-medium"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-black dark:bg-white text-white dark:text-black p-6 border-2 border-black dark:border-white">
                                    <h4 className="font-black mb-4 uppercase text-lg">Summary</h4>
                                    <div className="space-y-3 text-sm font-medium">
                                      <div className="flex justify-between">
                                        <span>Price per hour</span>
                                        <span className="font-bold">₹{space.price}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Duration</span>
                                        <span className="font-bold">{bookingDuration} hours</span>
                                      </div>
                                      <div className="flex justify-between pt-3 border-t-2 border-white dark:border-black">
                                        <span className="font-black text-lg uppercase">Total</span>
                                        <span className="font-black text-2xl">₹{calculateTotal()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <Button 
                                    className="w-full font-bold border-2 border-black dark:border-white text-lg h-12" 
                                    onClick={() => setBookingStep(2)}
                                    disabled={!bookingDate || !bookingStartTime}
                                  >
                                    CONTINUE TO PAYMENT
                                  </Button>
                                </div>
                              )}

                              {bookingStep === 2 && (
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="font-black mb-4 uppercase text-lg">Payment Method</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                      <Button 
                                        variant={paymentMethod === "upi" ? "default" : "outline"} 
                                        className="h-24 flex flex-col gap-2 border-2 font-bold"
                                        onClick={() => setPaymentMethod("upi")}
                                      >
                                        <Wallet className="h-6 w-6" />
                                        <span>UPI</span>
                                      </Button>
                                      <Button 
                                        variant={paymentMethod === "card" ? "default" : "outline"} 
                                        className="h-24 flex flex-col gap-2 border-2 font-bold"
                                        onClick={() => setPaymentMethod("card")}
                                      >
                                        <CreditCard className="h-6 w-6" />
                                        <span>CARD</span>
                                      </Button>
                                    </div>

                                    <div className="bg-yellow-400 text-black p-4 border-2 border-black mb-4">
                                      <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-bold mb-1 uppercase">Verification Required</p>
                                          <p className="text-sm font-medium">
                                            Upload payment proof after completing payment for admin verification
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {paymentMethod === "upi" ? (
                                      <div className="space-y-4">
                                        <UPIPayment
                                          upiId="7259663197@slc"
                                          amount={calculateTotal()}
                                          payeeName="Parking Management"
                                          transactionNote={`Booking_${space.id}_${Date.now()}`}
                                          onPaymentComplete={handlePaymentComplete}
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-bold mb-2 block uppercase">Card Number</label>
                                            <Input placeholder="1234 5678 9012 3456" className="border-2 font-medium" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="text-sm font-bold mb-2 block uppercase">Expiry</label>
                                              <Input placeholder="MM/YY" className="border-2 font-medium" />
                                            </div>
                                            <div>
                                              <label className="text-sm font-bold mb-2 block uppercase">CVV</label>
                                              <Input placeholder="123" type="password" maxLength={3} className="border-2 font-medium" />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-sm font-bold mb-2 block uppercase">Name</label>
                                            <Input placeholder="John Doe" className="border-2 font-medium" />
                                          </div>
                                        </div>

                                        <div className="bg-muted p-4 border-2 border-black dark:border-white">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Shield className="h-5 w-5" />
                                            <span className="font-bold uppercase">Secure Payment</span>
                                          </div>
                                          <p className="text-sm font-medium">
                                            Your information is encrypted
                                          </p>
                                        </div>

                                        <Button className="w-full font-bold border-2 border-black dark:border-white h-12" onClick={handlePaymentComplete}>
                                          COMPLETE PAYMENT
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  <Button variant="outline" className="w-full border-2 font-bold" onClick={() => setBookingStep(1)}>
                                    ← BACK
                                  </Button>
                                </div>
                              )}

                              {bookingStep === 3 && (
                                <div className="space-y-4">
                                  <div className="bg-yellow-400 text-black p-4 border-2 border-black">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-5 w-5 mt-0.5" />
                                      <div>
                                        <p className="font-bold mb-1 uppercase">Upload Payment Proof</p>
                                        <p className="text-sm font-medium">
                                          Booking created! Upload proof for verification
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="transactionId" className="font-bold uppercase">Transaction ID (Optional)</Label>
                                    <Input
                                      id="transactionId"
                                      placeholder="Enter transaction ID"
                                      value={transactionId}
                                      onChange={(e) => setTransactionId(e.target.value)}
                                      className="border-2 font-medium"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="screenshot" className="font-bold uppercase">Payment Proof *</Label>
                                    <Input
                                      id="screenshot"
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      onChange={handleFileChange}
                                      ref={fileInputRef}
                                      className="cursor-pointer border-2 font-medium"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                      .jpg, .jpeg, .png, .pdf (Max 5MB)
                                    </p>
                                    {uploadedFile && (
                                      <div className="mt-2 p-2 bg-green-600 text-white border-2 border-black dark:border-white flex items-center gap-2 font-bold">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-sm">{uploadedFile.name}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-3">
                                    <Button
                                      variant="outline"
                                      className="flex-1 border-2 font-bold"
                                      onClick={() => {
                                        setBookingDialogOpen(false);
                                        setBookingStep(1);
                                        setSelectedSpace(null);
                                        setPendingBookingId(null);
                                        setUploadedFile(null);
                                        setTransactionId("");
                                        fetchBookings();
                                      }}
                                      disabled={isUploading}
                                    >
                                      SKIP
                                    </Button>
                                    <Button
                                      className="flex-1 border-2 border-black dark:border-white font-bold"
                                      onClick={handleUploadScreenshot}
                                      disabled={isUploading || !uploadedFile}
                                    >
                                      {isUploading ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          UPLOADING...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="mr-2 h-4 w-4" />
                                          SUBMIT
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <Card className="p-12 text-center border-4 border-black dark:border-white">
                <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2 uppercase">No Bookings Yet</h3>
                <p className="text-muted-foreground font-medium mb-4">Start by searching for available parking spaces</p>
              </Card>
            ) : (
              bookings.map((booking) => {
                const isNavigateEnabled = booking.status === "confirmed";
                
                return (
                  <Card key={booking.id} className="border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <CardTitle className="text-2xl uppercase font-black">{booking.parkingSpaceName || "Parking Space"}</CardTitle>
                            <Badge className={`border-2 border-black dark:border-white font-bold ${
                              booking.status === "confirmed" ? "bg-green-600" : 
                              booking.status === "pending" ? "bg-yellow-400 text-black" :
                              booking.status === "cancelled" ? "bg-destructive" :
                              "bg-muted"
                            }`}>
                              {booking.status.toUpperCase()}
                            </Badge>
                            {booking.paymentStatus && getPaymentStatusBadge(booking.paymentStatus)}
                          </div>
                          <CardDescription className="flex items-center gap-1 font-medium">
                            <MapPin className="h-4 w-4" />
                            {booking.parkingSpaceLocation || "Location"}
                          </CardDescription>
                          {booking.paymentStatus === 'rejected' && booking.verificationReason && (
                            <div className="mt-2 p-3 bg-destructive/10 border-2 border-destructive">
                              <p className="text-sm text-destructive font-bold">
                                REJECTED: {booking.verificationReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black">₹{booking.amount}</div>
                          <div className="text-xs text-muted-foreground font-bold uppercase">{booking.duration}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t-2 border-black dark:border-white">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 font-bold uppercase">Booking ID</div>
                          <div className="text-sm font-bold">{booking.bookingId}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 font-bold uppercase">Date</div>
                          <div className="text-sm font-bold">{booking.date}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 font-bold uppercase">Time</div>
                          <div className="text-sm font-bold">{booking.startTime} - {booking.endTime}</div>
                        </div>
                        <div className="flex gap-2 justify-end flex-wrap">
                          {booking.paymentStatus === 'pending' && !booking.paymentScreenshot && (
                            <Button 
                              size="sm" 
                              className="border-2 border-black dark:border-white font-bold"
                              onClick={() => {
                                setSelectedBookingForUpload(booking);
                                setUploadDialogOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              UPLOAD
                            </Button>
                          )}
                          {(booking.status === "confirmed" || booking.status === "pending") && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button 
                                        size="sm" 
                                        variant={isNavigateEnabled ? "default" : "outline"}
                                        onClick={() => isNavigateEnabled && handleNavigate(booking)}
                                        disabled={!isNavigateEnabled}
                                        className={`border-2 font-bold ${!isNavigateEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                      >
                                        <NavigationIcon className="h-4 w-4 mr-1" />
                                        NAV
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!isNavigateEnabled && (
                                    <TooltipContent className="border-2 border-black dark:border-white font-bold">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Verification required</span>
                                      </div>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-2 font-bold"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setModifyDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                EDIT
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-2 font-bold"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                CANCEL
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Upload Screenshot Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Payment Proof</DialogTitle>
              <DialogDescription>
                Upload your payment screenshot or receipt for verification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter transaction ID if available"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="screenshot">Upload Payment Proof *</Label>
                <Input
                  id="screenshot"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: .jpg, .jpeg, .png, .pdf (Max 5MB)
                </p>
                {uploadedFile && (
                  <div className="mt-2 p-2 bg-muted rounded flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{uploadedFile.name}</span>
                  </div>
                )}
              </div>
              <div className="bg-primary/10 p-3 rounded border border-primary/20">
                <p className="text-sm">
                  <strong>Note:</strong> Your booking will remain "Pending Verification" until the admin/owner approves your payment proof.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setSelectedBookingForUpload(null);
                    setUploadedFile(null);
                    setTransactionId("");
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUploadScreenshot}
                  disabled={isUploading || !uploadedFile}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Booking Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Please provide a reason for cancelling this booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
                <Textarea
                  id="cancellationReason"
                  placeholder="e.g., Plans changed, Found alternative parking..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setCancelDialogOpen(false);
                    setCancellationReason("");
                    setSelectedBooking(null);
                  }}
                  disabled={isCancelling}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelBooking}
                  disabled={isCancelling || !cancellationReason.trim()}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Booking"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modify Booking Dialog */}
        <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modify Booking</DialogTitle>
              <DialogDescription>
                Update your booking details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleModifyBooking} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={selectedBooking?.date}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={selectedBooking?.startTime}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={selectedBooking?.endTime}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setModifyDialogOpen(false);
                    setSelectedBooking(null);
                  }}
                  disabled={isModifying}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isModifying}
                >
                  {isModifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
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
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const parkingSpaces = [
  {
    id: 1,
    name: "MG Road Premium Parking",
    location: "MG Road, Bangalore",
    city: "Bangalore",
    distance: "0.5 km",
    price: 50,
    priceType: "per hour",
    rating: 4.8,
    reviews: 245,
    totalSpots: 50,
    availableSpots: 12,
    features: ["CCTV", "24/7", "Covered"],
    image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    name: "Koramangala Hub Parking",
    location: "Koramangala 4th Block, Bangalore",
    city: "Bangalore",
    distance: "1.2 km",
    price: 40,
    priceType: "per hour",
    rating: 4.6,
    reviews: 189,
    totalSpots: 35,
    availableSpots: 8,
    features: ["CCTV", "Covered", "EV Charging"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Indiranagar Shopping Complex",
    location: "100 Feet Road, Indiranagar",
    city: "Bangalore",
    distance: "2.1 km",
    price: 30,
    priceType: "per hour",
    rating: 4.5,
    reviews: 156,
    totalSpots: 80,
    availableSpots: 25,
    features: ["24/7", "Security"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "Mysore Palace Parking",
    location: "Near Mysore Palace, Mysore",
    city: "Mysore",
    distance: "0.3 km",
    price: 20,
    priceType: "per hour",
    rating: 4.7,
    reviews: 98,
    totalSpots: 100,
    availableSpots: 45,
    features: ["CCTV", "Open Air"],
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    name: "Jayanagar Shopping District",
    location: "4th Block, Jayanagar",
    city: "Bangalore",
    distance: "3.5 km",
    price: 35,
    priceType: "per hour",
    rating: 4.4,
    reviews: 134,
    totalSpots: 45,
    availableSpots: 15,
    features: ["CCTV", "Covered"],
    image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    name: "Whitefield Tech Park Parking",
    location: "ITPL Main Road, Whitefield",
    city: "Bangalore",
    distance: "8.2 km",
    price: 45,
    priceType: "per hour",
    rating: 4.9,
    reviews: 312,
    totalSpots: 200,
    availableSpots: 67,
    features: ["CCTV", "24/7", "Covered", "EV Charging"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
  }
];

const myBookings = [
  {
    id: 1,
    spaceName: "MG Road Premium Parking",
    location: "MG Road, Bangalore",
    date: "2024-01-15",
    time: "10:00 AM - 2:00 PM",
    duration: "4 hours",
    amount: 200,
    status: "upcoming",
    bookingId: "BK001234"
  },
  {
    id: 2,
    spaceName: "Koramangala Hub Parking",
    location: "Koramangala, Bangalore",
    date: "2024-01-10",
    time: "9:00 AM - 6:00 PM",
    duration: "9 hours",
    amount: 360,
    status: "completed",
    bookingId: "BK001189"
  }
];

export default function CustomerDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDuration, setBookingDuration] = useState(1);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("upi");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/customer");
    }
  }, [session, isPending, router]);

  // Fetch parking spaces
  const fetchSpaces = async () => {
    try {
      setIsLoadingSpaces(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/parking-spaces?status=active&limit=20", {
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
  const handleNavigate = (booking: any) => {
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
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle booking modification
  const handleModifyBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const formData = new FormData(e.currentTarget);
    const updates: any = {
      booking_id: selectedBooking.id,
    };

    const newDate = formData.get("date") as string;
    const newStartTime = formData.get("startTime") as string;
    const newEndTime = formData.get("endTime") as string;

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
    } catch (error: any) {
      console.error("Error modifying booking:", error);
      toast.error(error.message || "Failed to modify booking");
    } finally {
      setIsModifying(false);
    }
  };

  const filteredSpaces = spaces.filter(space => 
    searchLocation === "" || 
    space.location?.toLowerCase().includes(searchLocation.toLowerCase()) ||
    space.city?.toLowerCase().includes(searchLocation.toLowerCase()) ||
    space.name?.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const handleBooking = (space: any) => {
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

      // Create booking via API
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
        status: "confirmed"
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
      
      // Close dialog
      setBookingDialogOpen(false);
      setBookingStep(1);
      setSelectedSpace(null);
      setBookingDate("");
      setBookingStartTime("");

      // Redirect to confirmation page
      router.push(`/booking-confirmation?bookingId=${newBooking.id}`);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Parking Spaces</h1>
          <p className="text-muted-foreground">Search and book parking spaces across Karnataka</p>
        </div>

        {/* Wallet & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WalletCard />
          <AchievementsCard />
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or city..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Spaces</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          </TabsList>

          {/* Available Spaces Tab */}
          <TabsContent value="available" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredSpaces.length} parking spaces
              </p>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {isLoadingSpaces ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredSpaces.length === 0 ? (
              <Card className="p-12 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No parking spaces found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpaces.map((space) => (
                  <Card key={space.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${space.image || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop'})` }}
                    >
                      <Badge className="absolute top-3 right-3 bg-background/90">
                        {space.availableSpots || 0} spots left
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{space.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {space.location}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{space.rating || 0}</span>
                          <span className="text-xs text-muted-foreground">({space.reviews || 0})</span>
                        </div>
                        {space.distance && (
                          <span className="text-xs text-muted-foreground">• {space.distance} away</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(space.features || []).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div>
                          <div className="text-2xl font-bold">₹{space.price}</div>
                          <div className="text-xs text-muted-foreground">{space.priceType || 'per hour'}</div>
                        </div>
                        <Dialog open={bookingDialogOpen && selectedSpace?.id === space.id} onOpenChange={(open) => {
                          setBookingDialogOpen(open);
                          if (!open) {
                            setBookingStep(1);
                            setSelectedSpace(null);
                            setBookingDate("");
                            setBookingStartTime("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button onClick={() => {
                              handleBooking(space);
                              setBookingDialogOpen(true);
                            }}>
                              Book Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Book Parking Space</DialogTitle>
                              <DialogDescription>
                                Complete your booking for {space.name}
                              </DialogDescription>
                            </DialogHeader>

                            {bookingStep === 1 && (
                              <div className="space-y-6">
                                <div>
                                  <h3 className="font-semibold mb-4">Booking Details</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Date</label>
                                      <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          type="date"
                                          className="pl-10"
                                          value={bookingDate}
                                          onChange={(e) => setBookingDate(e.target.value)}
                                          min={new Date().toISOString().split('T')[0]}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Start Time</label>
                                      <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          type="time"
                                          className="pl-10"
                                          value={bookingStartTime}
                                          onChange={(e) => setBookingStartTime(e.target.value)}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium mb-2 block">Duration (hours)</label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={bookingDuration}
                                        onChange={(e) => setBookingDuration(Number(e.target.value))}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-muted p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Price per hour</span>
                                      <span className="font-medium">₹{space.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Duration</span>
                                      <span className="font-medium">{bookingDuration} hours</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                      <span className="font-semibold">Total Amount</span>
                                      <span className="font-bold text-lg">₹{calculateTotal()}</span>
                                    </div>
                                  </div>
                                </div>

                                <Button 
                                  className="w-full" 
                                  onClick={() => setBookingStep(2)}
                                  disabled={!bookingDate || !bookingStartTime}
                                >
                                  Continue to Payment
                                </Button>
                              </div>
                            )}

                            {bookingStep === 2 && (
                              <div className="space-y-6">
                                <div>
                                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    Select Payment Method
                                  </h3>
                                  
                                  <div className="grid grid-cols-2 gap-4 mb-6">
                                    <Button 
                                      variant={paymentMethod === "upi" ? "default" : "outline"} 
                                      className="h-20 flex flex-col gap-2"
                                      onClick={() => setPaymentMethod("upi")}
                                    >
                                      <Wallet className="h-6 w-6" />
                                      <span className="text-sm">UPI Payment</span>
                                    </Button>
                                    <Button 
                                      variant={paymentMethod === "card" ? "default" : "outline"} 
                                      className="h-20 flex flex-col gap-2"
                                      onClick={() => setPaymentMethod("card")}
                                    >
                                      <CreditCard className="h-6 w-6" />
                                      <span className="text-sm">Card Payment</span>
                                    </Button>
                                  </div>

                                  {paymentMethod === "upi" ? (
                                    <UPIPayment
                                      upiId="7259663197@slc"
                                      amount={calculateTotal()}
                                      payeeName="Parking Space Management"
                                      transactionNote={`Booking_${space.id}_${Date.now()}`}
                                      onPaymentComplete={handlePaymentComplete}
                                    />
                                  ) : (
                                    <div className="space-y-4">
                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">Card Number</label>
                                          <Input placeholder="1234 5678 9012 3456" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                                            <Input placeholder="MM/YY" />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium mb-2 block">CVV</label>
                                            <Input placeholder="123" type="password" maxLength={3} />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                                          <Input placeholder="John Doe" />
                                        </div>
                                      </div>

                                      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Shield className="h-5 w-5 text-primary" />
                                          <span className="font-semibold">Secure Payment</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Your payment information is encrypted and secure
                                        </p>
                                      </div>

                                      <Button className="w-full" size="lg">
                                        Pay ₹{calculateTotal()}
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {paymentMethod === "card" && (
                                  <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setBookingStep(1)}>
                                      Back
                                    </Button>
                                  </div>
                                )}

                                {paymentMethod === "upi" && (
                                  <Button variant="outline" className="w-full" onClick={() => setBookingStep(1)}>
                                    Back to Booking Details
                                  </Button>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
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
              <Card className="p-12 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">Start by searching for available parking spaces</p>
              </Card>
            ) : (
              bookings.map((booking) => {
                const isNavigateEnabled = booking.status === "confirmed";
                
                return (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{booking.parkingSpaceName || "Parking Space"}</CardTitle>
                            <Badge variant={
                              booking.status === "confirmed" ? "default" : 
                              booking.status === "pending" ? "secondary" :
                              booking.status === "cancelled" ? "destructive" :
                              "outline"
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.parkingSpaceLocation || "Location"}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">₹{booking.amount}</div>
                          <div className="text-xs text-muted-foreground">{booking.duration}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Booking ID</div>
                          <div className="text-sm font-medium">{booking.bookingId}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Date</div>
                          <div className="text-sm font-medium">{booking.date}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Time</div>
                          <div className="text-sm font-medium">{booking.startTime} - {booking.endTime}</div>
                        </div>
                        <div className="flex gap-2 justify-end">
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
                                        className={!isNavigateEnabled ? "opacity-50 cursor-not-allowed" : ""}
                                      >
                                        <NavigationIcon className="h-4 w-4 mr-1" />
                                        Navigate
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!isNavigateEnabled && (
                                    <TooltipContent>
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Book a parking slot to enable navigation</span>
                                      </div>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setModifyDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Modify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
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
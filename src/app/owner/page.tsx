"use client";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plus,
  MapPin,
  IndianRupee,
  Users,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  X as XIcon,
  Image as ImageIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ParkingSpace {
  id: number;
  ownerId: string;
  name: string;
  location: string;
  city: string;
  address: string | null;
  totalSpots: number;
  availableSpots: number;
  price: number;
  priceType: string;
  status: string;
  features: string[] | null;
  description: string | null;
  monthlyRevenue: number;
  totalBookings: number;
  rating: number;
  imageUrl: string | null;
  peakHours: string | null;
  peakPrice: number | null;
  offPeakPrice: number | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: number;
  bookingId: string;
  customerId: string;
  parkingSpaceId: number;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  parkingSpaceName: string | null;
  parkingSpaceLocation: string | null;
}

interface OwnerStats {
  totalRevenue: number;
  totalBookings: number;
  activeSpaces: number;
  totalSpaces: number;
  averageRating: number;
  monthlyRevenueTrend: number;
}

export default function OwnerPortal() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/owner");
    }
  }, [session, isPending, router]);

  // Fetch parking spaces
  const fetchSpaces = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoadingSpaces(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/parking-spaces?owner_id=${session.user.id}`, {
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
      const response = await fetch(`/api/bookings?owner_id=${session.user.id}`, {
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

  // Fetch stats
  const fetchStats = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoadingStats(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/owner/stats?owner_id=${session.user.id}&period=month`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Don't show error toast for stats as it's not critical
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch data on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchSpaces();
      fetchBookings();
      fetchStats();
    }
  }, [session?.user?.id]);

  // Toggle space status
  const toggleSpaceStatus = async (spaceId: number) => {
    const space = spaces.find(s => s.id === spaceId);
    if (!space) return;

    const newStatus = space.status === "active" ? "inactive" : "active";
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/parking-spaces?id=${spaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update space status");
      }

      toast.success(`Parking space ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchSpaces();
      fetchStats();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update space status");
    }
  };

  // Handle image file change for preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission for new parking space
  const handleAddSpace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const formData = new FormData(e.currentTarget);
    const features = [];
    
    // Collect selected features
    if (formData.get("CCTV")) features.push("CCTV");
    if (formData.get("24/7 Access")) features.push("24/7 Access");
    if (formData.get("Covered Parking")) features.push("Covered Parking");
    if (formData.get("Security Guard")) features.push("Security Guard");
    if (formData.get("EV Charging")) features.push("EV Charging");
    if (formData.get("Valet Service")) features.push("Valet Service");

    // Convert image to base64 if file exists
    let imageBase64 = null;
    if (imageFile) {
      const reader = new FileReader();
      imageBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }

    const payload = {
      ownerId: session.user.id,
      name: formData.get("spaceName") as string,
      location: formData.get("address") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      totalSpots: parseInt(formData.get("totalSpots") as string),
      availableSpots: parseInt(formData.get("totalSpots") as string),
      price: parseInt(formData.get("price") as string),
      priceType: "per hour",
      status: "pending",
      features: features.length > 0 ? features : null,
      description: formData.get("description") as string || null,
      imageUrl: imageBase64,
      peakHours: formData.get("peakHours") as string || null,
      peakPrice: formData.get("peakPrice") ? parseInt(formData.get("peakPrice") as string) : null,
      offPeakPrice: formData.get("offPeakPrice") ? parseInt(formData.get("offPeakPrice") as string) : null,
      latitude: null,
      longitude: null,
    };

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/parking-spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create parking space");
      }

      toast.success("Parking space submitted for approval");
      setIsAddSpaceOpen(false);
      setImagePreview("");
      setImageFile(null);
      fetchSpaces();
      fetchStats();
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error creating space:", error);
      toast.error("Failed to create parking space");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      toast.success(`Booking ${newStatus}`);
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    }
  };

  if (isPending || isLoadingSpaces) {
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

  const displayStats = stats || {
    totalRevenue: 0,
    totalBookings: 0,
    activeSpaces: 0,
    totalSpaces: spaces.length,
    averageRating: 0,
    monthlyRevenueTrend: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your parking spaces and bookings</p>
          </div>
          <Dialog open={isAddSpaceOpen} onOpenChange={(open) => {
            setIsAddSpaceOpen(open);
            if (!open) {
              setImagePreview("");
              setImageFile(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add New Space
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Parking Space</DialogTitle>
                <DialogDescription>
                  Fill in the details to list your parking space
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddSpace} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="spaceName">Parking Space Name *</Label>
                    <Input id="spaceName" name="spaceName" placeholder="e.g., MG Road Premium Parking" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" placeholder="Select city" list="karnataka-cities" required />
                      <datalist id="karnataka-cities">
                        <option value="Bangalore" />
                        <option value="Mysore" />
                        <option value="Mangalore" />
                        <option value="Hubli" />
                        <option value="Belgaum" />
                      </datalist>
                    </div>
                    <div>
                      <Label htmlFor="totalSpots">Total Spots *</Label>
                      <Input id="totalSpots" name="totalSpots" type="number" placeholder="e.g., 50" required min="1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea id="address" name="address" placeholder="Enter complete address with landmarks" rows={3} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price per Hour (₹) *</Label>
                      <Input id="price" name="price" type="number" placeholder="e.g., 50" required min="1" />
                    </div>
                    <div>
                      <Label htmlFor="priceType">Pricing Type</Label>
                      <Input id="priceType" name="priceType" value="per hour" disabled />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-3">Parking Space Image</h4>
                      <p className="text-sm text-muted-foreground mb-4">Upload a photo of your parking space</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="imageFile">Upload Image</Label>
                      <div className="mt-2">
                        <input
                          id="imageFile"
                          name="imageFile"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('imageFile')?.click()}
                          className="w-full border-2 border-black dark:border-white"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {imageFile ? imageFile.name : 'Choose Image'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <div 
                          className="w-full h-48 bg-cover bg-center rounded-lg border"
                          style={{ backgroundImage: `url(${imagePreview})` }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                            const input = document.getElementById("imageFile") as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="mb-3 block">Amenities & Features</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["CCTV", "24/7 Access", "Covered Parking", "Security Guard", "EV Charging", "Valet Service"].map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <input type="checkbox" id={feature} name={feature} className="rounded" />
                          <Label htmlFor={feature} className="cursor-pointer">{feature}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      placeholder="Describe your parking space, accessibility, nearby landmarks..." 
                      rows={4} 
                    />
                  </div>

                  {/* Dynamic Pricing Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-3">Dynamic Pricing (Optional)</h4>
                      <p className="text-sm text-muted-foreground mb-4">Set different prices for peak and off-peak hours</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="peakHours">Peak Hours</Label>
                      <Input 
                        id="peakHours" 
                        name="peakHours" 
                        placeholder="e.g., 9:00-12:00,17:00-20:00"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Format: HH:MM-HH:MM, separate multiple ranges with commas</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="peakPrice">Peak Price (₹/hr)</Label>
                        <Input 
                          id="peakPrice" 
                          name="peakPrice" 
                          type="number" 
                          placeholder="e.g., 100"
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="offPeakPrice">Off-Peak Price (₹/hr)</Label>
                        <Input 
                          id="offPeakPrice" 
                          name="offPeakPrice" 
                          type="number" 
                          placeholder="e.g., 50"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => {
                    setIsAddSpaceOpen(false);
                    setImagePreview("");
                    setImageFile(null);
                  }} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Approval"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">₹{displayStats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    {displayStats.monthlyRevenueTrend > 0 ? "+" : ""}{displayStats.monthlyRevenueTrend}% from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{displayStats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Spaces
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{displayStats.activeSpaces}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Out of {displayStats.totalSpaces} total spaces
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{displayStats.averageRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on customer reviews
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="spaces" className="space-y-6">
          <TabsList>
            <TabsTrigger value="spaces">My Parking Spaces</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* My Parking Spaces Tab */}
          <TabsContent value="spaces" className="space-y-6">
            {isLoadingSpaces ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : spaces.length === 0 ? (
              <Card className="p-12 text-center">
                <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No parking spaces yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first parking space</p>
                <Button onClick={() => setIsAddSpaceOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Parking Space
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {spaces.map((space) => (
                  <Card key={space.id} className="overflow-hidden">
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{ 
                        backgroundImage: space.imageUrl 
                          ? `url(${space.imageUrl})` 
                          : 'url(https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&h=300&fit=crop)'
                      }}
                    >
                      <Badge className="absolute top-3 right-3" variant={space.status === "active" ? "default" : "secondary"}>
                        {space.status}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{space.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {space.location}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Available Spots</div>
                          <div className="text-lg font-semibold">
                            {space.availableSpots} / {space.totalSpots}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Price</div>
                          <div className="text-lg font-semibold">₹{space.price}/hr</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Monthly Revenue</div>
                          <div className="text-lg font-semibold">₹{space.monthlyRevenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Total Bookings</div>
                          <div className="text-lg font-semibold">{space.totalBookings}</div>
                        </div>
                      </div>

                      {space.features && Array.isArray(space.features) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {space.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 flex-1">
                          <Switch 
                            checked={space.status === "active"}
                            onCheckedChange={() => toggleSpaceStatus(space.id)}
                          />
                          <Label className="text-sm">
                            {space.status === "active" ? "Active" : "Inactive"}
                          </Label>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="outline" size="sm">Pending</Button>
                <Button variant="outline" size="sm">Confirmed</Button>
                <Button variant="outline" size="sm">Completed</Button>
              </div>
            </div>

            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">Bookings will appear here once customers book your spaces</p>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{booking.customerName}</CardTitle>
                          <Badge variant={
                            booking.status === "confirmed" ? "default" : 
                            booking.status === "pending" ? "secondary" : 
                            "outline"
                          }>
                            {booking.status === "confirmed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {booking.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {booking.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.parkingSpaceName || "Parking Space"}
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
                        {booking.status === "pending" && (
                          <>
                            <Button size="sm" variant="default" onClick={() => updateBookingStatus(booking.id, "confirmed")}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(booking.id, "cancelled")}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
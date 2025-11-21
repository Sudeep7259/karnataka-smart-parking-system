"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users,
  Car,
  TrendingUp,
  DollarSign,
  Shield,
  Clock,
  LogOut,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Loader2,
  Trash2,
  LayoutDashboard,
  ClipboardList,
  ParkingCircle,
  BarChart3,
  AlertTriangle,
  PowerOff,
  Power
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState("");

  // Check admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem("admin_authenticated");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      toast.error("Admin authentication required");
      router.push("/admin/login");
    }
    setIsLoading(false);
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsRes, bookingsRes, spacesRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/bookings?paymentStatus=pending", { headers }),
        fetch("/api/admin/parking-spaces", { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      if (spacesRes.ok) {
        const spacesData = await spacesRes.json();
        setParkingSpaces(spacesData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("admin_authenticated");
    router.push("/admin/login");
    toast.success("Signed out successfully");
  };

  const handleApprovePayment = async (bookingId) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/bookings/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        toast.success("Payment approved and booking confirmed!");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to approve payment");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedBooking || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/bookings/reject-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          reason: rejectReason,
        }),
      });

      if (res.ok) {
        toast.success("Payment rejected");
        setRejectDialogOpen(false);
        setRejectReason("");
        setSelectedBooking(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Failed to reject payment");
    }
  };

  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/admin/parking-spaces/${selectedSpace.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Parking space deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedSpace(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete parking space");
      }
    } catch (error) {
      console.error("Error deleting space:", error);
      toast.error("Failed to delete parking space");
    }
  };

  const handleToggleSpaceStatus = async (space, newStatus) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/admin/parking-spaces/${space.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Parking space ${newStatus === 'inactive' ? 'deactivated' : 'activated'} successfully`);
        setDeactivateDialogOpen(false);
        setSelectedSpace(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || `Failed to ${newStatus === 'inactive' ? 'deactivate' : 'activate'} parking space`);
      }
    } catch (error) {
      console.error("Error toggling space status:", error);
      toast.error(`Failed to ${newStatus === 'inactive' ? 'deactivate' : 'activate'} parking space`);
    }
  };

  const filteredSpaces = parkingSpaces.filter((space) =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const pendingPayments = bookings.filter((b) => b.paymentStatus === "pending");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-primary bg-card p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-black">ADMIN PANEL</h1>
        </div>

        <nav className="space-y-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start font-bold"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            DASHBOARD
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className="w-full justify-start font-bold"
            onClick={() => setActiveTab("bookings")}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            BOOKINGS
            {pendingPayments.length > 0 && (
              <Badge className="ml-auto" variant="destructive">
                {pendingPayments.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "spaces" ? "default" : "ghost"}
            className="w-full justify-start font-bold"
            onClick={() => setActiveTab("spaces")}
          >
            <ParkingCircle className="mr-2 h-4 w-4" />
            PARKING SLOTS
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            className="w-full justify-start font-bold"
            onClick={() => setActiveTab("reports")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            REPORTS
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t border-primary mt-8">
          <Button
            variant="destructive"
            className="w-full font-bold"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            LOGOUT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="bookings">
                Bookings
                {pendingPayments.length > 0 && (
                  <Badge className="ml-1" variant="destructive">
                    {pendingPayments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="spaces">Slots</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2">DASHBOARD OVERVIEW</h2>
              <p className="text-muted-foreground">System statistics and metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.users.customers} customers, {stats.users.owners} owners
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Parking Spaces
                  </CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.parkingSpaces.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.parkingSpaces.active} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.revenue.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    From completed bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Verification
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingPayments.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires review
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{stats.bookings.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-bold">{stats.bookings.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmed</span>
                    <span className="font-bold">{stats.bookings.confirmed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-bold">{stats.bookings.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancelled</span>
                    <span className="font-bold">{stats.bookings.cancelled}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parking Spaces Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{stats.parkingSpaces.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-bold text-green-600">{stats.parkingSpaces.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-bold text-yellow-600">{stats.parkingSpaces.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inactive</span>
                    <span className="font-bold text-gray-600">{stats.parkingSpaces.inactive}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2">BOOKING APPROVALS</h2>
              <p className="text-muted-foreground">Review and approve payment verifications</p>
            </div>

            {pendingPayments.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending payment verifications</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">Booking #{booking.bookingId}</h3>
                            <Badge variant="secondary">Pending Verification</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {booking.parkingSpace.name} - {booking.parkingSpace.city}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Customer</p>
                            <p className="font-semibold">{booking.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Booking Details</p>
                            <p className="font-semibold">{booking.date}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-semibold text-lg">₹{booking.amount}</p>
                          </div>
                          {booking.transactionId && (
                            <div>
                              <p className="text-xs text-muted-foreground">Transaction ID</p>
                              <p className="font-semibold text-sm">{booking.transactionId}</p>
                            </div>
                          )}
                        </div>

                        {booking.paymentScreenshot && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Payment Screenshot</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedScreenshot(booking.paymentScreenshot);
                                setScreenshotDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Screenshot
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => handleApprovePayment(booking.id)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Payment
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setRejectDialogOpen(true);
                            }}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Parking Slots Tab */}
        {activeTab === "spaces" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black mb-2">PARKING SLOT MANAGEMENT</h2>
                <p className="text-muted-foreground">Manage, deactivate, and delete parking spaces</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parking spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-4">
              {filteredSpaces.map((space) => (
                <Card key={space.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{space.name}</h3>
                        <Badge
                          variant={
                            space.status === "active"
                              ? "default"
                              : space.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {space.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {space.location}, {space.city}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Owner</p>
                          <p className="font-semibold">{space.owner.name}</p>
                          <p className="text-xs text-muted-foreground">{space.owner.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Spots</p>
                          <p className="font-semibold text-lg">{space.totalSpots}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Available</p>
                          <p className="font-semibold text-lg">{space.availableSpots}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-semibold text-lg">₹{space.price}/hr</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {space.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSpace(space);
                              setDeactivateDialogOpen(true);
                            }}
                          >
                            <PowerOff className="h-4 w-4 mr-2" />
                            Deactivate Space
                          </Button>
                        ) : space.status === 'inactive' ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleToggleSpaceStatus(space, 'active')}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Activate Space
                          </Button>
                        ) : null}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedSpace(space);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Space
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredSpaces.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No parking spaces found</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && stats && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2">SYSTEM REPORTS</h2>
              <p className="text-muted-foreground">Analytics and insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-bold">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customers</span>
                    <span className="font-bold">{stats.users.customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owners</span>
                    <span className="font-bold">{stats.users.owners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admins</span>
                    <span className="font-bold">{stats.users.admins}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-bold">₹{stats.revenue.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Bookings</span>
                    <span className="font-bold">{stats.bookings.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Booking Value</span>
                    <span className="font-bold">
                      ₹{stats.bookings.completed > 0 ? Math.round(stats.revenue.total / stats.bookings.completed) : 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Screenshot Dialog */}
      <Dialog open={screenshotDialogOpen} onOpenChange={setScreenshotDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {selectedScreenshot && (
            <div className="relative w-full h-96">
              <Image
                src={selectedScreenshot}
                alt="Payment Screenshot"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Screenshot is unclear, transaction ID doesn't match, suspicious activity..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectPayment}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Space Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Parking Space</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this parking space? It will no longer be visible to customers.
            </DialogDescription>
          </DialogHeader>
          {selectedSpace && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <PowerOff className="h-5 w-5 text-orange-500" />
                <p className="font-semibold">Deactivation Notice</p>
              </div>
              <p className="text-sm">
                <strong>{selectedSpace.name}</strong> will be hidden from customer searches. You can reactivate it anytime.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => selectedSpace && handleToggleSpaceStatus(selectedSpace, 'inactive')}
            >
              <PowerOff className="h-4 w-4 mr-2" />
              Deactivate Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Space Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parking Space</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this parking space? This will also delete all related bookings.
            </DialogDescription>
          </DialogHeader>
          {selectedSpace && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="font-semibold text-destructive">Warning: This action cannot be undone</p>
              </div>
              <p className="text-sm">
                You are about to delete <strong>{selectedSpace.name}</strong> and all associated bookings.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSpace}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
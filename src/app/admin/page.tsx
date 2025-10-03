"use client";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  Car,
  TrendingUp,
  DollarSign,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Ban,
  Edit,
  Shield,
  Clock,
  Calendar
} from "lucide-react";
import { useState } from "react";

const pendingApprovals = [
  {
    id: 1,
    spaceName: "Whitefield Tech Park Parking",
    ownerName: "Rahul Verma",
    location: "ITPL Main Road, Whitefield, Bangalore",
    city: "Bangalore",
    totalSpots: 200,
    price: 45,
    features: ["CCTV", "24/7", "Covered", "EV Charging"],
    submittedDate: "2024-01-14",
    status: "pending",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    spaceName: "HSR Layout Shopping Complex",
    ownerName: "Priya Sharma",
    location: "27th Main Road, HSR Layout, Bangalore",
    city: "Bangalore",
    totalSpots: 60,
    price: 35,
    features: ["CCTV", "Covered"],
    submittedDate: "2024-01-13",
    status: "pending",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    spaceName: "Mysore Mall Underground",
    ownerName: "Anil Kumar",
    location: "Sayyaji Rao Road, Mysore",
    city: "Mysore",
    totalSpots: 150,
    price: 30,
    features: ["CCTV", "24/7", "Underground", "Security"],
    submittedDate: "2024-01-15",
    status: "pending",
    image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=300&fit=crop"
  }
];

const allUsers = [
  { id: 1, name: "Rajesh Kumar", email: "rajesh@example.com", role: "customer", joinDate: "2024-01-10", bookings: 12, status: "active" },
  { id: 2, name: "Priya Sharma", email: "priya@example.com", role: "owner", joinDate: "2024-01-08", spaces: 3, status: "active" },
  { id: 3, name: "Amit Patel", email: "amit@example.com", role: "customer", joinDate: "2024-01-12", bookings: 5, status: "active" },
  { id: 4, name: "Sneha Reddy", email: "sneha@example.com", role: "owner", joinDate: "2024-01-05", spaces: 2, status: "active" },
  { id: 5, name: "Rahul Verma", email: "rahul@example.com", role: "owner", joinDate: "2024-01-14", spaces: 1, status: "pending" },
  { id: 6, name: "Lakshmi Iyer", email: "lakshmi@example.com", role: "customer", joinDate: "2024-01-09", bookings: 8, status: "active" },
];

const allParkingSpaces = [
  { id: 1, name: "MG Road Premium Parking", owner: "Priya Sharma", city: "Bangalore", spots: 50, revenue: 45000, status: "active" },
  { id: 2, name: "Koramangala Hub Parking", owner: "Sneha Reddy", city: "Bangalore", spots: 35, revenue: 28000, status: "active" },
  { id: 3, name: "Mysore Palace Parking", owner: "Anil Kumar", city: "Mysore", spots: 100, revenue: 32000, status: "active" },
  { id: 4, name: "Jayanagar Shopping District", owner: "Priya Sharma", city: "Bangalore", spots: 45, revenue: 0, status: "inactive" },
];

export default function AdminDashboard() {
  const [searchUsers, setSearchUsers] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const totalUsers = allUsers.length;
  const totalCustomers = allUsers.filter(u => u.role === "customer").length;
  const totalOwners = allUsers.filter(u => u.role === "owner").length;
  const totalSpaces = allParkingSpaces.length;
  const totalRevenue = allParkingSpaces.reduce((sum, space) => sum + space.revenue, 0);
  const pendingCount = pendingApprovals.length;

  const filteredUsers = allUsers.filter(user => 
    (selectedRole === "all" || user.role === selectedRole) &&
    (searchUsers === "" || 
     user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
     user.email.toLowerCase().includes(searchUsers.toLowerCase()))
  );

  const handleApprove = (spaceId: number) => {
    console.log("Approved space:", spaceId);
  };

  const handleReject = (spaceId: number) => {
    console.log("Rejected space:", spaceId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, parking spaces, and system analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCustomers} customers, {totalOwners} owners
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
              <div className="text-2xl font-bold">{totalSpaces}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingCount} pending approval
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
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Monthly platform revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires review
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approvals">
              Pending Approvals
              {pendingCount > 0 && (
                <Badge className="ml-2" variant="destructive">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="spaces">Parking Spaces</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            {pendingApprovals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingApprovals.map((space) => (
                  <Card key={space.id} className="overflow-hidden">
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${space.image})` }}
                    >
                      <Badge className="absolute top-3 right-3 bg-yellow-500">
                        Pending Review
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{space.spaceName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mb-1">
                            <MapPin className="h-4 w-4" />
                            {space.location}
                          </CardDescription>
                          <CardDescription className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Owner: {space.ownerName}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Total Spots</div>
                          <div className="text-lg font-semibold">{space.totalSpots}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Price per Hour</div>
                          <div className="text-lg font-semibold">₹{space.price}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 my-3">
                        {space.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground mb-4">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        Submitted: {space.submittedDate}
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          className="flex-1" 
                          onClick={() => handleApprove(space.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleReject(space.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending parking space approvals</p>
              </Card>
            )}
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedRole === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedRole("all")}
                >
                  All
                </Button>
                <Button 
                  variant={selectedRole === "customer" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedRole("customer")}
                >
                  Customers
                </Button>
                <Button 
                  variant={selectedRole === "owner" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSelectedRole("owner")}
                >
                  Owners
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {user.role === "customer" ? `${user.bookings} bookings` : `${user.spaces} spaces`}
                          </div>
                        </div>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parking Spaces Tab */}
          <TabsContent value="spaces" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Parking Spaces ({allParkingSpaces.length})</CardTitle>
                <CardDescription>Overview of all registered parking spaces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allParkingSpaces.map((space) => (
                    <div key={space.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{space.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {space.city}
                            <span className="mx-1">•</span>
                            Owner: {space.owner}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Spots</div>
                          <div className="font-semibold">{space.spots}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Revenue</div>
                          <div className="font-semibold">₹{space.revenue.toLocaleString()}</div>
                        </div>
                        <Badge variant={space.status === "active" ? "default" : "secondary"}>
                          {space.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Overall system metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Bookings (Monthly)</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Booking Value</span>
                    <span className="font-semibold">₹280</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Platform Fee Revenue</span>
                    <span className="font-semibold">₹12,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Users (Daily)</span>
                    <span className="font-semibold">456</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>City-wise Distribution</CardTitle>
                  <CardDescription>Parking spaces by city</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bangalore</span>
                    <span className="font-semibold">450 spaces</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mysore</span>
                    <span className="font-semibold">180 spaces</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mangalore</span>
                    <span className="font-semibold">125 spaces</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hubli</span>
                    <span className="font-semibold">95 spaces</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Spaces</CardTitle>
                  <CardDescription>Highest revenue this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">MG Road Premium</div>
                      <div className="text-xs text-muted-foreground">Bangalore</div>
                    </div>
                    <span className="font-semibold">₹45,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mysore Palace Parking</div>
                      <div className="text-xs text-muted-foreground">Mysore</div>
                    </div>
                    <span className="font-semibold">₹32,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Koramangala Hub</div>
                      <div className="text-xs text-muted-foreground">Bangalore</div>
                    </div>
                    <span className="font-semibold">₹28,000</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription>Month-over-month comparison</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Users</span>
                    <span className="font-semibold text-green-600">+24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bookings</span>
                    <span className="font-semibold text-green-600">+18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-semibold text-green-600">+15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Spaces</span>
                    <span className="font-semibold text-green-600">+12%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
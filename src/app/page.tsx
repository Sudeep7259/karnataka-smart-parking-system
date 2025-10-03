import Navigation from "@/components/Navigation";
import ParkingSearch from "@/components/ParkingSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Car, 
  Shield, 
  Clock, 
  MapPin, 
  Wallet, 
  Star,
  Users,
  CheckCircle2
} from "lucide-react";

const karnatakaCities = [
  { name: "Bangalore", spaces: 450, image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop" },
  { name: "Mysore", spaces: 180, image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=400&h=300&fit=crop" },
  { name: "Mangalore", spaces: 125, image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop" },
  { name: "Hubli", spaces: 95, image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop" },
  { name: "Belgaum", spaces: 85, image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop" },
  { name: "Gulbarga", spaces: 70, image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop" },
];

const features = [
  {
    icon: Clock,
    title: "Real-Time Availability",
    description: "Check parking space availability in real-time across Karnataka cities",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "Multiple payment options with secure transaction processing",
  },
  {
    icon: MapPin,
    title: "Smart Navigation",
    description: "Get directions to your booked parking spot with integrated maps",
  },
  {
    icon: Shield,
    title: "Verified Spaces",
    description: "All parking spaces are verified and approved by our admin team",
  },
];

const stats = [
  { icon: Users, value: "10,000+", label: "Active Users" },
  { icon: Car, value: "500+", label: "Parking Spaces" },
  { icon: MapPin, value: "18+", label: "Cities Covered" },
  { icon: Star, value: "4.8", label: "Average Rating" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-1 border-2 border-black">
              Karnataka's #1 Parking Solution
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-black">
              FIND & BOOK PARKING SPACES
              <span className="block mt-2">ACROSS KARNATAKA</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover available parking spaces in real-time. Book instantly, park hassle-free, 
              and save time in Bangalore, Mysore, Mangalore, and other major cities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" asChild className="text-base px-8 border-2 border-black">
                <Link href="/customer">
                  <Car className="mr-2 h-5 w-5" />
                  Find Parking Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 border-2 border-black">
                <Link href="/owner">
                  List Your Space
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Component */}
          <div className="max-w-5xl mx-auto mt-12">
            <ParkingSearch />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">WHY CHOOSE PARKEASE KA?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience hassle-free parking with our comprehensive features designed for convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="manga-border">
                  <CardHeader>
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Karnataka Cities Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              PARKING SPACES ACROSS KARNATAKA
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're available in major cities across Karnataka with verified parking spaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {karnatakaCities.map((city, index) => (
              <Card key={index} className="overflow-hidden manga-border">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{city.name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {city.spaces} parking spaces available
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild className="border-2 border-black">
                      <Link href={`/customer?city=${city.name}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              <CheckCircle2 className="inline h-5 w-5 mr-2" />
              Expanding to more cities soon
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            READY TO FIND YOUR PERFECT PARKING SPACE?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust ParkEase KA for their parking needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-base px-8 border-2 border-white bg-white text-black">
              <Link href="/customer">
                Get Started as Customer
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 border-2 border-white text-white">
              <Link href="/owner">
                Become a Space Owner
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t-4 border-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-black text-xl mb-4">
                <div className="bg-black text-white p-2">
                  <Car className="h-5 w-5" />
                </div>
                <span>PARKEASE KA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Karnataka's trusted parking management solution
              </p>
            </div>
            
            <div>
              <h3 className="font-black mb-4">QUICK LINKS</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/customer" className="hover:text-black">Find Parking</Link></li>
                <li><Link href="/owner" className="hover:text-black">List Space</Link></li>
                <li><Link href="/about" className="hover:text-black">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-black mb-4">SUPPORT</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-black">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-black">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-black">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-black mb-4">LEGAL</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-black">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-black">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t-2 border-black mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 ParkEase KA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
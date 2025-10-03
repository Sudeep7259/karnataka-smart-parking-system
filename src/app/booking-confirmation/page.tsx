"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Navigation as NavigationIcon, 
  MapPin,
  Clock,
  IndianRupee,
  Receipt,
  Mail,
  MessageCircle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    
    if (!bookingId) {
      router.push("/customer");
      return;
    }

    // Fetch booking details
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch(`/api/bookings?id=${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch booking");
        }

        const data = await response.json();
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("Failed to load booking details");
        router.push("/customer");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams, router]);

  const handleNavigate = () => {
    if (!booking) return;

    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.parkingSpaceLocation || "parking")}`;
    window.open(searchUrl, "_blank");
  };

  const handleDownloadReceipt = () => {
    if (!booking) return;

    const receiptContent = `
PARKING RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.bookingId}
Customer: ${booking.customerName}
Parking Space: ${booking.parkingSpaceName}
Location: ${booking.parkingSpaceLocation}

Date: ${booking.date}
Time: ${booking.startTime} - ${booking.endTime}
Duration: ${booking.duration}

Amount Paid: ₹${booking.amount}
Status: ${booking.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for using our service!
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parking-receipt-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Receipt downloaded!");
  };

  const handleShareWhatsApp = () => {
    if (!booking) return;

    const message = `🚗 Parking Booked!\n\n📍 ${booking.parkingSpaceName}\n📅 ${booking.date}\n⏰ ${booking.startTime} - ${booking.endTime}\n💰 ₹${booking.amount}\n🎫 Booking ID: ${booking.bookingId}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShareEmail = () => {
    if (!booking) return;

    const subject = `Parking Booking Confirmation - ${booking.bookingId}`;
    const body = `
Hello!

Your parking has been confirmed!

Booking Details:
- Parking Space: ${booking.parkingSpaceName}
- Location: ${booking.parkingSpaceLocation}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
- Duration: ${booking.duration}
- Amount: ₹${booking.amount}
- Booking ID: ${booking.bookingId}

Thank you for choosing our service!
    `.trim();

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleAddToGoogleCalendar = () => {
    if (!booking) return;

    const startDate = new Date(`${booking.date}T${booking.startTime}`);
    const endDate = new Date(`${booking.date}T${booking.endTime}`);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Parking: ' + booking.parkingSpaceName)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Booking ID: ${booking.bookingId}\nAmount: ₹${booking.amount}`)}&location=${encodeURIComponent(booking.parkingSpaceLocation || '')}`;
    
    window.open(googleCalUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" style={{ borderRadius: '50%' }}></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Manga-style Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <div className="relative">
              <h1 className="text-6xl font-black mb-4" style={{ fontFamily: "'Impact', sans-serif" }}>
                ✓ SUCCESS!!
              </h1>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              Your parking spot is secured!
            </div>
          </div>
        </div>

        {/* Booking Details Card with Comic Panel Style */}
        <div className="max-w-4xl mx-auto">
          <Card className="manga-border overflow-hidden">
            {/* Header Section */}
            <div className="bg-black text-white p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white text-black p-3">
                    <Receipt className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">BOOKING CONFIRMED</h2>
                    <p className="text-white/80 font-mono">#{booking.bookingId}</p>
                  </div>
                </div>
                <Badge className="bg-white text-black text-lg px-4 py-2 border-2 border-black">
                  ✓ PAID
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6 bg-white">
              {/* Parking Space Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide mb-1">
                      Parking Location
                    </div>
                    <div className="text-2xl font-black mb-1">
                      {booking.parkingSpaceName}
                    </div>
                    <div className="text-muted-foreground">
                      {booking.parkingSpaceLocation}
                    </div>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="border-2 border-black p-4 bg-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase">Date</span>
                    </div>
                    <div className="text-xl font-bold">{booking.date}</div>
                  </div>

                  <div className="border-2 border-black p-4 bg-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase">Time</span>
                    </div>
                    <div className="text-xl font-bold">{booking.startTime} - {booking.endTime}</div>
                    <div className="text-sm text-muted-foreground">{booking.duration}</div>
                  </div>

                  <div className="border-2 border-black p-4 bg-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase">Amount Paid</span>
                    </div>
                    <div className="text-3xl font-black">₹{booking.amount}</div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t-2 border-dashed border-black/20 pt-6">
                <div className="text-sm text-muted-foreground uppercase font-bold mb-2">
                  Customer Details
                </div>
                <div className="text-lg font-bold">{booking.customerName}</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-6 border-t-2 border-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    size="lg" 
                    className="h-14 text-lg font-black border-2 border-black"
                    onClick={handleNavigate}
                  >
                    <NavigationIcon className="mr-2 h-5 w-5" />
                    Navigate to Parking
                  </Button>

                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 text-lg font-black border-2 border-black"
                    onClick={handleDownloadReceipt}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Receipt
                  </Button>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  <div className="text-sm font-bold uppercase text-muted-foreground text-center">
                    Share Booking
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline"
                      className="border-2 border-black"
                      onClick={handleShareWhatsApp}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-2 border-black"
                      onClick={handleShareEmail}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-2 border-black"
                      onClick={handleAddToGoogleCalendar}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar
                    </Button>
                  </div>
                </div>

                {/* Back to Dashboard */}
                <Link href="/customer">
                  <Button 
                    variant="ghost" 
                    className="w-full border-2 border-dashed border-black/30"
                  >
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" style={{ borderRadius: '50%' }}></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
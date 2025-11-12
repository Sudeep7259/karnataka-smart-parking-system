"use client";

import Link from "next/link";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/customer", label: "FIND PARKING" },
    { href: "/owner", label: "LIST SPACE" },
  ];

  return (
    <nav className="bg-card border-b-4 border-primary sticky top-0 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl hover:scale-105 transition-transform">
            <Image 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/WhatsApp-Image-2025-10-05-at-12.25.40_4868263a-1759647674256.jpg"
              alt="NammaParking Logo"
              width={40}
              height={40}
              className="object-contain border-2 border-primary"
            />
            <span className="hidden sm:inline">NAMMAPARKING</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold hover:text-primary transition-colors px-3 py-2 hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Admin Panel Link - Prominent Display */}
            {session?.user?.role === "admin" && (
              <Link
                href="/admin"
                className="relative"
              >
                <Button 
                  variant="default" 
                  size="sm"
                  className="font-black border-4 border-black dark:border-white bg-yellow-400 text-black hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0_0_rgba(255,255,255,1)] transition-all"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  ADMIN PANEL
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 px-1.5 text-[10px] font-black border-2 border-black dark:border-white"
                  >
                    ⚡
                  </Badge>
                </Button>
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Auth Buttons or Profile */}
            {isPending ? (
              <div className="w-20 h-9 bg-muted animate-pulse border-2 border-primary" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-none p-0 border-2 border-primary hover:bg-muted">
                    <Avatar className="h-9 w-9 border-2 border-primary rounded-none">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold rounded-none">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {session?.user?.role === "admin" && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 border border-black dark:border-white rounded-none"></div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-4 border-primary shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
                  <div className="px-2 py-2 border-b-2 border-primary">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Signed in as</p>
                    <p className="text-sm font-black truncate">{session.user.email}</p>
                    {session?.user?.role === "admin" && (
                      <Badge className="mt-1 bg-yellow-400 text-black border-2 border-black dark:border-white font-black text-[10px]">
                        <Shield className="h-3 w-3 mr-1" />
                        ADMIN
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer font-bold">
                      <User className="mr-2 h-4 w-4" />
                      <span>PROFILE</span>
                    </Link>
                  </DropdownMenuItem>
                  {session?.user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer font-black bg-yellow-400/20">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>ADMIN DASHBOARD</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer font-bold border-t-2 border-primary mt-1">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>SIGN OUT</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" size="sm" asChild className="border-2 font-bold">
                  <Link href="/login">LOGIN</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary font-bold border-2 border-black dark:border-white">
                  <Link href="/register">SIGN UP</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-2 font-bold"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t-4 border-primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-bold hover:text-primary hover:bg-muted px-3 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Admin Panel Link - Mobile */}
            {session?.user?.role === "admin" && (
              <Link
                href="/admin"
                className="block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="bg-yellow-400 text-black p-3 border-4 border-black dark:border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] mx-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span className="font-black uppercase">Admin Panel</span>
                    </div>
                    <Badge variant="destructive" className="font-black border-2 border-black">
                      ⚡
                    </Badge>
                  </div>
                </div>
              </Link>
            )}
            
            {!session?.user && (
              <div className="flex gap-2 pt-2 px-3">
                <Button variant="outline" size="sm" asChild className="flex-1 border-2 font-bold">
                  <Link href="/login">LOGIN</Link>
                </Button>
                <Button size="sm" asChild className="flex-1 bg-primary font-bold border-2 border-black dark:border-white">
                  <Link href="/register">SIGN UP</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
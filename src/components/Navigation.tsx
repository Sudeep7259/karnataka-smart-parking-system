"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, LogOut, Settings, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { data: session, refetch } = useSession();
  const router = useRouter();

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme === "dark";
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Failed to sign out");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b-4 border-black bg-white dark:bg-black dark:border-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl dark:text-white">
            <div className="bg-black dark:bg-white text-white dark:text-black p-2">
              <Car className="h-5 w-5" />
            </div>
            <span>NMMAPARKING</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white">
              Home
            </Link>
            <Link href="/map" className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white">
              Find Parking
            </Link>
            <Link href="/customer" className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white">
              My Bookings
            </Link>
            <Link href="/owner" className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white">
              List Your Space
            </Link>
            <Link href="/admin" className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white">
              Admin
            </Link>
          </div>

          {/* Desktop Auth Buttons / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="border-2 border-black dark:border-white"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-white" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 border-2 border-black dark:border-white">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-bold">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-2 border-black dark:border-white">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold">{session.user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-black dark:bg-white" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer font-bold">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/customer" className="cursor-pointer font-bold">
                      <Settings className="mr-2 h-4 w-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-black dark:bg-white" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer font-bold">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="border-2 border-black dark:border-white font-bold dark:text-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="border-2 border-black dark:border-white font-bold">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 border-2 border-black dark:border-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6 dark:text-white" /> : <Menu className="h-6 w-6 dark:text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-black dark:border-white">
            <div className="flex flex-col gap-4">
              {session?.user && (
                <div className="flex items-center gap-3 pb-4 border-b-2 border-black dark:border-white">
                  <Avatar className="h-12 w-12 border-2 border-black dark:border-white">
                    <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-bold">
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold dark:text-white">{session.user.name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
              )}
              
              <Link 
                href="/" 
                className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/map" 
                className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Parking
              </Link>
              <Link 
                href="/customer" 
                className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link 
                href="/owner" 
                className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                List Your Space
              </Link>
              <Link 
                href="/admin" 
                className="text-sm font-bold hover:text-black dark:hover:text-white uppercase dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>

              {/* Mobile Dark Mode Toggle */}
              <Button
                variant="outline"
                onClick={toggleDarkMode}
                className="w-full justify-start border-2 border-black dark:border-white font-bold"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </Button>
              
              <div className="flex flex-col gap-2 pt-4 border-t-2 border-black dark:border-white">
                {session?.user ? (
                  <>
                    <Button variant="ghost" asChild className="w-full justify-start border-2 border-black dark:border-white font-bold">
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start border-2 border-black dark:border-white font-bold">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full border-2 border-black dark:border-white font-bold">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full border-2 border-black dark:border-white font-bold">
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
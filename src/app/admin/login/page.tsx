"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use better-auth to sign in
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error?.code) {
        toast.error("Invalid admin credentials. Please check your email and password.");
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      if (data?.user?.role !== 'admin') {
        toast.error("Access denied. Admin role required.");
        await authClient.signOut();
        setIsLoading(false);
        return;
      }

      // Store admin authentication flag for quick checks
      localStorage.setItem("admin_authenticated", "true");
      toast.success("Admin access granted");
      router.push("/admin");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md manga-border">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-black text-white flex items-center justify-center">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black">ADMIN ACCESS</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in with your admin credentials
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@parking.com"
                required
                disabled={isLoading}
                className="border-2 border-black"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold">
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                  className="border-2 border-black pr-10"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white border-2 border-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Access Admin Panel
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded border-2 border-black">
            <p className="text-xs font-bold mb-2">DEFAULT ADMIN CREDENTIALS:</p>
            <p className="text-xs">
              <span className="font-bold">Email:</span> <span className="font-mono">admin@parking.com</span>
            </p>
            <p className="text-xs">
              <span className="font-bold">Password:</span> <span className="font-mono">Admin@2025#Secure</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
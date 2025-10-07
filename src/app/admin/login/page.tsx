"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/admin",
      });

      if (error?.code) {
        toast.error("Invalid admin credentials. Please check your email and password.");
        setIsLoading(false);
        return;
      }

      // Verify admin role
      const session = await authClient.getSession();
      if (session?.user?.role !== "admin") {
        await authClient.signOut();
        toast.error("Access denied. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      toast.success("Admin login successful!");
      router.push("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("An error occurred during admin login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md manga-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black">ADMIN ACCESS</CardTitle>
          <CardDescription>Secure administrator login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Password must be 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <Button type="submit" className="w-full border-2 border-black dark:border-white font-bold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  ADMIN LOGIN
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Not an admin?{" "}
              <Link href="/login" className="font-bold text-black dark:text-white hover:underline">
                User Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
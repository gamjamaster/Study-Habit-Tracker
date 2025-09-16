"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        // If user is logged in, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
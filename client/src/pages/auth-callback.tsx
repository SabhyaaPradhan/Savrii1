import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallback() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Get return URL from query params
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo') || '/dashboard';
        
        // Redirect to the intended page
        window.location.href = returnTo;
      } else {
        // Authentication failed, redirect to auth page
        window.location.href = '/auth?error=auth_failed';
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
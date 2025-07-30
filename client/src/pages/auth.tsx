import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/ui/navbar";
import { SEOHead } from "@/components/SEOHead";

import { Bot, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/Screenshot_2025-07-27_102834-removebg-preview_1753592423683.png";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For email authentication, redirect to Google OAuth
      toast({
        title: "Authentication",
        description: "Redirecting to Google sign-in...",
      });
      
      // Get return URL from current page URL
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      
      setTimeout(() => {
        const authUrl = returnTo 
          ? `/auth/google?returnTo=${encodeURIComponent(returnTo)}`
          : "/auth/google";
        window.location.href = authUrl;
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    toast({
      title: "Google Sign-In",
      description: "Redirecting to secure authentication...",
    });
    
    // Get return URL from current page URL
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    
    setTimeout(() => {
      const authUrl = returnTo 
        ? `/auth/google?returnTo=${encodeURIComponent(returnTo)}`
        : "/auth/google";
      window.location.href = authUrl;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <SEOHead
        title="Sign In - Access Your Savrii Account | AI Customer Communication Platform"
        description="Sign in to your Savrii account to access AI-powered customer communication tools. Secure authentication with Google or email. Transform your customer support today."
        keywords="Savrii login, sign in, customer support platform, AI communication tools, secure authentication"
        canonicalUrl="https://www.savrii.com/auth"
      />
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <img src={logoImage} alt="Savrii Logo" className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Savrii</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isSignUp ? "Create your account to get started" : "Sign in to your account"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
                <CardDescription>
                  Choose your preferred authentication method
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Google Auth Button */}
                <Button
                  onClick={handleGoogleAuth}
                  variant="outline"
                  className="w-full h-12 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 text-sm text-gray-500 dark:text-gray-400">
                    or
                  </span>
                </div>

                {/* Email Auth Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    {isSignUp 
                      ? "Already have an account? Sign in" 
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            By continuing, you agree to our{" "}
            <a href="#" className="text-green-600 dark:text-green-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-600 dark:text-green-400 hover:underline">
              Privacy Policy
            </a>
          </motion.div>
        </div>
      </main>
      

    </div>
  );
}
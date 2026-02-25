import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ExternalLink, Shield, Church } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOLogin = async () => {
    setIsLoading(true);

    // Redirect to the main SoapBox app for authentication
    const soapboxAuthUrl = window.location.origin.includes("localhost")
      ? "http://localhost:3000/auth/church-admin"
      : "https://app.soapboxsuperapp.com/auth/church-admin";

    // In production, redirect to SSO
    if (!window.location.origin.includes("localhost")) {
      window.location.href = soapboxAuthUrl;
      return;
    }

    // For local dev, simulate SSO authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <Logo size="lg" showTagline />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Church Management
            </h1>
            <p className="text-purple-200/80">
              Manage your church community with the power of SoapBox
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
                <Church className="h-6 w-6 text-purple-300" />
              </div>
            </div>
            <CardTitle className="text-xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-purple-200/70">
              Sign in with your SoapBox account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SSO Login Button */}
            <Button
              onClick={handleSSOLogin}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 hover:from-indigo-600 hover:via-purple-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Connecting to SoapBox...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none">
                    <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.3" />
                    <path
                      d="M16 15 C16 13, 18 12, 20 12 C23 12, 24 14, 24 15.5 C24 17, 22 18, 20 18 C18 18, 16 19, 16 21 C16 23, 18 24, 20 24 C22 24, 24 23, 24 21"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span>Sign in with SoapBox</span>
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </div>
              )}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-sm text-purple-200/60">
              <Shield className="h-4 w-4" />
              <span>Secured by SoapBox SSO</span>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-2 text-purple-200/50">
                  Enterprise-grade security
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-purple-200/60">
              <div className="space-y-1">
                <div className="text-lg">256-bit</div>
                <div>Encryption</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg">SSO</div>
                <div>Single Sign-On</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg">2FA</div>
                <div>Supported</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-purple-200/50">
            Need help?{" "}
            <a href="#" className="text-purple-300 hover:text-purple-200 underline underline-offset-4">
              Contact Support
            </a>
          </p>
          <p className="text-xs text-purple-200/40 flex items-center justify-center gap-1">
            Powered by{" "}
            <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SoapBox Super App
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

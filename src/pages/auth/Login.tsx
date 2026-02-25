import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo, LogoIcon } from "@/components/Logo";
import { ExternalLink, Shield, Church, Users, DollarSign, Calendar } from "lucide-react";

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
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <div className="mb-8">
            <Logo size="lg" showTagline className="text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Manage Your Church<br />Community with Ease
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-md">
            A complete solution for member management, donations tracking, event planning, and spiritual growth.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Member Management</p>
                <p className="text-xs text-blue-200">Track & engage</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Donations</p>
                <p className="text-xs text-blue-200">Financial tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Events</p>
                <p className="text-xs text-blue-200">Plan & schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="p-2 bg-white/20 rounded-lg">
                <Church className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Discipleship</p>
                <p className="text-xs text-blue-200">Spiritual growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center space-y-4 text-center mb-8">
            <Logo size="lg" showTagline />
          </div>

          {/* Login Card */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30">
                  <Church className="h-6 w-6 text-sky-400" />
                </div>
              </div>
              <CardTitle className="text-xl text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">
                Sign in with your SoapBox account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SSO Login Button */}
              <Button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-sky-500 via-blue-500 to-blue-600 hover:from-sky-600 hover:via-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Connecting to SoapBox...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LogoIcon size="sm" className="h-5 w-5" />
                    <span>Sign in with SoapBox</span>
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </div>
                )}
              </Button>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4" />
                <span>Secured by SoapBox SSO</span>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900 px-2 text-slate-500">
                    Enterprise-grade security
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-500">
                <div className="space-y-1">
                  <div className="text-lg text-sky-400 font-semibold">256-bit</div>
                  <div>Encryption</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg text-sky-400 font-semibold">SSO</div>
                  <div>Single Sign-On</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg text-sky-400 font-semibold">2FA</div>
                  <div>Supported</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-500">
              Need help?{" "}
              <a href="#" className="text-sky-400 hover:text-sky-300 underline underline-offset-4">
                Contact Support
              </a>
            </p>
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
              Powered by{" "}
              <span className="font-semibold text-sky-400">
                SoapBox Super App
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

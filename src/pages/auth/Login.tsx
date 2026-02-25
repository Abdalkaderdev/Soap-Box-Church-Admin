import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo, LogoIcon } from "@/components/Logo";
import { ExternalLink, Shield, Church, Users, DollarSign, Calendar, CheckCircle } from "lucide-react";

// Get base API URL for SoapBox Super App
const getSoapBoxApiUrl = () => {
  return window.location.origin.includes("localhost")
    ? "http://localhost:5000"
    : "https://api.soapboxsuperapp.com";
};

export default function Login() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [ssoError, setSsoError] = useState<string | null>(null);

  // Handle SSO token on page load
  useEffect(() => {
    const handleSSOToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get("sso_token");

      if (ssoToken) {
        setIsLoading(true);
        setSsoError(null);

        try {
          // Validate the SSO token with the SoapBox API
          const response = await fetch(`${getSoapBoxApiUrl()}/api/sso/validate-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token: ssoToken }),
          });

          const data = await response.json();

          if (data.success && data.user) {
            // Store user info in localStorage for the CRM
            localStorage.setItem("soapbox_user", JSON.stringify(data.user));
            localStorage.setItem("soapbox_authenticated", "true");

            // Clear the SSO token from URL
            window.history.replaceState({}, document.title, "/login");

            // Redirect to dashboard
            navigate("/dashboard");
          } else {
            setSsoError(data.message || "SSO authentication failed");
            // Clear the token from URL
            window.history.replaceState({}, document.title, "/login");
          }
        } catch (error) {
          console.error("SSO validation error:", error);
          setSsoError("Failed to validate SSO token. Please try again.");
          window.history.replaceState({}, document.title, "/login");
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleSSOToken();
  }, [navigate]);

  const handleSSOLogin = async () => {
    setIsLoading(true);
    setSsoError(null);

    // Redirect to the main SoapBox app for authentication
    const soapboxAuthUrl = window.location.origin.includes("localhost")
      ? "http://localhost:5000/api/sso/redirect/church-admin"
      : "https://api.soapboxsuperapp.com/api/sso/redirect/church-admin";

    // Redirect to SoapBox for SSO
    window.location.href = soapboxAuthUrl;
  };

  const features = [
    { icon: Users, label: "Member Management", desc: "Track & engage" },
    { icon: DollarSign, label: "Donations", desc: "Financial tracking" },
    { icon: Calendar, label: "Events", desc: "Plan & schedule" },
    { icon: Church, label: "Discipleship", desc: "Spiritual growth" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a5f_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 xl:p-16 text-white">
          <div className="mb-10">
            <Logo size="lg" showTagline className="text-white" />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Manage Your Church
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Community with Ease
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed">
            A complete solution for member management, donations tracking, event planning, and spiritual growth.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/10">
                  <feature.icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{feature.label}</p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>10,000+ churches</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>99.9% uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center space-y-4 text-center mb-8">
            <Logo size="lg" showTagline />
          </div>

          {/* Login Card */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-slate-950/50">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
                  <Church className="h-7 w-7 text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white font-semibold">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">
                Sign in with your SoapBox account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SSO Error Message */}
              {ssoError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <p className="text-sm text-red-400">{ssoError}</p>
                </div>
              )}

              {/* SSO Login Button */}
              <Button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-semibold shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/30 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    <span>Authenticating...</span>
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
                  <span className="bg-slate-900 px-3 text-slate-500">
                    Enterprise-grade security
                  </span>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1.5">
                  <div className="text-lg text-blue-400 font-bold">256-bit</div>
                  <div className="text-xs text-slate-500">Encryption</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-lg text-blue-400 font-bold">SSO</div>
                  <div className="text-xs text-slate-500">Single Sign-On</div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-lg text-blue-400 font-bold">2FA</div>
                  <div className="text-xs text-slate-500">Supported</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-500">
              Need help?{" "}
              <a href="#" className="text-amber-400 hover:text-amber-300 font-medium">
                Contact Support
              </a>
            </p>
            <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
              Powered by{" "}
              <span className="font-semibold text-amber-400">
                SoapBox Super App
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

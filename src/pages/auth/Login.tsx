import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo, LogoIcon } from "@/components/Logo";
import { ExternalLink, Shield, Church, Users, Heart, Calendar, Sparkles } from "lucide-react";

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
            // Store user info in localStorage
            localStorage.setItem("soapbox_user", JSON.stringify(data.user));
            localStorage.setItem("soapbox_authenticated", "true");

            // Clear the SSO token from URL
            window.history.replaceState({}, document.title, "/login");

            // Redirect to dashboard
            navigate("/dashboard");
          } else {
            setSsoError(data.message || "SSO authentication failed");
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
    { icon: Users, label: "Member Care", desc: "Nurture your congregation" },
    { icon: Heart, label: "Generosity", desc: "Stewardship tracking" },
    { icon: Calendar, label: "Gatherings", desc: "Events & services" },
    { icon: Church, label: "Discipleship", desc: "Spiritual formation" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero section with warm church aesthetic */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-walnut-900">
        {/* Decorative cross pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M27 0h6v60h-6zM0 27h60v6H0z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Warm glow effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sidebar-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-burgundy-600/20 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-ivory-200/5 rounded-full blur-[60px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 xl:p-16 text-white">
          <div className="mb-12">
            <Logo size="lg" className="text-white" />
          </div>

          <h1 className="font-serif text-4xl xl:text-5xl font-semibold mb-6 leading-tight">
            Shepherding Your
            <br />
            <span className="text-sidebar-primary">
              Community with Care
            </span>
          </h1>

          <p className="text-lg text-ivory-300/80 mb-12 max-w-md leading-relaxed">
            A thoughtful solution for member care, stewardship, event planning, and spiritual growth in your congregation.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {features.map((feature, index) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-2.5 bg-sidebar-primary/20 rounded-lg border border-sidebar-primary/20">
                  <feature.icon className="h-5 w-5 text-sidebar-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-ivory-100">{feature.label}</p>
                  <p className="text-xs text-ivory-400/70">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center gap-8">
            <div className="flex items-center gap-2 text-ivory-400/70 text-sm">
              <Sparkles className="h-4 w-4 text-sidebar-primary" />
              <span>Trusted by churches</span>
            </div>
            <div className="flex items-center gap-2 text-ivory-400/70 text-sm">
              <Shield className="h-4 w-4 text-sage-400" />
              <span>Secure & reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-ivory-50 via-ivory-100 to-ivory-50 paper-texture">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center space-y-4 text-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Login Card */}
          <Card className="border-ivory-200/80 bg-white/80 backdrop-blur-xl shadow-warm-lg">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-burgundy-50 to-burgundy-100 border border-burgundy-200/50 shadow-warm">
                  <Church className="h-8 w-8 text-burgundy-700" />
                </div>
              </div>
              <CardTitle className="font-serif text-2xl text-walnut-900">Welcome Back</CardTitle>
              <CardDescription className="text-walnut-600">
                Sign in with your SoapBox account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SSO Error Message */}
              {ssoError && (
                <div className="bg-burgundy-50 border border-burgundy-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-burgundy-700">{ssoError}</p>
                </div>
              )}

              {/* SSO Login Button */}
              <Button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-burgundy-700 to-burgundy-800 hover:from-burgundy-800 hover:to-burgundy-900 text-ivory-50 font-semibold shadow-warm transition-all duration-300 hover:shadow-warm-lg hover:scale-[1.01] rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-ivory-200 border-t-transparent" />
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
              <div className="flex items-center justify-center gap-2 text-sm text-walnut-500">
                <Shield className="h-4 w-4 text-sage-600" />
                <span>Secured by SoapBox SSO</span>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-ivory-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-walnut-400">
                    Your data is protected
                  </span>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1.5 p-3 rounded-lg bg-ivory-50/50">
                  <div className="text-lg text-burgundy-700 font-bold font-serif">256-bit</div>
                  <div className="text-xs text-walnut-500">Encryption</div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-ivory-50/50">
                  <div className="text-lg text-burgundy-700 font-bold font-serif">SSO</div>
                  <div className="text-xs text-walnut-500">Single Sign-On</div>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-ivory-50/50">
                  <div className="text-lg text-burgundy-700 font-bold font-serif">2FA</div>
                  <div className="text-xs text-walnut-500">Supported</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-sm text-walnut-500">
              Need help?{" "}
              <a href="#" className="text-burgundy-700 hover:text-burgundy-800 font-medium underline-offset-4 hover:underline">
                Contact Support
              </a>
            </p>
            <div className="flex items-center justify-center gap-2">
              <LogoIcon size="sm" className="h-4 w-4 opacity-50" />
              <p className="text-xs text-walnut-400">
                Powered by{" "}
                <span className="font-semibold text-burgundy-700">
                  SoapBox
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

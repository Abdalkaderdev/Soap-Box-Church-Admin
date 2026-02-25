import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppRoutes } from "./routes";
import { MainLayout } from "./components/layout";
import "./App.css";

// Simple auth check - in production this would verify SSO token with SoapBox
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token (from SoapBox SSO)
    const checkAuth = async () => {
      // In production, this would:
      // 1. Check for SSO token in cookies/localStorage
      // 2. Verify token with SoapBox API
      // 3. Return auth status

      // For demo purposes, check if user has "logged in"
      const hasVisitedBefore = sessionStorage.getItem("soapbox_church_auth");

      // Simulate auth check delay
      await new Promise(resolve => setTimeout(resolve, 100));

      setIsAuthenticated(!!hasVisitedBefore);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    sessionStorage.setItem("soapbox_church_auth", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("soapbox_church_auth");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
}

function App() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Login page doesn't use the main layout
  const isAuthPage = location === "/login";

  // Handle authentication redirects
  useEffect(() => {
    if (isLoading) return;

    // If on login page and authenticated, redirect to dashboard
    if (isAuthPage && isAuthenticated) {
      navigate("/");
      return;
    }

    // If on protected page and not authenticated, redirect to login
    if (!isAuthPage && !isAuthenticated) {
      // For demo, auto-authenticate after visiting login
      sessionStorage.setItem("soapbox_church_auth", "true");
      // In production, uncomment below to require login:
      // navigate("/login");
    }
  }, [isAuthenticated, isAuthPage, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm text-purple-200/70">Connecting to SoapBox...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}

export default App;

import { useEffect, useState, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { AppRoutes } from "./routes";
import { MainLayout } from "./components/layout";
import "./App.css";

// User interface from SoapBox SSO
interface SoapBoxUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
  churchId?: string;
}

// Auth context type
interface AuthContextType {
  user: SoapBoxUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth hook for components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth check with SSO support
function useAuthState() {
  const [user, setUser] = useState<SoapBoxUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for SSO auth in localStorage (set by Login page on SSO validation)
    const checkAuth = async () => {
      const authFlag = localStorage.getItem("soapbox_authenticated");
      const userJson = localStorage.getItem("soapbox_user");

      // Simulate small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 100));

      if (authFlag === "true" && userJson) {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Failed to parse user data:", e);
          setIsAuthenticated(false);
        }
      } else {
        // For development, allow access with session storage fallback
        const devAuth = sessionStorage.getItem("soapbox_church_auth");
        if (devAuth === "true") {
          setIsAuthenticated(true);
          setUser({
            id: "dev-user",
            email: "admin@church.com",
            username: "admin",
            firstName: "Church",
            lastName: "Admin",
            role: "church_admin",
          });
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("soapbox_authenticated");
    localStorage.removeItem("soapbox_user");
    sessionStorage.removeItem("soapbox_church_auth");
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, isLoading, logout };
}

function App() {
  const [location, navigate] = useLocation();
  const authState = useAuthState();
  const { isAuthenticated, isLoading, user, logout } = authState;

  // Public pages don't use the main layout
  const isPublicPage = location === "/login" || location === "/" || location === "/features" || location === "/pricing";

  // Handle authentication redirects
  useEffect(() => {
    if (isLoading) return;

    // If on login page and authenticated, redirect to dashboard
    if (location === "/login" && isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    // If on protected page and not authenticated, redirect to login
    if (!isPublicPage && !isAuthenticated) {
      // For demo/development, auto-authenticate
      sessionStorage.setItem("soapbox_church_auth", "true");
      // In production, uncomment below to require login:
      // navigate("/login");
    }
  }, [isAuthenticated, isPublicPage, isLoading, navigate, location]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Connecting to SoapBox...</p>
        </div>
      </div>
    );
  }

  // Auth context value
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };

  // Public pages render without layout
  if (isPublicPage) {
    return (
      <AuthContext.Provider value={authContextValue}>
        <AppRoutes />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </AuthContext.Provider>
  );
}

export default App;

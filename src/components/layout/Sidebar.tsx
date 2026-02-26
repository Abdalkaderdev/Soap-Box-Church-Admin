import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { routes } from "@/routes";
import { Logo, LogoIcon } from "@/components/Logo";
import { useAuth } from "@/App";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  DollarSign,
  Calendar,
  Mail,
  Heart,
  BookOpen,
  BookMarked,
  HandHeart,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Globe,
  Home,
  UserCheck,
  ClipboardCheck,
  UserPlus,
  FileText,
  Sparkles,
  Baby,
  Building,
  GraduationCap,
  HeartHandshake,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    href: routes.members.list,
    icon: Users,
  },
  {
    title: "Donations",
    href: routes.donations.dashboard,
    icon: DollarSign,
  },
  {
    title: "Events",
    href: routes.events,
    icon: Calendar,
  },
  {
    title: "Check-in",
    href: routes.checkin,
    icon: UserCheck,
  },
  {
    title: "Attendance",
    href: routes.attendance,
    icon: ClipboardCheck,
  },
  {
    title: "Visitors",
    href: routes.visitors,
    icon: UserPlus,
  },
  {
    title: "Statements",
    href: routes.statements,
    icon: FileText,
  },
  {
    title: "Communications",
    href: routes.communications,
    icon: Mail,
  },
  {
    title: "Volunteers",
    href: routes.volunteers,
    icon: Heart,
  },
  {
    title: "Discipleship",
    href: routes.discipleship,
    icon: BookOpen,
  },
  {
    title: "Small Groups",
    href: routes.groups,
    icon: UsersRound,
  },
  {
    title: "Sermon Prep",
    href: routes.sermons,
    icon: BookMarked,
  },
  {
    title: "Prayer Requests",
    href: routes.prayer,
    icon: HandHeart,
  },
  {
    title: "Reports",
    href: routes.reports,
    icon: BarChart3,
  },
];

// Upcoming features (Coming Soon)
const upcomingFeatures = [
  {
    title: "Financial Dashboard",
    href: routes.upcoming.financialDashboard,
    icon: Sparkles,
  },
  {
    title: "Child Check-in",
    href: routes.upcoming.childCheckin,
    icon: Baby,
  },
  {
    title: "Facility Booking",
    href: routes.upcoming.facilityBooking,
    icon: Building,
  },
  {
    title: "Volunteer Scheduling",
    href: routes.upcoming.volunteerScheduling,
    icon: CalendarClock,
  },
  {
    title: "Online Classes",
    href: routes.upcoming.onlineClasses,
    icon: GraduationCap,
  },
  {
    title: "Pastoral Care",
    href: routes.upcoming.pastoralCare,
    icon: HeartHandshake,
  },
];

const bottomNavigationItems = [
  {
    title: "Settings",
    href: routes.settings,
    icon: Settings,
  },
];

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();
  const [isNavigatingToBuilder, setIsNavigatingToBuilder] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const handleSignOut = () => {
    logout();
    navigate(routes.login);
  };

  // Navigate to Website Builder with SSO
  const handleNavigateToBuilder = async () => {
    if (isNavigatingToBuilder) return;
    setIsNavigatingToBuilder(true);

    try {
      // Generate SSO token via API
      const response = await api.post<{
        success: boolean;
        redirectUrl?: string;
        message?: string;
      }>("/sso/generate-token", { targetApp: "website-builder" });

      if (response.success && response.redirectUrl) {
        // Open the builder with the SSO token
        window.open(response.redirectUrl, "_blank");
      } else {
        // Fallback: open builder without SSO (user will need to login)
        const fallbackUrl = window.location.origin.includes("localhost")
          ? "http://localhost:3000"
          : "https://builder.soapboxsuperapp.com";
        window.open(fallbackUrl, "_blank");
      }
    } catch (error) {
      console.error("SSO token generation failed:", error);
      // Fallback: open builder without SSO
      const fallbackUrl = window.location.origin.includes("localhost")
        ? "http://localhost:3000"
        : "https://builder.soapboxsuperapp.com";
      window.open(fallbackUrl, "_blank");
    } finally {
      setIsNavigatingToBuilder(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r wood-gradient border-walnut-800/30">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-walnut-700/30 px-5">
          <Logo size="sm" className="text-white" />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-3 text-[10px] font-semibold text-walnut-400 uppercase tracking-widest">
            Ministry
          </p>
          {navigationItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-ivory-300/80 hover:bg-walnut-700/40 hover:text-ivory-100 transition-all duration-200 h-11 rounded-lg",
                  "animate-slide-in",
                  isActive(item.href) &&
                    "bg-burgundy-800/50 text-ivory-100 font-medium border-l-[3px] border-l-sidebar-primary rounded-l-none shadow-inner-warm"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive(item.href) ? "text-sidebar-primary" : "text-walnut-400"
                )} />
                <span className="flex-1 text-left font-medium">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Coming Soon Section */}
          <Separator className="my-4 bg-walnut-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-amber-500/80 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </p>
          {upcomingFeatures.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-ivory-400/60 hover:bg-amber-900/20 hover:text-amber-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-amber-900/30 text-amber-200 font-medium border-l-[3px] border-l-amber-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-amber-400" : "text-amber-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-walnut-700/30 px-3 py-4">
          <p className="px-3 mb-3 text-[10px] font-semibold text-walnut-400 uppercase tracking-widest">
            System
          </p>
          {bottomNavigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-ivory-300/80 hover:bg-walnut-700/40 hover:text-ivory-100 transition-all duration-200 h-11 rounded-lg",
                  isActive(item.href) &&
                    "bg-burgundy-800/50 text-ivory-100 font-medium border-l-[3px] border-l-sidebar-primary rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px]",
                  isActive(item.href) ? "text-sidebar-primary" : "text-walnut-400"
                )} />
                {item.title}
              </Button>
            </Link>
          ))}

          <Separator className="my-4 bg-walnut-700/30" />

          {/* Quick Links */}
          <p className="px-3 mb-2 text-[10px] font-semibold text-walnut-400 uppercase tracking-widest">
            Quick Links
          </p>

          {/* Website Builder */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-ivory-400/70 hover:bg-sage-800/30 hover:text-sage-300 transition-all duration-200 h-10 rounded-lg mb-1"
            onClick={handleNavigateToBuilder}
            disabled={isNavigatingToBuilder}
          >
            <Globe className={`h-4 w-4 text-sage-500 ${isNavigatingToBuilder ? "animate-spin" : ""}`} />
            <span className="flex-1 text-left text-sm">
              {isNavigatingToBuilder ? "Opening..." : "Website Builder"}
            </span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>

          {/* Back to SoapBox */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-ivory-400/70 hover:bg-walnut-700/40 hover:text-ivory-200 transition-all duration-200 h-10 rounded-lg mb-1"
            onClick={() => {
              window.location.href = "https://soapboxsuperapp.com/";
            }}
          >
            <Home className="h-4 w-4 text-walnut-400" />
            <span className="flex-1 text-left text-sm">SoapBox Home</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>

          <Separator className="my-3 bg-walnut-700/30" />

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-ivory-500/60 hover:bg-burgundy-900/30 hover:text-burgundy-300 transition-all duration-200 h-10 rounded-lg"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>

        {/* Powered by footer */}
        <div className="px-5 py-4 border-t border-walnut-800/40 bg-walnut-950/50">
          <div className="flex items-center justify-center gap-2">
            <LogoIcon size="sm" className="h-4 w-4 opacity-60" />
            <p className="text-[10px] text-walnut-500">
              Powered by{" "}
              <span className="font-semibold text-sidebar-primary">
                SoapBox
              </span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

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
  Megaphone,
  LineChart,
  // Spiritual growth icons
  Flame,
  Cross,
  BookHeart,
  Trophy,
  // New admin section icons
  Briefcase,
  BarChart2,
  FileStack,
  Shield,
  Wrench,
  Film,
  UserCog,
  MessageSquare,
  QrCode,
  Receipt,
  TrendingUp,
  Send,
  Share2,
  Users2,
  // Organization structure icons
  Landmark,
  Building2,
  Network,
  Key,
  CalendarCheck,
  // Equipment icon
  Package,
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
  {
    title: "Financial Dashboard",
    href: routes.financialDashboard,
    icon: LineChart,
  },
];

// Spiritual growth admin section
const spiritualAdminItems = [
  {
    title: "Spiritual Dashboard",
    href: routes.spiritualDashboard,
    icon: Heart,
  },
  {
    title: "Reading Plans",
    href: routes.readingPlansAdmin,
    icon: BookHeart,
  },
  {
    title: "Devotionals",
    href: routes.devotionalsAdmin,
    icon: Cross,
  },
  {
    title: "Gamification",
    href: routes.gamificationAdmin,
    icon: Trophy,
  },
];

// Upcoming features (Coming Soon)
const upcomingFeatures = [
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
  {
    title: "Announcements",
    href: routes.upcoming.announcements,
    icon: Megaphone,
  },
];

// Ministry Admin section
const ministryAdminItems = [
  {
    title: "Events",
    href: routes.ministry.events,
    icon: Calendar,
  },
  {
    title: "Groups",
    href: routes.ministry.groups,
    icon: UsersRound,
  },
  {
    title: "Moderation",
    href: routes.ministry.moderation,
    icon: Shield,
  },
  {
    title: "Prayer",
    href: routes.ministry.prayer,
    icon: HandHeart,
  },
  {
    title: "Reports",
    href: routes.ministry.reports,
    icon: BarChart3,
  },
  {
    title: "Resources",
    href: routes.ministry.resources,
    icon: FileStack,
  },
  {
    title: "Settings",
    href: routes.ministry.settings,
    icon: Settings,
  },
  {
    title: "Volunteers",
    href: routes.ministry.volunteers,
    icon: Heart,
  },
];

// Group Admin section
const groupAdminItems = [
  {
    title: "Members",
    href: routes.groupAdmin.members,
    icon: Users,
  },
  {
    title: "Moderation",
    href: routes.groupAdmin.moderation,
    icon: Shield,
  },
  {
    title: "Resources",
    href: routes.groupAdmin.resources,
    icon: FileStack,
  },
  {
    title: "Settings",
    href: routes.groupAdmin.settings,
    icon: Settings,
  },
];

// Management section
const managementItems = [
  {
    title: "Members",
    href: routes.management.members,
    icon: UserCog,
  },
  {
    title: "Volunteers",
    href: routes.management.volunteers,
    icon: Heart,
  },
  {
    title: "Staff",
    href: routes.management.staff,
    icon: Briefcase,
  },
  {
    title: "Media",
    href: routes.management.media,
    icon: Film,
  },
  {
    title: "Background Checks",
    href: routes.management.backgroundChecks,
    icon: ClipboardCheck,
  },
];

// Analytics section
const analyticsItems = [
  {
    title: "Overview",
    href: routes.analytics.main,
    icon: BarChart2,
  },
  {
    title: "Dashboard",
    href: routes.analytics.dashboard,
    icon: TrendingUp,
  },
  {
    title: "Engagement",
    href: routes.analytics.engagement,
    icon: Users2,
  },
];

// Content section
const contentItems = [
  {
    title: "Bulk Communication",
    href: routes.content.bulkCommunication,
    icon: Send,
  },
  {
    title: "Distribution",
    href: routes.content.distribution,
    icon: Share2,
  },
  {
    title: "Community Admin",
    href: routes.content.communityAdmin,
    icon: MessageSquare,
  },
];

// Tools section
const toolsItems = [
  {
    title: "Sermon Studio",
    href: routes.tools.sermonStudio,
    icon: BookMarked,
  },
  {
    title: "QR Management",
    href: routes.tools.qrManagement,
    icon: QrCode,
  },
  {
    title: "Tax Reporting",
    href: routes.tools.taxReporting,
    icon: Receipt,
  },
];

// Organization Structure section
const organizationItems = [
  {
    title: "Ministries",
    href: routes.organization.ministries,
    icon: Landmark,
  },
  {
    title: "Departments",
    href: routes.organization.departments,
    icon: Building2,
  },
  {
    title: "Teams",
    href: routes.organization.teams,
    icon: Network,
  },
  {
    title: "Roles & Permissions",
    href: routes.organization.roles,
    icon: Key,
  },
  {
    title: "Service Allocation",
    href: routes.organization.serviceAllocation,
    icon: CalendarCheck,
  },
];

// Equipment & Assets
const equipmentItems = [
  {
    title: "Equipment & Assets",
    href: routes.equipment,
    icon: Package,
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r sanctuary-deep-gradient border-vesper-800/30">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-vesper-700/30 px-5">
          <Logo size="sm" className="text-white" />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-3 text-[10px] font-semibold text-vesper-400 uppercase tracking-widest">
            Ministry
          </p>
          {navigationItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-vesper-700/40 hover:text-grace-100 transition-all duration-200 h-11 rounded-lg",
                  "animate-slide-in",
                  isActive(item.href) &&
                    "bg-sanctuary-800/50 text-grace-100 font-medium border-l-[3px] border-l-sidebar-primary rounded-l-none shadow-inner-warm"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive(item.href) ? "text-sidebar-primary" : "text-vesper-400"
                )} />
                <span className="flex-1 text-left font-medium">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Spiritual Growth Admin Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-purple-400/80 uppercase tracking-widest flex items-center gap-2">
            <Flame className="h-3 w-3" />
            Spiritual Growth
          </p>
          {spiritualAdminItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-purple-900/30 hover:text-purple-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-purple-900/40 text-purple-200 font-medium border-l-[3px] border-l-purple-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-purple-400" : "text-purple-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Ministry Admin Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-blue-400/80 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="h-3 w-3" />
            Ministry Admin
          </p>
          {ministryAdminItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-blue-900/30 hover:text-blue-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-blue-900/40 text-blue-200 font-medium border-l-[3px] border-l-blue-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-blue-400" : "text-blue-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Group Admin Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-green-400/80 uppercase tracking-widest flex items-center gap-2">
            <UsersRound className="h-3 w-3" />
            Group Admin
          </p>
          {groupAdminItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-green-900/30 hover:text-green-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-green-900/40 text-green-200 font-medium border-l-[3px] border-l-green-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-green-400" : "text-green-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Management Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-orange-400/80 uppercase tracking-widest flex items-center gap-2">
            <UserCog className="h-3 w-3" />
            Management
          </p>
          {managementItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-orange-900/30 hover:text-orange-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-orange-900/40 text-orange-200 font-medium border-l-[3px] border-l-orange-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-orange-400" : "text-orange-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Analytics Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-cyan-400/80 uppercase tracking-widest flex items-center gap-2">
            <BarChart2 className="h-3 w-3" />
            Analytics
          </p>
          {analyticsItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-cyan-900/30 hover:text-cyan-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-cyan-900/40 text-cyan-200 font-medium border-l-[3px] border-l-cyan-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-cyan-400" : "text-cyan-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Content Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-pink-400/80 uppercase tracking-widest flex items-center gap-2">
            <FileStack className="h-3 w-3" />
            Content
          </p>
          {contentItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-pink-900/30 hover:text-pink-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-pink-900/40 text-pink-200 font-medium border-l-[3px] border-l-pink-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-pink-400" : "text-pink-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Tools Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-teal-400/80 uppercase tracking-widest flex items-center gap-2">
            <Wrench className="h-3 w-3" />
            Tools
          </p>
          {toolsItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-teal-900/30 hover:text-teal-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-teal-900/40 text-teal-200 font-medium border-l-[3px] border-l-teal-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-teal-400" : "text-teal-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Organization Structure Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-indigo-400/80 uppercase tracking-widest flex items-center gap-2">
            <Landmark className="h-3 w-3" />
            Organization
          </p>
          {organizationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-indigo-900/30 hover:text-indigo-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-indigo-900/40 text-indigo-200 font-medium border-l-[3px] border-l-indigo-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-indigo-400" : "text-indigo-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Equipment & Assets Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest flex items-center gap-2">
            <Package className="h-3 w-3" />
            Assets
          </p>
          {equipmentItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-emerald-900/30 hover:text-emerald-200 transition-all duration-200 h-10 rounded-lg",
                  isActive(item.href) &&
                    "bg-emerald-900/40 text-emerald-200 font-medium border-l-[3px] border-l-emerald-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[16px] w-[16px] transition-colors",
                  isActive(item.href) ? "text-emerald-400" : "text-emerald-500/50"
                )} />
                <span className="flex-1 text-left text-sm">{item.title}</span>
              </Button>
            </Link>
          ))}

          {/* Coming Soon Section */}
          <Separator className="my-4 bg-vesper-700/30" />
          <p className="px-3 mb-3 text-[10px] font-semibold text-amber-500/80 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </p>
          {upcomingFeatures.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-400/60 hover:bg-amber-900/20 hover:text-amber-200 transition-all duration-200 h-10 rounded-lg",
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
        <div className="border-t border-vesper-700/30 px-3 py-4">
          <p className="px-3 mb-3 text-[10px] font-semibold text-vesper-400 uppercase tracking-widest">
            System
          </p>
          {bottomNavigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-grace-300/80 hover:bg-vesper-700/40 hover:text-grace-100 transition-all duration-200 h-11 rounded-lg",
                  isActive(item.href) &&
                    "bg-sanctuary-800/50 text-grace-100 font-medium border-l-[3px] border-l-sidebar-primary rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px]",
                  isActive(item.href) ? "text-sidebar-primary" : "text-vesper-400"
                )} />
                {item.title}
              </Button>
            </Link>
          ))}

          <Separator className="my-4 bg-vesper-700/30" />

          {/* Quick Links */}
          <p className="px-3 mb-2 text-[10px] font-semibold text-vesper-400 uppercase tracking-widest">
            Quick Links
          </p>

          {/* Website Builder */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-grace-400/70 hover:bg-spirit-800/30 hover:text-spirit-300 transition-all duration-200 h-10 rounded-lg mb-1"
            onClick={handleNavigateToBuilder}
            disabled={isNavigatingToBuilder}
          >
            <Globe className={`h-4 w-4 text-spirit-500 ${isNavigatingToBuilder ? "animate-spin" : ""}`} />
            <span className="flex-1 text-left text-sm">
              {isNavigatingToBuilder ? "Opening..." : "Website Builder"}
            </span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>

          {/* Back to SoapBox */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-grace-400/70 hover:bg-vesper-700/40 hover:text-grace-200 transition-all duration-200 h-10 rounded-lg mb-1"
            onClick={() => {
              window.location.href = "https://soapboxsuperapp.com/";
            }}
          >
            <Home className="h-4 w-4 text-vesper-400" />
            <span className="flex-1 text-left text-sm">SoapBox Home</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>

          <Separator className="my-3 bg-vesper-700/30" />

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-grace-500/60 hover:bg-sanctuary-900/30 hover:text-sanctuary-300 transition-all duration-200 h-10 rounded-lg"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>

        {/* Powered by footer */}
        <div className="px-5 py-4 border-t border-vesper-800/40 bg-vesper-950/50">
          <div className="flex items-center justify-center gap-2">
            <LogoIcon size="sm" className="h-4 w-4 opacity-60" />
            <p className="text-[10px] text-vesper-500">
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

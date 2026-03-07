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
  Flame,
  Cross,
  BookHeart,
  Trophy,
  Briefcase,
  BarChart2,
  Shield,
  Film,
  UserCog,
  QrCode,
  Receipt,
  TrendingUp,
  Send,
  Share2,
  Users2,
  Landmark,
  Building2,
  Network,
  Key,
  CalendarCheck,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  labelIcon?: LucideIcon;
  color: string;
  items: NavItem[];
}

// ─── Reorganized Navigation ─────────────────────────────────────────────────
// Consolidated into logical categories with no duplicate modules.

const navSections: NavSection[] = [
  // 1. Overview
  {
    label: "Overview",
    color: "sanctuary",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },

  // 2. People
  {
    label: "People",
    labelIcon: Users,
    color: "blue",
    items: [
      { title: "Members", href: routes.members.list, icon: Users },
      { title: "Visitors", href: routes.visitors, icon: UserPlus },
      { title: "Small Groups", href: routes.groups, icon: UsersRound },
      { title: "Volunteers", href: routes.volunteers, icon: Heart },
      { title: "Communications", href: routes.communications, icon: Mail },
    ],
  },

  // 3. Church Operations
  {
    label: "Operations",
    labelIcon: Calendar,
    color: "green",
    items: [
      { title: "Events", href: routes.events, icon: Calendar },
      { title: "Check-in", href: routes.checkin, icon: UserCheck },
      { title: "Attendance", href: routes.attendance, icon: ClipboardCheck },
      { title: "Service Allocation", href: routes.organization.serviceAllocation, icon: CalendarCheck },
      { title: "Equipment & Assets", href: routes.equipment, icon: Package },
    ],
  },

  // 4. Spiritual Growth
  {
    label: "Spiritual Growth",
    labelIcon: Flame,
    color: "purple",
    items: [
      { title: "Discipleship", href: routes.discipleship, icon: BookOpen },
      { title: "Reading Plans", href: routes.readingPlansAdmin, icon: BookHeart },
      { title: "Devotionals", href: routes.devotionalsAdmin, icon: Cross },
      { title: "Sermon Prep", href: routes.sermons, icon: BookMarked },
      { title: "Prayer Requests", href: routes.prayer, icon: HandHeart },
      { title: "Gamification", href: routes.gamificationAdmin, icon: Trophy },
    ],
  },

  // 5. Finance
  {
    label: "Finance",
    labelIcon: DollarSign,
    color: "emerald",
    items: [
      { title: "Donations", href: routes.donations.dashboard, icon: DollarSign },
      { title: "Financial Dashboard", href: routes.financialDashboard, icon: LineChart },
      { title: "Giving Statements", href: routes.statements, icon: FileText },
      { title: "Tax Reporting", href: routes.tools.taxReporting, icon: Receipt },
    ],
  },

  // 6. Organization Structure
  {
    label: "Organization",
    labelIcon: Landmark,
    color: "indigo",
    items: [
      { title: "Ministries", href: routes.organization.ministries, icon: Landmark },
      { title: "Departments", href: routes.organization.departments, icon: Building2 },
      { title: "Teams", href: routes.organization.teams, icon: Network },
      { title: "Roles & Permissions", href: routes.organization.roles, icon: Key },
    ],
  },

  // 7. Reports & Analytics
  {
    label: "Reports & Analytics",
    labelIcon: BarChart3,
    color: "cyan",
    items: [
      { title: "Reports", href: routes.reports, icon: BarChart3 },
      { title: "Analytics", href: routes.analytics.main, icon: BarChart2 },
      { title: "Engagement", href: routes.analytics.engagement, icon: Users2 },
      { title: "Trends", href: routes.analytics.dashboard, icon: TrendingUp },
    ],
  },

  // 8. Administration
  {
    label: "Administration",
    labelIcon: UserCog,
    color: "orange",
    items: [
      { title: "Staff", href: routes.management.staff, icon: Briefcase },
      { title: "Background Checks", href: routes.management.backgroundChecks, icon: Shield },
      { title: "Media", href: routes.management.media, icon: Film },
      { title: "Content Distribution", href: routes.content.distribution, icon: Share2 },
      { title: "Bulk Communication", href: routes.content.bulkCommunication, icon: Send },
      { title: "QR Management", href: routes.tools.qrManagement, icon: QrCode },
    ],
  },

  // 9. Coming Soon
  {
    label: "Coming Soon",
    labelIcon: Sparkles,
    color: "amber",
    items: [
      { title: "Child Check-in", href: routes.upcoming.childCheckin, icon: Baby },
      { title: "Facility Booking", href: routes.upcoming.facilityBooking, icon: Building },
      { title: "Volunteer Scheduling", href: routes.upcoming.volunteerScheduling, icon: CalendarClock },
      { title: "Online Classes", href: routes.upcoming.onlineClasses, icon: GraduationCap },
      { title: "Pastoral Care", href: routes.upcoming.pastoralCare, icon: HeartHandshake },
      { title: "Announcements", href: routes.upcoming.announcements, icon: Megaphone },
    ],
  },
];

// Color mapping for section styling
const sectionColors: Record<string, { hover: string; active: string; border: string; icon: string; iconInactive: string; label: string }> = {
  sanctuary: {
    hover: "hover:bg-vesper-700/40 hover:text-grace-100",
    active: "bg-sanctuary-800/50 text-grace-100 font-medium border-l-[3px] border-l-sidebar-primary rounded-l-none shadow-inner-warm",
    border: "border-l-sidebar-primary",
    icon: "text-sidebar-primary",
    iconInactive: "text-vesper-400",
    label: "text-vesper-400",
  },
  blue: {
    hover: "hover:bg-blue-900/30 hover:text-blue-200",
    active: "bg-blue-900/40 text-blue-200 font-medium border-l-[3px] border-l-blue-500 rounded-l-none",
    border: "border-l-blue-500",
    icon: "text-blue-400",
    iconInactive: "text-blue-500/50",
    label: "text-blue-400/80",
  },
  green: {
    hover: "hover:bg-green-900/30 hover:text-green-200",
    active: "bg-green-900/40 text-green-200 font-medium border-l-[3px] border-l-green-500 rounded-l-none",
    border: "border-l-green-500",
    icon: "text-green-400",
    iconInactive: "text-green-500/50",
    label: "text-green-400/80",
  },
  purple: {
    hover: "hover:bg-purple-900/30 hover:text-purple-200",
    active: "bg-purple-900/40 text-purple-200 font-medium border-l-[3px] border-l-purple-500 rounded-l-none",
    border: "border-l-purple-500",
    icon: "text-purple-400",
    iconInactive: "text-purple-500/50",
    label: "text-purple-400/80",
  },
  emerald: {
    hover: "hover:bg-emerald-900/30 hover:text-emerald-200",
    active: "bg-emerald-900/40 text-emerald-200 font-medium border-l-[3px] border-l-emerald-500 rounded-l-none",
    border: "border-l-emerald-500",
    icon: "text-emerald-400",
    iconInactive: "text-emerald-500/50",
    label: "text-emerald-400/80",
  },
  indigo: {
    hover: "hover:bg-indigo-900/30 hover:text-indigo-200",
    active: "bg-indigo-900/40 text-indigo-200 font-medium border-l-[3px] border-l-indigo-500 rounded-l-none",
    border: "border-l-indigo-500",
    icon: "text-indigo-400",
    iconInactive: "text-indigo-500/50",
    label: "text-indigo-400/80",
  },
  cyan: {
    hover: "hover:bg-cyan-900/30 hover:text-cyan-200",
    active: "bg-cyan-900/40 text-cyan-200 font-medium border-l-[3px] border-l-cyan-500 rounded-l-none",
    border: "border-l-cyan-500",
    icon: "text-cyan-400",
    iconInactive: "text-cyan-500/50",
    label: "text-cyan-400/80",
  },
  orange: {
    hover: "hover:bg-orange-900/30 hover:text-orange-200",
    active: "bg-orange-900/40 text-orange-200 font-medium border-l-[3px] border-l-orange-500 rounded-l-none",
    border: "border-l-orange-500",
    icon: "text-orange-400",
    iconInactive: "text-orange-500/50",
    label: "text-orange-400/80",
  },
  amber: {
    hover: "hover:bg-amber-900/20 hover:text-amber-200",
    active: "bg-amber-900/30 text-amber-200 font-medium border-l-[3px] border-l-amber-500 rounded-l-none",
    border: "border-l-amber-500",
    icon: "text-amber-400",
    iconInactive: "text-amber-500/50",
    label: "text-amber-500/80",
  },
};

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();
  const [isNavigatingToBuilder, setIsNavigatingToBuilder] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleSignOut = () => {
    logout();
    navigate(routes.login);
  };

  const handleNavigateToBuilder = async () => {
    if (isNavigatingToBuilder) return;
    setIsNavigatingToBuilder(true);

    try {
      const response = await api.post<{
        success: boolean;
        redirectUrl?: string;
        message?: string;
      }>("/sso/generate-token", { targetApp: "website-builder" });

      if (response.success && response.redirectUrl) {
        window.open(response.redirectUrl, "_blank");
      } else {
        const fallbackUrl = window.location.origin.includes("localhost")
          ? "http://localhost:3000"
          : "https://builder.soapboxsuperapp.com";
        window.open(fallbackUrl, "_blank");
      }
    } catch (error) {
      console.error("SSO token generation failed:", error);
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
          {navSections.map((section, sectionIdx) => {
            const colors = sectionColors[section.color];
            const isFirstSection = sectionIdx === 0;

            return (
              <div key={section.label}>
                {!isFirstSection && <Separator className="my-4 bg-vesper-700/30" />}
                <p className={cn(
                  "px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2",
                  colors.label
                )}>
                  {section.labelIcon && <section.labelIcon className="h-3 w-3" />}
                  {section.label}
                </p>
                {section.items.map((item, itemIdx) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-grace-300/80 transition-all duration-200 h-10 rounded-lg",
                        colors.hover,
                        isFirstSection && "h-11 animate-slide-in",
                        isActive(item.href) && colors.active,
                        section.color === "amber" && !isActive(item.href) && "text-grace-400/60"
                      )}
                      style={isFirstSection ? { animationDelay: `${itemIdx * 30}ms` } : undefined}
                    >
                      <item.icon className={cn(
                        "h-[16px] w-[16px] transition-colors",
                        isFirstSection && "h-[18px] w-[18px]",
                        isActive(item.href) ? colors.icon : colors.iconInactive
                      )} />
                      <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-vesper-700/30 px-3 py-4">
          <p className="px-3 mb-3 text-[10px] font-semibold text-vesper-400 uppercase tracking-widest">
            System
          </p>
          <Link href={routes.settings}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-grace-300/80 hover:bg-vesper-700/40 hover:text-grace-100 transition-all duration-200 h-11 rounded-lg",
                isActive(routes.settings) &&
                  "bg-sanctuary-800/50 text-grace-100 font-medium border-l-[3px] border-l-sidebar-primary rounded-l-none"
              )}
            >
              <Settings className={cn(
                "h-[18px] w-[18px]",
                isActive(routes.settings) ? "text-sidebar-primary" : "text-vesper-400"
              )} />
              Settings
            </Button>
          </Link>

          <Separator className="my-4 bg-vesper-700/30" />

          <p className="px-3 mb-2 text-[10px] font-semibold text-vesper-400 uppercase tracking-widest">
            Quick Links
          </p>

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

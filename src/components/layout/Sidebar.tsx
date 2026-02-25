import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { routes } from "@/routes";
import { Logo, LogoIcon } from "@/components/Logo";
import { useAuth } from "@/App";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Mail,
  Heart,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
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
    title: "Reports",
    href: routes.reports,
    icon: BarChart3,
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

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800/50">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-800/50 px-5">
          <Logo size="sm" className="text-white" />
          <div className="ml-auto">
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              CRM
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </p>
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200 h-10",
                  isActive(item.href) &&
                    "bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-white font-medium border-l-2 border-l-amber-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  isActive(item.href) ? "text-amber-400" : "text-slate-500"
                )} />
                <span className="flex-1 text-left">{item.title}</span>
                {isActive(item.href) && (
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-slate-800/50 px-3 py-4">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            System
          </p>
          {bottomNavigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200 h-10",
                  isActive(item.href) &&
                    "bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-white font-medium border-l-2 border-l-amber-500 rounded-l-none"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  isActive(item.href) ? "text-amber-400" : "text-slate-500"
                )} />
                {item.title}
              </Button>
            </Link>
          ))}

          <Separator className="my-3 bg-slate-800/50" />

          {/* Back to SoapBox */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-500 hover:bg-slate-800/50 hover:text-white transition-all duration-200 h-10 mb-1"
            onClick={() => {
              // In production, navigate to main SoapBox app
              window.open("https://app.soapbox.com", "_blank");
            }}
          >
            <LogoIcon size="sm" className="h-4 w-4" />
            <span className="flex-1 text-left text-sm">Back to SoapBox</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 h-10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>

        {/* Powered by footer */}
        <div className="px-5 py-4 border-t border-slate-800/30 bg-slate-950/50">
          <p className="text-[10px] text-slate-600 text-center">
            Powered by{" "}
            <span className="font-semibold text-amber-500">
              SoapBox Super App
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

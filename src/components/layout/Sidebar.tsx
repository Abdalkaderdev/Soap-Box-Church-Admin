import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { routes } from "@/routes";
import {
  Church,
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Mail,
  Heart,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  {
    title: "Dashboard",
    href: routes.dashboard,
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
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">Church Admin</span>
            <span className="text-xs text-sidebar-foreground/60">Management System</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive(item.href) &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t px-3 py-4">
          {bottomNavigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive(item.href) &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
          <Separator className="my-2" />
          <Link href={routes.login}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

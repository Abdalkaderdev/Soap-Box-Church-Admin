import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { routes } from "@/routes";
import { LogoIcon } from "@/components/Logo";

export function Header() {
  const handleSignOut = () => {
    sessionStorage.removeItem("soapbox_church_auth");
    window.location.href = routes.login;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members, events, donations..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-500" />
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <p className="font-medium">New member registration</p>
                <p className="text-sm text-muted-foreground">
                  John Smith has joined the congregation
                </p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <p className="font-medium">Donation received</p>
                <p className="text-sm text-muted-foreground">
                  $500 donation from Anonymous
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                <p className="font-medium">Event reminder</p>
                <p className="text-sm text-muted-foreground">
                  Sunday Service starts in 2 hours
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-purple-600">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Administrator</p>
                  <LogoIcon size="sm" className="h-3 w-3" />
                </div>
                <p className="text-xs text-muted-foreground">admin@church.org</p>
                <p className="text-xs text-purple-500">SoapBox Connected</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={routes.settings}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                window.open("https://app.soapbox.com/profile", "_blank");
              }}
            >
              <span className="flex items-center gap-2">
                <LogoIcon size="sm" className="h-3 w-3" />
                SoapBox Profile
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;

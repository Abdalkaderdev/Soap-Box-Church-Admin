'use client';

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  MessageSquare,
  HandHeart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import { Logo, LogoIcon } from './Logo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
    children: [
      { name: 'All Members', href: '/members' },
      { name: 'Families', href: '/members/families' },
      { name: 'Groups', href: '/members/groups' },
      { name: 'Visitors', href: '/members/visitors' },
    ],
  },
  {
    name: 'Donations',
    href: '/donations',
    icon: Heart,
    children: [
      { name: 'Overview', href: '/donations' },
      { name: 'Pledges', href: '/donations/pledges' },
      { name: 'Campaigns', href: '/donations/campaigns' },
      { name: 'Statements', href: '/donations/statements' },
    ],
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    children: [
      { name: 'Calendar', href: '/events' },
      { name: 'Services', href: '/events/services' },
      { name: 'Registrations', href: '/events/registrations' },
    ],
  },
  { name: 'Check-in', href: '/checkin', icon: UserCheck },
  {
    name: 'Communications',
    href: '/communications',
    icon: MessageSquare,
    children: [
      { name: 'Messages', href: '/communications' },
      { name: 'Email Campaigns', href: '/communications/email' },
      { name: 'SMS', href: '/communications/sms' },
      { name: 'Announcements', href: '/communications/announcements' },
    ],
  },
  {
    name: 'Volunteers',
    href: '/volunteers',
    icon: HandHeart,
    children: [
      { name: 'Directory', href: '/volunteers' },
      { name: 'Teams', href: '/volunteers/teams' },
      { name: 'Scheduling', href: '/volunteers/scheduling' },
    ],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    children: [
      { name: 'Analytics', href: '/reports' },
      { name: 'Attendance', href: '/reports/attendance' },
      { name: 'Financial', href: '/reports/financial' },
      { name: 'Growth', href: '/reports/growth' },
    ],
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + '/');
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return isActive(item.href);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("soapbox_church_auth");
    window.location.href = "/login";
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[10px] font-medium text-purple-300/80 bg-purple-500/20 px-2 py-0.5 rounded-full ml-1">
              Church
            </span>
          </div>
        )}
        {collapsed && <LogoIcon size="sm" className="mx-auto" />}
        <button
          onClick={onToggle}
          className={`rounded-lg p-1.5 hover:bg-white/10 transition-colors ${collapsed ? 'mx-auto mt-2' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.children && !collapsed ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isParentActive(item)
                        ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-white/10'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isParentActive(item) ? 'text-purple-400' : ''}`} />
                      <span>{item.name}</span>
                    </div>
                    {expandedItems.includes(item.name) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.name) && (
                    <ul className="mt-1 space-y-1 pl-11">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isParentActive(item)
                      ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-white/10'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isParentActive(item) ? 'text-purple-400' : ''}`} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-2 py-3">
        {!collapsed && (
          <>
            {/* Back to SoapBox */}
            <button
              onClick={() => window.open("https://app.soapbox.com", "_blank")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors mb-1"
            >
              <LogoIcon size="sm" className="h-5 w-5" />
              <span className="flex-1 text-left">Back to SoapBox</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </button>
          </>
        )}

        <button
          onClick={handleSignOut}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {!collapsed && (
          <p className="text-[10px] text-slate-500 text-center mt-3">
            Powered by{" "}
            <span className="font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SoapBox Super App
            </span>
          </p>
        )}
      </div>
    </aside>
  );
}

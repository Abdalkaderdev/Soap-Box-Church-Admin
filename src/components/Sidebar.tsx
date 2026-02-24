'use client';

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Church,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return isActive(item.href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Church className="h-8 w-8 text-blue-400" />
            <span className="text-lg font-semibold">ChurchAdmin</span>
          </div>
        )}
        {collapsed && <Church className="mx-auto h-8 w-8 text-blue-400" />}
        <button
          onClick={onToggle}
          className={`rounded-lg p-1.5 hover:bg-slate-800 ${collapsed ? 'mx-auto mt-2' : ''}`}
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
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.children && !collapsed ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isParentActive(item)
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
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
                            to={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isParentActive(item)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

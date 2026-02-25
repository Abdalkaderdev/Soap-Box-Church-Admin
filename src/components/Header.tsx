'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { LogoIcon } from './Logo';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface HeaderProps {
  onMenuToggle?: () => void;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

// Mock notifications - in production, these would come from an API
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Member Registration',
    message: 'John Smith has requested to join the church.',
    time: '5 minutes ago',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Donation Received',
    message: 'A donation of $500 was received for the Building Fund.',
    time: '1 hour ago',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Event Reminder',
    message: 'Sunday Service starts in 2 hours.',
    time: '2 hours ago',
    read: true,
    type: 'warning',
  },
];

export default function Header({ onMenuToggle, user }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-indigo-100 text-indigo-800';
    }
  };

  const defaultUser = {
    name: 'Admin User',
    email: 'admin@church.org',
    role: 'Administrator',
  };

  const currentUser = user || defaultUser;

  const handleSignOut = () => {
    sessionStorage.removeItem("soapbox_church_auth");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members, events, donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-64 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 lg:w-96"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute left-0 top-full mt-1 w-full rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
              <p className="px-4 py-2 text-sm text-gray-500">
                Search results for "{searchQuery}"...
              </p>
            </div>
          )}
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Help Button */}
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-purple-500" />
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500">
                    No notifications
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 ${
                        !notification.read ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/notifications"
                className="block border-t border-gray-200 px-4 py-3 text-center text-sm font-medium text-purple-600 hover:bg-gray-50"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-medium text-white">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-gray-500 lg:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <LogoIcon size="sm" className="h-3 w-3" />
                </div>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
                <p className="text-xs text-purple-500 mt-1">SoapBox Connected</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4" />
                Your Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => window.open("https://app.soapbox.com/profile", "_blank")}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogoIcon size="sm" className="h-4 w-4" />
                <span className="flex-1 text-left">SoapBox Profile</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </button>
              <hr className="my-1" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="absolute left-0 top-16 w-full border-b border-gray-200 bg-white p-4 shadow-lg md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

// Route to label mapping for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  members: 'Members',
  families: 'Families',
  groups: 'Groups',
  visitors: 'Visitors',
  donations: 'Donations',
  pledges: 'Pledges',
  campaigns: 'Campaigns',
  statements: 'Statements',
  events: 'Events',
  calendar: 'Calendar',
  services: 'Services',
  registrations: 'Registrations',
  communications: 'Communications',
  messages: 'Messages',
  email: 'Email Campaigns',
  sms: 'SMS',
  announcements: 'Announcements',
  volunteers: 'Volunteers',
  directory: 'Directory',
  teams: 'Teams',
  scheduling: 'Scheduling',
  reports: 'Reports',
  analytics: 'Analytics',
  attendance: 'Attendance',
  financial: 'Financial',
  growth: 'Growth',
  settings: 'Settings',
  profile: 'Profile',
  notifications: 'Notifications',
  add: 'Add New',
  edit: 'Edit',
  view: 'View',
};

export default function Breadcrumbs({
  items,
  showHome = true,
  className = '',
}: BreadcrumbsProps) {
  const [location] = useLocation();

  // Generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    pathSegments.forEach((segment: string, index: number) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Check if segment is an ID (numeric or UUID-like)
      const isId = /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);

      if (isId) {
        // For IDs, just show a generic label or skip
        breadcrumbs.push({
          label: 'Details',
          href: isLast ? undefined : currentPath,
        });
      } else {
        const label = routeLabels[segment.toLowerCase()] ||
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {/* Home Link */}
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
        )}

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Additional component for page headers with breadcrumbs
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbItems,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-4" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

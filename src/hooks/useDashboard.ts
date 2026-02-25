/**
 * Dashboard Hook for Church Admin App
 * Fetches dashboard summary data including stats, recent donations, and upcoming events
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from './useAuth';

type ChangeType = 'positive' | 'negative' | 'neutral';

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  description: string;
  icon: React.ReactNode;
}

interface RecentDonation {
  id: number;
  donor: string;
  amount: string;
  date: string;
  type: string;
  avatar: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: 'confirmed' | 'pending';
}

interface SystemStatus {
  operational: boolean;
  lastSync: string;
  services: {
    database: boolean;
    email: boolean;
    payments: boolean;
  };
}

interface DashboardResponse {
  stats: DashboardStat[];
  recentDonations: RecentDonation[];
  upcomingEvents: UpcomingEvent[];
  systemStatus: SystemStatus;
}

export function useDashboard() {
  const { churchId } = useAuth();

  return useQuery<DashboardResponse>({
    queryKey: ['dashboard', churchId],
    queryFn: () => api.get<DashboardResponse>(`/church/${churchId}/dashboard`),
    enabled: !!churchId,
  });
}

export default useDashboard;

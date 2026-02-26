/**
 * Custom hooks for the Church Financial Dashboard
 * Provides data fetching for donation statistics, recent donations, and top donors
 *
 * Adapted for church-admin API structure
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

// Types
export interface DashboardStats {
  totalDonationsThisMonth: number;
  totalDonationsLastMonth: number;
  totalDonationsThisYear: number;
  activeRecurringDonors: number;
  newDonorsThisMonth: number;
  averageDonation: number;
  monthlyGrowthPercent: number;
  yearToDateTarget: number;
  yearToDateProgress: number;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
  recurring: number;
  oneTime: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percent: number;
  color: string;
}

export interface RecentDonation {
  id: number;
  amount: number;
  donorName: string;
  fundName: string;
  date: string;
  isRecurring: boolean;
  isAnonymous: boolean;
}

export interface TopDonor {
  id: number;
  name: string;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
}

// Default stats when API is unavailable
const defaultStats: DashboardStats = {
  totalDonationsThisMonth: 0,
  totalDonationsLastMonth: 0,
  totalDonationsThisYear: 0,
  activeRecurringDonors: 0,
  newDonorsThisMonth: 0,
  averageDonation: 0,
  monthlyGrowthPercent: 0,
  yearToDateTarget: 50000,
  yearToDateProgress: 0,
};

// Chart colors for category breakdown
const CHART_COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff'];

/**
 * Hook for fetching church donation statistics
 * @returns Query result with donation stats
 */
export function useChurchDonationStats() {
  const { churchId } = useAuth();

  return useQuery<DashboardStats>({
    queryKey: ['church', churchId, 'financial-dashboard', 'stats'],
    queryFn: async () => {
      if (!churchId) return defaultStats;

      try {
        return await api.get<DashboardStats>(`/church/${churchId}/donations/dashboard/stats`);
      } catch {
        // Return default stats if endpoint not available yet
        return defaultStats;
      }
    },
    enabled: Boolean(churchId),
    staleTime: 60000, // 1 minute cache
  });
}

/**
 * Hook for fetching donation trends over time
 * @param dateRange - Time range for trends (e.g., '3months', '6months', '12months')
 * @returns Query result with monthly trend data
 */
export function useDonationTrends(dateRange: string = '6months') {
  const { churchId } = useAuth();

  return useQuery<MonthlyTrend[]>({
    queryKey: ['church', churchId, 'financial-dashboard', 'trends', dateRange],
    queryFn: async () => {
      if (!churchId) return [];

      try {
        return await api.get<MonthlyTrend[]>(`/church/${churchId}/donations/dashboard/trends`, {
          range: dateRange,
        });
      } catch {
        // Return sample data for demo
        return generateSampleTrends();
      }
    },
    enabled: Boolean(churchId),
    staleTime: 60000,
  });
}

/**
 * Hook for fetching category breakdown of donations
 * @returns Query result with category breakdown data
 */
export function useDonationCategories() {
  const { churchId } = useAuth();

  return useQuery<CategoryBreakdown[]>({
    queryKey: ['church', churchId, 'financial-dashboard', 'categories'],
    queryFn: async () => {
      if (!churchId) return [];

      try {
        return await api.get<CategoryBreakdown[]>(`/church/${churchId}/donations/dashboard/categories`);
      } catch {
        // Return sample data
        return [
          { name: 'General Fund', amount: 25000, percent: 50, color: CHART_COLORS[0] },
          { name: 'Building Fund', amount: 12500, percent: 25, color: CHART_COLORS[1] },
          { name: 'Missions', amount: 7500, percent: 15, color: CHART_COLORS[2] },
          { name: 'Youth Ministry', amount: 5000, percent: 10, color: CHART_COLORS[3] },
        ];
      }
    },
    enabled: Boolean(churchId),
    staleTime: 60000,
  });
}

/**
 * Hook for fetching recent donations for the dashboard
 * @param limit - Maximum number of donations to fetch (default: 10)
 * @returns Query result with recent donations list
 */
export function useRecentDonationsWidget(limit: number = 10) {
  const { churchId } = useAuth();

  return useQuery<RecentDonation[]>({
    queryKey: ['church', churchId, 'financial-dashboard', 'recent', limit],
    queryFn: async () => {
      if (!churchId) return [];

      try {
        return await api.get<RecentDonation[]>(`/church/${churchId}/donations/dashboard/recent`, {
          limit,
        });
      } catch {
        return [];
      }
    },
    enabled: Boolean(churchId),
    staleTime: 30000, // 30 second cache for more real-time updates
  });
}

/**
 * Hook for fetching top donors
 * @param limit - Maximum number of donors to fetch (default: 5)
 * @returns Query result with top donors list
 */
export function useTopDonors(limit: number = 5) {
  const { churchId } = useAuth();

  return useQuery<TopDonor[]>({
    queryKey: ['church', churchId, 'financial-dashboard', 'top-donors', limit],
    queryFn: async () => {
      if (!churchId) return [];

      try {
        return await api.get<TopDonor[]>(`/church/${churchId}/donations/dashboard/top-donors`, {
          limit,
        });
      } catch {
        return [];
      }
    },
    enabled: Boolean(churchId),
    staleTime: 60000,
  });
}

/**
 * Combined hook for all financial dashboard data
 * Fetches all dashboard data in parallel for optimal performance
 */
export function useFinancialDashboard(options?: {
  dateRange?: string;
  recentLimit?: number;
  topDonorsLimit?: number;
}) {
  const { dateRange = '6months', recentLimit = 10, topDonorsLimit = 5 } = options || {};

  const stats = useChurchDonationStats();
  const trends = useDonationTrends(dateRange);
  const categories = useDonationCategories();
  const recentDonations = useRecentDonationsWidget(recentLimit);
  const topDonors = useTopDonors(topDonorsLimit);

  const isLoading =
    stats.isLoading ||
    trends.isLoading ||
    categories.isLoading ||
    recentDonations.isLoading ||
    topDonors.isLoading;

  const isError =
    stats.isError ||
    trends.isError ||
    categories.isError ||
    recentDonations.isError ||
    topDonors.isError;

  return {
    stats: stats.data || defaultStats,
    trends: trends.data || [],
    categories: categories.data || [],
    recentDonations: recentDonations.data || [],
    topDonors: topDonors.data || [],
    isLoading,
    isError,
    refetch: () => {
      stats.refetch();
      trends.refetch();
      categories.refetch();
      recentDonations.refetch();
      topDonors.refetch();
    },
  };
}

// Helper function to generate sample trend data
function generateSampleTrends(): MonthlyTrend[] {
  const trends: MonthlyTrend[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const baseAmount = 35000 + Math.random() * 15000;

    trends.push({
      month: monthName,
      amount: Math.round(baseAmount),
      count: Math.round(80 + Math.random() * 40),
      recurring: Math.round(baseAmount * 0.6),
      oneTime: Math.round(baseAmount * 0.4),
    });
  }

  return trends;
}

/**
 * Helper to format currency values
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Helper to format percentage values
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Helper to format large numbers with abbreviations
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

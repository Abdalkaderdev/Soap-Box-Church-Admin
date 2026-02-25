/**
 * Donations API Hook for Church Admin App
 * Handles donation CRUD operations, stats, and donor management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  Donation,
  DonationCreateInput,
  DonationMethod,
  DonationStatus,
  DonationStats,
  DonorDetails,
  RecurringDonation,
  Fund,
} from '../types';

// Query key factory for donations
const donationKeys = {
  all: (churchId: string) => ['church', churchId, 'donations'] as const,
  lists: (churchId: string) => [...donationKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: DonationFilters) =>
    [...donationKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...donationKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...donationKeys.details(churchId), id] as const,
  stats: (churchId: string, params?: StatsParams) =>
    [...donationKeys.all(churchId), 'stats', params] as const,
  dashboard: (churchId: string) => [...donationKeys.all(churchId), 'dashboard'] as const,
  donors: (churchId: string) => [...donationKeys.all(churchId), 'donors'] as const,
  donor: (churchId: string, memberId: string) =>
    [...donationKeys.donors(churchId), memberId] as const,
  recurring: (churchId: string) => [...donationKeys.all(churchId), 'recurring'] as const,
  funds: (churchId: string) => [...donationKeys.all(churchId), 'funds'] as const,
  fund: (churchId: string, fundId: string) =>
    [...donationKeys.funds(churchId), fundId] as const,
};

// Filter types
export interface DonationFilters extends PaginationParams {
  memberId?: string;
  fundId?: string;
  method?: DonationMethod | DonationMethod[];
  status?: DonationStatus | DonationStatus[];
  isRecurring?: boolean;
  isAnonymous?: boolean;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

interface StatsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

interface DonationDashboard {
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  totalThisYear: number;
  recentDonations: Donation[];
  topFunds: { fund: Fund; amount: number; percentage: number }[];
  topDonors: { memberId: string; memberName: string; totalAmount: number }[];
  trendData: { date: string; amount: number }[];
}

/**
 * Hook for fetching donations list with filters and pagination
 */
export function useDonations(filters: DonationFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Donation>>({
    queryKey: donationKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Donation>>(`/church/${churchId}/donations`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'date',
        sortOrder: filters.sortOrder || 'desc',
        memberId: filters.memberId,
        fundId: filters.fundId,
        method: filters.method,
        status: filters.status,
        isRecurring: filters.isRecurring,
        isAnonymous: filters.isAnonymous,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        amountMin: filters.amountMin,
        amountMax: filters.amountMax,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single donation by ID
 */
export function useDonation(donationId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Donation>({
    queryKey: donationKeys.detail(churchId!, donationId!),
    queryFn: () =>
      api.get<Donation>(`/church/${churchId}/donations/${donationId}`),
    enabled: Boolean(churchId) && Boolean(donationId),
  });
}

/**
 * Hook for fetching donation statistics
 */
export function useDonationStats(params?: StatsParams) {
  const { churchId } = useAuth();

  return useQuery<DonationStats>({
    queryKey: donationKeys.stats(churchId!, params),
    queryFn: () =>
      api.get<DonationStats>(`/church/${churchId}/donations/stats`, {
        startDate: params?.startDate,
        endDate: params?.endDate,
        groupBy: params?.groupBy || 'month',
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching donation dashboard data
 */
export function useDonationDashboard() {
  const { churchId } = useAuth();

  return useQuery<DonationDashboard>({
    queryKey: donationKeys.dashboard(churchId!),
    queryFn: () =>
      api.get<DonationDashboard>(`/church/${churchId}/donations/dashboard`),
    enabled: Boolean(churchId),
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data is more time-sensitive
  });
}

/**
 * Hook for fetching donor details (member's giving history)
 */
export function useDonorDetails(memberId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<DonorDetails>({
    queryKey: donationKeys.donor(churchId!, memberId!),
    queryFn: () =>
      api.get<DonorDetails>(`/church/${churchId}/donors/${memberId}`),
    enabled: Boolean(churchId) && Boolean(memberId),
  });
}

/**
 * Hook for recording a new donation
 */
export function useRecordDonation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Donation, Error, DonationCreateInput>({
    mutationFn: (data) =>
      api.post<Donation>(`/church/${churchId}/donations`, data),
    onSuccess: (newDonation) => {
      // Invalidate donation lists
      queryClient.invalidateQueries({
        queryKey: donationKeys.lists(churchId!),
      });

      // Invalidate stats and dashboard
      queryClient.invalidateQueries({
        queryKey: donationKeys.stats(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: donationKeys.dashboard(churchId!),
      });

      // Invalidate donor details if applicable
      if (newDonation.memberId) {
        queryClient.invalidateQueries({
          queryKey: donationKeys.donor(churchId!, newDonation.memberId),
        });
      }

      // Add the new donation to the cache
      queryClient.setQueryData(
        donationKeys.detail(churchId!, newDonation.id),
        newDonation
      );
    },
  });
}

/**
 * Hook for updating a donation
 */
export function useUpdateDonation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Donation,
    Error,
    { donationId: string; data: Partial<DonationCreateInput> }
  >({
    mutationFn: ({ donationId, data }) =>
      api.patch<Donation>(`/church/${churchId}/donations/${donationId}`, data),
    onSuccess: (updatedDonation, { donationId }) => {
      // Update the donation in cache
      queryClient.setQueryData(
        donationKeys.detail(churchId!, donationId),
        updatedDonation
      );

      // Invalidate lists and stats
      queryClient.invalidateQueries({
        queryKey: donationKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: donationKeys.stats(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: donationKeys.dashboard(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a donation
 */
export function useDeleteDonation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (donationId) =>
      api.delete<void>(`/church/${churchId}/donations/${donationId}`),
    onSuccess: (_, donationId) => {
      // Remove the donation from cache
      queryClient.removeQueries({
        queryKey: donationKeys.detail(churchId!, donationId),
      });

      // Invalidate all donation queries
      queryClient.invalidateQueries({
        queryKey: donationKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for refunding a donation
 */
export function useRefundDonation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Donation,
    Error,
    { donationId: string; reason?: string; amount?: number }
  >({
    mutationFn: ({ donationId, reason, amount }) =>
      api.post<Donation>(
        `/church/${churchId}/donations/${donationId}/refund`,
        { reason, amount }
      ),
    onSuccess: (_, { donationId }) => {
      // Invalidate the specific donation
      queryClient.invalidateQueries({
        queryKey: donationKeys.detail(churchId!, donationId),
      });

      // Invalidate all donation queries
      queryClient.invalidateQueries({
        queryKey: donationKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for fetching recurring donations
 */
export function useRecurringDonations(options?: PaginationParams) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<RecurringDonation>>({
    queryKey: donationKeys.recurring(churchId!),
    queryFn: () =>
      api.get<PaginatedResponse<RecurringDonation>>(
        `/church/${churchId}/donations/recurring`,
        {
          page: options?.page || 1,
          pageSize: options?.pageSize || 20,
          sortBy: options?.sortBy || 'nextDate',
          sortOrder: options?.sortOrder || 'asc',
        }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for cancelling a recurring donation
 */
export function useCancelRecurringDonation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recurringId: string; reason?: string }>({
    mutationFn: ({ recurringId, reason }) =>
      api.post<void>(
        `/church/${churchId}/donations/recurring/${recurringId}/cancel`,
        { reason }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: donationKeys.recurring(churchId!),
      });
    },
  });
}

/**
 * Hook for fetching funds
 */
export function useFunds() {
  const { churchId } = useAuth();

  return useQuery<Fund[]>({
    queryKey: donationKeys.funds(churchId!),
    queryFn: () => api.get<Fund[]>(`/church/${churchId}/funds`),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single fund
 */
export function useFund(fundId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Fund>({
    queryKey: donationKeys.fund(churchId!, fundId!),
    queryFn: () => api.get<Fund>(`/church/${churchId}/funds/${fundId}`),
    enabled: Boolean(churchId) && Boolean(fundId),
  });
}

/**
 * Hook for creating a fund
 */
export function useCreateFund() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Fund,
    Error,
    { name: string; description?: string; goal?: number; isDefault?: boolean }
  >({
    mutationFn: (data) => api.post<Fund>(`/church/${churchId}/funds`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: donationKeys.funds(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a fund
 */
export function useUpdateFund() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Fund,
    Error,
    {
      fundId: string;
      data: { name?: string; description?: string; goal?: number; isActive?: boolean };
    }
  >({
    mutationFn: ({ fundId, data }) =>
      api.patch<Fund>(`/church/${churchId}/funds/${fundId}`, data),
    onSuccess: (_, { fundId }) => {
      queryClient.invalidateQueries({
        queryKey: donationKeys.fund(churchId!, fundId),
      });
      queryClient.invalidateQueries({
        queryKey: donationKeys.funds(churchId!),
      });
    },
  });
}

/**
 * Hook for sending donation receipts
 */
export function useSendDonationReceipt() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { donationId: string }>({
    mutationFn: ({ donationId }) =>
      api.post<void>(
        `/church/${churchId}/donations/${donationId}/send-receipt`
      ),
    onSuccess: (_, { donationId }) => {
      queryClient.invalidateQueries({
        queryKey: donationKeys.detail(churchId!, donationId),
      });
    },
  });
}

/**
 * Hook for generating year-end giving statements
 */
export function useGenerateGivingStatements() {
  const { churchId } = useAuth();

  return useMutation<
    { generated: number; sent: number },
    Error,
    { year: number; sendEmail?: boolean; memberIds?: string[] }
  >({
    mutationFn: ({ year, sendEmail, memberIds }) =>
      api.post<{ generated: number; sent: number }>(
        `/church/${churchId}/donations/statements`,
        { year, sendEmail, memberIds }
      ),
  });
}

/**
 * Hook for batch importing donations
 */
export function useImportDonations() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    { imported: number; errors: { row: number; message: string }[] },
    Error,
    { file: File }
  >({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api'}/church/${churchId}/donations/import`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Import failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: donationKeys.all(churchId!),
      });
    },
  });
}

export default useDonations;

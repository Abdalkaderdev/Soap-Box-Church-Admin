/**
 * Reports API Hook for Church Admin App
 * Handles attendance stats, giving reports, and membership statistics
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  AttendanceStats,
  GivingReport,
  MembershipStats,
  DashboardStats,
  ReportParams,
  EventCategory,
  DonationMethod,
} from '../types';

// Query key factory for reports
const reportKeys = {
  all: (churchId: string) => ['church', churchId, 'reports'] as const,
  dashboard: (churchId: string) => [...reportKeys.all(churchId), 'dashboard'] as const,
  attendance: (churchId: string, params?: ReportParams) =>
    [...reportKeys.all(churchId), 'attendance', params] as const,
  giving: (churchId: string, params?: ReportParams) =>
    [...reportKeys.all(churchId), 'giving', params] as const,
  membership: (churchId: string, params?: ReportParams) =>
    [...reportKeys.all(churchId), 'membership', params] as const,
  custom: (churchId: string, reportType: string, params?: Record<string, unknown>) =>
    [...reportKeys.all(churchId), 'custom', reportType, params] as const,
};

// Legacy types for backward compatibility
interface AttendanceData {
  month: string;
  attendance: number;
  firstTime: number;
}

interface GivingData {
  month: string;
  tithes: number;
  offerings: number;
  missions: number;
}

interface MembershipData {
  name: string;
  value: number;
  color: string;
}

interface MinistryData {
  name: string;
  members: number;
  growth: number;
}

interface WeeklyAttendance {
  week: string;
  sunday: number;
  wednesday: number;
}

interface ReportsSummary {
  avgAttendance: number;
  avgAttendanceChange: number;
  totalGiving: number;
  totalGivingChange: number;
  newMembers: number;
  newMembersChange: number;
  firstTimeGuests: number;
  firstTimeGuestsChange: number;
}

interface ReportsResponse {
  summary: ReportsSummary;
  attendanceData: AttendanceData[];
  givingData: GivingData[];
  membershipData: MembershipData[];
  ministryData: MinistryData[];
  weeklyAttendance: WeeklyAttendance[];
}

interface SavedReport {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url: string;
}

// Extended report types
interface AttendanceReportOptions extends ReportParams {
  categories?: EventCategory[];
  ministryIds?: string[];
  includeBreakdown?: boolean;
}

interface GivingReportOptions extends ReportParams {
  fundIds?: string[];
  methods?: DonationMethod[];
  includeRecurring?: boolean;
  includeTopDonors?: boolean;
  donorLimit?: number;
}

interface MembershipReportOptions extends ReportParams {
  includeAgeBreakdown?: boolean;
  includeGenderBreakdown?: boolean;
  includeTagBreakdown?: boolean;
}

interface CustomReportConfig {
  name: string;
  type: 'attendance' | 'giving' | 'membership' | 'combined';
  filters: Record<string, unknown>;
  columns: string[];
  groupBy?: string;
  format: 'table' | 'chart' | 'summary';
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeCharts?: boolean;
  paperSize?: 'letter' | 'a4';
  orientation?: 'portrait' | 'landscape';
}

interface YearOverYearComparison {
  currentYear: number;
  previousYear: number;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'flat';
}

interface MinistryReport {
  ministryId: string;
  ministryName: string;
  memberCount: number;
  volunteerCount: number;
  eventsCount: number;
  totalAttendance: number;
  averageAttendance: number;
}

// ============================================
// Legacy hooks (backward compatibility)
// ============================================

/**
 * Legacy hook for fetching reports with date range
 * @deprecated Use useDashboardStats, useAttendanceStats, useGivingReport, or useMembershipStats instead
 */
export function useReports(dateRange: string = '6months') {
  const { churchId } = useAuth();

  return useQuery<ReportsResponse>({
    queryKey: ['reports', churchId, dateRange],
    queryFn: () => api.get<ReportsResponse>(`/church/${churchId}/reports?range=${dateRange}`),
    enabled: !!churchId,
  });
}

/**
 * Legacy hook for fetching saved reports
 */
export function useSavedReports() {
  const { churchId } = useAuth();

  return useQuery<SavedReport[]>({
    queryKey: ['saved-reports', churchId],
    queryFn: () => api.get<SavedReport[]>(`/church/${churchId}/reports/saved`),
    enabled: !!churchId,
  });
}

/**
 * Legacy hook for attendance report
 * @deprecated Use useAttendanceStats instead
 */
export function useAttendanceReport(dateRange: string = '6months') {
  const { churchId } = useAuth();

  return useQuery<AttendanceData[]>({
    queryKey: ['attendance-report', churchId, dateRange],
    queryFn: () => api.get<AttendanceData[]>(`/church/${churchId}/reports/attendance?range=${dateRange}`),
    enabled: !!churchId,
  });
}

/**
 * Legacy hook for giving report (simple)
 * @deprecated Use useGivingReport with GivingReportOptions instead
 */
export function useGivingReportLegacy(dateRange: string = '6months') {
  const { churchId } = useAuth();

  return useQuery<GivingData[]>({
    queryKey: ['giving-report', churchId, dateRange],
    queryFn: () => api.get<GivingData[]>(`/church/${churchId}/reports/giving?range=${dateRange}`),
    enabled: !!churchId,
  });
}

// ============================================
// New comprehensive hooks
// ============================================

/**
 * Hook for fetching dashboard statistics
 */
export function useDashboardStats() {
  const { churchId } = useAuth();

  return useQuery<DashboardStats>({
    queryKey: reportKeys.dashboard(churchId!),
    queryFn: () =>
      api.get<DashboardStats>(`/church/${churchId}/reports/dashboard`),
    enabled: Boolean(churchId),
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard is frequently viewed
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Hook for fetching attendance statistics
 */
export function useAttendanceStats(options?: AttendanceReportOptions) {
  const { churchId } = useAuth();

  return useQuery<AttendanceStats>({
    queryKey: reportKeys.attendance(churchId!, options),
    queryFn: () =>
      api.get<AttendanceStats>(`/church/${churchId}/reports/attendance`, {
        startDate: options?.startDate,
        endDate: options?.endDate,
        groupBy: options?.groupBy || 'week',
        categories: options?.categories,
        ministryIds: options?.ministryIds,
        includeBreakdown: options?.includeBreakdown,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching attendance comparison (year over year)
 */
export function useAttendanceComparison(year?: number) {
  const { churchId } = useAuth();
  const currentYear = year || new Date().getFullYear();

  return useQuery<YearOverYearComparison>({
    queryKey: [...reportKeys.attendance(churchId!), 'comparison', currentYear],
    queryFn: () =>
      api.get<YearOverYearComparison>(
        `/church/${churchId}/reports/attendance/comparison`,
        { year: currentYear }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching giving report
 */
export function useGivingReport(options?: GivingReportOptions) {
  const { churchId } = useAuth();

  return useQuery<GivingReport>({
    queryKey: reportKeys.giving(churchId!, options),
    queryFn: () =>
      api.get<GivingReport>(`/church/${churchId}/reports/giving`, {
        startDate: options?.startDate,
        endDate: options?.endDate,
        groupBy: options?.groupBy || 'month',
        fundIds: options?.fundIds,
        methods: options?.methods,
        includeRecurring: options?.includeRecurring,
        includeTopDonors: options?.includeTopDonors,
        donorLimit: options?.donorLimit || 10,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching giving comparison (year over year)
 */
export function useGivingComparison(year?: number) {
  const { churchId } = useAuth();
  const currentYear = year || new Date().getFullYear();

  return useQuery<YearOverYearComparison>({
    queryKey: [...reportKeys.giving(churchId!), 'comparison', currentYear],
    queryFn: () =>
      api.get<YearOverYearComparison>(
        `/church/${churchId}/reports/giving/comparison`,
        { year: currentYear }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching giving by fund
 */
export function useGivingByFund(options?: ReportParams) {
  const { churchId } = useAuth();

  return useQuery<{ fundId: string; fundName: string; amount: number; percentage: number; count: number }[]>({
    queryKey: [...reportKeys.giving(churchId!, options), 'byFund'],
    queryFn: () =>
      api.get<{ fundId: string; fundName: string; amount: number; percentage: number; count: number }[]>(
        `/church/${churchId}/reports/giving/by-fund`,
        {
          startDate: options?.startDate,
          endDate: options?.endDate,
        }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching membership statistics
 */
export function useMembershipStats(options?: MembershipReportOptions) {
  const { churchId } = useAuth();

  return useQuery<MembershipStats>({
    queryKey: reportKeys.membership(churchId!, options),
    queryFn: () =>
      api.get<MembershipStats>(`/church/${churchId}/reports/membership`, {
        startDate: options?.startDate,
        endDate: options?.endDate,
        groupBy: options?.groupBy || 'month',
        includeAgeBreakdown: options?.includeAgeBreakdown,
        includeGenderBreakdown: options?.includeGenderBreakdown,
        includeTagBreakdown: options?.includeTagBreakdown,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching membership growth trend
 */
export function useMembershipGrowth(options?: ReportParams) {
  const { churchId } = useAuth();

  return useQuery<{ date: string; total: number; new: number; left: number; net: number }[]>({
    queryKey: [...reportKeys.membership(churchId!, options), 'growth'],
    queryFn: () =>
      api.get<{ date: string; total: number; new: number; left: number; net: number }[]>(
        `/church/${churchId}/reports/membership/growth`,
        {
          startDate: options?.startDate,
          endDate: options?.endDate,
          groupBy: options?.groupBy || 'month',
        }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching ministry-specific reports
 */
export function useMinistryReports(options?: ReportParams) {
  const { churchId } = useAuth();

  return useQuery<MinistryReport[]>({
    queryKey: [...reportKeys.all(churchId!), 'ministries', options],
    queryFn: () =>
      api.get<MinistryReport[]>(`/church/${churchId}/reports/ministries`, {
        startDate: options?.startDate,
        endDate: options?.endDate,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching volunteer hours report
 */
export function useVolunteerHoursReport(options?: ReportParams) {
  const { churchId } = useAuth();

  return useQuery<{
    totalHours: number;
    totalVolunteers: number;
    averageHoursPerVolunteer: number;
    byTeam: { teamId: string; teamName: string; hours: number; volunteers: number }[];
    trend: { date: string; hours: number }[];
  }>({
    queryKey: [...reportKeys.all(churchId!), 'volunteerHours', options],
    queryFn: () =>
      api.get(`/church/${churchId}/reports/volunteer-hours`, {
        startDate: options?.startDate,
        endDate: options?.endDate,
        groupBy: options?.groupBy || 'week',
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching first-time visitor report
 */
export function useFirstTimeVisitorReport(options?: ReportParams) {
  const { churchId } = useAuth();

  return useQuery<{
    totalVisitors: number;
    convertedToMembers: number;
    conversionRate: number;
    trend: { date: string; visitors: number; converted: number }[];
    sources: { source: string; count: number }[];
  }>({
    queryKey: [...reportKeys.all(churchId!), 'firstTimeVisitors', options],
    queryFn: () =>
      api.get(`/church/${churchId}/reports/first-time-visitors`, {
        startDate: options?.startDate,
        endDate: options?.endDate,
        groupBy: options?.groupBy || 'week',
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for generating custom reports
 */
export function useGenerateCustomReport() {
  const { churchId } = useAuth();

  return useMutation<
    { data: Record<string, unknown>[]; summary: Record<string, unknown> },
    Error,
    CustomReportConfig
  >({
    mutationFn: (config) =>
      api.post(`/church/${churchId}/reports/custom`, config),
  });
}

/**
 * Hook for exporting reports
 */
export function useExportReport() {
  const { churchId } = useAuth();

  return useMutation<
    Blob,
    Error,
    {
      reportType: 'attendance' | 'giving' | 'membership' | 'dashboard' | 'custom';
      params?: ReportParams;
      exportOptions: ExportOptions;
    }
  >({
    mutationFn: async ({ reportType, params, exportOptions }) => {
      const queryParams = new URLSearchParams({
        format: exportOptions.format,
        ...(params?.startDate && { startDate: params.startDate }),
        ...(params?.endDate && { endDate: params.endDate }),
        ...(params?.groupBy && { groupBy: params.groupBy }),
        ...(exportOptions.includeCharts && { includeCharts: 'true' }),
        ...(exportOptions.paperSize && { paperSize: exportOptions.paperSize }),
        ...(exportOptions.orientation && { orientation: exportOptions.orientation }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api'}/church/${churchId}/reports/${reportType}/export?${queryParams}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return response.blob();
    },
  });
}

/**
 * Hook for scheduling automated reports
 */
export function useScheduleReport() {
  const { churchId } = useAuth();

  return useMutation<
    { id: string; nextRunDate: string },
    Error,
    {
      reportType: 'attendance' | 'giving' | 'membership';
      schedule: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      recipients: string[];
      format: 'csv' | 'xlsx' | 'pdf';
      params?: ReportParams;
    }
  >({
    mutationFn: (config) =>
      api.post(`/church/${churchId}/reports/schedule`, config),
  });
}

/**
 * Hook for fetching scheduled reports
 */
export function useScheduledReports() {
  const { churchId } = useAuth();

  return useQuery<{
    id: string;
    reportType: string;
    schedule: string;
    nextRunDate: string;
    recipients: string[];
    isActive: boolean;
  }[]>({
    queryKey: [...reportKeys.all(churchId!), 'scheduled'],
    queryFn: () =>
      api.get(`/church/${churchId}/reports/scheduled`),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for deleting a scheduled report
 */
export function useDeleteScheduledReport() {
  const { churchId } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: (scheduleId) =>
      api.delete(`/church/${churchId}/reports/scheduled/${scheduleId}`),
  });
}

/**
 * Hook for fetching report presets
 */
export function useReportPresets() {
  const { churchId } = useAuth();

  return useQuery<{
    id: string;
    name: string;
    type: string;
    config: CustomReportConfig;
    createdAt: string;
  }[]>({
    queryKey: [...reportKeys.all(churchId!), 'presets'],
    queryFn: () =>
      api.get(`/church/${churchId}/reports/presets`),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for saving a report preset
 */
export function useSaveReportPreset() {
  const { churchId } = useAuth();

  return useMutation<
    { id: string },
    Error,
    { name: string; config: CustomReportConfig }
  >({
    mutationFn: (data) =>
      api.post(`/church/${churchId}/reports/presets`, data),
  });
}

/**
 * Hook for comparing metrics across time periods
 */
export function useMetricComparison(options: {
  metric: 'attendance' | 'giving' | 'membership';
  period1: { startDate: string; endDate: string };
  period2: { startDate: string; endDate: string };
}) {
  const { churchId } = useAuth();

  return useQuery<{
    metric: string;
    period1: { label: string; value: number };
    period2: { label: string; value: number };
    change: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'flat';
  }>({
    queryKey: [...reportKeys.all(churchId!), 'comparison', options],
    queryFn: () =>
      api.post(`/church/${churchId}/reports/compare`, options),
    enabled: Boolean(churchId),
  });
}

export default useReports;

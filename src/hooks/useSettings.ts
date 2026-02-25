/**
 * Settings API Hook for Church Admin App
 * Handles church settings, user preferences, and configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from './useAuth';

// ===================================================================
// TYPES
// ===================================================================

export interface ChurchInfo {
  id: string;
  name: string;
  denomination?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  timezone: string;
  locale: string;
}

export interface NotificationSettings {
  newMemberAlerts: boolean;
  donationReceipts: boolean;
  eventReminders: boolean;
  volunteerReminders: boolean;
  weeklyDigest: boolean;
  systemAlerts: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  emailNotifications: NotificationSettings;
  pushNotifications: NotificationSettings;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  lastPasswordChange?: string;
  activeSessions: SessionInfo[];
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

// ===================================================================
// QUERY KEYS
// ===================================================================

const settingsKeys = {
  all: (churchId: string | null | undefined) => ['settings', churchId] as const,
  church: (churchId: string | null | undefined) => [...settingsKeys.all(churchId), 'church'] as const,
  preferences: (churchId: string | null | undefined) => [...settingsKeys.all(churchId), 'preferences'] as const,
  notifications: (churchId: string | null | undefined) => [...settingsKeys.all(churchId), 'notifications'] as const,
  security: (churchId: string | null | undefined) => [...settingsKeys.all(churchId), 'security'] as const,
  staff: (churchId: string | null | undefined) => [...settingsKeys.all(churchId), 'staff'] as const,
};

// ===================================================================
// CHURCH INFO HOOKS
// ===================================================================

/**
 * Fetch church information
 */
export function useChurchInfo() {
  const { churchId } = useAuth();

  return useQuery<ChurchInfo>({
    queryKey: settingsKeys.church(churchId),
    queryFn: () => api.get<ChurchInfo>(`/church/${churchId}/settings/info`),
    enabled: !!churchId,
  });
}

/**
 * Update church information
 */
export function useUpdateChurchInfo() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ChurchInfo, Error, Partial<ChurchInfo>>({
    mutationFn: (data) => api.patch<ChurchInfo>(`/church/${churchId}/settings/info`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.church(churchId) });
    },
  });
}

// ===================================================================
// USER PREFERENCES HOOKS
// ===================================================================

/**
 * Fetch user preferences
 */
export function useUserPreferences() {
  const { churchId } = useAuth();

  return useQuery<UserPreferences>({
    queryKey: settingsKeys.preferences(churchId),
    queryFn: () => api.get<UserPreferences>(`/church/${churchId}/settings/preferences`),
    enabled: !!churchId,
  });
}

/**
 * Update user preferences
 */
export function useUpdateUserPreferences() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<UserPreferences, Error, Partial<UserPreferences>>({
    mutationFn: (data) => api.patch<UserPreferences>(`/church/${churchId}/settings/preferences`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.preferences(churchId) });
    },
  });
}

// ===================================================================
// NOTIFICATION SETTINGS HOOKS
// ===================================================================

/**
 * Fetch notification settings
 */
export function useNotificationSettings() {
  const { churchId } = useAuth();

  return useQuery<NotificationSettings>({
    queryKey: settingsKeys.notifications(churchId),
    queryFn: () => api.get<NotificationSettings>(`/church/${churchId}/settings/notifications`),
    enabled: !!churchId,
  });
}

/**
 * Update notification settings
 */
export function useUpdateNotificationSettings() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<NotificationSettings, Error, Partial<NotificationSettings>>({
    mutationFn: (data) => api.patch<NotificationSettings>(`/church/${churchId}/settings/notifications`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications(churchId) });
    },
  });
}

// ===================================================================
// SECURITY SETTINGS HOOKS
// ===================================================================

/**
 * Fetch security settings
 */
export function useSecuritySettings() {
  const { churchId } = useAuth();

  return useQuery<SecuritySettings>({
    queryKey: settingsKeys.security(churchId),
    queryFn: () => api.get<SecuritySettings>(`/church/${churchId}/settings/security`),
    enabled: !!churchId,
  });
}

/**
 * Enable two-factor authentication
 */
export function useEnableTwoFactor() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<{ secret: string; qrCode: string }, Error, { method: 'app' | 'sms' | 'email' }>({
    mutationFn: (data) => api.post(`/church/${churchId}/settings/security/2fa/enable`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security(churchId) });
    },
  });
}

/**
 * Verify and confirm two-factor authentication
 */
export function useConfirmTwoFactor() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { code: string }>({
    mutationFn: (data) => api.post(`/church/${churchId}/settings/security/2fa/confirm`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security(churchId) });
    },
  });
}

/**
 * Disable two-factor authentication
 */
export function useDisableTwoFactor() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { password: string }>({
    mutationFn: (data) => api.post(`/church/${churchId}/settings/security/2fa/disable`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security(churchId) });
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: (data) => api.post(`/church/${churchId}/settings/security/password`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security(churchId) });
    },
  });
}

/**
 * Revoke a session
 */
export function useRevokeSession() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId) => api.delete(`/church/${churchId}/settings/security/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security(churchId) });
    },
  });
}

/**
 * Revoke all other sessions
 */
export function useRevokeAllSessions() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => api.post(`/church/${churchId}/settings/security/sessions/revoke-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security(churchId) });
    },
  });
}

// ===================================================================
// STAFF MANAGEMENT HOOKS
// ===================================================================

/**
 * Fetch staff members
 */
export function useStaffMembers() {
  const { churchId } = useAuth();

  return useQuery<StaffMember[]>({
    queryKey: settingsKeys.staff(churchId),
    queryFn: () => api.get<StaffMember[]>(`/church/${churchId}/settings/staff`),
    enabled: !!churchId,
  });
}

/**
 * Invite a new staff member
 */
export function useInviteStaff() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<StaffMember, Error, { email: string; role: string; permissions?: string[] }>({
    mutationFn: (data) => api.post<StaffMember>(`/church/${churchId}/settings/staff/invite`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.staff(churchId) });
    },
  });
}

/**
 * Update staff member permissions
 */
export function useUpdateStaffMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<StaffMember, Error, { staffId: string; role?: string; permissions?: string[]; status?: 'active' | 'inactive' }>({
    mutationFn: ({ staffId, ...data }) => api.patch<StaffMember>(`/church/${churchId}/settings/staff/${staffId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.staff(churchId) });
    },
  });
}

/**
 * Remove a staff member
 */
export function useRemoveStaff() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (staffId) => api.delete(`/church/${churchId}/settings/staff/${staffId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.staff(churchId) });
    },
  });
}

// ===================================================================
// DATA IMPORT/EXPORT HOOKS
// ===================================================================

/**
 * Export church data
 */
export function useExportData() {
  const { churchId } = useAuth();

  return useMutation<Blob, Error, { format: 'json' | 'csv'; includeMembers?: boolean; includeDonations?: boolean; includeEvents?: boolean }>({
    mutationFn: async (options) => {
      const params = new URLSearchParams({
        format: options.format,
        ...(options.includeMembers && { includeMembers: 'true' }),
        ...(options.includeDonations && { includeDonations: 'true' }),
        ...(options.includeEvents && { includeEvents: 'true' }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://app.soapboxsuperapp.com/api'}/church/${churchId}/settings/export?${params}`,
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
 * Import church data
 */
export function useImportData() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<{ imported: number; errors: string[] }, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://app.soapboxsuperapp.com/api'}/church/${churchId}/settings/import`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Import failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all data caches since import can affect many things
      queryClient.invalidateQueries();
    },
  });
}

// ===================================================================
// COMBINED SETTINGS HOOK
// ===================================================================

/**
 * Combined hook for the Settings page - provides all settings data
 */
export function useSettings() {
  const { churchId } = useAuth();

  const churchInfoQuery = useQuery<ChurchInfo>({
    queryKey: settingsKeys.church(churchId),
    queryFn: () => api.get<ChurchInfo>(`/church/${churchId}/settings/info`),
    enabled: !!churchId,
  });

  const preferencesQuery = useQuery<UserPreferences>({
    queryKey: settingsKeys.preferences(churchId),
    queryFn: () => api.get<UserPreferences>(`/church/${churchId}/settings/preferences`),
    enabled: !!churchId,
  });

  const notificationsQuery = useQuery<NotificationSettings>({
    queryKey: settingsKeys.notifications(churchId),
    queryFn: () => api.get<NotificationSettings>(`/church/${churchId}/settings/notifications`),
    enabled: !!churchId,
  });

  const securityQuery = useQuery<SecuritySettings>({
    queryKey: settingsKeys.security(churchId),
    queryFn: () => api.get<SecuritySettings>(`/church/${churchId}/settings/security`),
    enabled: !!churchId,
  });

  return {
    churchInfo: churchInfoQuery.data,
    preferences: preferencesQuery.data,
    notifications: notificationsQuery.data,
    security: securityQuery.data,
    isLoading:
      churchInfoQuery.isLoading ||
      preferencesQuery.isLoading ||
      notificationsQuery.isLoading ||
      securityQuery.isLoading,
    error:
      churchInfoQuery.error ||
      preferencesQuery.error ||
      notificationsQuery.error ||
      securityQuery.error,
  };
}

export default useSettings;

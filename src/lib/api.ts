/**
 * Church Admin CRM - API Service Layer
 *
 * Comprehensive API client with:
 * - Type-safe request/response handling
 * - Authentication with token refresh
 * - Request/response interceptors
 * - Error handling with custom error class
 * - All domain-specific API methods
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api';

// Token storage keys
const AUTH_TOKEN_KEY = 'soapbox_auth_token';
const REFRESH_TOKEN_KEY = 'soapbox_refresh_token';

// ============================================================================
// CORE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if this is a forbidden error
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if this is a server error
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Get validation errors for a specific field
   */
  getFieldErrors(field: string): string[] {
    return this.details?.[field] || [];
  }
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get auth token from localStorage or cookie
 */
export function getAuthToken(): string | null {
  // Try localStorage first
  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (localToken) {
    return localToken;
  }

  // Try cookies as fallback
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === AUTH_TOKEN_KEY) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Clear auth tokens from storage and cookies
 */
export function clearAuthTokens(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Clear cookies
  document.cookie = `${AUTH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set refresh token
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

// ============================================================================
// INTERCEPTORS
// ============================================================================

type RequestInterceptor = (config: RequestInit, url: string) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * Add a request interceptor
 * @returns Cleanup function to remove the interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) {
      requestInterceptors.splice(index, 1);
    }
  };
}

/**
 * Add a response interceptor
 * @returns Cleanup function to remove the interceptor
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) {
      responseInterceptors.splice(index, 1);
    }
  };
}

async function runRequestInterceptors(config: RequestInit, url: string): Promise<RequestInit> {
  let currentConfig = config;
  for (const interceptor of requestInterceptors) {
    currentConfig = await interceptor(currentConfig, url);
  }
  return currentConfig;
}

async function runResponseInterceptors(response: Response): Promise<Response> {
  let currentResponse = response;
  for (const interceptor of responseInterceptors) {
    currentResponse = await interceptor(currentResponse);
  }
  return currentResponse;
}

// ============================================================================
// TOKEN REFRESH LOGIC
// ============================================================================

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAuthToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data.accessToken) {
      setAuthToken(data.accessToken);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAuthToken();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

// ============================================================================
// CORE REQUEST FUNCTION
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>;

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  return url.toString();
}

/**
 * Main API request function with full type safety
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  params?: QueryParams
): Promise<T> {
  const url = buildUrl(endpoint, params);

  // Build default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include cookies for SSO
  };

  // Run request interceptors
  config = await runRequestInterceptors(config, url);

  // Make the request
  let response = await fetch(url, config);

  // Run response interceptors
  response = await runResponseInterceptors(response);

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      // Retry the request with new token
      const newToken = getAuthToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        config.headers = headers;
        response = await fetch(url, config);
        response = await runResponseInterceptors(response);
      }
    } else {
      // Clear tokens and redirect to login
      clearAuthTokens();
      const loginUrl = import.meta.env.VITE_SSO_LOGIN_URL || 'https://soapboxsuperapp.com/login';
      window.location.href = `${loginUrl}?redirect=${encodeURIComponent(window.location.href)}`;
      throw new ApiClientError({
        message: 'Session expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        status: 401,
      });
    }
  }

  // Handle error responses
  if (!response.ok) {
    let errorData: ApiError;
    try {
      const errorBody = await response.json();
      errorData = {
        message: errorBody.message || errorBody.error || 'An error occurred',
        code: errorBody.code || 'UNKNOWN_ERROR',
        status: response.status,
        details: errorBody.details || errorBody.errors,
      };
    } catch {
      errorData = {
        message: response.statusText || 'An error occurred',
        code: 'UNKNOWN_ERROR',
        status: response.status,
      };
    }
    throw new ApiClientError(errorData);
  }

  // Parse and return response
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
}

// ============================================================================
// GENERIC API METHODS
// ============================================================================

/**
 * Generic API methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, params?: QueryParams) =>
    apiRequest<T>(endpoint, { method: 'GET' }, params),

  post: <T>(endpoint: string, body?: unknown, params?: QueryParams) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, params),

  put: <T>(endpoint: string, body?: unknown, params?: QueryParams) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, params),

  patch: <T>(endpoint: string, body?: unknown, params?: QueryParams) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }, params),

  delete: <T>(endpoint: string, params?: QueryParams) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }, params),
};

// ============================================================================
// FILE UPLOAD HELPER
// ============================================================================

/**
 * Upload a file with proper multipart/form-data handling
 */
export async function uploadFile<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  // For progress tracking, we need XMLHttpRequest
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}${endpoint}`);

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.withCredentials = true;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new ApiClientError({
            message: 'Upload failed',
            code: 'UPLOAD_FAILED',
            status: xhr.status,
          }));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiClientError({
          message: 'Upload failed',
          code: 'UPLOAD_FAILED',
          status: 0,
        }));
      });

      xhr.send(formData);
    });
  }

  // Without progress tracking, use fetch
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new ApiClientError({
      message: error.message || 'Upload failed',
      code: error.code || 'UPLOAD_FAILED',
      status: response.status,
    });
  }

  return response.json();
}

/**
 * Download a file from the API
 */
export async function downloadFile(
  endpoint: string,
  filename: string,
  params?: QueryParams
): Promise<void> {
  const url = buildUrl(endpoint, params);

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new ApiClientError({
      message: 'Download failed',
      code: 'DOWNLOAD_FAILED',
      status: response.status,
    });
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

// ============================================================================
// DOMAIN-SPECIFIC API SERVICES
// ============================================================================

// Import types for API methods
import type {
  User,
  Church,
  Member,
  MemberCreateInput,
  MemberUpdateInput,
  MembershipStatus,
  Family,
  Donation,
  DonationCreateInput,
  DonationStats,
  DonorDetails,
  RecurringDonation,
  Fund,
  Event,
  EventCreateInput,
  EventUpdateInput,
  EventCategory,
  Attendee,
  AttendeeStatus,
  Volunteer,
  VolunteerCreateInput,
  VolunteerUpdateInput,
  VolunteerStatus,
  VolunteerAssignment,
  MinistryTeam,
  Message,
  MessageCreateInput,
  MessageType,
  MessageStatus,
  MessageTemplate,
  MessageTemplateCreateInput,
  RecipientFilter,
  AttendanceStats,
  GivingReport,
  MembershipStats,
  DashboardStats,
  ReportParams,
  // Sermon Prep types
  SermonSeries,
  Sermon,
  SermonCreateInput,
  SermonUpdateInput,
  SermonResource,
  SermonFeedback,
  SermonCollaborator,
  // Prayer Request types
  PrayerRequest,
  PrayerCreateInput,
  PrayerUpdateInput,
  PrayerCategory,
  PrayerStatus,
  PrayerFollowUp,
  // Small Groups types
  SmallGroup,
  SmallGroupCreateInput,
  SmallGroupUpdateInput,
  SmallGroupCategory,
  SmallGroupMember,
  SmallGroupMeeting,
  SmallGroupAttendance,
  SmallGroupJoinRequest,
  // Check-in types
  Service,
  ServiceCheckIn,
  ChildCheckIn,
  CheckInKiosk,
  CheckInFilters,
  CheckInStats,
} from '../types';

// ----------------------------------------------------------------------------
// AUTH API
// ----------------------------------------------------------------------------

export const authApi = {
  /**
   * Get current authenticated user and church
   */
  getCurrentSession: () =>
    api.get<{ user: User; church: Church }>('/auth/me'),

  /**
   * Login with email and password
   */
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
      email,
      password,
    }),

  /**
   * Logout current user
   */
  logout: () => api.post<void>('/auth/logout'),

  /**
   * Refresh access token
   */
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
      refreshToken,
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: (email: string) =>
    api.post<void>('/auth/forgot-password', { email }),

  /**
   * Reset password with token
   */
  resetPassword: (token: string, newPassword: string) =>
    api.post<void>('/auth/reset-password', { token, newPassword }),

  /**
   * Change password for current user
   */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>('/auth/change-password', { currentPassword, newPassword }),
};

// ----------------------------------------------------------------------------
// MEMBERS API
// ----------------------------------------------------------------------------

export interface MemberFilters extends PaginationParams {
  status?: MembershipStatus | MembershipStatus[];
  tags?: string[];
  search?: string;
  familyId?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
  memberSinceFrom?: string;
  memberSinceTo?: string;
}

export const membersApi = {
  /**
   * List all members with optional filters
   */
  list: (churchId: string, filters?: MemberFilters) =>
    api.get<PaginatedResponse<Member>>(`/church/${churchId}/members`, filters),

  /**
   * Get a single member by ID
   */
  get: (churchId: string, memberId: string) =>
    api.get<Member>(`/church/${churchId}/members/${memberId}`),

  /**
   * Create a new member
   */
  create: (churchId: string, data: MemberCreateInput) =>
    api.post<Member>(`/church/${churchId}/members`, data),

  /**
   * Update an existing member
   */
  update: (churchId: string, memberId: string, data: MemberUpdateInput) =>
    api.patch<Member>(`/church/${churchId}/members/${memberId}`, data),

  /**
   * Delete a member
   */
  delete: (churchId: string, memberId: string) =>
    api.delete<void>(`/church/${churchId}/members/${memberId}`),

  /**
   * Search members by name/email
   */
  search: (churchId: string, query: string, limit?: number) =>
    api.get<Member[]>(`/church/${churchId}/members/search`, { q: query, limit }),

  /**
   * Get member statistics
   */
  getStats: (churchId: string) =>
    api.get<{
      total: number;
      byStatus: Record<MembershipStatus, number>;
      newThisMonth: number;
      newThisYear: number;
    }>(`/church/${churchId}/members/stats`),

  /**
   * Bulk update multiple members
   */
  bulkUpdate: (churchId: string, memberIds: string[], data: MemberUpdateInput) =>
    api.patch<{ updated: number }>(`/church/${churchId}/members/bulk`, {
      memberIds,
      ...data,
    }),

  /**
   * Import members from file
   */
  import: (churchId: string, file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }) =>
    uploadFile<{ imported: number; errors: { row: number; message: string }[] }>(
      `/church/${churchId}/members/import`,
      file,
      {
        ...(options?.skipDuplicates && { skipDuplicates: 'true' }),
        ...(options?.updateExisting && { updateExisting: 'true' }),
      }
    ),

  /**
   * Export members to file
   */
  export: (churchId: string, format: 'csv' | 'xlsx', filters?: MemberFilters) =>
    downloadFile(
      `/church/${churchId}/members/export`,
      `members.${format}`,
      { format, ...filters }
    ),
};

// ----------------------------------------------------------------------------
// FAMILIES API
// ----------------------------------------------------------------------------

export const familiesApi = {
  /**
   * List all families
   */
  list: (churchId: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<Family>>(`/church/${churchId}/families`, params),

  /**
   * Get a single family
   */
  get: (churchId: string, familyId: string) =>
    api.get<Family>(`/church/${churchId}/families/${familyId}`),

  /**
   * Create a new family
   */
  create: (churchId: string, data: { name: string; memberIds?: string[]; primaryContactId?: string }) =>
    api.post<Family>(`/church/${churchId}/families`, data),

  /**
   * Update family members
   */
  updateMembers: (churchId: string, familyId: string, memberIds: string[], action: 'add' | 'remove') =>
    api.patch<Family>(`/church/${churchId}/families/${familyId}/members`, {
      memberIds,
      action,
    }),
};

// ----------------------------------------------------------------------------
// DONATIONS API
// ----------------------------------------------------------------------------

export interface DonationFilters extends PaginationParams {
  memberId?: string;
  fundId?: string;
  method?: string | string[];
  status?: string | string[];
  isRecurring?: boolean;
  isAnonymous?: boolean;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export const donationsApi = {
  /**
   * List all donations with optional filters
   */
  list: (churchId: string, filters?: DonationFilters) =>
    api.get<PaginatedResponse<Donation>>(`/church/${churchId}/donations`, filters),

  /**
   * Get a single donation by ID
   */
  get: (churchId: string, donationId: string) =>
    api.get<Donation>(`/church/${churchId}/donations/${donationId}`),

  /**
   * Record a new donation
   */
  create: (churchId: string, data: DonationCreateInput) =>
    api.post<Donation>(`/church/${churchId}/donations`, data),

  /**
   * Update an existing donation
   */
  update: (churchId: string, donationId: string, data: Partial<DonationCreateInput>) =>
    api.patch<Donation>(`/church/${churchId}/donations/${donationId}`, data),

  /**
   * Delete a donation
   */
  delete: (churchId: string, donationId: string) =>
    api.delete<void>(`/church/${churchId}/donations/${donationId}`),

  /**
   * Refund a donation
   */
  refund: (churchId: string, donationId: string, reason?: string, amount?: number) =>
    api.post<Donation>(`/church/${churchId}/donations/${donationId}/refund`, {
      reason,
      amount,
    }),

  /**
   * Get donation statistics
   */
  getStats: (churchId: string, params?: { startDate?: string; endDate?: string; groupBy?: string }) =>
    api.get<DonationStats>(`/church/${churchId}/donations/stats`, params),

  /**
   * Get donation dashboard data
   */
  getDashboard: (churchId: string) =>
    api.get<{
      totalToday: number;
      totalThisWeek: number;
      totalThisMonth: number;
      totalThisYear: number;
      recentDonations: Donation[];
      topFunds: { fund: Fund; amount: number; percentage: number }[];
      topDonors: { memberId: string; memberName: string; totalAmount: number }[];
      trendData: { date: string; amount: number }[];
    }>(`/church/${churchId}/donations/dashboard`),

  /**
   * Get donor details
   */
  getDonorDetails: (churchId: string, memberId: string) =>
    api.get<DonorDetails>(`/church/${churchId}/donors/${memberId}`),

  /**
   * Send donation receipt
   */
  sendReceipt: (churchId: string, donationId: string) =>
    api.post<void>(`/church/${churchId}/donations/${donationId}/send-receipt`),

  /**
   * Generate year-end giving statements
   */
  generateStatements: (churchId: string, year: number, sendEmail?: boolean, memberIds?: string[]) =>
    api.post<{ generated: number; sent: number }>(`/church/${churchId}/donations/statements`, {
      year,
      sendEmail,
      memberIds,
    }),

  /**
   * Import donations from file
   */
  import: (churchId: string, file: File) =>
    uploadFile<{ imported: number; errors: { row: number; message: string }[] }>(
      `/church/${churchId}/donations/import`,
      file
    ),
};

// ----------------------------------------------------------------------------
// RECURRING DONATIONS API
// ----------------------------------------------------------------------------

export const recurringDonationsApi = {
  /**
   * List recurring donations
   */
  list: (churchId: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<RecurringDonation>>(`/church/${churchId}/donations/recurring`, params),

  /**
   * Cancel a recurring donation
   */
  cancel: (churchId: string, recurringId: string, reason?: string) =>
    api.post<void>(`/church/${churchId}/donations/recurring/${recurringId}/cancel`, { reason }),
};

// ----------------------------------------------------------------------------
// FUNDS API
// ----------------------------------------------------------------------------

export const fundsApi = {
  /**
   * List all funds
   */
  list: (churchId: string) =>
    api.get<Fund[]>(`/church/${churchId}/funds`),

  /**
   * Get a single fund
   */
  get: (churchId: string, fundId: string) =>
    api.get<Fund>(`/church/${churchId}/funds/${fundId}`),

  /**
   * Create a new fund
   */
  create: (churchId: string, data: { name: string; description?: string; goal?: number; isDefault?: boolean }) =>
    api.post<Fund>(`/church/${churchId}/funds`, data),

  /**
   * Update a fund
   */
  update: (churchId: string, fundId: string, data: { name?: string; description?: string; goal?: number; isActive?: boolean }) =>
    api.patch<Fund>(`/church/${churchId}/funds/${fundId}`, data),
};

// ----------------------------------------------------------------------------
// EVENTS API
// ----------------------------------------------------------------------------

export interface EventFilters extends PaginationParams {
  category?: EventCategory | EventCategory[];
  status?: string | string[];
  ministryId?: string;
  isPublic?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  requiresRegistration?: boolean;
}

export const eventsApi = {
  /**
   * List all events with optional filters
   */
  list: (churchId: string, filters?: EventFilters) =>
    api.get<PaginatedResponse<Event>>(`/church/${churchId}/events`, filters),

  /**
   * Get a single event by ID
   */
  get: (churchId: string, eventId: string) =>
    api.get<Event>(`/church/${churchId}/events/${eventId}`),

  /**
   * Create a new event
   */
  create: (churchId: string, data: EventCreateInput) =>
    api.post<Event>(`/church/${churchId}/events`, data),

  /**
   * Update an existing event
   */
  update: (churchId: string, eventId: string, data: EventUpdateInput) =>
    api.patch<Event>(`/church/${churchId}/events/${eventId}`, data),

  /**
   * Delete an event
   */
  delete: (churchId: string, eventId: string) =>
    api.delete<void>(`/church/${churchId}/events/${eventId}`),

  /**
   * Cancel an event
   */
  cancel: (churchId: string, eventId: string, reason?: string, notifyAttendees?: boolean) =>
    api.post<Event>(`/church/${churchId}/events/${eventId}/cancel`, {
      reason,
      notifyAttendees,
    }),

  /**
   * Duplicate an event
   */
  duplicate: (churchId: string, eventId: string, newStartDate?: string) =>
    api.post<Event>(`/church/${churchId}/events/${eventId}/duplicate`, { newStartDate }),

  /**
   * Get upcoming events
   */
  getUpcoming: (churchId: string, limit?: number) =>
    api.get<Event[]>(`/church/${churchId}/events/upcoming`, { limit }),

  /**
   * Get calendar events for a month
   */
  getCalendar: (churchId: string, month: string) =>
    api.get<{ id: string; title: string; start: string; end: string; allDay: boolean; category: EventCategory }[]>(
      `/church/${churchId}/events/calendar`,
      { month }
    ),

  /**
   * Send event reminders
   */
  sendReminders: (churchId: string, eventId: string, attendeeIds?: string[]) =>
    api.post<{ sent: number }>(`/church/${churchId}/events/${eventId}/send-reminders`, { attendeeIds }),
};

// ----------------------------------------------------------------------------
// ATTENDEES API
// ----------------------------------------------------------------------------

export interface AttendeeFilters extends PaginationParams {
  status?: AttendeeStatus | AttendeeStatus[];
  search?: string;
}

export const attendeesApi = {
  /**
   * List event attendees
   */
  list: (churchId: string, eventId: string, filters?: AttendeeFilters) =>
    api.get<PaginatedResponse<Attendee>>(`/church/${churchId}/events/${eventId}/attendees`, filters),

  /**
   * Register an attendee
   */
  register: (churchId: string, eventId: string, data: {
    memberId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    notes?: string;
  }) =>
    api.post<Attendee>(`/church/${churchId}/events/${eventId}/attendees`, data),

  /**
   * Update attendee status
   */
  updateStatus: (churchId: string, eventId: string, attendeeId: string, status: AttendeeStatus) =>
    api.patch<Attendee>(`/church/${churchId}/events/${eventId}/attendees/${attendeeId}`, { status }),

  /**
   * Check in an attendee
   */
  checkIn: (churchId: string, eventId: string, attendeeId: string) =>
    api.post<Attendee>(`/church/${churchId}/events/${eventId}/attendees/${attendeeId}/check-in`),

  /**
   * Bulk check in attendees
   */
  bulkCheckIn: (churchId: string, eventId: string, attendeeIds: string[]) =>
    api.post<{ checkedIn: number }>(`/church/${churchId}/events/${eventId}/attendees/bulk-check-in`, { attendeeIds }),

  /**
   * Remove an attendee
   */
  remove: (churchId: string, eventId: string, attendeeId: string, notifyAttendee?: boolean) =>
    api.delete<void>(`/church/${churchId}/events/${eventId}/attendees/${attendeeId}`, { notifyAttendee }),

  /**
   * Export attendees
   */
  export: (churchId: string, eventId: string, format: 'csv' | 'xlsx') =>
    downloadFile(
      `/church/${churchId}/events/${eventId}/attendees/export`,
      `attendees.${format}`,
      { format }
    ),
};

// ----------------------------------------------------------------------------
// VOLUNTEERS API
// ----------------------------------------------------------------------------

export interface VolunteerFilters extends PaginationParams {
  status?: VolunteerStatus | VolunteerStatus[];
  teamId?: string;
  skills?: string[];
  backgroundCheckStatus?: string | string[];
  search?: string;
  availableOn?: string;
}

export const volunteersApi = {
  /**
   * List all volunteers with optional filters
   */
  list: (churchId: string, filters?: VolunteerFilters) =>
    api.get<PaginatedResponse<Volunteer>>(`/church/${churchId}/volunteers`, filters),

  /**
   * Get a single volunteer by ID
   */
  get: (churchId: string, volunteerId: string) =>
    api.get<Volunteer>(`/church/${churchId}/volunteers/${volunteerId}`),

  /**
   * Create a new volunteer
   */
  create: (churchId: string, data: VolunteerCreateInput) =>
    api.post<Volunteer>(`/church/${churchId}/volunteers`, data),

  /**
   * Update an existing volunteer
   */
  update: (churchId: string, volunteerId: string, data: VolunteerUpdateInput) =>
    api.patch<Volunteer>(`/church/${churchId}/volunteers/${volunteerId}`, data),

  /**
   * Deactivate a volunteer
   */
  deactivate: (churchId: string, volunteerId: string, reason?: string) =>
    api.post<Volunteer>(`/church/${churchId}/volunteers/${volunteerId}/deactivate`, { reason }),

  /**
   * Get volunteer statistics
   */
  getStats: (churchId: string) =>
    api.get<{
      totalVolunteers: number;
      activeVolunteers: number;
      totalHoursThisMonth: number;
      totalHoursThisYear: number;
      byTeam: { team: MinistryTeam; count: number; hours: number }[];
      byStatus: Record<VolunteerStatus, number>;
      needsBackgroundCheck: number;
    }>(`/church/${churchId}/volunteers/stats`),

  /**
   * Get volunteer schedule
   */
  getSchedule: (churchId: string, startDate: string, endDate: string, teamId?: string) =>
    api.get<VolunteerAssignment[]>(`/church/${churchId}/volunteers/schedule`, {
      startDate,
      endDate,
      teamId,
    }),

  /**
   * Log volunteer hours
   */
  logHours: (churchId: string, volunteerId: string, hours: number, date: string, notes?: string) =>
    api.post<void>(`/church/${churchId}/volunteers/${volunteerId}/hours`, {
      hours,
      date,
      notes,
    }),

  /**
   * Initiate background check
   */
  initiateBackgroundCheck: (churchId: string, volunteerId: string) =>
    api.post<void>(`/church/${churchId}/volunteers/${volunteerId}/background-check`),
};

// ----------------------------------------------------------------------------
// MINISTRY TEAMS API
// ----------------------------------------------------------------------------

export const teamsApi = {
  /**
   * List all ministry teams
   */
  list: (churchId: string, includeInactive?: boolean) =>
    api.get<MinistryTeam[]>(`/church/${churchId}/teams`, { includeInactive }),

  /**
   * Get a single team
   */
  get: (churchId: string, teamId: string) =>
    api.get<MinistryTeam>(`/church/${churchId}/teams/${teamId}`),

  /**
   * Create a new team
   */
  create: (churchId: string, data: {
    name: string;
    description?: string;
    ministryId?: string;
    leaderId?: string;
    requirements?: string[];
  }) =>
    api.post<MinistryTeam>(`/church/${churchId}/teams`, data),

  /**
   * Update a team
   */
  update: (churchId: string, teamId: string, data: {
    name?: string;
    description?: string;
    ministryId?: string;
    leaderId?: string;
    requirements?: string[];
    isActive?: boolean;
  }) =>
    api.patch<MinistryTeam>(`/church/${churchId}/teams/${teamId}`, data),

  /**
   * Delete a team
   */
  delete: (churchId: string, teamId: string) =>
    api.delete<void>(`/church/${churchId}/teams/${teamId}`),

  /**
   * Get team members
   */
  getMembers: (churchId: string, teamId: string) =>
    api.get<Volunteer[]>(`/church/${churchId}/teams/${teamId}/members`),

  /**
   * Add member to team
   */
  addMember: (churchId: string, teamId: string, volunteerId: string, role?: string) =>
    api.post<void>(`/church/${churchId}/teams/${teamId}/members`, { volunteerId, role }),

  /**
   * Remove member from team
   */
  removeMember: (churchId: string, teamId: string, volunteerId: string) =>
    api.delete<void>(`/church/${churchId}/teams/${teamId}/members/${volunteerId}`),
};

// ----------------------------------------------------------------------------
// VOLUNTEER ASSIGNMENTS API
// ----------------------------------------------------------------------------

export const assignmentsApi = {
  /**
   * List assignments
   */
  list: (churchId: string, params?: { volunteerId?: string; startDate?: string; endDate?: string; status?: string }) =>
    api.get<VolunteerAssignment[]>(`/church/${churchId}/assignments`, params),

  /**
   * Get volunteer's assignments
   */
  getForVolunteer: (churchId: string, volunteerId: string, params?: { startDate?: string; endDate?: string; status?: string }) =>
    api.get<VolunteerAssignment[]>(`/church/${churchId}/volunteers/${volunteerId}/assignments`, params),

  /**
   * Create an assignment
   */
  create: (churchId: string, data: {
    volunteerId: string;
    teamId: string;
    eventId?: string;
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) =>
    api.post<VolunteerAssignment>(`/church/${churchId}/assignments`, data),

  /**
   * Update an assignment
   */
  update: (churchId: string, assignmentId: string, data: {
    teamId?: string;
    eventId?: string;
    role?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) =>
    api.patch<VolunteerAssignment>(`/church/${churchId}/assignments/${assignmentId}`, data),

  /**
   * Delete an assignment
   */
  delete: (churchId: string, assignmentId: string) =>
    api.delete<void>(`/church/${churchId}/assignments/${assignmentId}`),

  /**
   * Confirm an assignment
   */
  confirm: (churchId: string, assignmentId: string) =>
    api.post<VolunteerAssignment>(`/church/${churchId}/assignments/${assignmentId}/confirm`),
};

// ----------------------------------------------------------------------------
// COMMUNICATIONS API
// ----------------------------------------------------------------------------

export interface MessageFilters extends PaginationParams {
  type?: MessageType | MessageType[];
  status?: MessageStatus | MessageStatus[];
  senderId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const communicationsApi = {
  /**
   * List messages with optional filters
   */
  list: (churchId: string, filters?: MessageFilters) =>
    api.get<PaginatedResponse<Message>>(`/church/${churchId}/communications/messages`, filters),

  /**
   * Get a single message
   */
  get: (churchId: string, messageId: string) =>
    api.get<Message>(`/church/${churchId}/communications/messages/${messageId}`),

  /**
   * Send a message
   */
  send: (churchId: string, data: MessageCreateInput) =>
    api.post<Message>(`/church/${churchId}/communications/send`, data),

  /**
   * Get draft messages
   */
  getDrafts: (churchId: string) =>
    api.get<Message[]>(`/church/${churchId}/communications/messages/drafts`),

  /**
   * Save a draft
   */
  saveDraft: (churchId: string, data: MessageCreateInput) =>
    api.post<Message>(`/church/${churchId}/communications/drafts`, data),

  /**
   * Update a draft
   */
  updateDraft: (churchId: string, messageId: string, data: Partial<MessageCreateInput>) =>
    api.patch<Message>(`/church/${churchId}/communications/drafts/${messageId}`, data),

  /**
   * Delete a draft
   */
  deleteDraft: (churchId: string, messageId: string) =>
    api.delete<void>(`/church/${churchId}/communications/drafts/${messageId}`),

  /**
   * Get scheduled messages
   */
  getScheduled: (churchId: string) =>
    api.get<Message[]>(`/church/${churchId}/communications/messages/scheduled`),

  /**
   * Schedule a message
   */
  schedule: (churchId: string, data: MessageCreateInput & { scheduledFor: string }) =>
    api.post<Message>(`/church/${churchId}/communications/schedule`, data),

  /**
   * Cancel a scheduled message
   */
  cancelScheduled: (churchId: string, messageId: string) =>
    api.post<void>(`/church/${churchId}/communications/messages/${messageId}/cancel`),

  /**
   * Preview a message
   */
  preview: (churchId: string, data: { templateId?: string; subject: string; body: string; type: MessageType; memberId?: string }) =>
    api.post<{ subject: string; body: string; html?: string }>(`/church/${churchId}/communications/preview`, data),

  /**
   * Send a test message
   */
  sendTest: (churchId: string, data: { type: MessageType; subject: string; body: string; recipients: string[] }) =>
    api.post<void>(`/church/${churchId}/communications/test`, data),

  /**
   * Resend a failed message
   */
  resend: (churchId: string, messageId: string) =>
    api.post<Message>(`/church/${churchId}/communications/messages/${messageId}/resend`),

  /**
   * Get recipient count for a filter
   */
  getRecipientCount: (churchId: string, filter: RecipientFilter) =>
    api.post<{ count: number; sample: { id: string; name: string; email?: string }[] }>(
      `/church/${churchId}/communications/recipient-count`,
      filter
    ),

  /**
   * Get communication statistics
   */
  getStats: (churchId: string, params?: { startDate?: string; endDate?: string; type?: MessageType }) =>
    api.get<{
      totalSent: number;
      totalDelivered: number;
      totalOpened: number;
      totalClicked: number;
      averageOpenRate: number;
      averageClickRate: number;
      byType: Record<MessageType, { sent: number; delivered: number; opened: number; clicked: number }>;
      trend: { date: string; sent: number; opened: number }[];
    }>(`/church/${churchId}/communications/stats`, params),
};

// ----------------------------------------------------------------------------
// MESSAGE TEMPLATES API
// ----------------------------------------------------------------------------

export const templatesApi = {
  /**
   * List all templates
   */
  list: (churchId: string, type?: MessageType) =>
    api.get<MessageTemplate[]>(`/church/${churchId}/communications/templates`, { type }),

  /**
   * Get a single template
   */
  get: (churchId: string, templateId: string) =>
    api.get<MessageTemplate>(`/church/${churchId}/communications/templates/${templateId}`),

  /**
   * Create a template
   */
  create: (churchId: string, data: MessageTemplateCreateInput) =>
    api.post<MessageTemplate>(`/church/${churchId}/communications/templates`, data),

  /**
   * Update a template
   */
  update: (churchId: string, templateId: string, data: Partial<MessageTemplateCreateInput>) =>
    api.patch<MessageTemplate>(`/church/${churchId}/communications/templates/${templateId}`, data),

  /**
   * Delete a template
   */
  delete: (churchId: string, templateId: string) =>
    api.delete<void>(`/church/${churchId}/communications/templates/${templateId}`),

  /**
   * Duplicate a template
   */
  duplicate: (churchId: string, templateId: string, name: string) =>
    api.post<MessageTemplate>(`/church/${churchId}/communications/templates/${templateId}/duplicate`, { name }),

  /**
   * Get available template variables
   */
  getVariables: (churchId: string) =>
    api.get<{ name: string; description: string; example: string }[]>(
      `/church/${churchId}/communications/template-variables`
    ),
};

// ----------------------------------------------------------------------------
// DISCIPLESHIP API
// ----------------------------------------------------------------------------

export interface DiscipleshipPlan {
  id: string | number;
  name: string;
  description: string;
  category: 'doctrine' | 'conduct' | 'character' | 'service';
  totalLessons: number;
  estimatedDuration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  coverImageUrl?: string;
  enrolledCount: number;
  completedCount: number;
  averageRating?: number;
  status: 'draft' | 'active' | 'archived';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscipleshipLesson {
  id: string | number;
  planId: number;
  title: string;
  description?: string;
  content?: string;
  orderIndex: number;
  estimatedMinutes?: number;
  videoUrl?: string;
  audioUrl?: string;
  scriptureReferences?: string[];
  reflectionQuestions?: { question: string; type?: string }[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface DiscipleProgress {
  id: string | number;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  planId: string | number;
  planName: string;
  progress: number;
  currentLesson: number;
  totalLessons: number;
  completedLessonIds?: number[];
  startedAt: string;
  lastActivityAt: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'paused' | 'dropped';
}

export interface DiscipleshipSmallGroup {
  id: string | number;
  name: string;
  description?: string;
  leaderId?: string;
  leaderName?: string;
  memberCount: number;
  maxMembers?: number;
  meetingDay?: string;
  meetingTime?: string;
  meetingFrequency?: 'weekly' | 'biweekly' | 'monthly';
  meetingLocation?: string;
  locationType?: 'in_person' | 'online' | 'hybrid';
  currentPlanId?: string | number;
  currentPlanName?: string;
  status: 'forming' | 'active' | 'completed' | 'archived';
  isAcceptingMembers: boolean;
  createdAt: string;
}

export interface DiscipleshipFilters {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const discipleshipApi = {
  // Plans
  listPlans: (churchId: string, filters?: DiscipleshipFilters) =>
    api.get<{ data: DiscipleshipPlan[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/church/${churchId}/discipleship/plans`,
      filters
    ),

  getPlan: (churchId: string, planId: string | number) =>
    api.get<DiscipleshipPlan & { lessons: DiscipleshipLesson[] }>(`/church/${churchId}/discipleship/plans/${planId}`),

  createPlan: (churchId: string, data: {
    name: string;
    description?: string;
    category: DiscipleshipPlan['category'];
    estimatedDuration?: string;
    difficulty?: DiscipleshipPlan['difficulty'];
    coverImageUrl?: string;
    isPublic?: boolean;
  }) =>
    api.post<DiscipleshipPlan>(`/church/${churchId}/discipleship/plans`, data),

  updatePlan: (churchId: string, planId: number, data: Partial<{
    name: string;
    description: string;
    category: DiscipleshipPlan['category'];
    estimatedDuration: string;
    difficulty: DiscipleshipPlan['difficulty'];
    coverImageUrl: string;
    isPublic: boolean;
    status: DiscipleshipPlan['status'];
  }>) =>
    api.patch<DiscipleshipPlan>(`/church/${churchId}/discipleship/plans/${planId}`, data),

  deletePlan: (churchId: string, planId: number) =>
    api.delete<void>(`/church/${churchId}/discipleship/plans/${planId}`),

  // Lessons
  createLesson: (churchId: string, data: {
    planId: number;
    title: string;
    description?: string;
    content?: string;
    orderIndex?: number;
    estimatedMinutes?: number;
    videoUrl?: string;
    audioUrl?: string;
    scriptureReferences?: string[];
    reflectionQuestions?: { question: string; type?: string }[];
  }) =>
    api.post<DiscipleshipLesson>(`/church/${churchId}/discipleship/lessons`, data),

  updateLesson: (churchId: string, lessonId: number, data: Partial<{
    title: string;
    description: string;
    content: string;
    orderIndex: number;
    estimatedMinutes: number;
    videoUrl: string;
    audioUrl: string;
    scriptureReferences: string[];
    reflectionQuestions: { question: string; type?: string }[];
    status: DiscipleshipLesson['status'];
  }>) =>
    api.patch<DiscipleshipLesson>(`/church/${churchId}/discipleship/lessons/${lessonId}`, data),

  deleteLesson: (churchId: string, lessonId: number) =>
    api.delete<void>(`/church/${churchId}/discipleship/lessons/${lessonId}`),

  // Progress
  listProgress: (churchId: string, filters?: DiscipleshipFilters) =>
    api.get<{ data: DiscipleProgress[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/church/${churchId}/discipleship/progress`,
      filters
    ),

  enrollInPlan: (churchId: string, planId: number, memberId?: string) =>
    api.post<DiscipleProgress>(`/church/${churchId}/discipleship/progress/enroll`, { planId, memberId }),

  updateProgress: (churchId: string, progressId: number, data: {
    currentLessonIndex?: number;
    completedLessonIds?: number[];
    status?: DiscipleProgress['status'];
    lessonNotes?: Record<string, string>;
  }) =>
    api.patch<DiscipleProgress>(`/church/${churchId}/discipleship/progress/${progressId}`, data),

  // Groups
  listGroups: (churchId: string, filters?: DiscipleshipFilters) =>
    api.get<{ data: DiscipleshipSmallGroup[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/church/${churchId}/discipleship/groups`,
      filters
    ),

  createGroup: (churchId: string, data: {
    name: string;
    description?: string;
    planId?: number;
    meetingDay?: string;
    meetingTime?: string;
    meetingFrequency?: 'weekly' | 'biweekly' | 'monthly';
    meetingLocation?: string;
    virtualMeetingUrl?: string;
    locationType?: 'in_person' | 'online' | 'hybrid';
    maxMembers?: number;
    requiresApproval?: boolean;
  }) =>
    api.post<DiscipleshipSmallGroup>(`/church/${churchId}/discipleship/groups`, data),

  updateGroup: (churchId: string, groupId: number, data: Partial<{
    name: string;
    description: string;
    planId: number;
    meetingDay: string;
    meetingTime: string;
    meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
    meetingLocation: string;
    virtualMeetingUrl: string;
    locationType: 'in_person' | 'online' | 'hybrid';
    maxMembers: number;
    status: DiscipleshipSmallGroup['status'];
    isAcceptingMembers: boolean;
  }>) =>
    api.patch<DiscipleshipSmallGroup>(`/church/${churchId}/discipleship/groups/${groupId}`, data),

  addGroupMember: (churchId: string, groupId: number, userId: string, role?: string) =>
    api.post<void>(`/church/${churchId}/discipleship/groups/${groupId}/members`, { userId, role }),

  removeGroupMember: (churchId: string, groupId: number, memberId: string) =>
    api.delete<void>(`/church/${churchId}/discipleship/groups/${groupId}/members/${memberId}`),

  // Stats
  getStats: (churchId: string) =>
    api.get<{
      totalPlans: number;
      activeParticipants: number;
      completedJourneys: number;
      smallGroups: number;
      weeklyEngagement: number;
    }>(`/church/${churchId}/discipleship/stats`),
};

// ----------------------------------------------------------------------------
// SERMONS API
// ----------------------------------------------------------------------------

export interface SermonFilters extends PaginationParams {
  seriesId?: string;
  status?: Sermon['status'] | Sermon['status'][];
  speakerId?: string;
  tags?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const sermonsApi = {
  // Series
  listSeries: (churchId: string, params?: PaginationParams & { status?: string }) =>
    api.get<PaginatedResponse<SermonSeries>>(`/church/${churchId}/sermons/series`, params),

  getSeries: (churchId: string, seriesId: string) =>
    api.get<SermonSeries & { sermons: Sermon[] }>(`/church/${churchId}/sermons/series/${seriesId}`),

  createSeries: (churchId: string, data: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    imageUrl?: string;
    status?: SermonSeries['status'];
  }) =>
    api.post<SermonSeries>(`/church/${churchId}/sermons/series`, data),

  updateSeries: (churchId: string, seriesId: string, data: Partial<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    status: SermonSeries['status'];
  }>) =>
    api.patch<SermonSeries>(`/church/${churchId}/sermons/series/${seriesId}`, data),

  deleteSeries: (churchId: string, seriesId: string) =>
    api.delete<void>(`/church/${churchId}/sermons/series/${seriesId}`),

  // Sermons
  list: (churchId: string, filters?: SermonFilters) =>
    api.get<PaginatedResponse<Sermon>>(`/church/${churchId}/sermons`, filters),

  get: (churchId: string, sermonId: string) =>
    api.get<Sermon & { resources: SermonResource[]; feedback: SermonFeedback[] }>(
      `/church/${churchId}/sermons/${sermonId}`
    ),

  create: (churchId: string, data: SermonCreateInput) =>
    api.post<Sermon>(`/church/${churchId}/sermons`, data),

  update: (churchId: string, sermonId: string, data: SermonUpdateInput) =>
    api.patch<Sermon>(`/church/${churchId}/sermons/${sermonId}`, data),

  delete: (churchId: string, sermonId: string) =>
    api.delete<void>(`/church/${churchId}/sermons/${sermonId}`),

  duplicate: (churchId: string, sermonId: string) =>
    api.post<Sermon>(`/church/${churchId}/sermons/${sermonId}/duplicate`),

  // Collaborators
  addCollaborator: (churchId: string, sermonId: string, data: {
    userId: string;
    role: SermonCollaborator['role'];
    canEdit?: boolean;
  }) =>
    api.post<SermonCollaborator>(`/church/${churchId}/sermons/${sermonId}/collaborators`, data),

  removeCollaborator: (churchId: string, sermonId: string, collaboratorId: string) =>
    api.delete<void>(`/church/${churchId}/sermons/${sermonId}/collaborators/${collaboratorId}`),

  // Resources
  addResource: (churchId: string, sermonId: string, data: {
    type: SermonResource['type'];
    title: string;
    url: string;
    description?: string;
  }) =>
    api.post<SermonResource>(`/church/${churchId}/sermons/${sermonId}/resources`, data),

  updateResource: (churchId: string, sermonId: string, resourceId: string, data: Partial<{
    title: string;
    url: string;
    description: string;
    orderIndex: number;
  }>) =>
    api.patch<SermonResource>(`/church/${churchId}/sermons/${sermonId}/resources/${resourceId}`, data),

  deleteResource: (churchId: string, sermonId: string, resourceId: string) =>
    api.delete<void>(`/church/${churchId}/sermons/${sermonId}/resources/${resourceId}`),

  uploadResource: (churchId: string, sermonId: string, file: File, title?: string) =>
    uploadFile<SermonResource>(
      `/church/${churchId}/sermons/${sermonId}/resources/upload`,
      file,
      title ? { title } : undefined
    ),

  // Feedback
  submitFeedback: (churchId: string, sermonId: string, data: {
    rating?: number;
    comment?: string;
    isAnonymous?: boolean;
  }) =>
    api.post<SermonFeedback>(`/church/${churchId}/sermons/${sermonId}/feedback`, data),

  getFeedback: (churchId: string, sermonId: string) =>
    api.get<SermonFeedback[]>(`/church/${churchId}/sermons/${sermonId}/feedback`),

  // Stats
  getStats: (churchId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<{
      totalSermons: number;
      totalSeries: number;
      sermonsThisMonth: number;
      averageRating: number;
      topSpeakers: { speakerId: string; speakerName: string; sermonCount: number }[];
      byStatus: Record<Sermon['status'], number>;
    }>(`/church/${churchId}/sermons/stats`, params),

  // Upcoming/Scheduled
  getUpcoming: (churchId: string, limit?: number) =>
    api.get<Sermon[]>(`/church/${churchId}/sermons/upcoming`, { limit }),

  getArchive: (churchId: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<Sermon>>(`/church/${churchId}/sermons/archive`, params),
};

// ----------------------------------------------------------------------------
// PRAYER REQUESTS API
// ----------------------------------------------------------------------------

export interface PrayerFilters extends PaginationParams {
  category?: PrayerCategory | PrayerCategory[];
  status?: PrayerStatus | PrayerStatus[];
  isUrgent?: boolean;
  isPrivate?: boolean;
  memberId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const prayerApi = {
  list: (churchId: string, filters?: PrayerFilters) =>
    api.get<PaginatedResponse<PrayerRequest>>(`/church/${churchId}/prayer-requests`, filters),

  get: (churchId: string, requestId: string) =>
    api.get<PrayerRequest & { followUps: PrayerFollowUp[] }>(`/church/${churchId}/prayer-requests/${requestId}`),

  create: (churchId: string, data: PrayerCreateInput) =>
    api.post<PrayerRequest>(`/church/${churchId}/prayer-requests`, data),

  update: (churchId: string, requestId: string, data: PrayerUpdateInput) =>
    api.patch<PrayerRequest>(`/church/${churchId}/prayer-requests/${requestId}`, data),

  delete: (churchId: string, requestId: string) =>
    api.delete<void>(`/church/${churchId}/prayer-requests/${requestId}`),

  // Mark as prayed
  markPrayed: (churchId: string, requestId: string) =>
    api.post<{ prayerCount: number }>(`/church/${churchId}/prayer-requests/${requestId}/prayed`),

  // Mark as answered
  markAnswered: (churchId: string, requestId: string, note?: string) =>
    api.post<PrayerRequest>(`/church/${churchId}/prayer-requests/${requestId}/answered`, { note }),

  // Add follow-up
  addFollowUp: (churchId: string, requestId: string, data: {
    content: string;
    isUpdate?: boolean;
  }) =>
    api.post<PrayerFollowUp>(`/church/${churchId}/prayer-requests/${requestId}/follow-ups`, data),

  // Get urgent requests
  getUrgent: (churchId: string, limit?: number) =>
    api.get<PrayerRequest[]>(`/church/${churchId}/prayer-requests/urgent`, { limit }),

  // Get my prayer requests
  getMine: (churchId: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<PrayerRequest>>(`/church/${churchId}/prayer-requests/mine`, params),

  // Stats
  getStats: (churchId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<{
      totalRequests: number;
      activeRequests: number;
      answeredRequests: number;
      totalPrayers: number;
      byCategory: Record<PrayerCategory, number>;
      byStatus: Record<PrayerStatus, number>;
      urgentCount: number;
      trend: { date: string; requests: number; answered: number }[];
    }>(`/church/${churchId}/prayer-requests/stats`, params),

  // Categories
  getCategories: (churchId: string) =>
    api.get<{ category: PrayerCategory; label: string; count: number }[]>(
      `/church/${churchId}/prayer-requests/categories`
    ),
};

// ----------------------------------------------------------------------------
// SMALL GROUPS API
// ----------------------------------------------------------------------------

export interface SmallGroupFilters extends PaginationParams {
  category?: SmallGroupCategory | SmallGroupCategory[];
  status?: SmallGroup['status'] | SmallGroup['status'][];
  meetingDay?: string;
  meetingType?: SmallGroup['meetingType'];
  leaderId?: string;
  isPublic?: boolean;
  hasOpenings?: boolean;
  search?: string;
  tags?: string[];
}

export const smallGroupsApi = {
  list: (churchId: string, filters?: SmallGroupFilters) =>
    api.get<PaginatedResponse<SmallGroup>>(`/church/${churchId}/small-groups`, filters),

  get: (churchId: string, groupId: string) =>
    api.get<SmallGroup & { meetings: SmallGroupMeeting[] }>(`/church/${churchId}/small-groups/${groupId}`),

  create: (churchId: string, data: SmallGroupCreateInput) =>
    api.post<SmallGroup>(`/church/${churchId}/small-groups`, data),

  update: (churchId: string, groupId: string, data: SmallGroupUpdateInput) =>
    api.patch<SmallGroup>(`/church/${churchId}/small-groups/${groupId}`, data),

  delete: (churchId: string, groupId: string) =>
    api.delete<void>(`/church/${churchId}/small-groups/${groupId}`),

  // Members
  getMembers: (churchId: string, groupId: string) =>
    api.get<SmallGroupMember[]>(`/church/${churchId}/small-groups/${groupId}/members`),

  addMember: (churchId: string, groupId: string, data: {
    memberId: string;
    role?: SmallGroupMember['role'];
  }) =>
    api.post<SmallGroupMember>(`/church/${churchId}/small-groups/${groupId}/members`, data),

  updateMember: (churchId: string, groupId: string, memberId: string, data: {
    role?: SmallGroupMember['role'];
    status?: SmallGroupMember['status'];
  }) =>
    api.patch<SmallGroupMember>(`/church/${churchId}/small-groups/${groupId}/members/${memberId}`, data),

  removeMember: (churchId: string, groupId: string, memberId: string) =>
    api.delete<void>(`/church/${churchId}/small-groups/${groupId}/members/${memberId}`),

  // Join Requests
  getJoinRequests: (churchId: string, groupId: string) =>
    api.get<SmallGroupJoinRequest[]>(`/church/${churchId}/small-groups/${groupId}/join-requests`),

  submitJoinRequest: (churchId: string, groupId: string, message?: string) =>
    api.post<SmallGroupJoinRequest>(`/church/${churchId}/small-groups/${groupId}/join-requests`, { message }),

  respondToJoinRequest: (churchId: string, groupId: string, requestId: string, data: {
    status: 'approved' | 'denied';
    message?: string;
  }) =>
    api.patch<SmallGroupJoinRequest>(
      `/church/${churchId}/small-groups/${groupId}/join-requests/${requestId}`,
      data
    ),

  // Meetings
  getMeetings: (churchId: string, groupId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<SmallGroupMeeting[]>(`/church/${churchId}/small-groups/${groupId}/meetings`, params),

  createMeeting: (churchId: string, groupId: string, data: {
    date: string;
    startTime: string;
    endTime?: string;
    title?: string;
    topic?: string;
    location?: string;
    notes?: string;
  }) =>
    api.post<SmallGroupMeeting>(`/church/${churchId}/small-groups/${groupId}/meetings`, data),

  updateMeeting: (churchId: string, groupId: string, meetingId: string, data: Partial<{
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    topic: string;
    location: string;
    notes: string;
  }>) =>
    api.patch<SmallGroupMeeting>(`/church/${churchId}/small-groups/${groupId}/meetings/${meetingId}`, data),

  deleteMeeting: (churchId: string, groupId: string, meetingId: string) =>
    api.delete<void>(`/church/${churchId}/small-groups/${groupId}/meetings/${meetingId}`),

  // Attendance
  recordAttendance: (churchId: string, groupId: string, meetingId: string, data: {
    attendees: { memberId: string; isPresent: boolean }[];
  }) =>
    api.post<SmallGroupAttendance[]>(
      `/church/${churchId}/small-groups/${groupId}/meetings/${meetingId}/attendance`,
      data
    ),

  getAttendance: (churchId: string, groupId: string, meetingId: string) =>
    api.get<SmallGroupAttendance[]>(
      `/church/${churchId}/small-groups/${groupId}/meetings/${meetingId}/attendance`
    ),

  // Stats
  getStats: (churchId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<{
      totalGroups: number;
      activeGroups: number;
      totalMembers: number;
      averageGroupSize: number;
      totalMeetings: number;
      averageAttendance: number;
      byCategory: Record<SmallGroupCategory, number>;
      byStatus: Record<SmallGroup['status'], number>;
      trend: { date: string; meetings: number; attendance: number }[];
    }>(`/church/${churchId}/small-groups/stats`, params),

  // Find groups accepting members
  findOpenGroups: (churchId: string, filters?: {
    category?: SmallGroupCategory;
    meetingDay?: string;
    meetingType?: SmallGroup['meetingType'];
  }) =>
    api.get<SmallGroup[]>(`/church/${churchId}/small-groups/open`, filters),

  // My groups
  getMyGroups: (churchId: string) =>
    api.get<SmallGroup[]>(`/church/${churchId}/small-groups/mine`),
};

// ----------------------------------------------------------------------------
// CHECK-IN API
// ----------------------------------------------------------------------------

export interface ServiceFilters extends PaginationParams {
  serviceType?: Service['serviceType'] | Service['serviceType'][];
  status?: Service['status'] | Service['status'][];
  dateFrom?: string;
  dateTo?: string;
}

export const checkInApi = {
  // Services
  listServices: (churchId: string, filters?: ServiceFilters) =>
    api.get<PaginatedResponse<Service>>(`/church/${churchId}/check-in/services`, filters),

  getService: (churchId: string, serviceId: string) =>
    api.get<Service & { checkIns: ServiceCheckIn[] }>(`/church/${churchId}/check-in/services/${serviceId}`),

  createService: (churchId: string, data: {
    name: string;
    serviceType: Service['serviceType'];
    scheduledDate: string;
    startTime: string;
    endTime?: string;
    location?: string;
    checkInStartTime?: string;
    checkInEndTime?: string;
    notes?: string;
  }) =>
    api.post<Service>(`/church/${churchId}/check-in/services`, data),

  updateService: (churchId: string, serviceId: string, data: Partial<{
    name: string;
    serviceType: Service['serviceType'];
    scheduledDate: string;
    startTime: string;
    endTime: string;
    location: string;
    status: Service['status'];
    isCheckInOpen: boolean;
    checkInStartTime: string;
    checkInEndTime: string;
    notes: string;
  }>) =>
    api.patch<Service>(`/church/${churchId}/check-in/services/${serviceId}`, data),

  deleteService: (churchId: string, serviceId: string) =>
    api.delete<void>(`/church/${churchId}/check-in/services/${serviceId}`),

  // Open/close check-in
  openCheckIn: (churchId: string, serviceId: string) =>
    api.post<Service>(`/church/${churchId}/check-in/services/${serviceId}/open`),

  closeCheckIn: (churchId: string, serviceId: string) =>
    api.post<Service>(`/church/${churchId}/check-in/services/${serviceId}/close`),

  // Check-ins
  listCheckIns: (churchId: string, serviceId: string, filters?: CheckInFilters) =>
    api.get<PaginatedResponse<ServiceCheckIn>>(`/church/${churchId}/check-in/services/${serviceId}/check-ins`, filters),

  checkIn: (churchId: string, serviceId: string, data: {
    memberId?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    isFirstTime?: boolean;
    notes?: string;
  }) =>
    api.post<ServiceCheckIn>(`/church/${churchId}/check-in/services/${serviceId}/check-ins`, data),

  checkOut: (churchId: string, serviceId: string, checkInId: string) =>
    api.post<ServiceCheckIn>(`/church/${churchId}/check-in/services/${serviceId}/check-ins/${checkInId}/check-out`),

  // Quick check-in by member search
  quickCheckIn: (churchId: string, serviceId: string, query: string) =>
    api.post<{ matches: Member[]; autoCheckedIn?: ServiceCheckIn }>(
      `/church/${churchId}/check-in/services/${serviceId}/quick-check-in`,
      { query }
    ),

  // Child check-in
  checkInChild: (churchId: string, serviceId: string, parentCheckInId: string, data: {
    childId?: string;
    childName: string;
    dateOfBirth?: string;
    parentName: string;
    parentPhone: string;
    classroomAssignment?: string;
    allergies?: string;
    specialNotes?: string;
  }) =>
    api.post<ChildCheckIn>(
      `/church/${churchId}/check-in/services/${serviceId}/check-ins/${parentCheckInId}/children`,
      data
    ),

  checkOutChild: (churchId: string, serviceId: string, childCheckInId: string, data: {
    securityCode: string;
    checkedOutBy?: string;
  }) =>
    api.post<ChildCheckIn>(
      `/church/${churchId}/check-in/services/${serviceId}/children/${childCheckInId}/check-out`,
      data
    ),

  getChildCheckIns: (churchId: string, serviceId: string) =>
    api.get<ChildCheckIn[]>(`/church/${churchId}/check-in/services/${serviceId}/children`),

  // Kiosks
  listKiosks: (churchId: string) =>
    api.get<CheckInKiosk[]>(`/church/${churchId}/check-in/kiosks`),

  createKiosk: (churchId: string, data: {
    name: string;
    location: string;
    type: CheckInKiosk['type'];
    settings?: CheckInKiosk['settings'];
  }) =>
    api.post<CheckInKiosk>(`/church/${churchId}/check-in/kiosks`, data),

  updateKiosk: (churchId: string, kioskId: string, data: Partial<{
    name: string;
    location: string;
    type: CheckInKiosk['type'];
    isActive: boolean;
    settings: CheckInKiosk['settings'];
  }>) =>
    api.patch<CheckInKiosk>(`/church/${churchId}/check-in/kiosks/${kioskId}`, data),

  deleteKiosk: (churchId: string, kioskId: string) =>
    api.delete<void>(`/church/${churchId}/check-in/kiosks/${kioskId}`),

  // Today's services
  getTodaysServices: (churchId: string) =>
    api.get<Service[]>(`/church/${churchId}/check-in/today`),

  // Current active service
  getActiveService: (churchId: string) =>
    api.get<Service | null>(`/church/${churchId}/check-in/active`),

  // Stats
  getStats: (churchId: string, params?: { startDate?: string; endDate?: string; serviceType?: string }) =>
    api.get<CheckInStats>(`/church/${churchId}/check-in/stats`, params),

  // Attendance report
  getAttendanceReport: (churchId: string, params?: {
    startDate?: string;
    endDate?: string;
    serviceType?: Service['serviceType'];
    groupBy?: 'day' | 'week' | 'month';
  }) =>
    api.get<{
      totalServices: number;
      totalCheckIns: number;
      averageAttendance: number;
      trend: { date: string; attendance: number; guests: number; firstTimers: number }[];
      byServiceType: Record<Service['serviceType'], { count: number; avgAttendance: number }>;
    }>(`/church/${churchId}/check-in/attendance-report`, params),

  // Export check-ins
  exportCheckIns: (churchId: string, serviceId: string, format: 'csv' | 'xlsx') =>
    downloadFile(
      `/church/${churchId}/check-in/services/${serviceId}/export`,
      `check-ins.${format}`,
      { format }
    ),

  // Print labels (returns print-ready HTML)
  printLabels: (churchId: string, serviceId: string, checkInIds: string[]) =>
    api.post<{ html: string; count: number }>(
      `/church/${churchId}/check-in/services/${serviceId}/print-labels`,
      { checkInIds }
    ),
};

// ----------------------------------------------------------------------------
// REPORTS API
// ----------------------------------------------------------------------------

export interface ReportFilters extends ReportParams {
  categories?: EventCategory[];
  ministryIds?: string[];
  fundIds?: string[];
  methods?: string[];
  includeBreakdown?: boolean;
  includeRecurring?: boolean;
  includeTopDonors?: boolean;
  donorLimit?: number;
  includeAgeBreakdown?: boolean;
  includeGenderBreakdown?: boolean;
  includeTagBreakdown?: boolean;
}

export const reportsApi = {
  /**
   * Get dashboard statistics
   */
  getDashboard: (churchId: string) =>
    api.get<DashboardStats>(`/church/${churchId}/reports/dashboard`),

  /**
   * Get attendance statistics
   */
  getAttendance: (churchId: string, params?: ReportFilters) =>
    api.get<AttendanceStats>(`/church/${churchId}/reports/attendance`, params),

  /**
   * Get attendance year-over-year comparison
   */
  getAttendanceComparison: (churchId: string, year?: number) =>
    api.get<{
      currentYear: number;
      previousYear: number;
      currentValue: number;
      previousValue: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'flat';
    }>(`/church/${churchId}/reports/attendance/comparison`, { year }),

  /**
   * Get giving report
   */
  getGiving: (churchId: string, params?: ReportFilters) =>
    api.get<GivingReport>(`/church/${churchId}/reports/giving`, params),

  /**
   * Get giving year-over-year comparison
   */
  getGivingComparison: (churchId: string, year?: number) =>
    api.get<{
      currentYear: number;
      previousYear: number;
      currentValue: number;
      previousValue: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'flat';
    }>(`/church/${churchId}/reports/giving/comparison`, { year }),

  /**
   * Get giving by fund
   */
  getGivingByFund: (churchId: string, params?: ReportParams) =>
    api.get<{ fundId: string; fundName: string; amount: number; percentage: number; count: number }[]>(
      `/church/${churchId}/reports/giving/by-fund`,
      params
    ),

  /**
   * Get membership statistics
   */
  getMembership: (churchId: string, params?: ReportFilters) =>
    api.get<MembershipStats>(`/church/${churchId}/reports/membership`, params),

  /**
   * Get membership growth trend
   */
  getMembershipGrowth: (churchId: string, params?: ReportParams) =>
    api.get<{ date: string; total: number; new: number; left: number; net: number }[]>(
      `/church/${churchId}/reports/membership/growth`,
      params
    ),

  /**
   * Get ministry reports
   */
  getMinistries: (churchId: string, params?: ReportParams) =>
    api.get<{
      ministryId: string;
      ministryName: string;
      memberCount: number;
      volunteerCount: number;
      eventsCount: number;
      totalAttendance: number;
      averageAttendance: number;
    }[]>(`/church/${churchId}/reports/ministries`, params),

  /**
   * Get volunteer hours report
   */
  getVolunteerHours: (churchId: string, params?: ReportParams) =>
    api.get<{
      totalHours: number;
      totalVolunteers: number;
      averageHoursPerVolunteer: number;
      byTeam: { teamId: string; teamName: string; hours: number; volunteers: number }[];
      trend: { date: string; hours: number }[];
    }>(`/church/${churchId}/reports/volunteer-hours`, params),

  /**
   * Get first-time visitor report
   */
  getFirstTimeVisitors: (churchId: string, params?: ReportParams) =>
    api.get<{
      totalVisitors: number;
      convertedToMembers: number;
      conversionRate: number;
      trend: { date: string; visitors: number; converted: number }[];
      sources: { source: string; count: number }[];
    }>(`/church/${churchId}/reports/first-time-visitors`, params),

  /**
   * Generate a custom report
   */
  generateCustom: (churchId: string, config: {
    name: string;
    type: 'attendance' | 'giving' | 'membership' | 'combined';
    filters: Record<string, unknown>;
    columns: string[];
    groupBy?: string;
    format: 'table' | 'chart' | 'summary';
  }) =>
    api.post<{ data: Record<string, unknown>[]; summary: Record<string, unknown> }>(
      `/church/${churchId}/reports/custom`,
      config
    ),

  /**
   * Export a report
   */
  export: (churchId: string, reportType: string, format: 'csv' | 'xlsx' | 'pdf', params?: ReportParams) =>
    downloadFile(
      `/church/${churchId}/reports/${reportType}/export`,
      `${reportType}-report.${format}`,
      { format, ...params }
    ),

  /**
   * Compare metrics across time periods
   */
  compare: (churchId: string, options: {
    metric: 'attendance' | 'giving' | 'membership';
    period1: { startDate: string; endDate: string };
    period2: { startDate: string; endDate: string };
  }) =>
    api.post<{
      metric: string;
      period1: { label: string; value: number };
      period2: { label: string; value: number };
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'flat';
    }>(`/church/${churchId}/reports/compare`, options),

  /**
   * Schedule automated reports
   */
  scheduleReport: (churchId: string, config: {
    reportType: 'attendance' | 'giving' | 'membership';
    schedule: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    recipients: string[];
    format: 'csv' | 'xlsx' | 'pdf';
    params?: ReportParams;
  }) =>
    api.post<{ id: string; nextRunDate: string }>(`/church/${churchId}/reports/schedule`, config),

  /**
   * Get scheduled reports
   */
  getScheduled: (churchId: string) =>
    api.get<{
      id: string;
      reportType: string;
      schedule: string;
      nextRunDate: string;
      recipients: string[];
      isActive: boolean;
    }[]>(`/church/${churchId}/reports/scheduled`),

  /**
   * Delete a scheduled report
   */
  deleteScheduled: (churchId: string, scheduleId: string) =>
    api.delete<void>(`/church/${churchId}/reports/scheduled/${scheduleId}`),

  /**
   * Get report presets
   */
  getPresets: (churchId: string) =>
    api.get<{
      id: string;
      name: string;
      type: string;
      config: Record<string, unknown>;
      createdAt: string;
    }[]>(`/church/${churchId}/reports/presets`),

  /**
   * Save a report preset
   */
  savePreset: (churchId: string, data: { name: string; config: Record<string, unknown> }) =>
    api.post<{ id: string }>(`/church/${churchId}/reports/presets`, data),

  /**
   * Get saved reports
   */
  getSaved: (churchId: string) =>
    api.get<{
      id: string;
      name: string;
      type: string;
      date: string;
      size: string;
      url: string;
    }[]>(`/church/${churchId}/reports/saved`),
};

// ----------------------------------------------------------------------------
// SETTINGS API
// ----------------------------------------------------------------------------

export interface GeneralSettings {
  churchName: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timezone: string;
  defaultCurrency: string;
  fiscalYearStart: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  donationReceipts: boolean;
  eventReminders: boolean;
  volunteerReminders: boolean;
  birthdayNotifications: boolean;
  membershipUpdates: boolean;
}

export interface IntegrationSettings {
  stripeEnabled: boolean;
  stripePublishableKey?: string;
  mailchimpEnabled: boolean;
  mailchimpAudienceId?: string;
  googleCalendarEnabled: boolean;
  planningCenterEnabled: boolean;
}

export interface AppearanceSettings {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
}

export interface SecuritySettings {
  requireMfa: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  allowedDomains: string[];
}

export interface AllSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
}

export const settingsApi = {
  /**
   * Get all settings
   */
  getAll: (churchId: string) =>
    api.get<AllSettings>(`/church/${churchId}/settings`),

  /**
   * Get general settings
   */
  getGeneral: (churchId: string) =>
    api.get<GeneralSettings>(`/church/${churchId}/settings/general`),

  /**
   * Update general settings
   */
  updateGeneral: (churchId: string, data: Partial<GeneralSettings>) =>
    api.patch<GeneralSettings>(`/church/${churchId}/settings/general`, data),

  /**
   * Get notification settings
   */
  getNotifications: (churchId: string) =>
    api.get<NotificationSettings>(`/church/${churchId}/settings/notifications`),

  /**
   * Update notification settings
   */
  updateNotifications: (churchId: string, data: Partial<NotificationSettings>) =>
    api.patch<NotificationSettings>(`/church/${churchId}/settings/notifications`, data),

  /**
   * Get integration settings
   */
  getIntegrations: (churchId: string) =>
    api.get<IntegrationSettings>(`/church/${churchId}/settings/integrations`),

  /**
   * Update integration settings
   */
  updateIntegrations: (churchId: string, data: Partial<IntegrationSettings>) =>
    api.patch<IntegrationSettings>(`/church/${churchId}/settings/integrations`, data),

  /**
   * Get appearance settings
   */
  getAppearance: (churchId: string) =>
    api.get<AppearanceSettings>(`/church/${churchId}/settings/appearance`),

  /**
   * Update appearance settings
   */
  updateAppearance: (churchId: string, data: Partial<AppearanceSettings>) =>
    api.patch<AppearanceSettings>(`/church/${churchId}/settings/appearance`, data),

  /**
   * Get security settings
   */
  getSecurity: (churchId: string) =>
    api.get<SecuritySettings>(`/church/${churchId}/settings/security`),

  /**
   * Update security settings
   */
  updateSecurity: (churchId: string, data: Partial<SecuritySettings>) =>
    api.patch<SecuritySettings>(`/church/${churchId}/settings/security`, data),

  /**
   * Upload church logo
   */
  uploadLogo: (churchId: string, file: File) =>
    uploadFile<{ url: string }>(`/church/${churchId}/settings/logo`, file),

  /**
   * Test email configuration
   */
  testEmail: (churchId: string, email: string) =>
    api.post<{ success: boolean }>(`/church/${churchId}/settings/test-email`, { email }),

  /**
   * Test SMS configuration
   */
  testSms: (churchId: string, phone: string) =>
    api.post<{ success: boolean }>(`/church/${churchId}/settings/test-sms`, { phone }),

  /**
   * Get audit log
   */
  getAuditLog: (churchId: string, params?: PaginationParams & { action?: string; userId?: string; startDate?: string; endDate?: string }) =>
    api.get<PaginatedResponse<{
      id: string;
      userId: string;
      userName: string;
      action: string;
      resource: string;
      resourceId: string;
      changes: Record<string, { old: unknown; new: unknown }>;
      ipAddress: string;
      userAgent: string;
      timestamp: string;
    }>>(`/church/${churchId}/settings/audit-log`, params),

  /**
   * Export audit log
   */
  exportAuditLog: (churchId: string, format: 'csv' | 'xlsx', params?: { startDate?: string; endDate?: string }) =>
    downloadFile(
      `/church/${churchId}/settings/audit-log/export`,
      `audit-log.${format}`,
      { format, ...params }
    ),

  /**
   * Get user roles and permissions
   */
  getRoles: (churchId: string) =>
    api.get<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      isSystem: boolean;
    }[]>(`/church/${churchId}/settings/roles`),

  /**
   * Create a custom role
   */
  createRole: (churchId: string, data: { name: string; description?: string; permissions: string[] }) =>
    api.post<{ id: string; name: string; permissions: string[] }>(`/church/${churchId}/settings/roles`, data),

  /**
   * Update a role
   */
  updateRole: (churchId: string, roleId: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    api.patch<{ id: string; name: string; permissions: string[] }>(`/church/${churchId}/settings/roles/${roleId}`, data),

  /**
   * Delete a custom role
   */
  deleteRole: (churchId: string, roleId: string) =>
    api.delete<void>(`/church/${churchId}/settings/roles/${roleId}`),

  /**
   * Get all available permissions
   */
  getPermissions: (churchId: string) =>
    api.get<{ name: string; description: string; category: string }[]>(`/church/${churchId}/settings/permissions`),

  /**
   * Get team/staff members
   */
  getTeamMembers: (churchId: string) =>
    api.get<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      lastActive: string;
      status: 'active' | 'invited' | 'disabled';
    }[]>(`/church/${churchId}/settings/team`),

  /**
   * Invite a team member
   */
  inviteTeamMember: (churchId: string, data: { email: string; role: string; firstName?: string; lastName?: string }) =>
    api.post<{ id: string; email: string }>(`/church/${churchId}/settings/team/invite`, data),

  /**
   * Update a team member
   */
  updateTeamMember: (churchId: string, userId: string, data: { role?: string; status?: 'active' | 'disabled' }) =>
    api.patch<void>(`/church/${churchId}/settings/team/${userId}`, data),

  /**
   * Remove a team member
   */
  removeTeamMember: (churchId: string, userId: string) =>
    api.delete<void>(`/church/${churchId}/settings/team/${userId}`),

  /**
   * Resend invitation
   */
  resendInvitation: (churchId: string, userId: string) =>
    api.post<void>(`/church/${churchId}/settings/team/${userId}/resend-invite`),
};

// ============================================================================
// DEVELOPMENT LOGGING
// ============================================================================

if (import.meta.env.DEV) {
  addRequestInterceptor((config, url) => {
    console.log(`[API Request] ${config.method || 'GET'} ${url}`);
    return config;
  });

  addResponseInterceptor((response) => {
    console.log(`[API Response] ${response.status} ${response.url}`);
    return response;
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { API_BASE_URL };

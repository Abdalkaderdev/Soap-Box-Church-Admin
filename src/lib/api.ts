/**
 * Base API Client for Church Admin App
 * Connects to the main SoapBox Super App backend
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api';

// Token storage keys
const AUTH_TOKEN_KEY = 'soapbox_auth_token';
const REFRESH_TOKEN_KEY = 'soapbox_refresh_token';

// Types for API responses
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

// Custom API Error class
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
}

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
 * Clear auth tokens
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

// Request interceptor type
type RequestInterceptor = (config: RequestInit, url: string) => RequestInit | Promise<RequestInit>;

// Response interceptor type
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

// Interceptor storage
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * Add a request interceptor
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

/**
 * Run all request interceptors
 */
async function runRequestInterceptors(config: RequestInit, url: string): Promise<RequestInit> {
  let currentConfig = config;
  for (const interceptor of requestInterceptors) {
    currentConfig = await interceptor(currentConfig, url);
  }
  return currentConfig;
}

/**
 * Run all response interceptors
 */
async function runResponseInterceptors(response: Response): Promise<Response> {
  let currentResponse = response;
  for (const interceptor of responseInterceptors) {
    currentResponse = await interceptor(currentResponse);
  }
  return currentResponse;
}

// Token refresh state to prevent multiple refresh requests
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the auth token
 */
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

/**
 * Handle token refresh with deduplication
 */
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

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, unknown>): string {
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
 * Main API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, unknown>
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

// Convenience methods for common HTTP verbs
export const api = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) =>
    apiRequest<T>(endpoint, { method: 'GET' }, params),

  post: <T>(endpoint: string, body?: unknown, params?: Record<string, unknown>) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, params),

  put: <T>(endpoint: string, body?: unknown, params?: Record<string, unknown>) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, params),

  patch: <T>(endpoint: string, body?: unknown, params?: Record<string, unknown>) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }, params),

  delete: <T>(endpoint: string, params?: Record<string, unknown>) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }, params),
};

// Export base URL for use in other modules
export { API_BASE_URL };

// Add default request interceptor for logging in development
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

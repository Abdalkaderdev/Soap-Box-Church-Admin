/**
 * Authentication Hook for Church Admin App
 * Handles user authentication, church info, and SSO integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  getAuthToken,
  clearAuthTokens,
  setAuthToken,
  setRefreshToken,
} from '../lib/api';
import type { User, Church } from '../types';

// Auth response types
interface CurrentSessionResponse {
  user: User;
  church: Church;
}

// SSO configuration
const SSO_LOGIN_URL = import.meta.env.VITE_SSO_LOGIN_URL || 'https://soapboxsuperapp.com/login';
const SSO_LOGOUT_URL = import.meta.env.VITE_SSO_LOGOUT_URL || 'https://soapboxsuperapp.com/logout';

// Local storage keys for SSO user data
const USER_STORAGE_KEY = 'soapbox_user';
const AUTH_FLAG_KEY = 'soapbox_authenticated';

/**
 * Get user from localStorage (set by Login page after SSO)
 */
function getStoredUser(): User | null {
  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
  } catch (e) {
    console.error('Failed to parse stored user:', e);
  }
  return null;
}

/**
 * Check if user is authenticated via localStorage flag
 */
function isStoredAuthenticated(): boolean {
  return localStorage.getItem(AUTH_FLAG_KEY) === 'true';
}

/**
 * Hook for managing authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if we have a token
  const hasToken = Boolean(getAuthToken());

  // Get stored user from localStorage (set by Login page)
  const storedUser = getStoredUser();
  const isStoredAuth = isStoredAuthenticated();

  // Fetch current session/user from API
  const {
    data: session,
    isLoading,
    error,
    refetch: refetchSession,
  } = useQuery<CurrentSessionResponse>({
    queryKey: ['auth', 'session'],
    queryFn: () => api.get<CurrentSessionResponse>('/auth/me'),
    enabled: hasToken && !storedUser, // Only fetch if we don't have stored user
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Resolve user: prefer API response, fallback to localStorage
  const resolvedUser = session?.user || storedUser;

  // Resolve church: prefer API response, create from stored user's churchId
  const resolvedChurch = session?.church || (storedUser?.churchId ? {
    id: storedUser.churchId,
    name: 'Church', // Default name when we only have churchId
  } as Church : null);

  // Mark as initialized once we've determined auth state
  useEffect(() => {
    if (!hasToken || !isLoading || storedUser) {
      setIsInitialized(true);
    }
  }, [hasToken, isLoading, storedUser]);

  /**
   * Redirect to SSO login page
   */
  const redirectToLogin = useCallback((returnUrl?: string) => {
    const redirectUrl = returnUrl || window.location.href;
    window.location.href = `${SSO_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  /**
   * Handle SSO callback with tokens
   */
  const handleSSOCallback = useCallback(async (accessToken: string, refreshToken?: string) => {
    setAuthToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    await refetchSession();
  }, [refetchSession]);

  /**
   * Logout user
   */
  const logout = useCallback(async (redirectToSSO = true) => {
    try {
      // Call logout endpoint to invalidate server-side session
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout API call failed:', error);
    }

    // Clear local tokens
    clearAuthTokens();

    // Clear all cached queries
    queryClient.clear();

    // Redirect to SSO logout page
    if (redirectToSSO) {
      window.location.href = `${SSO_LOGOUT_URL}?redirect=${encodeURIComponent(window.location.origin)}`;
    }
  }, [queryClient]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!resolvedUser) return false;

    // Admin has all permissions
    if (resolvedUser.role === 'admin') return true;

    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      pastor: [
        'members:read', 'members:write',
        'donations:read', 'donations:write',
        'events:read', 'events:write',
        'volunteers:read', 'volunteers:write',
        'communications:read', 'communications:write',
        'reports:read',
      ],
      staff: [
        'members:read', 'members:write',
        'donations:read', 'donations:write',
        'events:read', 'events:write',
        'volunteers:read', 'volunteers:write',
        'communications:read', 'communications:write',
        'reports:read',
      ],
      volunteer: [
        'members:read',
        'events:read',
        'volunteers:read',
      ],
      member: [
        'events:read',
      ],
    };

    const userPermissions = rolePermissions[resolvedUser.role] || [];
    return userPermissions.includes(permission);
  }, [resolvedUser]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!resolvedUser) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(resolvedUser.role);
  }, [resolvedUser]);

  /**
   * Get church ID for API calls
   * Uses churchId from user object or church object
   */
  const churchId = resolvedChurch?.id || resolvedUser?.churchId || null;

  return {
    // State
    user: resolvedUser || null,
    church: resolvedChurch || null,
    churchId,
    isAuthenticated: (hasToken || isStoredAuth) && Boolean(resolvedUser),
    isLoading: !isInitialized || (isLoading && !storedUser),
    error: error as Error | null,

    // Actions
    redirectToLogin,
    handleSSOCallback,
    logout,
    refetchSession,

    // Permission helpers
    hasPermission,
    hasRole,
  };
}

/**
 * Hook for checking authentication status only
 * Lighter weight than useAuth for components that just need to check auth
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated, isLoading } = useAuth();
  return !isLoading && isAuthenticated;
}

/**
 * Hook for getting current church ID
 * Throws if not authenticated
 */
export function useChurchId(): string {
  const { churchId, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    throw new Error('Auth is still loading');
  }

  if (!isAuthenticated || !churchId) {
    throw new Error('User is not authenticated or no church associated');
  }

  return churchId;
}

/**
 * Hook for requiring authentication
 * Automatically redirects to login if not authenticated
 */
export function useRequireAuth(options?: { redirectTo?: string }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.redirectToLogin(options?.redirectTo);
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.redirectToLogin, options?.redirectTo]);

  return auth;
}

export default useAuth;

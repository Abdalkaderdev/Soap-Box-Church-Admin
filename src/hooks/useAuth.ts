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

/**
 * Hook for managing authentication state
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if we have a token
  const hasToken = Boolean(getAuthToken());

  // Fetch current session/user
  const {
    data: session,
    isLoading,
    error,
    refetch: refetchSession,
  } = useQuery<CurrentSessionResponse>({
    queryKey: ['auth', 'session'],
    queryFn: () => api.get<CurrentSessionResponse>('/auth/me'),
    enabled: hasToken,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mark as initialized once we've attempted to fetch session
  useEffect(() => {
    if (!hasToken || !isLoading) {
      setIsInitialized(true);
    }
  }, [hasToken, isLoading]);

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
    if (!session?.user) return false;

    // Admin has all permissions
    if (session.user.role === 'admin') return true;

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

    const userPermissions = rolePermissions[session.user.role] || [];
    return userPermissions.includes(permission);
  }, [session?.user]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!session?.user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(session.user.role);
  }, [session?.user]);

  /**
   * Get church ID for API calls
   */
  const churchId = session?.church?.id || null;

  return {
    // State
    user: session?.user || null,
    church: session?.church || null,
    churchId,
    isAuthenticated: hasToken && Boolean(session?.user),
    isLoading: !isInitialized || isLoading,
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

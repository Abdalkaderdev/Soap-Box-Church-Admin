/**
 * Test Utilities
 * Custom render functions and test helpers for integration testing
 */
/* eslint-disable react-refresh/only-export-components */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';

// Mock auth context value for testing
const mockAuthContext = {
  user: {
    id: 'user-1',
    email: 'admin@church.org',
    firstName: 'John',
    lastName: 'Pastor',
    role: 'admin' as const,
    churchId: 'church-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  church: {
    id: 'church-1',
    name: 'First Community Church',
  },
  churchId: 'church-1',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  redirectToLogin: () => {},
  handleSSOCallback: async () => {},
  logout: async () => {},
  refetchSession: async () => ({ data: undefined, error: null }),
  hasPermission: () => true,
  hasRole: () => true,
};

// Create a test query client with aggressive error handling
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
}

/**
 * Wrapper component with all providers for testing
 */
function AllProviders({ children, queryClient, initialRoute = '/' }: AllProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient();

  // Mock useAuth hook by setting localStorage
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('soapbox_auth_token', 'test-token');
    window.localStorage.setItem('soapbox_authenticated', 'true');
    window.localStorage.setItem('soapbox_user', JSON.stringify(mockAuthContext.user));
  }

  return (
    <QueryClientProvider client={testQueryClient}>
      <Router base="" ssrPath={initialRoute}>
        {children}
      </Router>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRoute?: string;
}

/**
 * Custom render function that wraps component with all necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { queryClient: QueryClient } {
  const queryClient = options?.queryClient || createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders queryClient={queryClient} initialRoute={options?.initialRoute}>
      {children}
    </AllProviders>
  );

  const result = render(ui, { wrapper: Wrapper, ...options });

  return {
    ...result,
    queryClient,
  };
}

/**
 * Create a mock query client with pre-populated data
 */
function createQueryClientWithData(
  data: Record<string, unknown>
): QueryClient {
  const queryClient = createTestQueryClient();

  Object.entries(data).forEach(([key, value]) => {
    queryClient.setQueryData([key], value);
  });

  return queryClient;
}

/**
 * Wait for async operations to complete
 */
async function waitForLoadingToFinish() {
  // Wait for next tick to allow state updates
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a deferred promise for testing async flows
 */
function createDeferred<T = void>() {
  let resolve: (value: T) => void = () => {};
  let reject: (reason?: unknown) => void = () => {};

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// Export everything
export * from '@testing-library/react';
export {
  customRender as render,
  createTestQueryClient,
  createQueryClientWithData,
  waitForLoadingToFinish,
  createDeferred,
  mockAuthContext,
  AllProviders,
};

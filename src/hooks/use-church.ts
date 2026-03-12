/**
 * Church Hook - Provides church context from auth
 * Re-exports church-related state from useAuth for convenience
 */

import { useAuth } from './useAuth';
import type { Church } from '../types';

interface UseChurchResult {
  church: Church | null;
  churchId: string | null;
  isLoading: boolean;
}

/**
 * Hook for accessing current church context
 * Wrapper around useAuth that extracts church-related state
 */
export function useChurch(): UseChurchResult {
  const { church, churchId, isLoading } = useAuth();

  return {
    church,
    // Convert churchId to string for consistent API usage
    churchId: churchId != null ? String(churchId) : null,
    isLoading,
  };
}

export default useChurch;

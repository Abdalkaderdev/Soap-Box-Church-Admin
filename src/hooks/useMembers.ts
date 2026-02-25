/**
 * Members API Hook for Church Admin App
 * Handles member CRUD operations and related queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  Member,
  MemberCreateInput,
  MemberUpdateInput,
  MembershipStatus,
  Family,
} from '../types';

// Query key factory for members
const memberKeys = {
  all: (churchId: string) => ['church', churchId, 'members'] as const,
  lists: (churchId: string) => [...memberKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: MemberFilters) =>
    [...memberKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...memberKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...memberKeys.details(churchId), id] as const,
  families: (churchId: string) => [...memberKeys.all(churchId), 'families'] as const,
  family: (churchId: string, familyId: string) =>
    [...memberKeys.families(churchId), familyId] as const,
  search: (churchId: string, query: string) =>
    [...memberKeys.all(churchId), 'search', query] as const,
  stats: (churchId: string) => [...memberKeys.all(churchId), 'stats'] as const,
};

// Filter types
export interface MemberFilters extends PaginationParams {
  status?: MembershipStatus | MembershipStatus[];
  tags?: string[];
  search?: string;
  familyId?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
  memberSince?: {
    from?: string;
    to?: string;
  };
}

interface MemberStats {
  total: number;
  byStatus: Record<MembershipStatus, number>;
  newThisMonth: number;
  newThisYear: number;
}

/**
 * Hook for fetching members list with filters and pagination
 */
export function useMembers(filters: MemberFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Member>>({
    queryKey: memberKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Member>>(`/church/${churchId}/members`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'lastName',
        sortOrder: filters.sortOrder || 'asc',
        status: filters.status,
        tags: filters.tags,
        search: filters.search,
        familyId: filters.familyId,
        hasEmail: filters.hasEmail,
        hasPhone: filters.hasPhone,
        memberSinceFrom: filters.memberSince?.from,
        memberSinceTo: filters.memberSince?.to,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single member by ID
 */
export function useMember(memberId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Member>({
    queryKey: memberKeys.detail(churchId!, memberId!),
    queryFn: () => api.get<Member>(`/church/${churchId}/members/${memberId}`),
    enabled: Boolean(churchId) && Boolean(memberId),
  });
}

/**
 * Hook for searching members (debounced search)
 */
export function useMemberSearch(query: string, options?: { limit?: number }) {
  const { churchId } = useAuth();

  return useQuery<Member[]>({
    queryKey: memberKeys.search(churchId!, query),
    queryFn: () =>
      api.get<Member[]>(`/church/${churchId}/members/search`, {
        q: query,
        limit: options?.limit || 10,
      }),
    enabled: Boolean(churchId) && query.length >= 2,
  });
}

/**
 * Hook for fetching member statistics
 */
export function useMemberStats() {
  const { churchId } = useAuth();

  return useQuery<MemberStats>({
    queryKey: memberKeys.stats(churchId!),
    queryFn: () => api.get<MemberStats>(`/church/${churchId}/members/stats`),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for creating a new member
 */
export function useCreateMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Member, Error, MemberCreateInput>({
    mutationFn: (data) =>
      api.post<Member>(`/church/${churchId}/members`, data),
    onSuccess: (newMember) => {
      // Invalidate member lists
      queryClient.invalidateQueries({
        queryKey: memberKeys.lists(churchId!),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: memberKeys.stats(churchId!),
      });

      // Add the new member to the cache
      queryClient.setQueryData(
        memberKeys.detail(churchId!, newMember.id),
        newMember
      );
    },
  });
}

/**
 * Hook for updating a member
 */
export function useUpdateMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Member,
    Error,
    { memberId: string; data: MemberUpdateInput }
  >({
    mutationFn: ({ memberId, data }) =>
      api.patch<Member>(`/church/${churchId}/members/${memberId}`, data),
    onSuccess: (updatedMember, { memberId }) => {
      // Update the member in cache
      queryClient.setQueryData(
        memberKeys.detail(churchId!, memberId),
        updatedMember
      );

      // Invalidate member lists
      queryClient.invalidateQueries({
        queryKey: memberKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a member
 */
export function useDeleteMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (memberId) =>
      api.delete<void>(`/church/${churchId}/members/${memberId}`),
    onSuccess: (_, memberId) => {
      // Remove the member from cache
      queryClient.removeQueries({
        queryKey: memberKeys.detail(churchId!, memberId),
      });

      // Invalidate member lists
      queryClient.invalidateQueries({
        queryKey: memberKeys.lists(churchId!),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: memberKeys.stats(churchId!),
      });
    },
  });
}

/**
 * Hook for bulk updating members
 */
export function useBulkUpdateMembers() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    { updated: number },
    Error,
    { memberIds: string[]; data: MemberUpdateInput }
  >({
    mutationFn: ({ memberIds, data }) =>
      api.patch<{ updated: number }>(`/church/${churchId}/members/bulk`, {
        memberIds,
        ...data,
      }),
    onSuccess: () => {
      // Invalidate all member queries
      queryClient.invalidateQueries({
        queryKey: memberKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for fetching families
 */
export function useFamilies(options?: PaginationParams) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Family>>({
    queryKey: memberKeys.families(churchId!),
    queryFn: () =>
      api.get<PaginatedResponse<Family>>(`/church/${churchId}/families`, {
        page: options?.page || 1,
        pageSize: options?.pageSize || 20,
        sortBy: options?.sortBy || 'name',
        sortOrder: options?.sortOrder || 'asc',
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single family with members
 */
export function useFamily(familyId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Family>({
    queryKey: memberKeys.family(churchId!, familyId!),
    queryFn: () => api.get<Family>(`/church/${churchId}/families/${familyId}`),
    enabled: Boolean(churchId) && Boolean(familyId),
  });
}

/**
 * Hook for creating a family
 */
export function useCreateFamily() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Family,
    Error,
    { name: string; memberIds?: string[]; primaryContactId?: string }
  >({
    mutationFn: (data) =>
      api.post<Family>(`/church/${churchId}/families`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.families(churchId!),
      });
    },
  });
}

/**
 * Hook for updating family membership
 */
export function useUpdateFamilyMembers() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Family,
    Error,
    { familyId: string; memberIds: string[]; action: 'add' | 'remove' }
  >({
    mutationFn: ({ familyId, memberIds, action }) =>
      api.patch<Family>(`/church/${churchId}/families/${familyId}/members`, {
        memberIds,
        action,
      }),
    onSuccess: (_, { familyId }) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.family(churchId!, familyId),
      });
      queryClient.invalidateQueries({
        queryKey: memberKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for importing members from CSV/Excel
 */
export function useImportMembers() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    { imported: number; errors: { row: number; message: string }[] },
    Error,
    { file: File; options?: { skipDuplicates?: boolean; updateExisting?: boolean } }
  >({
    mutationFn: async ({ file, options }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.skipDuplicates) {
        formData.append('skipDuplicates', 'true');
      }
      if (options?.updateExisting) {
        formData.append('updateExisting', 'true');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api'}/church/${churchId}/members/import`,
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
        queryKey: memberKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for exporting members
 */
export function useExportMembers() {
  const { churchId } = useAuth();

  return useMutation<
    Blob,
    Error,
    { format: 'csv' | 'xlsx'; filters?: MemberFilters }
  >({
    mutationFn: async ({ format, filters }) => {
      const params = new URLSearchParams({
        format,
        ...(filters?.status && { status: String(filters.status) }),
        ...(filters?.tags && { tags: filters.tags.join(',') }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api'}/church/${churchId}/members/export?${params}`,
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

export default useMembers;

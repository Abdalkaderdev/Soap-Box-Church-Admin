/**
 * Organization Structure API Hooks for Church Admin App
 * Handles ministries, departments, teams, roles, and service allocations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  MinistryTeam,
  Member,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface Ministry {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  leaderId?: string;
  leader?: Member;
  departmentCount: number;
  teamCount: number;
  memberCount: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MinistryCreateInput {
  name: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export type MinistryUpdateInput = Partial<MinistryCreateInput>;

export interface Department {
  id: string;
  churchId: string;
  ministryId: string;
  ministry?: Ministry;
  name: string;
  description?: string;
  leaderId?: string;
  leader?: Member;
  teamCount: number;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreateInput {
  ministryId: string;
  name: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
}

export type DepartmentUpdateInput = Partial<DepartmentCreateInput>;

export interface DepartmentFilters extends PaginationParams {
  ministryId?: string;
  search?: string;
  isActive?: boolean;
}

export interface Team {
  id: string;
  churchId: string;
  departmentId: string;
  department?: Department;
  name: string;
  description?: string;
  leaderId?: string;
  leader?: Member;
  memberCount: number;
  isActive: boolean;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamCreateInput {
  departmentId: string;
  name: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
  requirements?: string[];
}

export type TeamUpdateInput = Partial<TeamCreateInput>;

export interface TeamFilters extends PaginationParams {
  departmentId?: string;
  ministryId?: string;
  search?: string;
  isActive?: boolean;
}

export interface TeamMember {
  id: string;
  teamId: string;
  memberId: string;
  member?: Member;
  role: string;
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface AddTeamMemberInput {
  teamId: string;
  memberId: string;
  role?: string;
}

export interface RemoveTeamMemberInput {
  teamId: string;
  memberId: string;
}

export interface OrganizationRole {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  permissions: string[];
  level: number;
  isSystem: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions?: string[];
  level?: number;
}

export type RoleUpdateInput = Partial<RoleCreateInput>;

export interface ServiceAllocation {
  id: string;
  churchId: string;
  teamId: string;
  team?: MinistryTeam;
  memberId: string;
  member?: Member;
  serviceDate: string;
  role: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationCreateInput {
  teamId: string;
  memberId: string;
  serviceDate: string;
  role: string;
  notes?: string;
}

export interface AllocationUpdateInput extends Partial<AllocationCreateInput> {
  status?: ServiceAllocation['status'];
}

export interface AllocationFilters extends PaginationParams {
  teamId?: string;
  memberId?: string;
  serviceDate?: string;
  startDate?: string;
  endDate?: string;
  status?: ServiceAllocation['status'];
}

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

const ministryKeys = {
  all: (churchId: string) => ['church', churchId, 'ministries'] as const,
  lists: (churchId: string) => [...ministryKeys.all(churchId), 'list'] as const,
  list: (churchId: string) => [...ministryKeys.lists(churchId)] as const,
  details: (churchId: string) => [...ministryKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...ministryKeys.details(churchId), id] as const,
};

const departmentKeys = {
  all: (churchId: string) => ['church', churchId, 'departments'] as const,
  lists: (churchId: string) => [...departmentKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: DepartmentFilters) =>
    [...departmentKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...departmentKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...departmentKeys.details(churchId), id] as const,
};

const teamKeys = {
  all: (churchId: string) => ['church', churchId, 'teams'] as const,
  lists: (churchId: string) => [...teamKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: TeamFilters) =>
    [...teamKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...teamKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...teamKeys.details(churchId), id] as const,
  members: (churchId: string, teamId: string) =>
    [...teamKeys.all(churchId), 'members', teamId] as const,
};

const roleKeys = {
  all: (churchId: string) => ['church', churchId, 'roles'] as const,
  lists: (churchId: string) => [...roleKeys.all(churchId), 'list'] as const,
  list: (churchId: string) => [...roleKeys.lists(churchId)] as const,
};

const allocationKeys = {
  all: (churchId: string) => ['church', churchId, 'allocations'] as const,
  lists: (churchId: string) => [...allocationKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: AllocationFilters) =>
    [...allocationKeys.lists(churchId), filters] as const,
};

// ============================================================================
// MINISTRY HOOKS
// ============================================================================

/**
 * Hook for fetching all ministries for a church
 */
export function useMinistries(churchId?: string) {
  const { churchId: authChurchId } = useAuth();
  const resolvedChurchId = churchId || authChurchId;

  return useQuery<PaginatedResponse<Ministry>>({
    queryKey: ministryKeys.list(resolvedChurchId!),
    queryFn: () =>
      api.get<PaginatedResponse<Ministry>>(`/church/${resolvedChurchId}/ministries`),
    enabled: Boolean(resolvedChurchId),
  });
}

/**
 * Hook for fetching a single ministry by ID
 */
export function useMinistry(id: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Ministry>({
    queryKey: ministryKeys.detail(churchId!, id!),
    queryFn: () => api.get<Ministry>(`/church/${churchId}/ministries/${id}`),
    enabled: Boolean(churchId) && Boolean(id),
  });
}

/**
 * Hook for creating a new ministry
 */
export function useCreateMinistry() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Ministry, Error, MinistryCreateInput>({
    mutationFn: (data) =>
      api.post<Ministry>(`/church/${churchId}/ministries`, data),
    onSuccess: (newMinistry) => {
      queryClient.invalidateQueries({
        queryKey: ministryKeys.lists(churchId!),
      });
      queryClient.setQueryData(
        ministryKeys.detail(churchId!, newMinistry.id),
        newMinistry
      );
    },
  });
}

/**
 * Hook for updating a ministry
 */
export function useUpdateMinistry() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Ministry,
    Error,
    { id: string; data: MinistryUpdateInput }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<Ministry>(`/church/${churchId}/ministries/${id}`, data),
    onSuccess: (updatedMinistry, { id }) => {
      queryClient.setQueryData(
        ministryKeys.detail(churchId!, id),
        updatedMinistry
      );
      queryClient.invalidateQueries({
        queryKey: ministryKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a ministry
 */
export function useDeleteMinistry() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/church/${churchId}/ministries/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ministryKeys.detail(churchId!, id),
      });
      queryClient.invalidateQueries({
        queryKey: ministryKeys.lists(churchId!),
      });
      // Departments may be affected
      queryClient.invalidateQueries({
        queryKey: departmentKeys.all(churchId!),
      });
    },
  });
}

// ============================================================================
// DEPARTMENT HOOKS
// ============================================================================

/**
 * Hook for fetching departments with optional filters
 */
export function useDepartments(filters: DepartmentFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Department>>({
    queryKey: departmentKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Department>>(`/church/${churchId}/departments`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'name',
        sortOrder: filters.sortOrder || 'asc',
        ministryId: filters.ministryId,
        search: filters.search,
        isActive: filters.isActive,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single department by ID
 */
export function useDepartment(id: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Department>({
    queryKey: departmentKeys.detail(churchId!, id!),
    queryFn: () => api.get<Department>(`/church/${churchId}/departments/${id}`),
    enabled: Boolean(churchId) && Boolean(id),
  });
}

/**
 * Hook for creating a new department
 */
export function useCreateDepartment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Department, Error, DepartmentCreateInput>({
    mutationFn: (data) =>
      api.post<Department>(`/church/${churchId}/departments`, data),
    onSuccess: (newDepartment) => {
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(churchId!),
      });
      queryClient.setQueryData(
        departmentKeys.detail(churchId!, newDepartment.id),
        newDepartment
      );
      // Ministry counts may change
      queryClient.invalidateQueries({
        queryKey: ministryKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a department
 */
export function useUpdateDepartment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Department,
    Error,
    { id: string; data: DepartmentUpdateInput }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<Department>(`/church/${churchId}/departments/${id}`, data),
    onSuccess: (updatedDepartment, { id }) => {
      queryClient.setQueryData(
        departmentKeys.detail(churchId!, id),
        updatedDepartment
      );
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a department
 */
export function useDeleteDepartment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/church/${churchId}/departments/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: departmentKeys.detail(churchId!, id),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(churchId!),
      });
      // Ministry counts may change
      queryClient.invalidateQueries({
        queryKey: ministryKeys.lists(churchId!),
      });
      // Teams may be affected
      queryClient.invalidateQueries({
        queryKey: teamKeys.all(churchId!),
      });
    },
  });
}

// ============================================================================
// TEAM HOOKS
// ============================================================================

/**
 * Hook for fetching teams with optional filters
 */
export function useTeams(filters: TeamFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Team>>({
    queryKey: teamKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Team>>(`/church/${churchId}/teams`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'name',
        sortOrder: filters.sortOrder || 'asc',
        departmentId: filters.departmentId,
        ministryId: filters.ministryId,
        search: filters.search,
        isActive: filters.isActive,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single team by ID
 */
export function useTeam(id: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Team>({
    queryKey: teamKeys.detail(churchId!, id!),
    queryFn: () => api.get<Team>(`/church/${churchId}/teams/${id}`),
    enabled: Boolean(churchId) && Boolean(id),
  });
}

/**
 * Hook for creating a new team
 */
export function useCreateTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Team, Error, TeamCreateInput>({
    mutationFn: (data) =>
      api.post<Team>(`/church/${churchId}/teams`, data),
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(churchId!),
      });
      queryClient.setQueryData(
        teamKeys.detail(churchId!, newTeam.id),
        newTeam
      );
      // Department counts may change
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a team
 */
export function useUpdateTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Team,
    Error,
    { id: string; data: TeamUpdateInput }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<Team>(`/church/${churchId}/teams/${id}`, data),
    onSuccess: (updatedTeam, { id }) => {
      queryClient.setQueryData(
        teamKeys.detail(churchId!, id),
        updatedTeam
      );
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a team
 */
export function useDeleteTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/church/${churchId}/teams/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: teamKeys.detail(churchId!, id),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(churchId!),
      });
      // Department counts may change
      queryClient.invalidateQueries({
        queryKey: departmentKeys.lists(churchId!),
      });
    },
  });
}

// ============================================================================
// TEAM MEMBER HOOKS
// ============================================================================

/**
 * Hook for fetching team members
 */
export function useTeamMembers(teamId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<TeamMember[]>({
    queryKey: teamKeys.members(churchId!, teamId!),
    queryFn: () =>
      api.get<TeamMember[]>(`/church/${churchId}/teams/${teamId}/members`),
    enabled: Boolean(churchId) && Boolean(teamId),
  });
}

/**
 * Hook for adding a member to a team
 */
export function useAddTeamMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TeamMember, Error, AddTeamMemberInput>({
    mutationFn: ({ teamId, memberId, role }) =>
      api.post<TeamMember>(`/church/${churchId}/teams/${teamId}/members`, {
        memberId,
        role,
      }),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for removing a member from a team
 */
export function useRemoveTeamMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveTeamMemberInput>({
    mutationFn: ({ teamId, memberId }) =>
      api.delete<void>(`/church/${churchId}/teams/${teamId}/members/${memberId}`),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.members(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(churchId!),
      });
    },
  });
}

// ============================================================================
// ROLE HOOKS
// ============================================================================

/**
 * Hook for fetching organization roles
 */
export function useOrganizationRoles(churchId?: string) {
  const { churchId: authChurchId } = useAuth();
  const resolvedChurchId = churchId || authChurchId;

  return useQuery<OrganizationRole[]>({
    queryKey: roleKeys.list(resolvedChurchId!),
    queryFn: () =>
      api.get<OrganizationRole[]>(`/church/${resolvedChurchId}/roles`),
    enabled: Boolean(resolvedChurchId),
  });
}

/**
 * Hook for creating a new role
 */
export function useCreateRole() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<OrganizationRole, Error, RoleCreateInput>({
    mutationFn: (data) =>
      api.post<OrganizationRole>(`/church/${churchId}/roles`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a role
 */
export function useUpdateRole() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    OrganizationRole,
    Error,
    { id: string; data: RoleUpdateInput }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<OrganizationRole>(`/church/${churchId}/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a role
 */
export function useDeleteRole() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/church/${churchId}/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.lists(churchId!),
      });
    },
  });
}

// ============================================================================
// SERVICE ALLOCATION HOOKS
// ============================================================================

/**
 * Hook for fetching service allocations with optional filters
 */
export function useServiceAllocations(filters: AllocationFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<ServiceAllocation>>({
    queryKey: allocationKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<ServiceAllocation>>(`/church/${churchId}/allocations`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'serviceDate',
        sortOrder: filters.sortOrder || 'asc',
        teamId: filters.teamId,
        memberId: filters.memberId,
        serviceDate: filters.serviceDate,
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for creating a service allocation
 */
export function useCreateAllocation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ServiceAllocation, Error, AllocationCreateInput>({
    mutationFn: (data) =>
      api.post<ServiceAllocation>(`/church/${churchId}/allocations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a service allocation
 */
export function useUpdateAllocation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    ServiceAllocation,
    Error,
    { id: string; data: AllocationUpdateInput }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<ServiceAllocation>(`/church/${churchId}/allocations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a service allocation
 */
export function useDeleteAllocation() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/church/${churchId}/allocations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.lists(churchId!),
      });
    },
  });
}

export default useMinistries;

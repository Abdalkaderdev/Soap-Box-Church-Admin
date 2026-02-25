/**
 * Volunteers API Hook for Church Admin App
 * Handles volunteer management, ministry teams, and assignments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  Volunteer,
  VolunteerCreateInput,
  VolunteerUpdateInput,
  VolunteerStatus,
  VolunteerAssignment,
  AssignmentStatus,
  MinistryTeam,
  BackgroundCheckStatus,
} from '../types';

// Query key factory for volunteers
const volunteerKeys = {
  all: (churchId: string) => ['church', churchId, 'volunteers'] as const,
  lists: (churchId: string) => [...volunteerKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: VolunteerFilters) =>
    [...volunteerKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...volunteerKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) =>
    [...volunteerKeys.details(churchId), id] as const,
  assignments: (churchId: string, volunteerId?: string) =>
    [...volunteerKeys.all(churchId), 'assignments', volunteerId] as const,
  teams: (churchId: string) => [...volunteerKeys.all(churchId), 'teams'] as const,
  team: (churchId: string, teamId: string) =>
    [...volunteerKeys.teams(churchId), teamId] as const,
  teamMembers: (churchId: string, teamId: string) =>
    [...volunteerKeys.team(churchId, teamId), 'members'] as const,
  stats: (churchId: string) => [...volunteerKeys.all(churchId), 'stats'] as const,
  schedule: (churchId: string, params: ScheduleParams) =>
    [...volunteerKeys.all(churchId), 'schedule', params] as const,
};

// Filter types
export interface VolunteerFilters extends PaginationParams {
  status?: VolunteerStatus | VolunteerStatus[];
  teamId?: string;
  skills?: string[];
  backgroundCheckStatus?: BackgroundCheckStatus | BackgroundCheckStatus[];
  search?: string;
  availableOn?: string; // day of week
}

interface ScheduleParams {
  startDate: string;
  endDate: string;
  teamId?: string;
}

interface VolunteerStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalHoursThisMonth: number;
  totalHoursThisYear: number;
  byTeam: { team: MinistryTeam; count: number; hours: number }[];
  byStatus: Record<VolunteerStatus, number>;
  needsBackgroundCheck: number;
}

interface TeamCreateInput {
  name: string;
  description?: string;
  ministryId?: string;
  leaderId?: string;
  requirements?: string[];
}

interface TeamUpdateInput extends Partial<TeamCreateInput> {
  isActive?: boolean;
}

interface AssignmentCreateInput {
  volunteerId: string;
  teamId: string;
  eventId?: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

/**
 * Hook for fetching volunteers list with filters and pagination
 */
export function useVolunteers(filters: VolunteerFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Volunteer>>({
    queryKey: volunteerKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Volunteer>>(`/church/${churchId}/volunteers`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'lastName',
        sortOrder: filters.sortOrder || 'asc',
        status: filters.status,
        teamId: filters.teamId,
        skills: filters.skills,
        backgroundCheckStatus: filters.backgroundCheckStatus,
        search: filters.search,
        availableOn: filters.availableOn,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single volunteer by ID
 */
export function useVolunteer(volunteerId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Volunteer>({
    queryKey: volunteerKeys.detail(churchId!, volunteerId!),
    queryFn: () =>
      api.get<Volunteer>(`/church/${churchId}/volunteers/${volunteerId}`),
    enabled: Boolean(churchId) && Boolean(volunteerId),
  });
}

/**
 * Hook for fetching volunteer statistics
 */
export function useVolunteerStats() {
  const { churchId } = useAuth();

  return useQuery<VolunteerStats>({
    queryKey: volunteerKeys.stats(churchId!),
    queryFn: () =>
      api.get<VolunteerStats>(`/church/${churchId}/volunteers/stats`),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for creating a new volunteer
 */
export function useCreateVolunteer() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Volunteer, Error, VolunteerCreateInput>({
    mutationFn: (data) =>
      api.post<Volunteer>(`/church/${churchId}/volunteers`, data),
    onSuccess: (newVolunteer) => {
      // Invalidate volunteer lists
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.lists(churchId!),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.stats(churchId!),
      });

      // Add to cache
      queryClient.setQueryData(
        volunteerKeys.detail(churchId!, newVolunteer.id),
        newVolunteer
      );
    },
  });
}

/**
 * Hook for updating a volunteer
 */
export function useUpdateVolunteer() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Volunteer,
    Error,
    { volunteerId: string; data: VolunteerUpdateInput }
  >({
    mutationFn: ({ volunteerId, data }) =>
      api.patch<Volunteer>(
        `/church/${churchId}/volunteers/${volunteerId}`,
        data
      ),
    onSuccess: (updatedVolunteer, { volunteerId }) => {
      // Update in cache
      queryClient.setQueryData(
        volunteerKeys.detail(churchId!, volunteerId),
        updatedVolunteer
      );

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.lists(churchId!),
      });

      // Invalidate stats if status changed
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.stats(churchId!),
      });
    },
  });
}

/**
 * Hook for deactivating a volunteer
 */
export function useDeactivateVolunteer() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Volunteer,
    Error,
    { volunteerId: string; reason?: string }
  >({
    mutationFn: ({ volunteerId, reason }) =>
      api.post<Volunteer>(
        `/church/${churchId}/volunteers/${volunteerId}/deactivate`,
        { reason }
      ),
    onSuccess: (_, { volunteerId }) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.detail(churchId!, volunteerId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.stats(churchId!),
      });
    },
  });
}

/**
 * Hook for fetching ministry teams
 */
export function useMinistryTeams(options?: { includeInactive?: boolean }) {
  const { churchId } = useAuth();

  return useQuery<MinistryTeam[]>({
    queryKey: volunteerKeys.teams(churchId!),
    queryFn: () =>
      api.get<MinistryTeam[]>(`/church/${churchId}/teams`, {
        includeInactive: options?.includeInactive,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single ministry team
 */
export function useMinistryTeam(teamId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<MinistryTeam>({
    queryKey: volunteerKeys.team(churchId!, teamId!),
    queryFn: () => api.get<MinistryTeam>(`/church/${churchId}/teams/${teamId}`),
    enabled: Boolean(churchId) && Boolean(teamId),
  });
}

/**
 * Hook for fetching team members
 */
export function useTeamMembers(teamId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Volunteer[]>({
    queryKey: volunteerKeys.teamMembers(churchId!, teamId!),
    queryFn: () =>
      api.get<Volunteer[]>(`/church/${churchId}/teams/${teamId}/members`),
    enabled: Boolean(churchId) && Boolean(teamId),
  });
}

/**
 * Hook for creating a ministry team
 */
export function useCreateTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MinistryTeam, Error, TeamCreateInput>({
    mutationFn: (data) =>
      api.post<MinistryTeam>(`/church/${churchId}/teams`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.teams(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a ministry team
 */
export function useUpdateTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    MinistryTeam,
    Error,
    { teamId: string; data: TeamUpdateInput }
  >({
    mutationFn: ({ teamId, data }) =>
      api.patch<MinistryTeam>(`/church/${churchId}/teams/${teamId}`, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.team(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.teams(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a ministry team
 */
export function useDeleteTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (teamId) =>
      api.delete<void>(`/church/${churchId}/teams/${teamId}`),
    onSuccess: (_, teamId) => {
      queryClient.removeQueries({
        queryKey: volunteerKeys.team(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.teams(churchId!),
      });
    },
  });
}

/**
 * Hook for adding a volunteer to a team
 */
export function useAddToTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { teamId: string; volunteerId: string; role?: string }
  >({
    mutationFn: ({ teamId, volunteerId, role }) =>
      api.post<void>(`/church/${churchId}/teams/${teamId}/members`, {
        volunteerId,
        role,
      }),
    onSuccess: (_, { teamId, volunteerId }) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.teamMembers(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.detail(churchId!, volunteerId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.team(churchId!, teamId),
      });
    },
  });
}

/**
 * Hook for removing a volunteer from a team
 */
export function useRemoveFromTeam() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { teamId: string; volunteerId: string }>({
    mutationFn: ({ teamId, volunteerId }) =>
      api.delete<void>(
        `/church/${churchId}/teams/${teamId}/members/${volunteerId}`
      ),
    onSuccess: (_, { teamId, volunteerId }) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.teamMembers(churchId!, teamId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.detail(churchId!, volunteerId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.team(churchId!, teamId),
      });
    },
  });
}

/**
 * Hook for fetching volunteer assignments
 */
export function useVolunteerAssignments(
  volunteerId?: string,
  options?: { startDate?: string; endDate?: string; status?: AssignmentStatus }
) {
  const { churchId } = useAuth();

  return useQuery<VolunteerAssignment[]>({
    queryKey: volunteerKeys.assignments(churchId!, volunteerId),
    queryFn: () =>
      api.get<VolunteerAssignment[]>(
        volunteerId
          ? `/church/${churchId}/volunteers/${volunteerId}/assignments`
          : `/church/${churchId}/assignments`,
        {
          startDate: options?.startDate,
          endDate: options?.endDate,
          status: options?.status,
        }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching volunteer schedule
 */
export function useVolunteerSchedule(params: ScheduleParams) {
  const { churchId } = useAuth();

  return useQuery<VolunteerAssignment[]>({
    queryKey: volunteerKeys.schedule(churchId!, params),
    queryFn: () =>
      api.get<VolunteerAssignment[]>(`/church/${churchId}/volunteers/schedule`, {
        startDate: params.startDate,
        endDate: params.endDate,
        teamId: params.teamId,
      }),
    enabled: Boolean(churchId) && Boolean(params.startDate) && Boolean(params.endDate),
  });
}

/**
 * Hook for creating an assignment
 */
export function useCreateAssignment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<VolunteerAssignment, Error, AssignmentCreateInput>({
    mutationFn: (data) =>
      api.post<VolunteerAssignment>(`/church/${churchId}/assignments`, data),
    onSuccess: (_, { volunteerId }) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.assignments(churchId!, volunteerId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.assignments(churchId!, undefined),
      });
    },
  });
}

/**
 * Hook for updating an assignment
 */
export function useUpdateAssignment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    VolunteerAssignment,
    Error,
    {
      assignmentId: string;
      data: Partial<Omit<AssignmentCreateInput, 'volunteerId'>>;
    }
  >({
    mutationFn: ({ assignmentId, data }) =>
      api.patch<VolunteerAssignment>(
        `/church/${churchId}/assignments/${assignmentId}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting an assignment
 */
export function useDeleteAssignment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (assignmentId) =>
      api.delete<void>(`/church/${churchId}/assignments/${assignmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for confirming an assignment
 */
export function useConfirmAssignment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<VolunteerAssignment, Error, string>({
    mutationFn: (assignmentId) =>
      api.post<VolunteerAssignment>(
        `/church/${churchId}/assignments/${assignmentId}/confirm`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for logging volunteer hours
 */
export function useLogVolunteerHours() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { volunteerId: string; hours: number; date: string; notes?: string }
  >({
    mutationFn: ({ volunteerId, hours, date, notes }) =>
      api.post<void>(`/church/${churchId}/volunteers/${volunteerId}/hours`, {
        hours,
        date,
        notes,
      }),
    onSuccess: (_, { volunteerId }) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.detail(churchId!, volunteerId),
      });
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.stats(churchId!),
      });
    },
  });
}

/**
 * Hook for initiating background check
 */
export function useInitiateBackgroundCheck() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (volunteerId) =>
      api.post<void>(
        `/church/${churchId}/volunteers/${volunteerId}/background-check`
      ),
    onSuccess: (_, volunteerId) => {
      queryClient.invalidateQueries({
        queryKey: volunteerKeys.detail(churchId!, volunteerId),
      });
    },
  });
}

export default useVolunteers;

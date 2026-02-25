/**
 * Discipleship Hooks - Church Admin CRM
 *
 * Hooks for managing discipleship plans, progress tracking, and small groups.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

// ===================================================================
// TYPES
// ===================================================================

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

export interface SmallGroup {
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

export interface DiscipleshipStats {
  totalPlans: number;
  activeParticipants: number;
  completedJourneys: number;
  smallGroups: number;
  weeklyEngagement: number;
}

export interface DiscipleshipFilters {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePlanInput {
  name: string;
  description?: string;
  category: DiscipleshipPlan['category'];
  estimatedDuration?: string;
  difficulty?: DiscipleshipPlan['difficulty'];
  coverImageUrl?: string;
  isPublic?: boolean;
}

export interface CreateLessonInput {
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
}

export interface CreateGroupInput {
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
}

export interface EnrollInput {
  planId: number;
  memberId?: string;
}

export interface UpdateProgressInput {
  currentLessonIndex?: number;
  completedLessonIds?: number[];
  status?: DiscipleProgress['status'];
  lessonNotes?: Record<string, string>;
}

// ===================================================================
// API RESPONSE TYPES
// ===================================================================

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===================================================================
// QUERY KEYS
// ===================================================================

type ChurchIdType = string | number | null | undefined;

const discipleshipKeys = {
  all: ['discipleship'] as const,
  plans: (churchId: ChurchIdType) => [...discipleshipKeys.all, churchId, 'plans'] as const,
  plan: (churchId: ChurchIdType, planId: string | number) => [...discipleshipKeys.plans(churchId), planId] as const,
  lessons: (churchId: ChurchIdType, planId: string | number) => [...discipleshipKeys.plan(churchId, planId), 'lessons'] as const,
  progress: (churchId: ChurchIdType) => [...discipleshipKeys.all, churchId, 'progress'] as const,
  memberProgress: (churchId: ChurchIdType, memberId: string) => [...discipleshipKeys.progress(churchId), memberId] as const,
  groups: (churchId: ChurchIdType) => [...discipleshipKeys.all, churchId, 'groups'] as const,
  group: (churchId: ChurchIdType, groupId: string | number) => [...discipleshipKeys.groups(churchId), groupId] as const,
  stats: (churchId: ChurchIdType) => [...discipleshipKeys.all, churchId, 'stats'] as const,
};

// ===================================================================
// PLANS HOOKS
// ===================================================================

/**
 * Fetch all discipleship plans for the church
 */
export function useDiscipleshipPlans(filters?: DiscipleshipFilters) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<DiscipleshipPlan>>({
    queryKey: [...discipleshipKeys.plans(churchId), filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      return api.get<PaginatedResponse<DiscipleshipPlan>>(
        `/church/${churchId}/discipleship/plans${queryString ? `?${queryString}` : ''}`
      );
    },
    enabled: !!churchId,
  });
}

/**
 * Fetch a single discipleship plan with lessons
 */
export function useDiscipleshipPlan(planId: string | number) {
  const { churchId } = useAuth();

  return useQuery<DiscipleshipPlan & { lessons: DiscipleshipLesson[] }>({
    queryKey: discipleshipKeys.plan(churchId, planId),
    queryFn: () => api.get(`/church/${churchId}/discipleship/plans/${planId}`),
    enabled: !!churchId && !!planId,
  });
}

/**
 * Create a new discipleship plan
 */
export function useCreateDiscipleshipPlan() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlanInput) =>
      api.post<DiscipleshipPlan>(`/church/${churchId}/discipleship/plans`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plans(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.stats(churchId) });
    },
  });
}

/**
 * Update a discipleship plan
 */
export function useUpdateDiscipleshipPlan() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, ...input }: Partial<CreatePlanInput> & { planId: number }) =>
      api.patch<DiscipleshipPlan>(`/church/${churchId}/discipleship/plans/${planId}`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plans(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plan(churchId, variables.planId) });
    },
  });
}

/**
 * Delete a discipleship plan
 */
export function useDeleteDiscipleshipPlan() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) =>
      api.delete(`/church/${churchId}/discipleship/plans/${planId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plans(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.stats(churchId) });
    },
  });
}

// ===================================================================
// LESSONS HOOKS
// ===================================================================

/**
 * Create a new lesson in a plan
 */
export function useCreateDiscipleshipLesson() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLessonInput) =>
      api.post<DiscipleshipLesson>(`/church/${churchId}/discipleship/lessons`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plan(churchId, variables.planId) });
    },
  });
}

/**
 * Update a lesson
 */
export function useUpdateDiscipleshipLesson() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, planId, ...input }: Partial<CreateLessonInput> & { lessonId: number; planId: number }) =>
      api.patch<DiscipleshipLesson>(`/church/${churchId}/discipleship/lessons/${lessonId}`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plan(churchId, variables.planId) });
    },
  });
}

/**
 * Delete a lesson
 */
export function useDeleteDiscipleshipLesson() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId }: { lessonId: number; planId: number }) =>
      api.delete(`/church/${churchId}/discipleship/lessons/${lessonId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plan(churchId, variables.planId) });
    },
  });
}

// ===================================================================
// PROGRESS HOOKS
// ===================================================================

/**
 * Fetch all member progress records
 */
export function useDiscipleshipProgress(filters?: DiscipleshipFilters) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<DiscipleProgress>>({
    queryKey: [...discipleshipKeys.progress(churchId), filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      return api.get<PaginatedResponse<DiscipleProgress>>(
        `/church/${churchId}/discipleship/progress${queryString ? `?${queryString}` : ''}`
      );
    },
    enabled: !!churchId,
  });
}

/**
 * Enroll a member in a discipleship plan
 */
export function useEnrollInPlan() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EnrollInput) =>
      api.post<DiscipleProgress>(`/church/${churchId}/discipleship/progress/enroll`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.progress(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.plans(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.stats(churchId) });
    },
  });
}

/**
 * Update progress (complete lesson, pause, etc.)
 */
export function useUpdateDiscipleshipProgress() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ progressId, ...input }: UpdateProgressInput & { progressId: number }) =>
      api.patch<DiscipleProgress>(`/church/${churchId}/discipleship/progress/${progressId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.progress(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.stats(churchId) });
    },
  });
}

// ===================================================================
// GROUPS HOOKS
// ===================================================================

/**
 * Fetch all discipleship groups
 */
export function useDiscipleshipGroups(filters?: DiscipleshipFilters) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<SmallGroup>>({
    queryKey: [...discipleshipKeys.groups(churchId), filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      return api.get<PaginatedResponse<SmallGroup>>(
        `/church/${churchId}/discipleship/groups${queryString ? `?${queryString}` : ''}`
      );
    },
    enabled: !!churchId,
  });
}

/**
 * Create a new discipleship group
 */
export function useCreateDiscipleshipGroup() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) =>
      api.post<SmallGroup>(`/church/${churchId}/discipleship/groups`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.groups(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.stats(churchId) });
    },
  });
}

/**
 * Update a discipleship group
 */
export function useUpdateDiscipleshipGroup() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, ...input }: Partial<CreateGroupInput> & { groupId: number }) =>
      api.patch<SmallGroup>(`/church/${churchId}/discipleship/groups/${groupId}`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.groups(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.group(churchId, variables.groupId) });
    },
  });
}

/**
 * Add a member to a group
 */
export function useAddGroupMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId, role }: { groupId: number; userId: string; role?: string }) =>
      api.post(`/church/${churchId}/discipleship/groups/${groupId}/members`, { userId, role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.groups(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.group(churchId, variables.groupId) });
    },
  });
}

/**
 * Remove a member from a group
 */
export function useRemoveGroupMember() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: string }) =>
      api.delete(`/church/${churchId}/discipleship/groups/${groupId}/members/${memberId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.groups(churchId) });
      queryClient.invalidateQueries({ queryKey: discipleshipKeys.group(churchId, variables.groupId) });
    },
  });
}

// ===================================================================
// STATS HOOKS
// ===================================================================

/**
 * Fetch discipleship statistics for dashboard
 */
export function useDiscipleshipStats() {
  const { churchId } = useAuth();

  return useQuery<DiscipleshipStats>({
    queryKey: discipleshipKeys.stats(churchId),
    queryFn: () => api.get<DiscipleshipStats>(`/church/${churchId}/discipleship/stats`),
    enabled: !!churchId,
  });
}

// ===================================================================
// COMBINED HOOK (for backwards compatibility with Discipleship.tsx)
// ===================================================================

/**
 * Combined hook that fetches all discipleship data
 * Used by the main Discipleship page for convenience
 */
export function useDiscipleship() {
  const { churchId } = useAuth();

  const plansQuery = useQuery<DiscipleshipPlan[]>({
    queryKey: discipleshipKeys.plans(churchId),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<DiscipleshipPlan> | DiscipleshipPlan[]>(
        `/church/${churchId}/discipleship/plans`
      );
      // Handle both paginated and array responses
      return Array.isArray(response) ? response : response.data;
    },
    enabled: !!churchId,
  });

  const progressQuery = useQuery<DiscipleProgress[]>({
    queryKey: discipleshipKeys.progress(churchId),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<DiscipleProgress> | DiscipleProgress[]>(
        `/church/${churchId}/discipleship/progress`
      );
      return Array.isArray(response) ? response : response.data;
    },
    enabled: !!churchId,
  });

  const groupsQuery = useQuery<SmallGroup[]>({
    queryKey: discipleshipKeys.groups(churchId),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<SmallGroup> | SmallGroup[]>(
        `/church/${churchId}/discipleship/groups`
      );
      return Array.isArray(response) ? response : response.data;
    },
    enabled: !!churchId,
  });

  const statsQuery = useQuery<DiscipleshipStats>({
    queryKey: discipleshipKeys.stats(churchId),
    queryFn: () => api.get<DiscipleshipStats>(`/church/${churchId}/discipleship/stats`),
    enabled: !!churchId,
  });

  return {
    plans: plansQuery.data ?? [],
    progress: progressQuery.data ?? [],
    groups: groupsQuery.data ?? [],
    stats: statsQuery.data,
    isLoading: plansQuery.isLoading || progressQuery.isLoading || groupsQuery.isLoading || statsQuery.isLoading,
    error: plansQuery.error || progressQuery.error || groupsQuery.error || statsQuery.error,
  };
}

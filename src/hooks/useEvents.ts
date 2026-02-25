/**
 * Events API Hook for Church Admin App
 * Handles event CRUD operations and attendee management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  Event,
  EventCreateInput,
  EventUpdateInput,
  EventCategory,
  EventStatus,
  Attendee,
  AttendeeStatus,
} from '../types';

// Query key factory for events
const eventKeys = {
  all: (churchId: string) => ['church', churchId, 'events'] as const,
  lists: (churchId: string) => [...eventKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: EventFilters) =>
    [...eventKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...eventKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...eventKeys.details(churchId), id] as const,
  attendees: (churchId: string, eventId: string) =>
    [...eventKeys.detail(churchId, eventId), 'attendees'] as const,
  upcoming: (churchId: string, limit?: number) =>
    [...eventKeys.all(churchId), 'upcoming', limit] as const,
  calendar: (churchId: string, month: string) =>
    [...eventKeys.all(churchId), 'calendar', month] as const,
};

// Filter types
export interface EventFilters extends PaginationParams {
  category?: EventCategory | EventCategory[];
  status?: EventStatus | EventStatus[];
  ministryId?: string;
  isPublic?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  requiresRegistration?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  category: EventCategory;
  status: EventStatus;
}

interface AttendeeFilters extends PaginationParams {
  status?: AttendeeStatus | AttendeeStatus[];
  search?: string;
}

interface RegisterAttendeeInput {
  memberId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  notes?: string;
}

/**
 * Hook for fetching events list with filters and pagination
 */
export function useEvents(filters: EventFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Event>>({
    queryKey: eventKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Event>>(`/church/${churchId}/events`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'startDate',
        sortOrder: filters.sortOrder || 'asc',
        category: filters.category,
        status: filters.status,
        ministryId: filters.ministryId,
        isPublic: filters.isPublic,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        search: filters.search,
        requiresRegistration: filters.requiresRegistration,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single event by ID
 */
export function useEvent(eventId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Event>({
    queryKey: eventKeys.detail(churchId!, eventId!),
    queryFn: () => api.get<Event>(`/church/${churchId}/events/${eventId}`),
    enabled: Boolean(churchId) && Boolean(eventId),
  });
}

/**
 * Hook for fetching upcoming events
 */
export function useUpcomingEvents(limit: number = 5) {
  const { churchId } = useAuth();

  return useQuery<Event[]>({
    queryKey: eventKeys.upcoming(churchId!, limit),
    queryFn: () =>
      api.get<Event[]>(`/church/${churchId}/events/upcoming`, { limit }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching calendar events for a specific month
 */
export function useCalendarEvents(month: string) {
  const { churchId } = useAuth();

  return useQuery<CalendarEvent[]>({
    queryKey: eventKeys.calendar(churchId!, month),
    queryFn: () =>
      api.get<CalendarEvent[]>(`/church/${churchId}/events/calendar`, {
        month,
      }),
    enabled: Boolean(churchId) && Boolean(month),
  });
}

/**
 * Hook for creating a new event
 */
export function useCreateEvent() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Event, Error, EventCreateInput>({
    mutationFn: (data) =>
      api.post<Event>(`/church/${churchId}/events`, data),
    onSuccess: (newEvent) => {
      // Invalidate event lists
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(churchId!),
      });

      // Invalidate upcoming events
      queryClient.invalidateQueries({
        queryKey: eventKeys.upcoming(churchId!),
      });

      // Add the new event to the cache
      queryClient.setQueryData(
        eventKeys.detail(churchId!, newEvent.id),
        newEvent
      );
    },
  });
}

/**
 * Hook for updating an event
 */
export function useUpdateEvent() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Event,
    Error,
    { eventId: string; data: EventUpdateInput }
  >({
    mutationFn: ({ eventId, data }) =>
      api.patch<Event>(`/church/${churchId}/events/${eventId}`, data),
    onSuccess: (updatedEvent, { eventId }) => {
      // Update the event in cache
      queryClient.setQueryData(
        eventKeys.detail(churchId!, eventId),
        updatedEvent
      );

      // Invalidate event lists
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(churchId!),
      });

      // Invalidate upcoming and calendar
      queryClient.invalidateQueries({
        queryKey: eventKeys.upcoming(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting an event
 */
export function useDeleteEvent() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (eventId) =>
      api.delete<void>(`/church/${churchId}/events/${eventId}`),
    onSuccess: (_, eventId) => {
      // Remove the event from cache
      queryClient.removeQueries({
        queryKey: eventKeys.detail(churchId!, eventId),
      });

      // Invalidate all event queries
      queryClient.invalidateQueries({
        queryKey: eventKeys.all(churchId!),
      });
    },
  });
}

/**
 * Hook for cancelling an event
 */
export function useCancelEvent() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Event,
    Error,
    { eventId: string; reason?: string; notifyAttendees?: boolean }
  >({
    mutationFn: ({ eventId, reason, notifyAttendees }) =>
      api.post<Event>(`/church/${churchId}/events/${eventId}/cancel`, {
        reason,
        notifyAttendees,
      }),
    onSuccess: (_, { eventId }) => {
      // Invalidate the specific event
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(churchId!, eventId),
      });

      // Invalidate all event lists
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for duplicating an event
 */
export function useDuplicateEvent() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Event,
    Error,
    { eventId: string; newStartDate?: string }
  >({
    mutationFn: ({ eventId, newStartDate }) =>
      api.post<Event>(`/church/${churchId}/events/${eventId}/duplicate`, {
        newStartDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.lists(churchId!),
      });
    },
  });
}

/**
 * Hook for fetching event attendees
 */
export function useEventAttendees(
  eventId: string | undefined,
  filters: AttendeeFilters = {}
) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Attendee>>({
    queryKey: eventKeys.attendees(churchId!, eventId!),
    queryFn: () =>
      api.get<PaginatedResponse<Attendee>>(
        `/church/${churchId}/events/${eventId}/attendees`,
        {
          page: filters.page || 1,
          pageSize: filters.pageSize || 50,
          sortBy: filters.sortBy || 'lastName',
          sortOrder: filters.sortOrder || 'asc',
          status: filters.status,
          search: filters.search,
        }
      ),
    enabled: Boolean(churchId) && Boolean(eventId),
  });
}

/**
 * Hook for registering an attendee
 */
export function useRegisterAttendee() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Attendee,
    Error,
    { eventId: string; data: RegisterAttendeeInput }
  >({
    mutationFn: ({ eventId, data }) =>
      api.post<Attendee>(
        `/church/${churchId}/events/${eventId}/attendees`,
        data
      ),
    onSuccess: (_, { eventId }) => {
      // Invalidate attendees list
      queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(churchId!, eventId),
      });

      // Invalidate event to update attendee count
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(churchId!, eventId),
      });
    },
  });
}

/**
 * Hook for updating attendee status
 */
export function useUpdateAttendeeStatus() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Attendee,
    Error,
    { eventId: string; attendeeId: string; status: AttendeeStatus }
  >({
    mutationFn: ({ eventId, attendeeId, status }) =>
      api.patch<Attendee>(
        `/church/${churchId}/events/${eventId}/attendees/${attendeeId}`,
        { status }
      ),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(churchId!, eventId),
      });
    },
  });
}

/**
 * Hook for checking in an attendee
 */
export function useCheckInAttendee() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Attendee,
    Error,
    { eventId: string; attendeeId: string }
  >({
    mutationFn: ({ eventId, attendeeId }) =>
      api.post<Attendee>(
        `/church/${churchId}/events/${eventId}/attendees/${attendeeId}/check-in`
      ),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(churchId!, eventId),
      });
    },
  });
}

/**
 * Hook for removing an attendee
 */
export function useRemoveAttendee() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { eventId: string; attendeeId: string; notifyAttendee?: boolean }
  >({
    mutationFn: ({ eventId, attendeeId, notifyAttendee }) =>
      api.delete<void>(
        `/church/${churchId}/events/${eventId}/attendees/${attendeeId}`,
        { notifyAttendee }
      ),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(churchId!, eventId),
      });

      // Invalidate event to update attendee count
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(churchId!, eventId),
      });
    },
  });
}

/**
 * Hook for bulk check-in
 */
export function useBulkCheckIn() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    { checkedIn: number },
    Error,
    { eventId: string; attendeeIds: string[] }
  >({
    mutationFn: ({ eventId, attendeeIds }) =>
      api.post<{ checkedIn: number }>(
        `/church/${churchId}/events/${eventId}/attendees/bulk-check-in`,
        { attendeeIds }
      ),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(churchId!, eventId),
      });
    },
  });
}

/**
 * Hook for exporting attendee list
 */
export function useExportAttendees() {
  const { churchId } = useAuth();

  return useMutation<
    Blob,
    Error,
    { eventId: string; format: 'csv' | 'xlsx' }
  >({
    mutationFn: async ({ eventId, format }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://soapboxsuperapp.com/api'}/church/${churchId}/events/${eventId}/attendees/export?format=${format}`,
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

/**
 * Hook for sending event reminders
 */
export function useSendEventReminders() {
  const { churchId } = useAuth();

  return useMutation<
    { sent: number },
    Error,
    { eventId: string; attendeeIds?: string[] }
  >({
    mutationFn: ({ eventId, attendeeIds }) =>
      api.post<{ sent: number }>(
        `/church/${churchId}/events/${eventId}/send-reminders`,
        { attendeeIds }
      ),
  });
}

export default useEvents;

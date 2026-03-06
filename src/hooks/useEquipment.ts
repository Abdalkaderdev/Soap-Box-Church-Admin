/**
 * Equipment & Assets API Hooks for Church Admin App
 * Handles equipment CRUD, checkouts, returns, and maintenance logs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type { Member } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export type EquipmentCategory =
  | 'audio_visual'
  | 'musical_instruments'
  | 'furniture'
  | 'lighting'
  | 'computing'
  | 'kitchen'
  | 'outdoor'
  | 'vehicles'
  | 'other';

export type EquipmentStatus =
  | 'available'
  | 'in_use'
  | 'checked_out'
  | 'maintenance'
  | 'retired'
  | 'lost';

export interface Equipment {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  location?: string;
  assignedTo?: string;
  assignedMember?: Member;
  imageUrl?: string;
  barcode?: string;
  warrantyExpiration?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentCreateInput {
  name: string;
  description?: string;
  category: EquipmentCategory;
  status?: EquipmentStatus;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  location?: string;
  imageUrl?: string;
  barcode?: string;
  warrantyExpiration?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  tags?: string[];
}

export interface EquipmentUpdateInput extends Partial<EquipmentCreateInput> {
  assignedTo?: string;
}

export interface EquipmentFilters extends PaginationParams {
  search?: string;
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  location?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface EquipmentCheckout {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  memberId: string;
  member?: Member;
  checkedOutAt: string;
  expectedReturnDate?: string;
  returnedAt?: string;
  returnedCondition?: string;
  checkedOutBy: string;
  returnedBy?: string;
  purpose?: string;
  notes?: string;
  status: 'checked_out' | 'returned' | 'overdue' | 'lost';
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutEquipmentInput {
  equipmentId: string;
  memberId: string;
  expectedReturnDate?: string;
  purpose?: string;
  notes?: string;
}

export interface ReturnEquipmentInput {
  checkoutId: string;
  returnedCondition?: string;
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  type: 'preventive' | 'repair' | 'inspection' | 'calibration' | 'cleaning' | 'other';
  description: string;
  performedBy?: string;
  performedByName?: string;
  vendor?: string;
  cost?: number;
  scheduledDate?: string;
  completedDate?: string;
  nextScheduledDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLogCreateInput {
  equipmentId: string;
  type: MaintenanceLog['type'];
  description: string;
  performedBy?: string;
  performedByName?: string;
  vendor?: string;
  cost?: number;
  scheduledDate?: string;
  completedDate?: string;
  nextScheduledDate?: string;
  status?: MaintenanceLog['status'];
  notes?: string;
}

export interface EquipmentStats {
  total: number;
  byCategory: Record<EquipmentCategory, number>;
  byStatus: Record<EquipmentStatus, number>;
  totalValue: number;
  maintenanceDue: number;
  checkedOut: number;
  overdue: number;
}

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

const equipmentKeys = {
  all: (churchId: string) => ['church', churchId, 'equipment'] as const,
  lists: (churchId: string) => [...equipmentKeys.all(churchId), 'list'] as const,
  list: (churchId: string, filters: EquipmentFilters) =>
    [...equipmentKeys.lists(churchId), filters] as const,
  details: (churchId: string) => [...equipmentKeys.all(churchId), 'detail'] as const,
  detail: (churchId: string, id: string) => [...equipmentKeys.details(churchId), id] as const,
  checkouts: (churchId: string) => [...equipmentKeys.all(churchId), 'checkouts'] as const,
  checkoutsByItem: (churchId: string, equipmentId: string) =>
    [...equipmentKeys.checkouts(churchId), equipmentId] as const,
  maintenance: (churchId: string) => [...equipmentKeys.all(churchId), 'maintenance'] as const,
  maintenanceByItem: (churchId: string, equipmentId: string) =>
    [...equipmentKeys.maintenance(churchId), equipmentId] as const,
  stats: (churchId: string) => [...equipmentKeys.all(churchId), 'stats'] as const,
};

// ============================================================================
// EQUIPMENT HOOKS
// ============================================================================

/**
 * Hook for fetching equipment list with filters and pagination
 */
export function useEquipment(filters: EquipmentFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Equipment>>({
    queryKey: equipmentKeys.list(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Equipment>>(`/church/${churchId}/equipment`, {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'name',
        sortOrder: filters.sortOrder || 'asc',
        search: filters.search,
        category: filters.category,
        status: filters.status,
        location: filters.location,
        assignedTo: filters.assignedTo,
        tags: filters.tags,
      }),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single equipment item by ID
 */
export function useEquipmentItem(id: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Equipment>({
    queryKey: equipmentKeys.detail(churchId!, id!),
    queryFn: () => api.get<Equipment>(`/church/${churchId}/equipment/${id}`),
    enabled: Boolean(churchId) && Boolean(id),
  });
}

/**
 * Hook for creating a new equipment item
 */
export function useCreateEquipment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Equipment, Error, EquipmentCreateInput>({
    mutationFn: (data) =>
      api.post<Equipment>(`/church/${churchId}/equipment`, data),
    onSuccess: (newEquipment) => {
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.stats(churchId!),
      });
      queryClient.setQueryData(
        equipmentKeys.detail(churchId!, newEquipment.id),
        newEquipment
      );
    },
  });
}

/**
 * Hook for updating an equipment item
 */
export function useUpdateEquipment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Equipment,
    Error,
    { id: string; data: EquipmentUpdateInput }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<Equipment>(`/church/${churchId}/equipment/${id}`, data),
    onSuccess: (updatedEquipment, { id }) => {
      queryClient.setQueryData(
        equipmentKeys.detail(churchId!, id),
        updatedEquipment
      );
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.stats(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting an equipment item
 */
export function useDeleteEquipment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/church/${churchId}/equipment/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: equipmentKeys.detail(churchId!, id),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.stats(churchId!),
      });
    },
  });
}

// ============================================================================
// CHECKOUT HOOKS
// ============================================================================

/**
 * Hook for fetching equipment checkout history
 * If equipmentId is provided, fetches checkouts for that item only
 */
export function useEquipmentCheckouts(equipmentId?: string) {
  const { churchId } = useAuth();

  const queryKey = equipmentId
    ? equipmentKeys.checkoutsByItem(churchId!, equipmentId)
    : equipmentKeys.checkouts(churchId!);

  const url = equipmentId
    ? `/church/${churchId}/equipment/${equipmentId}/checkouts`
    : `/church/${churchId}/equipment-checkouts`;

  return useQuery<EquipmentCheckout[]>({
    queryKey,
    queryFn: () => api.get<EquipmentCheckout[]>(url),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for checking out equipment to a member
 */
export function useCheckoutEquipment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<EquipmentCheckout, Error, CheckoutEquipmentInput>({
    mutationFn: (data) =>
      api.post<EquipmentCheckout>(
        `/church/${churchId}/equipment/${data.equipmentId}/checkout`,
        data
      ),
    onSuccess: (_, { equipmentId }) => {
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.checkouts(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.checkoutsByItem(churchId!, equipmentId),
      });
      // Equipment status changes on checkout
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.detail(churchId!, equipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.stats(churchId!),
      });
    },
  });
}

/**
 * Hook for returning checked-out equipment
 */
export function useReturnEquipment() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<EquipmentCheckout, Error, ReturnEquipmentInput>({
    mutationFn: ({ checkoutId, ...data }) =>
      api.patch<EquipmentCheckout>(
        `/church/${churchId}/equipment-checkouts/${checkoutId}/return`,
        data
      ),
    onSuccess: () => {
      // Invalidate all checkout and equipment queries since we may not know the equipmentId
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.checkouts(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.stats(churchId!),
      });
    },
  });
}

// ============================================================================
// MAINTENANCE LOG HOOKS
// ============================================================================

/**
 * Hook for fetching maintenance logs for an equipment item
 */
export function useMaintenanceLogs(equipmentId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<MaintenanceLog[]>({
    queryKey: equipmentKeys.maintenanceByItem(churchId!, equipmentId!),
    queryFn: () =>
      api.get<MaintenanceLog[]>(
        `/church/${churchId}/equipment/${equipmentId}/maintenance`
      ),
    enabled: Boolean(churchId) && Boolean(equipmentId),
  });
}

/**
 * Hook for creating a maintenance log entry
 */
export function useCreateMaintenanceLog() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MaintenanceLog, Error, MaintenanceLogCreateInput>({
    mutationFn: ({ equipmentId, ...data }) =>
      api.post<MaintenanceLog>(
        `/church/${churchId}/equipment/${equipmentId}/maintenance`,
        data
      ),
    onSuccess: (_, { equipmentId }) => {
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.maintenanceByItem(churchId!, equipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.maintenance(churchId!),
      });
      // Equipment status or next maintenance date may change
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.detail(churchId!, equipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.lists(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.stats(churchId!),
      });
    },
  });
}

// ============================================================================
// STATS HOOK
// ============================================================================

/**
 * Hook for fetching equipment summary statistics
 */
export function useEquipmentStats() {
  const { churchId } = useAuth();

  return useQuery<EquipmentStats>({
    queryKey: equipmentKeys.stats(churchId!),
    queryFn: () =>
      api.get<EquipmentStats>(`/church/${churchId}/equipment/stats`),
    enabled: Boolean(churchId),
  });
}

export default useEquipment;

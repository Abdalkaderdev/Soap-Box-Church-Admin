/**
 * Communications API Hook for Church Admin App
 * Handles messaging (email/sms/push), templates, and message history
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type PaginatedResponse, type PaginationParams } from '../lib/api';
import { useAuth } from './useAuth';
import type {
  Message,
  MessageCreateInput,
  MessageType,
  MessageStatus,
  MessageTemplate,
  MessageTemplateCreateInput,
  RecipientFilter,
} from '../types';

// Query key factory for communications
const communicationKeys = {
  all: (churchId: string) => ['church', churchId, 'communications'] as const,
  messages: (churchId: string) =>
    [...communicationKeys.all(churchId), 'messages'] as const,
  messageList: (churchId: string, filters: MessageFilters) =>
    [...communicationKeys.messages(churchId), 'list', filters] as const,
  message: (churchId: string, messageId: string) =>
    [...communicationKeys.messages(churchId), messageId] as const,
  templates: (churchId: string) =>
    [...communicationKeys.all(churchId), 'templates'] as const,
  template: (churchId: string, templateId: string) =>
    [...communicationKeys.templates(churchId), templateId] as const,
  stats: (churchId: string, params?: StatsParams) =>
    [...communicationKeys.all(churchId), 'stats', params] as const,
  drafts: (churchId: string) =>
    [...communicationKeys.messages(churchId), 'drafts'] as const,
  scheduled: (churchId: string) =>
    [...communicationKeys.messages(churchId), 'scheduled'] as const,
  recipientCount: (churchId: string, filter: RecipientFilter) =>
    [...communicationKeys.all(churchId), 'recipientCount', filter] as const,
};

// Filter types
export interface MessageFilters extends PaginationParams {
  type?: MessageType | MessageType[];
  status?: MessageStatus | MessageStatus[];
  senderId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface StatsParams {
  startDate?: string;
  endDate?: string;
  type?: MessageType;
}

interface CommunicationStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
  byType: Record<MessageType, {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  trend: { date: string; sent: number; opened: number }[];
}

interface SendMessageInput extends MessageCreateInput {
  testMode?: boolean;
  testRecipients?: string[];
}

interface PreviewMessageInput {
  templateId?: string;
  subject: string;
  body: string;
  type: MessageType;
  memberId?: string; // For preview with real member data
}

interface MessagePreview {
  subject: string;
  body: string;
  html?: string;
}

/**
 * Hook for fetching message history with filters and pagination
 */
export function useMessages(filters: MessageFilters = {}) {
  const { churchId } = useAuth();

  return useQuery<PaginatedResponse<Message>>({
    queryKey: communicationKeys.messageList(churchId!, filters),
    queryFn: () =>
      api.get<PaginatedResponse<Message>>(
        `/church/${churchId}/communications/messages`,
        {
          page: filters.page || 1,
          pageSize: filters.pageSize || 20,
          sortBy: filters.sortBy || 'createdAt',
          sortOrder: filters.sortOrder || 'desc',
          type: filters.type,
          status: filters.status,
          senderId: filters.senderId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          search: filters.search,
        }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single message with full details
 */
export function useMessage(messageId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<Message>({
    queryKey: communicationKeys.message(churchId!, messageId!),
    queryFn: () =>
      api.get<Message>(
        `/church/${churchId}/communications/messages/${messageId}`
      ),
    enabled: Boolean(churchId) && Boolean(messageId),
  });
}

/**
 * Hook for fetching draft messages
 */
export function useDraftMessages() {
  const { churchId } = useAuth();

  return useQuery<Message[]>({
    queryKey: communicationKeys.drafts(churchId!),
    queryFn: () =>
      api.get<Message[]>(`/church/${churchId}/communications/messages/drafts`),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching scheduled messages
 */
export function useScheduledMessages() {
  const { churchId } = useAuth();

  return useQuery<Message[]>({
    queryKey: communicationKeys.scheduled(churchId!),
    queryFn: () =>
      api.get<Message[]>(
        `/church/${churchId}/communications/messages/scheduled`
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching communication statistics
 */
export function useCommunicationStats(params?: StatsParams) {
  const { churchId } = useAuth();

  return useQuery<CommunicationStats>({
    queryKey: communicationKeys.stats(churchId!, params),
    queryFn: () =>
      api.get<CommunicationStats>(
        `/church/${churchId}/communications/stats`,
        {
          startDate: params?.startDate,
          endDate: params?.endDate,
          type: params?.type,
        }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for getting recipient count based on filter
 */
export function useRecipientCount(filter: RecipientFilter) {
  const { churchId } = useAuth();

  return useQuery<{ count: number; sample: { id: string; name: string; email?: string }[] }>({
    queryKey: communicationKeys.recipientCount(churchId!, filter),
    queryFn: () =>
      api.post<{ count: number; sample: { id: string; name: string; email?: string }[] }>(
        `/church/${churchId}/communications/recipient-count`,
        filter
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for sending a message (email/sms/push)
 */
export function useSendMessage() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SendMessageInput>({
    mutationFn: (data) =>
      api.post<Message>(`/church/${churchId}/communications/send`, data),
    onSuccess: (newMessage) => {
      // Invalidate message lists
      queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(churchId!),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: communicationKeys.stats(churchId!),
      });

      // Add to cache
      queryClient.setQueryData(
        communicationKeys.message(churchId!, newMessage.id),
        newMessage
      );
    },
  });
}

/**
 * Hook for saving a message as draft
 */
export function useSaveDraft() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, MessageCreateInput>({
    mutationFn: (data) =>
      api.post<Message>(`/church/${churchId}/communications/drafts`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.drafts(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a draft
 */
export function useUpdateDraft() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    Message,
    Error,
    { messageId: string; data: Partial<MessageCreateInput> }
  >({
    mutationFn: ({ messageId, data }) =>
      api.patch<Message>(
        `/church/${churchId}/communications/drafts/${messageId}`,
        data
      ),
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.message(churchId!, messageId),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.drafts(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a draft
 */
export function useDeleteDraft() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (messageId) =>
      api.delete<void>(
        `/church/${churchId}/communications/drafts/${messageId}`
      ),
    onSuccess: (_, messageId) => {
      queryClient.removeQueries({
        queryKey: communicationKeys.message(churchId!, messageId),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.drafts(churchId!),
      });
    },
  });
}

/**
 * Hook for scheduling a message
 */
export function useScheduleMessage() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, MessageCreateInput & { scheduledFor: string }>({
    mutationFn: (data) =>
      api.post<Message>(`/church/${churchId}/communications/schedule`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.scheduled(churchId!),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.drafts(churchId!),
      });
    },
  });
}

/**
 * Hook for cancelling a scheduled message
 */
export function useCancelScheduledMessage() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (messageId) =>
      api.post<void>(
        `/church/${churchId}/communications/messages/${messageId}/cancel`
      ),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.message(churchId!, messageId),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.scheduled(churchId!),
      });
    },
  });
}

/**
 * Hook for previewing a message
 */
export function usePreviewMessage() {
  const { churchId } = useAuth();

  return useMutation<MessagePreview, Error, PreviewMessageInput>({
    mutationFn: (data) =>
      api.post<MessagePreview>(
        `/church/${churchId}/communications/preview`,
        data
      ),
  });
}

/**
 * Hook for sending a test message
 */
export function useSendTestMessage() {
  const { churchId } = useAuth();

  return useMutation<
    void,
    Error,
    { type: MessageType; subject: string; body: string; recipients: string[] }
  >({
    mutationFn: (data) =>
      api.post<void>(`/church/${churchId}/communications/test`, data),
  });
}

/**
 * Hook for fetching message templates
 */
export function useMessageTemplates(type?: MessageType) {
  const { churchId } = useAuth();

  return useQuery<MessageTemplate[]>({
    queryKey: communicationKeys.templates(churchId!),
    queryFn: () =>
      api.get<MessageTemplate[]>(
        `/church/${churchId}/communications/templates`,
        { type }
      ),
    enabled: Boolean(churchId),
  });
}

/**
 * Hook for fetching a single template
 */
export function useMessageTemplate(templateId: string | undefined) {
  const { churchId } = useAuth();

  return useQuery<MessageTemplate>({
    queryKey: communicationKeys.template(churchId!, templateId!),
    queryFn: () =>
      api.get<MessageTemplate>(
        `/church/${churchId}/communications/templates/${templateId}`
      ),
    enabled: Boolean(churchId) && Boolean(templateId),
  });
}

/**
 * Hook for creating a message template
 */
export function useCreateTemplate() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MessageTemplate, Error, MessageTemplateCreateInput>({
    mutationFn: (data) =>
      api.post<MessageTemplate>(
        `/church/${churchId}/communications/templates`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(churchId!),
      });
    },
  });
}

/**
 * Hook for updating a template
 */
export function useUpdateTemplate() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    MessageTemplate,
    Error,
    { templateId: string; data: Partial<MessageTemplateCreateInput> }
  >({
    mutationFn: ({ templateId, data }) =>
      api.patch<MessageTemplate>(
        `/church/${churchId}/communications/templates/${templateId}`,
        data
      ),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.template(churchId!, templateId),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(churchId!),
      });
    },
  });
}

/**
 * Hook for deleting a template
 */
export function useDeleteTemplate() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (templateId) =>
      api.delete<void>(
        `/church/${churchId}/communications/templates/${templateId}`
      ),
    onSuccess: (_, templateId) => {
      queryClient.removeQueries({
        queryKey: communicationKeys.template(churchId!, templateId),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(churchId!),
      });
    },
  });
}

/**
 * Hook for duplicating a template
 */
export function useDuplicateTemplate() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MessageTemplate, Error, { templateId: string; name: string }>({
    mutationFn: ({ templateId, name }) =>
      api.post<MessageTemplate>(
        `/church/${churchId}/communications/templates/${templateId}/duplicate`,
        { name }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(churchId!),
      });
    },
  });
}

/**
 * Hook for resending a failed message
 */
export function useResendMessage() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Message, Error, string>({
    mutationFn: (messageId) =>
      api.post<Message>(
        `/church/${churchId}/communications/messages/${messageId}/resend`
      ),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.message(churchId!, messageId),
      });
      queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(churchId!),
      });
    },
  });
}

/**
 * Hook for getting available template variables
 */
export function useTemplateVariables() {
  const { churchId } = useAuth();

  return useQuery<{ name: string; description: string; example: string }[]>({
    queryKey: ['templateVariables'],
    queryFn: () =>
      api.get<{ name: string; description: string; example: string }[]>(
        `/church/${churchId}/communications/template-variables`
      ),
    enabled: Boolean(churchId),
    staleTime: 1000 * 60 * 60, // 1 hour - variables don't change often
  });
}

/**
 * Combined hook for Communications page - provides messages, templates, and send functionality
 */
export function useCommunications() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages
  const messagesQuery = useQuery<Message[]>({
    queryKey: ['communications', churchId, 'all-messages'],
    queryFn: () => api.get<Message[]>(`/church/${churchId}/communications/messages/recent`),
    enabled: Boolean(churchId),
  });

  // Fetch templates
  const templatesQuery = useQuery<MessageTemplate[]>({
    queryKey: communicationKeys.templates(churchId!),
    queryFn: () => api.get<MessageTemplate[]>(`/church/${churchId}/communications/templates`),
    enabled: Boolean(churchId),
  });

  // Send message mutation
  const sendMutation = useMutation<Message, Error, {
    type: MessageType;
    recipients: string;
    subject: string;
    content: string;
    scheduleForLater?: boolean;
  }>({
    mutationFn: (data) =>
      api.post<Message>(`/church/${churchId}/communications/send`, {
        type: data.type,
        recipientFilter: { group: data.recipients },
        subject: data.subject,
        body: data.content,
        scheduledFor: data.scheduleForLater ? new Date(Date.now() + 86400000).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['communications', churchId],
      });
    },
  });

  return {
    data: {
      messages: messagesQuery.data ?? [],
      templates: templatesQuery.data ?? [],
    },
    isLoading: messagesQuery.isLoading || templatesQuery.isLoading,
    error: messagesQuery.error || templatesQuery.error,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}

export default useMessages;

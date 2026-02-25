/**
 * Hooks Index - Export all hooks for convenient importing
 */

// Auth hooks
export {
  useAuth,
  useIsAuthenticated,
  useChurchId,
  useRequireAuth,
} from './useAuth';

// Members hooks
export {
  useMembers,
  useMember,
  useMemberSearch,
  useMemberStats,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  useBulkUpdateMembers,
  useFamilies,
  useFamily,
  useCreateFamily,
  useUpdateFamilyMembers,
  useImportMembers,
  useExportMembers,
  type MemberFilters,
} from './useMembers';

// Donations hooks
export {
  useDonations,
  useDonation,
  useDonationStats,
  useDonationDashboard,
  useDonorDetails,
  useRecordDonation,
  useUpdateDonation,
  useDeleteDonation,
  useRefundDonation,
  useRecurringDonations,
  useCancelRecurringDonation,
  useFunds,
  useFund,
  useCreateFund,
  useUpdateFund,
  useSendDonationReceipt,
  useGenerateGivingStatements,
  useImportDonations,
  type DonationFilters,
} from './useDonations';

// Events hooks
export {
  useEvents,
  useEvent,
  useUpcomingEvents,
  useCalendarEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useCancelEvent,
  useDuplicateEvent,
  useEventAttendees,
  useRegisterAttendee,
  useUpdateAttendeeStatus,
  useCheckInAttendee,
  useRemoveAttendee,
  useBulkCheckIn,
  useExportAttendees,
  useSendEventReminders,
  type EventFilters,
} from './useEvents';

// Volunteers hooks
export {
  useVolunteers,
  useVolunteer,
  useVolunteerStats,
  useCreateVolunteer,
  useUpdateVolunteer,
  useDeactivateVolunteer,
  useMinistryTeams,
  useMinistryTeam,
  useTeamMembers,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useAddToTeam,
  useRemoveFromTeam,
  useVolunteerAssignments,
  useVolunteerSchedule,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useConfirmAssignment,
  useLogVolunteerHours,
  useInitiateBackgroundCheck,
  type VolunteerFilters,
} from './useVolunteers';

// Communications hooks
export {
  useMessages,
  useMessage,
  useDraftMessages,
  useScheduledMessages,
  useCommunicationStats,
  useRecipientCount,
  useSendMessage,
  useSaveDraft,
  useUpdateDraft,
  useDeleteDraft,
  useScheduleMessage,
  useCancelScheduledMessage,
  usePreviewMessage,
  useSendTestMessage,
  useMessageTemplates,
  useMessageTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useResendMessage,
  useTemplateVariables,
  type MessageFilters,
} from './useCommunications';

// Reports hooks
export {
  useReports,
  useSavedReports,
  useAttendanceReport,
  useGivingReportLegacy,
  useDashboardStats,
  useAttendanceStats,
  useAttendanceComparison,
  useGivingReport,
  useGivingComparison,
  useGivingByFund,
  useMembershipStats,
  useMembershipGrowth,
  useMinistryReports,
  useVolunteerHoursReport,
  useFirstTimeVisitorReport,
  useGenerateCustomReport,
  useExportReport,
  useScheduleReport,
  useScheduledReports,
  useDeleteScheduledReport,
  useReportPresets,
  useSaveReportPreset,
  useMetricComparison,
} from './useReports';

// Discipleship hooks
export {
  useDiscipleship,
  useDiscipleshipPlans,
  useDiscipleshipPlan,
  useCreateDiscipleshipPlan,
  useUpdateDiscipleshipPlan,
  useDeleteDiscipleshipPlan,
  useCreateDiscipleshipLesson,
  useUpdateDiscipleshipLesson,
  useDeleteDiscipleshipLesson,
  useDiscipleshipProgress,
  useEnrollInPlan,
  useUpdateDiscipleshipProgress,
  useDiscipleshipGroups,
  useCreateDiscipleshipGroup,
  useUpdateDiscipleshipGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useDiscipleshipStats,
  type DiscipleshipPlan,
  type DiscipleshipLesson,
  type DiscipleProgress,
  type SmallGroup,
  type DiscipleshipStats,
  type DiscipleshipFilters,
} from './useDiscipleship';

// Settings hooks
export {
  useSettings,
  useChurchInfo,
  useUpdateChurchInfo,
  useUserPreferences,
  useUpdateUserPreferences,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useSecuritySettings,
  useEnableTwoFactor,
  useConfirmTwoFactor,
  useDisableTwoFactor,
  useChangePassword,
  useRevokeSession,
  useRevokeAllSessions,
  useStaffMembers,
  useInviteStaff,
  useUpdateStaffMember,
  useRemoveStaff,
  useExportData,
  useImportData,
  type ChurchInfo,
  type UserPreferences,
  type NotificationSettings as SettingsNotificationSettings,
  type SecuritySettings,
  type SessionInfo,
  type StaffMember,
} from './useSettings';

// Dashboard hooks
export { useDashboard } from './useDashboard';

// Toast hooks
export { useToast, useToastState, type Toast, type ToastOptions } from './use-toast';

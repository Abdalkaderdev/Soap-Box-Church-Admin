/**
 * Shared TypeScript types for Church Admin App
 */

// User and Auth types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
  churchId: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'pastor' | 'staff' | 'volunteer' | 'member';

export interface Church {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  settings: ChurchSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ChurchSettings {
  allowOnlineDonations: boolean;
  allowEventRegistration: boolean;
  allowVolunteerSignup: boolean;
  defaultCurrency: string;
  fiscalYearStart: number; // Month (1-12)
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Member types
export interface Member {
  id: string;
  churchId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  membershipStatus: MembershipStatus;
  memberSince?: string;
  familyId?: string;
  photoUrl?: string;
  notes?: string;
  tags: string[];
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'active' | 'inactive' | 'pending' | 'visitor' | 'former';

export interface MemberCreateInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: Address;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  membershipStatus?: MembershipStatus;
  memberSince?: string;
  familyId?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface MemberUpdateInput extends Partial<MemberCreateInput> {
  photoUrl?: string;
}

export interface Family {
  id: string;
  churchId: string;
  name: string;
  members: Member[];
  primaryContactId?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

// Donation types
export interface Donation {
  id: string;
  churchId: string;
  memberId?: string;
  member?: Member;
  amount: number;
  currency: string;
  date: string;
  method: DonationMethod;
  fund: string;
  fundId?: string;
  status: DonationStatus;
  isRecurring: boolean;
  recurringId?: string;
  transactionId?: string;
  notes?: string;
  isAnonymous: boolean;
  receiptSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DonationMethod = 'cash' | 'check' | 'card' | 'ach' | 'online' | 'other';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface DonationCreateInput {
  memberId?: string;
  amount: number;
  currency?: string;
  date: string;
  method: DonationMethod;
  fund: string;
  fundId?: string;
  notes?: string;
  isAnonymous?: boolean;
  isRecurring?: boolean;
}

export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  byFund: Record<string, { amount: number; count: number }>;
  byMethod: Record<DonationMethod, { amount: number; count: number }>;
  trend: { date: string; amount: number; count: number }[];
}

export interface DonorDetails {
  memberId: string;
  member: Member;
  totalDonations: number;
  totalAmount: number;
  firstDonationDate: string;
  lastDonationDate: string;
  averageAmount: number;
  donations: Donation[];
  recurringDonations: RecurringDonation[];
}

export interface RecurringDonation {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  fund: string;
  method: DonationMethod;
  startDate: string;
  endDate?: string;
  nextDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Fund {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  goal?: number;
  currentAmount: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event types
export interface Event {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  location?: string;
  address?: Address;
  startDate: string;
  endDate: string;
  allDay: boolean;
  recurrence?: EventRecurrence;
  category: EventCategory;
  isPublic: boolean;
  requiresRegistration: boolean;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
  ministryId?: string;
  createdBy: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory = 'worship' | 'youth' | 'children' | 'small_group' | 'outreach' | 'fellowship' | 'training' | 'meeting' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  occurrences?: number;
}

export interface EventCreateInput {
  title: string;
  description?: string;
  location?: string;
  address?: Address;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  recurrence?: EventRecurrence;
  category: EventCategory;
  isPublic?: boolean;
  requiresRegistration?: boolean;
  maxAttendees?: number;
  imageUrl?: string;
  ministryId?: string;
  status?: EventStatus;
}

export interface EventUpdateInput extends Partial<EventCreateInput> {}

export interface Attendee {
  id: string;
  eventId: string;
  memberId?: string;
  member?: Member;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: AttendeeStatus;
  checkInTime?: string;
  notes?: string;
  registeredAt: string;
}

export type AttendeeStatus = 'registered' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled';

// Volunteer types
export interface Volunteer {
  id: string;
  churchId: string;
  memberId: string;
  member: Member;
  status: VolunteerStatus;
  skills: string[];
  availability: VolunteerAvailability;
  backgroundCheckStatus?: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  trainingCompleted: string[];
  teams: MinistryTeam[];
  totalHours: number;
  createdAt: string;
  updatedAt: string;
}

export type VolunteerStatus = 'active' | 'inactive' | 'pending' | 'on_leave';
export type BackgroundCheckStatus = 'not_started' | 'pending' | 'approved' | 'denied' | 'expired';

export interface VolunteerAvailability {
  sunday: string[];
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
}

export interface MinistryTeam {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  ministryId?: string;
  leaderId?: string;
  leader?: Member;
  memberCount: number;
  isActive: boolean;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  volunteer?: Volunteer;
  teamId: string;
  team?: MinistryTeam;
  eventId?: string;
  event?: Event;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AssignmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssignmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface VolunteerCreateInput {
  memberId: string;
  skills?: string[];
  availability?: VolunteerAvailability;
  teamIds?: string[];
}

export interface VolunteerUpdateInput {
  status?: VolunteerStatus;
  skills?: string[];
  availability?: VolunteerAvailability;
  backgroundCheckStatus?: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  trainingCompleted?: string[];
}

// Communication types
export interface Message {
  id: string;
  churchId: string;
  type: MessageType;
  subject: string;
  body: string;
  templateId?: string;
  senderId: string;
  sender?: User;
  recipients: MessageRecipient[];
  recipientCount: number;
  status: MessageStatus;
  scheduledFor?: string;
  sentAt?: string;
  stats?: MessageStats;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'email' | 'sms' | 'push';
export type MessageStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';

export interface MessageRecipient {
  id: string;
  memberId?: string;
  member?: Member;
  email?: string;
  phone?: string;
  status: RecipientStatus;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface MessageStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

export interface MessageCreateInput {
  type: MessageType;
  subject: string;
  body: string;
  templateId?: string;
  recipientIds?: string[];
  recipientFilter?: RecipientFilter;
  scheduledFor?: string;
  sendImmediately?: boolean;
}

export interface RecipientFilter {
  membershipStatus?: MembershipStatus[];
  tags?: string[];
  ministryTeams?: string[];
  ageRange?: { min?: number; max?: number };
  gender?: string[];
}

export interface MessageTemplate {
  id: string;
  churchId: string;
  name: string;
  type: MessageType;
  subject: string;
  body: string;
  category?: TemplateCategory;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 'welcome' | 'event' | 'newsletter' | 'reminder' | 'follow-up' | 'announcement' | 'thank-you' | 'general';

export interface MessageTemplateCreateInput {
  name: string;
  type: MessageType;
  subject: string;
  body: string;
  category?: TemplateCategory;
}

// Reports types
export interface AttendanceStats {
  period: string;
  totalEvents: number;
  totalAttendance: number;
  averageAttendance: number;
  byCategory: Record<EventCategory, {
    events: number;
    totalAttendance: number;
    averageAttendance: number;
  }>;
  trend: { date: string; attendance: number; events: number }[];
  topEvents: { event: Event; attendance: number }[];
}

export interface GivingReport {
  period: string;
  totalAmount: number;
  totalDonations: number;
  totalDonors: number;
  averageDonation: number;
  newDonors: number;
  recurringAmount: number;
  byFund: { fund: Fund; amount: number; percentage: number }[];
  byMethod: Record<DonationMethod, { amount: number; count: number }>;
  trend: { date: string; amount: number; count: number }[];
  topDonors?: { member: Member; totalAmount: number }[];
  yearOverYearGrowth?: number;
}

export interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  formerMembers: number;
  byStatus: Record<MembershipStatus, number>;
  byAge: Record<string, number>;
  byGender: Record<string, number>;
  growthTrend: { date: string; total: number; new: number; left: number }[];
  retentionRate: number;
}

export interface DashboardStats {
  membership: {
    total: number;
    active: number;
    newThisMonth: number;
    growthPercentage: number;
  };
  giving: {
    thisMonth: number;
    lastMonth: number;
    yearToDate: number;
    growthPercentage: number;
  };
  attendance: {
    lastWeek: number;
    averageAttendance: number;
    growthPercentage: number;
  };
  volunteers: {
    total: number;
    active: number;
    hoursThisMonth: number;
  };
  upcomingEvents: Event[];
  recentDonations: Donation[];
}

// Report query parameters
export interface ReportParams {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

// ============================================================================
// SERMON PREP TYPES
// ============================================================================

export interface SermonSeries {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  sermonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sermon {
  id: string;
  churchId: string;
  seriesId?: string;
  series?: SermonSeries;
  title: string;
  scriptureReferences: string[];
  description?: string;
  notes?: string;
  outline?: SermonOutlineItem[];
  speaker?: string;
  speakerId?: string;
  scheduledDate?: string;
  duration?: number;
  videoUrl?: string;
  audioUrl?: string;
  slidesUrl?: string;
  status: 'draft' | 'review' | 'approved' | 'delivered' | 'archived';
  collaborators?: SermonCollaborator[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SermonOutlineItem {
  id: string;
  title: string;
  content?: string;
  scripture?: string;
  orderIndex: number;
  children?: SermonOutlineItem[];
}

export interface SermonCollaborator {
  id: string;
  sermonId: string;
  userId: string;
  user?: User;
  role: 'author' | 'reviewer' | 'contributor';
  canEdit: boolean;
  addedAt: string;
}

export interface SermonResource {
  id: string;
  sermonId: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'link';
  title: string;
  url: string;
  description?: string;
  orderIndex: number;
  createdAt: string;
}

export interface SermonFeedback {
  id: string;
  sermonId: string;
  memberId?: string;
  memberName?: string;
  rating?: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface SermonCreateInput {
  seriesId?: string;
  title: string;
  scriptureReferences?: string[];
  description?: string;
  notes?: string;
  outline?: SermonOutlineItem[];
  speaker?: string;
  speakerId?: string;
  scheduledDate?: string;
  duration?: number;
  tags?: string[];
  status?: Sermon['status'];
}

export interface SermonUpdateInput extends Partial<SermonCreateInput> {
  videoUrl?: string;
  audioUrl?: string;
  slidesUrl?: string;
}

// ============================================================================
// PRAYER REQUEST TYPES
// ============================================================================

export interface PrayerRequest {
  id: string;
  churchId: string;
  memberId?: string;
  member?: Member;
  submitterName?: string;
  submitterEmail?: string;
  title: string;
  description: string;
  category: PrayerCategory;
  isAnonymous: boolean;
  isPrivate: boolean;
  isUrgent: boolean;
  status: PrayerStatus;
  prayerCount: number;
  followUps?: PrayerFollowUp[];
  prayedBy?: string[];
  expiresAt?: string;
  answeredAt?: string;
  answeredNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type PrayerCategory = 'health' | 'family' | 'finances' | 'spiritual' | 'relationships' | 'work' | 'grief' | 'thanksgiving' | 'other';
export type PrayerStatus = 'active' | 'answered' | 'ongoing' | 'closed';

export interface PrayerFollowUp {
  id: string;
  prayerRequestId: string;
  userId?: string;
  userName?: string;
  content: string;
  isUpdate: boolean;
  createdAt: string;
}

export interface PrayerCreateInput {
  title: string;
  description: string;
  category: PrayerCategory;
  isAnonymous?: boolean;
  isPrivate?: boolean;
  isUrgent?: boolean;
  memberId?: string;
  submitterName?: string;
  submitterEmail?: string;
  expiresAt?: string;
}

export interface PrayerUpdateInput {
  title?: string;
  description?: string;
  category?: PrayerCategory;
  isPrivate?: boolean;
  isUrgent?: boolean;
  status?: PrayerStatus;
  answeredNote?: string;
}

// ============================================================================
// SMALL GROUPS TYPES
// ============================================================================

export interface SmallGroup {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  category: SmallGroupCategory;
  leaderId?: string;
  leader?: Member;
  coLeaderId?: string;
  coLeader?: Member;
  members: SmallGroupMember[];
  memberCount: number;
  maxMembers?: number;
  meetingDay?: string;
  meetingTime?: string;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
  meetingLocation?: string;
  meetingType: 'in_person' | 'online' | 'hybrid';
  virtualMeetingUrl?: string;
  imageUrl?: string;
  status: 'forming' | 'active' | 'full' | 'paused' | 'closed';
  isPublic: boolean;
  requiresApproval: boolean;
  currentStudy?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type SmallGroupCategory = 'bible_study' | 'fellowship' | 'mens' | 'womens' | 'young_adults' | 'couples' | 'parents' | 'seniors' | 'recovery' | 'other';

export interface SmallGroupMember {
  id: string;
  groupId: string;
  memberId: string;
  member?: Member;
  role: 'leader' | 'co_leader' | 'member' | 'apprentice';
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface SmallGroupMeeting {
  id: string;
  groupId: string;
  title?: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  topic?: string;
  notes?: string;
  attendance: SmallGroupAttendance[];
  attendanceCount: number;
  createdAt: string;
}

export interface SmallGroupAttendance {
  id: string;
  meetingId: string;
  memberId: string;
  member?: Member;
  isPresent: boolean;
  checkedInAt?: string;
}

export interface SmallGroupJoinRequest {
  id: string;
  groupId: string;
  memberId: string;
  member?: Member;
  message?: string;
  status: 'pending' | 'approved' | 'denied';
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface SmallGroupCreateInput {
  name: string;
  description?: string;
  category: SmallGroupCategory;
  leaderId?: string;
  coLeaderId?: string;
  maxMembers?: number;
  meetingDay?: string;
  meetingTime?: string;
  meetingFrequency?: 'weekly' | 'biweekly' | 'monthly';
  meetingLocation?: string;
  meetingType?: 'in_person' | 'online' | 'hybrid';
  virtualMeetingUrl?: string;
  isPublic?: boolean;
  requiresApproval?: boolean;
  tags?: string[];
}

export interface SmallGroupUpdateInput extends Partial<SmallGroupCreateInput> {
  status?: SmallGroup['status'];
  currentStudy?: string;
  imageUrl?: string;
}

// ============================================================================
// CHECK-IN SYSTEM TYPES
// ============================================================================

export interface Service {
  id: string;
  churchId: string;
  name: string;
  serviceType: 'sunday_worship' | 'wednesday_service' | 'special_event' | 'youth_service' | 'kids_church' | 'other';
  scheduledDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  totalCheckIns: number;
  totalChildCheckIns: number;
  isCheckInOpen: boolean;
  checkInStartTime?: string;
  checkInEndTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCheckIn {
  id: string;
  serviceId: string;
  memberId?: string;
  member?: Member;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  isGuest: boolean;
  isFirstTime: boolean;
  checkInTime: string;
  checkOutTime?: string;
  kioskId?: string;
  notes?: string;
  children?: ChildCheckIn[];
}

export interface ChildCheckIn {
  id: string;
  serviceCheckInId: string;
  serviceId: string;
  childId?: string;
  childName: string;
  dateOfBirth?: string;
  age?: number;
  parentName: string;
  parentPhone: string;
  parentId?: string;
  classroomAssignment?: string;
  securityCode: string;
  allergies?: string;
  specialNotes?: string;
  checkInTime: string;
  checkOutTime?: string;
  checkedOutBy?: string;
  status: 'checked_in' | 'checked_out' | 'waiting_pickup';
}

export interface CheckInKiosk {
  id: string;
  churchId: string;
  name: string;
  location: string;
  type: 'general' | 'children' | 'volunteer';
  deviceId?: string;
  lastActiveAt?: string;
  isActive: boolean;
  settings: {
    allowGuestCheckIn: boolean;
    allowChildCheckIn: boolean;
    requirePhone: boolean;
    printLabels: boolean;
    defaultServiceId?: string;
  };
  createdAt: string;
}

export interface CheckInFilters {
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  isGuest?: boolean;
  isFirstTime?: boolean;
  search?: string;
  // Pagination params
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CheckInStats {
  totalCheckIns: number;
  totalGuests: number;
  totalFirstTimers: number;
  totalChildren: number;
  averageCheckInTime: string;
  peakCheckInTime: string;
  byService: { service: Service; count: number }[];
  trend: { date: string; checkIns: number; guests: number }[];
}

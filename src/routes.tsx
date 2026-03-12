/* eslint-disable react-refresh/only-export-components */
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";

// Lazy load all page components for better code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MembersList = lazy(() => import("./pages/members/MembersList"));
const MemberDetails = lazy(() => import("./pages/members/MemberDetails"));
const AddMember = lazy(() => import("./pages/members/AddMember"));
const DonationsDashboard = lazy(() => import("./pages/donations/DonationsDashboard"));
const DonationsList = lazy(() => import("./pages/donations/DonationsList"));
const DonationsManagement = lazy(() => import("./pages/donations/DonationsManagement"));
const RecordDonation = lazy(() => import("./pages/donations/RecordDonation"));
const DonorDetails = lazy(() => import("./pages/donations/DonorDetails"));
const EventsList = lazy(() => import("./pages/events/EventsList"));
const Communications = lazy(() => import("./pages/communications/Communications"));
const Volunteers = lazy(() => import("./pages/volunteers/Volunteers"));
const Discipleship = lazy(() => import("./pages/discipleship/Discipleship"));
const SmallGroups = lazy(() => import("./pages/groups/SmallGroups"));
const SermonPrep = lazy(() => import("./pages/sermons/SermonPrep"));
const PrayerRequests = lazy(() => import("./pages/prayer/PrayerRequests"));
const Reports = lazy(() => import("./pages/reports/Reports"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const CheckIn = lazy(() => import("./pages/checkin/CheckIn"));
const Attendance = lazy(() => import("./pages/attendance/Attendance"));
const Visitors = lazy(() => import("./pages/visitors/Visitors"));
const GivingStatements = lazy(() => import("./pages/statements/GivingStatements"));

// Admin pages
const JobsManagement = lazy(() => import("./pages/admin/JobsManagement"));
const ReadingPlansAdmin = lazy(() => import("./pages/reading-plans/ReadingPlansAdmin"));
const DevotionalsAdmin = lazy(() => import("./pages/devotionals/DevotionalsAdmin"));
const SpiritualDashboard = lazy(() => import("./pages/spiritual/SpiritualDashboard"));
const GamificationAdmin = lazy(() => import("./pages/gamification/GamificationAdmin"));

// Ministry Admin pages
const MinistryAdminEvents = lazy(() => import("./pages/ministry/MinistryAdminEvents"));
const MinistryAdminGroups = lazy(() => import("./pages/ministry/MinistryAdminGroups"));
const MinistryAdminModeration = lazy(() => import("./pages/ministry/MinistryAdminModeration"));
const MinistryAdminPrayer = lazy(() => import("./pages/ministry/MinistryAdminPrayer"));
const MinistryAdminReports = lazy(() => import("./pages/ministry/MinistryAdminReports"));
const MinistryAdminResources = lazy(() => import("./pages/ministry/MinistryAdminResources"));
const MinistryAdminSettings = lazy(() => import("./pages/ministry/MinistryAdminSettings"));
const MinistryAdminVolunteers = lazy(() => import("./pages/ministry/MinistryAdminVolunteers"));

// Group Admin pages
const GroupAdminMembers = lazy(() => import("./pages/group-admin/GroupAdminMembers"));
const GroupAdminModeration = lazy(() => import("./pages/group-admin/GroupAdminModeration"));
const GroupAdminResources = lazy(() => import("./pages/group-admin/GroupAdminResources"));
const GroupAdminSettings = lazy(() => import("./pages/group-admin/GroupAdminSettings"));

// Management pages
const MemberManagement = lazy(() => import("./pages/management/member-management"));
const VolunteerManagement = lazy(() => import("./pages/management/volunteer-management"));
const StaffManagement = lazy(() => import("./pages/management/staff-management"));
const MediaManagement = lazy(() => import("./pages/management/media-management"));
const BackgroundCheckManagement = lazy(() => import("./pages/management/background-check-management"));

// Analytics pages
const AdminAnalytics = lazy(() => import("./pages/analytics/AdminAnalytics"));
const AnalyticsDashboard = lazy(() => import("./pages/analytics/analytics-dashboard"));
const EngagementAnalytics = lazy(() => import("./pages/analytics/EngagementAnalytics"));

// Content & Tools pages
const BulkCommunication = lazy(() => import("./pages/content/BulkCommunication"));
const ContentDistribution = lazy(() => import("./pages/content/ContentDistributionPage"));
const CommunityAdmin = lazy(() => import("./pages/content/CommunityAdmin"));
const MinistryModeration = lazy(() => import("./pages/moderation/ministry-moderation"));
const GroupModeration = lazy(() => import("./pages/moderation/group-moderation"));
const SermonStudio = lazy(() => import("./pages/tools/SermonStudioPage"));
const QRManagement = lazy(() => import("./pages/tools/qr-management"));
const TaxReporting = lazy(() => import("./pages/tools/TaxReporting"));

// Organization Structure pages
const MinistriesManagement = lazy(() => import("./pages/organization/MinistriesManagement"));
const DepartmentsManagement = lazy(() => import("./pages/organization/DepartmentsManagement"));
const TeamsManagement = lazy(() => import("./pages/organization/TeamsManagement"));
const RolesPermissions = lazy(() => import("./pages/organization/RolesPermissions"));
const ServiceAllocation = lazy(() => import("./pages/organization/ServiceAllocation"));

// Equipment Management
const EquipmentManagement = lazy(() => import("./pages/equipment/EquipmentManagement"));

// Financial Dashboard (promoted from upcoming to main feature)
const FinancialDashboard = lazy(() => import("./pages/upcoming/FinancialDashboard"));

// Upcoming feature placeholders
const ChildCheckin = lazy(() => import("./pages/upcoming/ChildCheckin"));
const FacilityBooking = lazy(() => import("./pages/upcoming/FacilityBooking"));
const VolunteerScheduling = lazy(() => import("./pages/upcoming/VolunteerScheduling"));
const OnlineClasses = lazy(() => import("./pages/upcoming/OnlineClasses"));
const PastoralCare = lazy(() => import("./pages/upcoming/PastoralCare"));
const BackgroundChecks = lazy(() => import("./pages/upcoming/BackgroundChecks"));
const MultiCampus = lazy(() => import("./pages/upcoming/MultiCampus"));
const MemberDirectory = lazy(() => import("./pages/upcoming/MemberDirectory"));
const PledgeTracking = lazy(() => import("./pages/upcoming/PledgeTracking"));
const Announcements = lazy(() => import("./pages/upcoming/Announcements"));

const Login = lazy(() => import("./pages/auth/Login"));
const Landing = lazy(() => import("./pages/Landing"));
const Features = lazy(() => import("./pages/Features"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Route definitions for use in navigation and other components
export const routes = {
  landing: "/",
  features: "/features",
  about: "/about",
  contact: "/contact",
  helpCenter: "/help",
  privacy: "/privacy",
  terms: "/terms",
  dashboard: "/dashboard",
  members: {
    list: "/members",
    details: "/members/:id",
    new: "/members/new",
  },
  donations: {
    dashboard: "/donations",
    list: "/donations/list",
    management: "/donations/management",
    new: "/donations/new",
    donor: "/donations/donor/:id",
  },
  events: "/events",
  checkin: "/checkin",
  attendance: "/attendance",
  visitors: "/visitors",
  statements: "/statements",
  jobs: "/jobs",
  readingPlansAdmin: "/reading-plans-admin",
  devotionalsAdmin: "/devotionals-admin",
  spiritualDashboard: "/spiritual-dashboard",
  gamificationAdmin: "/gamification-admin",
  communications: "/communications",
  volunteers: "/volunteers",
  discipleship: "/discipleship",
  groups: "/groups",
  sermons: "/sermons",
  prayer: "/prayer",
  reports: "/reports",
  financialDashboard: "/financial-dashboard",
  settings: "/settings",
  login: "/login",
  // Upcoming features
  upcoming: {
    childCheckin: "/upcoming/child-checkin",
    facilityBooking: "/upcoming/facility-booking",
    volunteerScheduling: "/upcoming/volunteer-scheduling",
    onlineClasses: "/upcoming/online-classes",
    pastoralCare: "/upcoming/pastoral-care",
    backgroundChecks: "/upcoming/background-checks",
    multiCampus: "/upcoming/multi-campus",
    memberDirectory: "/upcoming/member-directory",
    pledgeTracking: "/upcoming/pledge-tracking",
    announcements: "/upcoming/announcements",
  },
  // Ministry Admin
  ministry: {
    events: "/ministry/events",
    groups: "/ministry/groups",
    moderation: "/ministry/moderation",
    prayer: "/ministry/prayer",
    reports: "/ministry/reports",
    resources: "/ministry/resources",
    settings: "/ministry/settings",
    volunteers: "/ministry/volunteers",
  },
  // Group Admin
  groupAdmin: {
    members: "/group-admin/members",
    moderation: "/group-admin/moderation",
    resources: "/group-admin/resources",
    settings: "/group-admin/settings",
  },
  // Management
  management: {
    members: "/management/members",
    volunteers: "/management/volunteers",
    staff: "/management/staff",
    media: "/management/media",
    backgroundChecks: "/management/background-checks",
  },
  // Analytics
  analytics: {
    main: "/analytics",
    dashboard: "/analytics/dashboard",
    engagement: "/analytics/engagement",
  },
  // Content & Tools
  content: {
    bulkCommunication: "/content/bulk-communication",
    distribution: "/content/distribution",
    communityAdmin: "/content/community-admin",
  },
  moderation: {
    ministry: "/moderation/ministry",
    groups: "/moderation/groups",
  },
  tools: {
    sermonStudio: "/tools/sermon-studio",
    qrManagement: "/tools/qr-management",
    taxReporting: "/tools/tax-reporting",
  },
  // Organization Structure
  organization: {
    ministries: "/organization/ministries",
    departments: "/organization/departments",
    teams: "/organization/teams",
    roles: "/organization/roles",
    serviceAllocation: "/organization/service-allocation",
  },
  // Equipment & Assets
  equipment: "/equipment",
} as const;

// Helper function to generate member details URL
export function getMemberDetailsUrl(id: string | number): string {
  return `/members/${id}`;
}

// Helper function to generate donor details URL
export function getDonorDetailsUrl(id: string | number): string {
  return `/donations/donor/${id}`;
}

// Main routes component
export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Landing Page */}
        <Route path="/" component={Landing} />

        {/* Features */}
        <Route path="/features" component={Features} />

        {/* About */}
        <Route path="/about" component={AboutUs} />

        {/* Contact */}
        <Route path="/contact" component={Contact} />

        {/* Help Center */}
        <Route path="/help" component={HelpCenter} />

        {/* Privacy */}
        <Route path="/privacy" component={Privacy} />

        {/* Terms */}
        <Route path="/terms" component={Terms} />

        {/* Dashboard */}
        <Route path="/dashboard" component={Dashboard} />

        {/* Members - order matters: /new before /:id */}
        <Route path="/members/new" component={AddMember} />
        <Route path="/members/:id" component={MemberDetails} />
        <Route path="/members" component={MembersList} />

        {/* Donations */}
        <Route path="/donations/donor/:id" component={DonorDetails} />
        <Route path="/donations/management" component={DonationsManagement} />
        <Route path="/donations/list" component={DonationsList} />
        <Route path="/donations/new" component={RecordDonation} />
        <Route path="/donations" component={DonationsDashboard} />

        {/* Events */}
        <Route path="/events" component={EventsList} />

        {/* Check-in */}
        <Route path="/checkin" component={CheckIn} />

        {/* Attendance Tracking */}
        <Route path="/attendance" component={Attendance} />

        {/* First-Time Visitors */}
        <Route path="/visitors" component={Visitors} />

        {/* Giving Statements */}
        <Route path="/statements" component={GivingStatements} />

        {/* Jobs Management */}
        <Route path="/jobs" component={JobsManagement} />

        {/* Reading Plans Admin */}
        <Route path="/reading-plans-admin" component={ReadingPlansAdmin} />

        {/* Devotionals Admin */}
        <Route path="/devotionals-admin" component={DevotionalsAdmin} />

        {/* Spiritual Dashboard */}
        <Route path="/spiritual-dashboard" component={SpiritualDashboard} />

        {/* Gamification Admin */}
        <Route path="/gamification-admin" component={GamificationAdmin} />

        {/* Communications */}
        <Route path="/communications" component={Communications} />

        {/* Volunteers */}
        <Route path="/volunteers" component={Volunteers} />

        {/* Discipleship */}
        <Route path="/discipleship" component={Discipleship} />

        {/* Small Groups */}
        <Route path="/groups" component={SmallGroups} />

        {/* Sermon Prep */}
        <Route path="/sermons" component={SermonPrep} />

        {/* Prayer Requests */}
        <Route path="/prayer" component={PrayerRequests} />

        {/* Reports */}
        <Route path="/reports" component={Reports} />

        {/* Financial Dashboard */}
        <Route path="/financial-dashboard" component={FinancialDashboard} />

        {/* Settings */}
        <Route path="/settings" component={Settings} />

        {/* Auth */}
        <Route path="/login" component={Login} />

        {/* Upcoming Features (Coming Soon placeholders) */}
        <Route path="/upcoming/child-checkin" component={ChildCheckin} />
        <Route path="/upcoming/facility-booking" component={FacilityBooking} />
        <Route path="/upcoming/volunteer-scheduling" component={VolunteerScheduling} />
        <Route path="/upcoming/online-classes" component={OnlineClasses} />
        <Route path="/upcoming/pastoral-care" component={PastoralCare} />
        <Route path="/upcoming/background-checks" component={BackgroundChecks} />
        <Route path="/upcoming/multi-campus" component={MultiCampus} />
        <Route path="/upcoming/member-directory" component={MemberDirectory} />
        <Route path="/upcoming/pledge-tracking" component={PledgeTracking} />
        <Route path="/upcoming/announcements" component={Announcements} />

        {/* Ministry Admin */}
        <Route path="/ministry/events" component={MinistryAdminEvents} />
        <Route path="/ministry/groups" component={MinistryAdminGroups} />
        <Route path="/ministry/moderation" component={MinistryAdminModeration} />
        <Route path="/ministry/prayer" component={MinistryAdminPrayer} />
        <Route path="/ministry/reports" component={MinistryAdminReports} />
        <Route path="/ministry/resources" component={MinistryAdminResources} />
        <Route path="/ministry/settings" component={MinistryAdminSettings} />
        <Route path="/ministry/volunteers" component={MinistryAdminVolunteers} />

        {/* Group Admin */}
        <Route path="/group-admin/members" component={GroupAdminMembers} />
        <Route path="/group-admin/moderation" component={GroupAdminModeration} />
        <Route path="/group-admin/resources" component={GroupAdminResources} />
        <Route path="/group-admin/settings" component={GroupAdminSettings} />

        {/* Management */}
        <Route path="/management/members" component={MemberManagement} />
        <Route path="/management/volunteers" component={VolunteerManagement} />
        <Route path="/management/staff" component={StaffManagement} />
        <Route path="/management/media" component={MediaManagement} />
        <Route path="/management/background-checks" component={BackgroundCheckManagement} />

        {/* Analytics */}
        <Route path="/analytics/dashboard" component={AnalyticsDashboard} />
        <Route path="/analytics/engagement" component={EngagementAnalytics} />
        <Route path="/analytics" component={AdminAnalytics} />

        {/* Content */}
        <Route path="/content/bulk-communication" component={BulkCommunication} />
        <Route path="/content/distribution" component={ContentDistribution} />
        <Route path="/content/community-admin" component={CommunityAdmin} />

        {/* Moderation */}
        <Route path="/moderation/ministry" component={MinistryModeration} />
        <Route path="/moderation/groups" component={GroupModeration} />

        {/* Tools */}
        <Route path="/tools/sermon-studio" component={SermonStudio} />
        <Route path="/tools/qr-management" component={QRManagement} />
        <Route path="/tools/tax-reporting" component={TaxReporting} />

        {/* Organization Structure */}
        <Route path="/organization/ministries" component={MinistriesManagement} />
        <Route path="/organization/departments" component={DepartmentsManagement} />
        <Route path="/organization/teams" component={TeamsManagement} />
        <Route path="/organization/roles" component={RolesPermissions} />
        <Route path="/organization/service-allocation" component={ServiceAllocation} />

        {/* Equipment & Assets */}
        <Route path="/equipment" component={EquipmentManagement} />

        {/* 404 fallback */}
        <Route>
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-muted-foreground">Page not found</p>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

export default AppRoutes;

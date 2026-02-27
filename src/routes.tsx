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

import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";

// Lazy load all page components for better code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MembersList = lazy(() => import("./pages/members/MembersList"));
const MemberDetails = lazy(() => import("./pages/members/MemberDetails"));
const AddMember = lazy(() => import("./pages/members/AddMember"));
const DonationsDashboard = lazy(() => import("./pages/donations/DonationsDashboard"));
const DonationsList = lazy(() => import("./pages/donations/DonationsList"));
const RecordDonation = lazy(() => import("./pages/donations/RecordDonation"));
const DonorDetails = lazy(() => import("./pages/donations/DonorDetails"));
const EventsList = lazy(() => import("./pages/events/EventsList"));
const Communications = lazy(() => import("./pages/communications/Communications"));
const Volunteers = lazy(() => import("./pages/volunteers/Volunteers"));
const Reports = lazy(() => import("./pages/reports/Reports"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const Login = lazy(() => import("./pages/auth/Login"));

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
  dashboard: "/",
  members: {
    list: "/members",
    details: "/members/:id",
    new: "/members/new",
  },
  donations: {
    dashboard: "/donations",
    list: "/donations/list",
    new: "/donations/new",
    donor: "/donations/donor/:id",
  },
  events: "/events",
  communications: "/communications",
  volunteers: "/volunteers",
  reports: "/reports",
  settings: "/settings",
  login: "/login",
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
        {/* Dashboard */}
        <Route path="/" component={Dashboard} />

        {/* Members - order matters: /new before /:id */}
        <Route path="/members/new" component={AddMember} />
        <Route path="/members/:id" component={MemberDetails} />
        <Route path="/members" component={MembersList} />

        {/* Donations */}
        <Route path="/donations/donor/:id" component={DonorDetails} />
        <Route path="/donations/list" component={DonationsList} />
        <Route path="/donations/new" component={RecordDonation} />
        <Route path="/donations" component={DonationsDashboard} />

        {/* Events */}
        <Route path="/events" component={EventsList} />

        {/* Communications */}
        <Route path="/communications" component={Communications} />

        {/* Volunteers */}
        <Route path="/volunteers" component={Volunteers} />

        {/* Reports */}
        <Route path="/reports" component={Reports} />

        {/* Settings */}
        <Route path="/settings" component={Settings} />

        {/* Auth */}
        <Route path="/login" component={Login} />

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

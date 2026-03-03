import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

// Placeholder types until context is migrated
type ScopeType = 'all' | 'church' | 'ministry' | 'group';

interface AdminCommunity {
  id: number;
  type: ScopeType;
  name: string;
}

// Placeholder hook until CommunityScopeContext is migrated
function useCommunityScope() {
  return {
    scope: { type: 'all' as ScopeType, id: undefined, name: undefined }
  };
}

function CommunityAdminContent() {
  const { user } = useAuth();
  const { scope } = useCommunityScope();

  // Fetch user's admin communities
  const { data: adminCommunitiesData } = useQuery({
    queryKey: ['/api/auth/admin-communities'],
    enabled: !!user
  });

  const adminCommunities: AdminCommunity[] = Array.isArray(adminCommunitiesData) ? adminCommunitiesData : [];

  const totalCommunities = adminCommunities.length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to access Community Admin.</p>
      </div>
    );
  }

  // Render appropriate dashboard based on scope type
  const renderDashboard = () => {
    if (scope.type === 'all') {
      // Show all dashboards when "All Communities" is selected
      const groupCommunities = adminCommunities.filter((c) => c.type === 'group');
      const ministryCommunities = adminCommunities.filter((c) => c.type === 'ministry');
      const churchCommunities = adminCommunities.filter((c) => c.type === 'church');

      return (
        <div className="space-y-6">
          {/* TODO: Migrate dashboard components */}
          {churchCommunities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Church Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {churchCommunities.length} church(es) - ChurchAdminDashboard component needs migration
                </p>
              </CardContent>
            </Card>
          )}
          {ministryCommunities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Ministry Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {ministryCommunities.length} ministry(ies) - MinistryAdminDashboard component needs migration
                </p>
              </CardContent>
            </Card>
          )}
          {groupCommunities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Group Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {groupCommunities.length} group(s) - GroupAdminDashboard component needs migration
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    } else if (scope.type === 'church') {
      return (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Church Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">ChurchAdminDashboard component needs migration</p>
          </CardContent>
        </Card>
      );
    } else if (scope.type === 'ministry') {
      return (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Ministry Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">MinistryAdminDashboard component needs migration</p>
          </CardContent>
        </Card>
      );
    } else if (scope.type === 'group') {
      return (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Group Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">GroupAdminDashboard component needs migration</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-community-admin-title">
          Community Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your groups, ministries, and churches in one place
        </p>
      </div>

      {/* Unified Scope Selector with integrated banner */}
      {totalCommunities > 0 && (
        <>
          {/* TODO: Migrate UnifiedScopeSelector component */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scope Selector placeholder - UnifiedScopeSelector component needs migration
            </p>
          </div>

          {/* Community Visual Banner - TODO: Migrate CommunityBanner component */}
          {scope.type !== 'all' && scope.name && (
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <p className="font-medium">{scope.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{scope.type}</p>
            </div>
          )}

          {/* Helper banner only when unscoped */}
          {scope.type === 'all' && (
            <div className="mb-4 rounded-md border border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700 px-3 py-2 text-sm text-purple-900 dark:text-purple-200">
              Select a community above to enable scoped actions like Invitations, Posts, and Events.
            </div>
          )}
        </>
      )}

      {/* No Access State */}
      {totalCommunities === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Admin Access</h3>
            <p className="text-gray-600 dark:text-gray-300">
              You don't have administrative permissions for any communities.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      {totalCommunities > 0 && (
        <div className="mt-6">
          {renderDashboard()}
        </div>
      )}
    </div>
  );
}

export default function CommunityAdmin() {
  // TODO: Wrap with CommunityScopeProvider when context is migrated
  return <CommunityAdminContent />;
}

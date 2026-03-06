import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
// Note: These components need to be migrated or created:
// import UnifiedCommunicationHub from '../../components/communication/UnifiedCommunicationHub';
// import { UnifiedScopeSelector } from '../../components/admin/UnifiedScopeSelector';
// import { CommunityScopeProvider, useCommunityScope, type ScopeType } from '../../contexts/CommunityScopeContext';
// import { CommunityBanner } from '../../components/CommunityBanner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Placeholder types until context is migrated
type ScopeType = 'all' | 'church' | 'ministry' | 'group';
interface Community {
  id: string | number;
  name?: string;
}
interface AdminData {
  churches: Community[];
  ministries: Community[];
  groups: Community[];
}

// Placeholder hook until CommunityScopeContext is migrated
function useCommunityScope() {
  return {
    scope: { type: 'all' as ScopeType, id: undefined, name: undefined }
  };
}

function BulkCommunicationContent() {
  // Use CommunityScopeContext for scope management
  const { scope } = useCommunityScope();

  // Fetch user's admin communities to determine which Communication Hubs to show
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ["/api/users/admin-communities"],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Communication Hubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load admin communities. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = adminData as AdminData | undefined;
  const churches = data?.churches || [];
  const ministries = data?.ministries || [];
  const groups = data?.groups || [];

  // Determine which scopes the user has admin access to
  const hasChurchAccess = churches.length > 0;
  const hasMinistryAccess = ministries.length > 0;
  const hasGroupAccess = groups.length > 0;

  // If user has no admin access to any community type
  if (!hasChurchAccess && !hasMinistryAccess && !hasGroupAccess) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be an administrator of at least one church, ministry, or group to access the Communication Hub.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter communities based on selected scope from context
  const selectedScope = scope.type as ScopeType;
  const selectedCommunityId = scope.id;

  const filteredChurches = selectedScope === 'all' || selectedScope === 'church'
    ? (selectedCommunityId ? churches.filter((c: Community) => c.id.toString() === selectedCommunityId) : churches)
    : [];
  const filteredMinistries = selectedScope === 'all' || selectedScope === 'ministry'
    ? (selectedCommunityId ? ministries.filter((m: Community) => m.id.toString() === selectedCommunityId) : ministries)
    : [];
  const filteredGroups = selectedScope === 'all' || selectedScope === 'group'
    ? (selectedCommunityId ? groups.filter((g: Community) => g.id.toString() === selectedCommunityId) : groups)
    : [];

  // Get selected community details for banner from context
  const selectedCommunity = scope.type !== 'all' && scope.id
    ? [...churches, ...ministries, ...groups].find((c: Community) => c.id.toString() === scope.id)
    : null;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Unified Scope Selector - TODO: Migrate UnifiedScopeSelector component */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold">Communication Hub</h1>
        <p className="text-gray-600 dark:text-gray-400">Select a community to manage communications</p>
      </div>

      {/* Community Banner - TODO: Migrate CommunityBanner component */}
      {scope.type !== 'all' && selectedCommunity && (
        <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <p className="font-medium">{selectedCommunity.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{scope.type}</p>
        </div>
      )}

      <div className="space-y-12">
        {/* Church Communication Hubs - TODO: Migrate UnifiedCommunicationHub component */}
        {filteredChurches.map((church: Community, index: number) => (
          <div key={`church-${church.id}`}>
            {index > 0 && <Separator className="my-12" />}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">{church.name} - Church Communication Hub</h2>
              <p className="text-gray-600 dark:text-gray-400">Communication hub placeholder - component needs migration</p>
            </div>
          </div>
        ))}

        {/* Ministry Communication Hubs */}
        {filteredMinistries.map((ministry: Community, index: number) => (
          <div key={`ministry-${ministry.id}`}>
            {(filteredChurches.length > 0 || index > 0) && <Separator className="my-12" />}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">{ministry.name} - Ministry Communication Hub</h2>
              <p className="text-gray-600 dark:text-gray-400">Communication hub placeholder - component needs migration</p>
            </div>
          </div>
        ))}

        {/* Group Communication Hubs */}
        {filteredGroups.map((group: Community, index: number) => (
          <div key={`group-${group.id}`}>
            {((filteredChurches.length > 0 || filteredMinistries.length > 0) || index > 0) && <Separator className="my-12" />}
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold">{group.name} - Group Communication Hub</h2>
              <p className="text-gray-600 dark:text-gray-400">Communication hub placeholder - component needs migration</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrap with CommunityScopeProvider when migrated
export default function BulkCommunication() {
  // TODO: Wrap with CommunityScopeProvider when context is migrated
  return <BulkCommunicationContent />;
}

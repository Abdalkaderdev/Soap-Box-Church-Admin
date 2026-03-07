import { useState, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Heart,
  HandHeart,
  BookOpen,
  ChevronRight,
  Globe,
  Church,
  UsersRound,
  Briefcase,
} from 'lucide-react';

// Types
type ScopeType = 'all' | 'church' | 'ministry' | 'group';

interface AdminCommunity {
  id: number;
  type: ScopeType;
  name: string;
  memberCount?: number;
  description?: string;
}

interface CommunityScope {
  type: ScopeType;
  id: number | undefined;
  name: string | undefined;
}

// Context for community scope
interface CommunityScopeContextType {
  scope: CommunityScope;
  setScope: (scope: CommunityScope) => void;
  communities: AdminCommunity[];
}

const CommunityScopeContext = createContext<CommunityScopeContextType | null>(null);

function useCommunityScopeContext() {
  const context = useContext(CommunityScopeContext);
  if (!context) {
    throw new Error('useCommunityScopeContext must be used within CommunityScopeProvider');
  }
  return context;
}

// Scope Selector Component
function ScopeSelector() {
  const { scope, setScope, communities } = useCommunityScopeContext();

  const getScopeIcon = (type: ScopeType) => {
    switch (type) {
      case 'church': return Church;
      case 'ministry': return Briefcase;
      case 'group': return UsersRound;
      default: return Globe;
    }
  };

  const handleScopeChange = (value: string) => {
    if (value === 'all') {
      setScope({ type: 'all', id: undefined, name: undefined });
    } else {
      const [type, idStr] = value.split('-');
      const id = parseInt(idStr);
      const community = communities.find(c => c.id === id);
      if (community) {
        setScope({ type: type as ScopeType, id, name: community.name });
      }
    }
  };

  const currentValue = scope.type === 'all' ? 'all' : `${scope.type}-${scope.id}`;

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-purple-600" />
        <span className="font-medium">Scope:</span>
      </div>
      <Select value={currentValue} onValueChange={handleScopeChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a community" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>All Communities</span>
            </div>
          </SelectItem>
          {communities.map(community => {
            const Icon = getScopeIcon(community.type);
            return (
              <SelectItem key={`${community.type}-${community.id}`} value={`${community.type}-${community.id}`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{community.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {community.type}
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// Community Banner Component
function CommunityBanner() {
  const { scope } = useCommunityScopeContext();

  if (scope.type === 'all') return null;

  const getBannerStyle = () => {
    switch (scope.type) {
      case 'church':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600';
      case 'ministry':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600';
      case 'group':
        return 'bg-gradient-to-r from-green-600 to-emerald-600';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const renderIcon = () => {
    switch (scope.type) {
      case 'church': return <Church className="w-8 h-8" />;
      case 'ministry': return <Briefcase className="w-8 h-8" />;
      case 'group': return <UsersRound className="w-8 h-8" />;
      default: return <Building2 className="w-8 h-8" />;
    }
  };

  return (
    <div className={`${getBannerStyle()} text-white p-4 rounded-lg`}>
      <div className="flex items-center gap-3">
        {renderIcon()}
        <div>
          <h2 className="text-xl font-bold">{scope.name}</h2>
          <p className="text-white/80 capitalize">{scope.type} Dashboard</p>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  color: string;
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${!trend.positive && 'rotate-180'}`} />
                {trend.positive ? '+' : ''}{trend.value}% this month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Component
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
}

function QuickAction({ title, description, icon: Icon, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex items-start gap-3 text-left w-full justify-start"
      onClick={onClick}
    >
      <Icon className="w-5 h-5 text-purple-600 mt-0.5" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
    </Button>
  );
}

// Dashboard Content Component
function DashboardContent() {
  const { scope, communities } = useCommunityScopeContext();

  const churchCommunities = communities.filter(c => c.type === 'church');
  const ministryCommunities = communities.filter(c => c.type === 'ministry');
  const groupCommunities = communities.filter(c => c.type === 'group');

  // Render all communities overview
  if (scope.type === 'all') {
    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={communities.reduce((sum, c) => sum + (c.memberCount || 0), 0)}
            icon={Users}
            trend={{ value: 5, positive: true }}
            color="bg-purple-600"
          />
          <StatCard
            title="Churches"
            value={churchCommunities.length}
            icon={Church}
            color="bg-indigo-600"
          />
          <StatCard
            title="Ministries"
            value={ministryCommunities.length}
            icon={Briefcase}
            color="bg-blue-600"
          />
          <StatCard
            title="Small Groups"
            value={groupCommunities.length}
            icon={UsersRound}
            color="bg-green-600"
          />
        </div>

        {/* Community Lists */}
        {churchCommunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="w-5 h-5 text-purple-600" />
                Churches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {churchCommunities.map(church => (
                  <div key={church.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{church.name}</p>
                      <p className="text-sm text-gray-500">{church.memberCount || 0} members</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {ministryCommunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Ministries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {ministryCommunities.map(ministry => (
                  <div key={ministry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{ministry.name}</p>
                      <p className="text-sm text-gray-500">{ministry.memberCount || 0} members</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {groupCommunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-green-600" />
                Small Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groupCommunities.map(group => (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-gray-500">{group.memberCount || 0} members</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render specific community dashboard
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Members"
          value={142}
          icon={Users}
          trend={{ value: 8, positive: true }}
          color="bg-purple-600"
        />
        <StatCard
          title="Events This Month"
          value={12}
          icon={Calendar}
          color="bg-blue-600"
        />
        <StatCard
          title="Prayer Requests"
          value={28}
          icon={Heart}
          trend={{ value: 15, positive: true }}
          color="bg-pink-600"
        />
        <StatCard
          title="Volunteers"
          value={34}
          icon={HandHeart}
          color="bg-green-600"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for {scope.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickAction
              title="Post Announcement"
              description="Share news with your community"
              icon={MessageSquare}
            />
            <QuickAction
              title="Create Event"
              description="Schedule a new gathering"
              icon={Calendar}
            />
            <QuickAction
              title="Send Message"
              description="Communicate with members"
              icon={Users}
            />
            <QuickAction
              title="View Reports"
              description="Check engagement metrics"
              icon={TrendingUp}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New member joined', user: 'Sarah Johnson', time: '2 hours ago', icon: Users },
              { action: 'Prayer request submitted', user: 'Michael Chen', time: '4 hours ago', icon: Heart },
              { action: 'Event RSVP', user: 'Emily Williams', time: '5 hours ago', icon: Calendar },
              { action: 'Devotional completed', user: 'David Brown', time: '1 day ago', icon: BookOpen },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <activity.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Component with Provider
function CommunityAdminContent() {
  const { user } = useAuth();
  const [scope, setScope] = useState<CommunityScope>({
    type: 'all',
    id: undefined,
    name: undefined,
  });

  // Fetch user's admin communities
  const { data: adminCommunitiesData, isLoading } = useQuery({
    queryKey: ['/api/auth/admin-communities'],
    enabled: !!user,
  });

  // Parse communities or use sample data for demo
  const adminCommunities: AdminCommunity[] = Array.isArray(adminCommunitiesData)
    ? adminCommunitiesData
    : [
        { id: 1, type: 'church', name: 'Grace Community Church', memberCount: 450 },
        { id: 2, type: 'ministry', name: 'Youth Ministry', memberCount: 85 },
        { id: 3, type: 'ministry', name: 'Worship Team', memberCount: 32 },
        { id: 4, type: 'group', name: 'Tuesday Bible Study', memberCount: 12 },
        { id: 5, type: 'group', name: 'Young Adults', memberCount: 28 },
        { id: 6, type: 'group', name: "Men's Fellowship", memberCount: 18 },
      ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to access Community Admin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const totalCommunities = adminCommunities.length;

  return (
    <CommunityScopeContext.Provider value={{ scope, setScope, communities: adminCommunities }}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your groups, ministries, and churches in one place
          </p>
        </div>

        {/* No Access State */}
        {totalCommunities === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Admin Access</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You don't have administrative permissions for any communities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Scope Selector */}
            <ScopeSelector />

            {/* Community Banner */}
            <CommunityBanner />

            {/* Helper banner when unscoped */}
            {scope.type === 'all' && (
              <div className="rounded-md border border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700 px-4 py-3 text-sm text-purple-900 dark:text-purple-200">
                <strong>Tip:</strong> Select a specific community above to enable scoped actions like creating posts, events, and sending invitations.
              </div>
            )}

            {/* Dashboard Content */}
            <DashboardContent />
          </>
        )}
      </div>
    </CommunityScopeContext.Provider>
  );
}

export default function CommunityAdmin() {
  return <CommunityAdminContent />;
}

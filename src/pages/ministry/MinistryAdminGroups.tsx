import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { useToast } from "../../hooks/use-toast";
import {
  Users,
  Plus,
  Crown,
  Shield,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Settings,
  UserPlus,
  Calendar,
  MessageSquare,
  BarChart3,
  Search,
  Filter
} from "lucide-react";

interface Group {
  id: number;
  name: string;
  description: string;
  category: string;
  leader: string;
  coLeaders: string[];
  members: number;
  maxMembers: number;
  status: string;
  growth: string;
  engagement: string;
  meetingTime: string;
  location: string;
  lastActivity: string;
  events: number;
  posts: number;
  weeklyAttendance: number;
  founded: string;
}

export default function MinistryAdminGroups() {
  const { toast } = useToast();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewGroupOpen, setViewGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Mock groups data
  const groups: Group[] = [
    {
      id: 1,
      name: "Young Adults Bible Study",
      description: "Weekly Bible study for young adults aged 18-30",
      category: "Bible Study",
      leader: "Sarah Johnson",
      coLeaders: ["Mike Chen"],
      members: 24,
      maxMembers: 30,
      status: "active",
      growth: "+15%",
      engagement: "high",
      meetingTime: "Thursdays 7:00 PM",
      location: "Room A",
      lastActivity: "2 hours ago",
      events: 8,
      posts: 45,
      weeklyAttendance: 18,
      founded: "2024-01-15"
    },
    {
      id: 2,
      name: "Family Fellowship",
      description: "Monthly gathering for families with children",
      category: "Fellowship",
      leader: "David Rodriguez",
      coLeaders: [],
      members: 35,
      maxMembers: 40,
      status: "active",
      growth: "+8%",
      engagement: "medium",
      meetingTime: "First Sunday 6:00 PM",
      location: "Main Hall",
      lastActivity: "1 day ago",
      events: 12,
      posts: 28,
      weeklyAttendance: 28,
      founded: "2023-09-10"
    },
    {
      id: 3,
      name: "Prayer Warriors",
      description: "Dedicated prayer group meeting weekly",
      category: "Prayer",
      leader: "Emma Wilson",
      coLeaders: ["Lisa Park"],
      members: 18,
      maxMembers: 25,
      status: "active",
      growth: "+22%",
      engagement: "high",
      meetingTime: "Wednesdays 6:30 AM",
      location: "Prayer Room",
      lastActivity: "3 hours ago",
      events: 4,
      posts: 67,
      weeklyAttendance: 16,
      founded: "2023-11-20"
    },
    {
      id: 4,
      name: "Community Outreach",
      description: "Organizing community service projects",
      category: "Service",
      leader: "Robert Kim",
      coLeaders: ["Jessica Williams"],
      members: 15,
      maxMembers: 20,
      status: "planning",
      growth: "New",
      engagement: "low",
      meetingTime: "Saturdays 9:00 AM",
      location: "Various",
      lastActivity: "1 week ago",
      events: 2,
      posts: 12,
      weeklyAttendance: 12,
      founded: "2024-08-01"
    }
  ];

  const categories = ["Bible Study", "Fellowship", "Prayer", "Service", "Youth", "Women's Ministry", "Men's Ministry"];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || group.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || group.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGrowthIcon = (growth: string) => {
    if (growth.includes('+')) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (growth.includes('-')) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-purple-600" />;
  };

  const handleCreateGroup = () => {
    setCreateGroupOpen(false);
  };

  const handleViewGroup = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setViewGroupOpen(true);
      toast({
        title: "Group Details",
        description: `Opening detailed view for ${group.name}`,
      });
    }
  };

  const handleEditGroup = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setEditGroupOpen(true);
      toast({
        title: "Edit Group",
        description: `Editing ${group.name} settings`,
      });
    }
  };

  const handleManageGroup = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      // Navigate to the comprehensive Group Management Dashboard
      window.location.href = `/groups/${groupId}/manage`;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Groups Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create and oversee all groups within your ministry
          </p>
        </div>
        <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ministry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Ministry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input id="groupName" placeholder="Enter group name" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Group description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxMembers">Max Members</Label>
                  <Input id="maxMembers" type="number" placeholder="25" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingTime">Meeting Time</Label>
                  <Input id="meetingTime" placeholder="e.g., Thursdays 7:00 PM" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Meeting location" />
                </div>
              </div>
              <div>
                <Label htmlFor="leader">Group Leader</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Chen</SelectItem>
                    <SelectItem value="david">David Rodriguez</SelectItem>
                    <SelectItem value="emma">Emma Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Group Dialog */}
      <Dialog open={viewGroupOpen} onOpenChange={setViewGroupOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              {selectedGroup?.name} - Group Details
            </DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedGroup.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                    <Badge variant="outline" className="mt-1">{selectedGroup.category}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Schedule</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedGroup.meetingTime}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedGroup.location}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leadership</Label>
                    <div className="mt-1 space-y-1">
                      <Badge variant="default" className="text-xs">Leader: {selectedGroup.leader}</Badge>
                      {selectedGroup.coLeaders.map((coLeader: string) => (
                        <Badge key={coLeader} variant="outline" className="text-xs ml-2">
                          Co-Leader: {coLeader}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Members</Label>
                      <p className="text-2xl font-bold text-purple-600">{selectedGroup.members}/{selectedGroup.maxMembers}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Growth</Label>
                      <p className="text-2xl font-bold text-green-600">{selectedGroup.growth}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Level</Label>
                    <div className="flex items-center mt-1">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        selectedGroup.engagement === 'high' ? 'bg-green-500' :
                        selectedGroup.engagement === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{selectedGroup.engagement}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Calendar className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGroup.events}</p>
                  <p className="text-xs text-gray-500">Events</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGroup.posts}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGroup.weeklyAttendance}</p>
                  <p className="text-xs text-gray-500">Avg Attendance</p>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p><strong>Founded:</strong> {new Date(selectedGroup.founded).toLocaleDateString()}</p>
                <p><strong>Last Activity:</strong> {selectedGroup.lastActivity}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-green-600" />
              Edit {selectedGroup?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editGroupName">Group Name</Label>
                <Input id="editGroupName" defaultValue={selectedGroup.name} />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea id="editDescription" defaultValue={selectedGroup.description} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCategory">Category</Label>
                  <Select defaultValue={selectedGroup.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editMaxMembers">Max Members</Label>
                  <Input id="editMaxMembers" type="number" defaultValue={selectedGroup.maxMembers} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editMeetingTime">Meeting Time</Label>
                  <Input id="editMeetingTime" defaultValue={selectedGroup.meetingTime} />
                </div>
                <div>
                  <Label htmlFor="editLocation">Location</Label>
                  <Input id="editLocation" defaultValue={selectedGroup.location} />
                </div>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select defaultValue={selectedGroup.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditGroupOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setEditGroupOpen(false);
                  toast({
                    title: "Group Updated",
                    description: `${selectedGroup.name} has been successfully updated.`,
                  });
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.reduce((sum, group) => sum + group.members, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Group Leaders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.length + groups.reduce((sum, group) => sum + group.coLeaders.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Avg. Growth
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  +11%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                      {group.status}
                    </Badge>
                    <Badge variant="outline">{group.category}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {group.description}
                  </p>
                </div>
              </div>

              {/* Leadership */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Crown className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="font-medium text-sm">Leadership</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="text-xs">
                    Leader: {group.leader}
                  </Badge>
                  {group.coLeaders.map(coLeader => (
                    <Badge key={coLeader} variant="outline" className="text-xs">
                      Co-Leader: {coLeader}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="font-semibold">{group.members}/{group.maxMembers}</span>
                  </div>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-semibold">{group.events}</span>
                  </div>
                  <p className="text-xs text-gray-500">Events</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageSquare className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="font-semibold">{group.posts}</span>
                  </div>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {getGrowthIcon(group.growth)}
                    <span className="ml-1 font-medium">{group.growth}</span>
                    <span className="ml-1 text-gray-500">growth</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      group.engagement === 'high' ? 'bg-green-500' :
                      group.engagement === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={getEngagementColor(group.engagement)}>
                      {group.engagement} engagement
                    </span>
                  </div>
                </div>
              </div>

              {/* Meeting Info */}
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                <p><strong>Meets:</strong> {group.meetingTime}</p>
                <p><strong>Location:</strong> {group.location}</p>
                <p><strong>Attendance:</strong> {group.weeklyAttendance} avg/week</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Last activity: {group.lastActivity}
                </div>
                <TooltipProvider>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewGroup(group.id)}
                          className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/20 transition-all duration-200 transform hover:scale-105"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View group details</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGroup(group.id)}
                          className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-105"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit group settings</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageGroup(group.id)}
                          className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/20 transition-all duration-200 transform hover:scale-105"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage group operations</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No groups found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search criteria or create a new group.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

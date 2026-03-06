import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  HandHeart,
  Plus,
  Heart,
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Eye,
  Flag,
  Filter,
  Search,
  Download,
  Settings
} from "lucide-react";
import { format } from "date-fns";

export default function MinistryAdminPrayer() {
  const [activeTab, setActiveTab] = useState("prayers");
  const [createPrayerOpen, setCreatePrayerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock prayer requests data
  const prayerRequests = [
    {
      id: 1,
      title: "Healing for Community Member",
      description: "Please pray for Sarah who is recovering from surgery. She needs strength and healing during this challenging time.",
      author: "Mike Chen",
      authorGroup: "Bible Study",
      category: "Health",
      status: "active",
      privacy: "ministry",
      hearts: 24,
      comments: 8,
      createdDate: "2024-08-20T10:30:00Z",
      lastActivity: "2024-08-23T14:20:00Z",
      answered: false,
      urgent: false
    },
    {
      id: 2,
      title: "Job Search Guidance",
      description: "Seeking prayers for wisdom and guidance in my job search. Please pray that I find the right opportunity that aligns with God's plan.",
      author: "Jessica Williams",
      authorGroup: "Young Adults",
      category: "Career",
      status: "active",
      privacy: "public",
      hearts: 18,
      comments: 12,
      createdDate: "2024-08-19T16:45:00Z",
      lastActivity: "2024-08-23T11:30:00Z",
      answered: false,
      urgent: false
    },
    {
      id: 3,
      title: "Family Reconciliation",
      description: "Please pray for healing and reconciliation in my family relationships. We need God's grace to overcome our differences.",
      author: "David Rodriguez",
      authorGroup: "Prayer Warriors",
      category: "Family",
      status: "answered",
      privacy: "ministry",
      hearts: 32,
      comments: 15,
      createdDate: "2024-08-15T09:15:00Z",
      lastActivity: "2024-08-22T19:45:00Z",
      answered: true,
      urgent: false
    },
    {
      id: 4,
      title: "Emergency Surgery Recovery",
      description: "Urgent prayers needed for emergency surgery complications. Please pray for complete healing and recovery.",
      author: "Emma Wilson",
      authorGroup: "Family Fellowship",
      category: "Health",
      status: "active",
      privacy: "ministry",
      hearts: 45,
      comments: 23,
      createdDate: "2024-08-23T06:00:00Z",
      lastActivity: "2024-08-23T15:10:00Z",
      answered: false,
      urgent: true
    }
  ];

  // Mock prayer analytics
  const prayerAnalytics = {
    totalPrayers: 156,
    activePrayers: 89,
    answeredPrayers: 67,
    heartsThisWeek: 234,
    commentsThisWeek: 89,
    newPrayersThisWeek: 12,
    categoriesCounts: {
      Health: 45,
      Family: 32,
      Career: 28,
      Spiritual: 25,
      Financial: 15,
      Other: 11
    }
  };

  // Mock prayer groups
  const prayerGroups = [
    {
      name: "Young Adults",
      activePrayers: 23,
      totalMembers: 24,
      participationRate: "96%"
    },
    {
      name: "Bible Study",
      activePrayers: 18,
      totalMembers: 18,
      participationRate: "100%"
    },
    {
      name: "Prayer Warriors",
      activePrayers: 32,
      totalMembers: 32,
      participationRate: "100%"
    },
    {
      name: "Family Fellowship",
      activePrayers: 16,
      totalMembers: 35,
      participationRate: "46%"
    }
  ];

  const filteredPrayers = prayerRequests.filter(prayer => {
    const matchesStatus = statusFilter === "all" || prayer.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || prayer.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleCreatePrayer = () => {
    setCreatePrayerOpen(false);
  };

  const handleMarkAnswered = () => {
  };

  const handleFlagPrayer = () => {
  };

  const handleViewPrayer = () => {
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'answered': return 'bg-purple-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Health: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      Family: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Career: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Spiritual: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Financial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      Other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Prayer Wall Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Oversee and manage prayer requests across all ministry groups
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createPrayerOpen} onOpenChange={setCreatePrayerOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Prayer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Prayer Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Prayer Title
                  </label>
                  <Input id="title" placeholder="Enter prayer request title" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea id="description" placeholder="Share your prayer request..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="spiritual">Spiritual</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="privacy" className="block text-sm font-medium mb-2">
                      Privacy
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="ministry">Ministry Only</SelectItem>
                        <SelectItem value="leaders">Leaders Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="urgent" />
                  <label htmlFor="urgent" className="text-sm">
                    Mark as urgent
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreatePrayerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePrayer}>
                    Submit Prayer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HandHeart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Prayers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {prayerAnalytics.totalPrayers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Prayers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {prayerAnalytics.activePrayers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Answered Prayers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {prayerAnalytics.answeredPrayers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Hearts This Week
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {prayerAnalytics.heartsThisWeek}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="prayers">Prayer Requests</TabsTrigger>
          <TabsTrigger value="groups">Group Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="prayers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search prayer requests..." className="pl-10" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Career">Career</SelectItem>
                      <SelectItem value="Spiritual">Spiritual</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prayer Requests List */}
          <div className="space-y-4">
            {filteredPrayers.map((prayer) => (
              <Card key={prayer.id} className={prayer.urgent ? "border-red-300 shadow-md" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {prayer.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(prayer.status)}`}></div>
                      <Badge className={getCategoryColor(prayer.category)}>
                        {prayer.category}
                      </Badge>
                      <Badge variant="outline">{prayer.privacy}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(prayer.createdDate), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{prayer.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {prayer.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {prayer.author} ({prayer.authorGroup})
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {prayer.hearts} hearts
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {prayer.comments} comments
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Last activity: {format(new Date(prayer.lastActivity), 'MMM d')}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewPrayer()}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!prayer.answered && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAnswered()}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleFlagPrayer()}>
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4">
            {prayerGroups.map((group, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mt-2">
                        <span>{group.activePrayers} active prayers</span>
                        <span>{group.totalMembers} members</span>
                        <span>Participation: {group.participationRate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{group.participationRate}</div>
                      <div className="text-sm text-gray-500">participation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Prayer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Prayer Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(prayerAnalytics.categoriesCounts).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span>{category}:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{width: `${(count / prayerAnalytics.totalPrayers) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Weekly Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>New Prayer Requests:</span>
                      <span className="font-medium">{prayerAnalytics.newPrayersThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hearts Given:</span>
                      <span className="font-medium">{prayerAnalytics.heartsThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Comments Posted:</span>
                      <span className="font-medium">{prayerAnalytics.commentsThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Prayers Answered:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Answer Rate:</span>
                      <span className="font-medium">43%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Prayer Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Prayer Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-moderation Settings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Automatically flag prayers containing inappropriate content
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Prayer Review Queue</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      0 prayers pending review
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View Queue</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sensitive Content Detection</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      AI-powered detection for sensitive prayer requests
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

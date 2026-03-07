import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { api } from "../../lib/api";
import {
  Flag,
  Eye,
  Trash2,
  CheckCircle,
  Users,
  Activity,
  Search,
  Filter,
  Shield,
  TrendingUp,
  MessageCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface FlaggedContent {
  id: number;
  type: string;
  content: string;
  author: string;
  authorEmail: string;
  group: string;
  reportedBy: string;
  reportReason: string;
  reportDate: string;
  status: string;
  severity: string;
  originalPost: string;
  reviewNotes: string;
}

// Default flagged content data
const defaultFlaggedContent: FlaggedContent[] = [
    {
      id: 1,
      type: "post",
      content: "This is an inappropriate message that violates community guidelines...",
      author: "John Doe",
      authorEmail: "john.doe@email.com",
      group: "Young Adults",
      reportedBy: "Sarah Johnson",
      reportReason: "Inappropriate content",
      reportDate: "2024-08-23T10:30:00Z",
      status: "pending",
      severity: "medium",
      originalPost: "This is the full content of the flagged post that contains material that may be inappropriate for our community guidelines and standards.",
      reviewNotes: ""
    },
    {
      id: 2,
      type: "comment",
      content: "Spam comment with external links...",
      author: "Jane Smith",
      authorEmail: "jane.smith@email.com",
      group: "Bible Study",
      reportedBy: "Mike Chen",
      reportReason: "Spam",
      reportDate: "2024-08-22T15:45:00Z",
      status: "pending",
      severity: "low",
      originalPost: "Check out this amazing deal at [external link] - click here for instant savings!",
      reviewNotes: ""
    },
    {
      id: 3,
      type: "post",
      content: "Content that may be spreading misinformation...",
      author: "Bob Wilson",
      authorEmail: "bob.wilson@email.com",
      group: "Prayer Group",
      reportedBy: "Emma Wilson",
      reportReason: "Misinformation",
      reportDate: "2024-08-21T08:20:00Z",
      status: "reviewed",
      severity: "high",
      originalPost: "Here's some information that contradicts established facts and may mislead other community members about important health and safety topics.",
      reviewNotes: "Reviewed and removed due to factual inaccuracies"
    }
  ];

// Default moderation activity
const defaultModerationActivity = [
    {
      id: 1,
      action: "Content Removed",
      moderator: "Sarah Johnson",
      target: "Post by John Doe",
      group: "Young Adults",
      reason: "Violated community guidelines",
      timestamp: "2024-08-23T14:30:00Z"
    },
    {
      id: 2,
      action: "Comment Approved",
      moderator: "Mike Chen",
      target: "Comment by Lisa Park",
      group: "Bible Study",
      reason: "No policy violation found",
      timestamp: "2024-08-23T13:15:00Z"
    },
    {
      id: 3,
      action: "User Warned",
      moderator: "Emma Wilson",
      target: "Bob Wilson",
      group: "Prayer Group",
      reason: "Multiple policy violations",
      timestamp: "2024-08-23T11:45:00Z"
    }
  ];

// Default community guidelines
const defaultCommunityGuidelines = [
    {
      category: "Respectful Communication",
      description: "All members should communicate with respect and kindness",
      violations: 3,
      examples: ["No harassment", "No hate speech", "No personal attacks"]
    },
    {
      category: "Appropriate Content",
      description: "Content should be appropriate for all age groups in our community",
      violations: 5,
      examples: ["No inappropriate images", "No profanity", "No violent content"]
    },
    {
      category: "No Spam",
      description: "Avoid posting repetitive or promotional content",
      violations: 2,
      examples: ["No excessive self-promotion", "No repetitive posts", "No commercial content"]
    }
  ];

export default function MinistryAdminModeration() {
  const [activeTab, setActiveTab] = useState("flagged");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");

  // Fetch flagged content from API
  const { data: flaggedData, isLoading } = useQuery<FlaggedContent[]>({
    queryKey: ['/api/ministry-admin/flagged-content'],
    queryFn: () => api.get<FlaggedContent[]>('/api/ministry-admin/flagged-content').catch(() => defaultFlaggedContent),
  });

  const flaggedContent = flaggedData || defaultFlaggedContent;
  const moderationActivity = defaultModerationActivity;
  const communityGuidelines = defaultCommunityGuidelines;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const filteredContent = flaggedContent.filter(item => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = contentTypeFilter === "all" || item.type === contentTypeFilter;
    return matchesStatus && matchesType;
  });

  const handleApproveContent = () => {
  };

  const handleRemoveContent = () => {
  };

  const handleReviewContent = () => {
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content & Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and moderate content across all ministry groups
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Guidelines
          </Button>
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flag className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Flagged Content
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Actions Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
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
                  Resolved This Week
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  28
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Moderators
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  6
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search flagged content..." className="pl-10" />
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="post">Posts</SelectItem>
                      <SelectItem value="comment">Comments</SelectItem>
                      <SelectItem value="message">Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Content List */}
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(item.severity)}`}></div>
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge variant={
                        item.status === 'pending' ? 'destructive' :
                        item.status === 'reviewed' ? 'default' : 'secondary'
                      }>
                        {item.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {item.severity} severity
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(item.reportDate), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Flagged Content</h4>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm">{item.originalPost}</p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Author:</span>
                          <span className="ml-2">{item.author} ({item.authorEmail})</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Group:</span>
                          <span className="ml-2">{item.group}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Reported by:</span>
                          <span className="ml-2">{item.reportedBy}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Reason:</span>
                          <span className="ml-2">{item.reportReason}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Review Notes</h4>
                      <Textarea
                        placeholder="Add review notes..."
                        value={item.reviewNotes}
                        rows={4}
                        className="mb-4"
                      />

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveContent()}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveContent()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewContent()}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Full Review
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact User
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Moderator</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant={
                          activity.action.includes('Removed') ? 'destructive' :
                          activity.action.includes('Approved') ? 'default' : 'secondary'
                        }>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{activity.moderator}</TableCell>
                      <TableCell>{activity.target}</TableCell>
                      <TableCell>{activity.group}</TableCell>
                      <TableCell className="text-sm text-gray-600">{activity.reason}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <div className="grid gap-4">
            {communityGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{guideline.category}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {guideline.description}
                      </p>
                      <div>
                        <h4 className="font-medium mb-2">Examples:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {guideline.examples.map((example, idx) => (
                            <li key={idx}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {guideline.violations}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          violations this month
                        </div>
                      </div>
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
              <CardTitle>Moderation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">This Month's Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total Reports:</span>
                      <span className="font-medium">42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Content Removed:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>False Reports:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Response Time:</span>
                      <span className="font-medium">2.4 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Warnings Issued:</span>
                      <span className="font-medium">12</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Most Common Violations</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Inappropriate Content:</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm">15</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Spam:</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '40%'}}></div>
                        </div>
                        <span className="text-sm">10</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Harassment:</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '20%'}}></div>
                        </div>
                        <span className="text-sm">5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

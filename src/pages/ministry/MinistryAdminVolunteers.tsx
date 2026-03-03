import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  HandHeart,
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  User,
  Mail,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Shield
} from "lucide-react";
import { format } from "date-fns";

export default function MinistryAdminVolunteers() {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [createOpportunityOpen, setCreateOpportunityOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock volunteer opportunities
  const opportunities = [
    {
      id: 1,
      title: "Youth Ministry Helper",
      description: "Assist with weekly youth activities and mentorship",
      category: "Youth Ministry",
      type: "ongoing",
      commitment: "2 hours/week",
      location: "Main Campus",
      requiredSkills: ["Working with youth", "Mentorship"],
      backgroundCheck: true,
      status: "active",
      applicants: 5,
      filled: 2,
      needed: 3,
      startDate: "2024-09-01",
      coordinator: "Sarah Johnson",
      urgency: "high"
    },
    {
      id: 2,
      title: "Community Outreach Coordinator",
      description: "Organize and lead community service projects",
      category: "Outreach",
      type: "ongoing",
      commitment: "5 hours/week",
      location: "Various Locations",
      requiredSkills: ["Organization", "Leadership", "Communication"],
      backgroundCheck: true,
      status: "active",
      applicants: 3,
      filled: 1,
      needed: 2,
      startDate: "2024-08-15",
      coordinator: "Mike Chen",
      urgency: "medium"
    },
    {
      id: 3,
      title: "Event Setup Team",
      description: "Help set up and tear down for special events",
      category: "Events",
      type: "event-based",
      commitment: "4 hours per event",
      location: "Main Campus",
      requiredSkills: ["Physical work", "Teamwork"],
      backgroundCheck: false,
      status: "active",
      applicants: 8,
      filled: 5,
      needed: 3,
      startDate: "2024-08-20",
      coordinator: "David Rodriguez",
      urgency: "low"
    }
  ];

  // Mock volunteer applications
  const applications = [
    {
      id: 1,
      opportunityId: 1,
      opportunityTitle: "Youth Ministry Helper",
      applicant: {
        name: "Jessica Williams",
        email: "jessica.w@email.com",
        phone: "(555) 789-0123",
        age: 24,
        experience: "2 years working with youth at previous church"
      },
      applicationDate: "2024-08-20",
      status: "pending",
      backgroundCheckStatus: "in_progress",
      availability: "Weekends",
      motivationLetter: "I'm passionate about mentoring young people and helping them grow in their faith journey.",
      references: 2,
      skills: ["Youth work", "Mentorship", "Music"]
    },
    {
      id: 2,
      opportunityId: 2,
      opportunityTitle: "Community Outreach Coordinator",
      applicant: {
        name: "Robert Kim",
        email: "robert.k@email.com",
        phone: "(555) 890-1234",
        age: 31,
        experience: "5 years in nonprofit organization management"
      },
      applicationDate: "2024-08-18",
      status: "approved",
      backgroundCheckStatus: "completed",
      availability: "Flexible",
      motivationLetter: "I have extensive experience in community outreach and would love to serve in this capacity.",
      references: 3,
      skills: ["Leadership", "Project Management", "Community Relations"]
    }
  ];

  // Mock active volunteers
  const activeVolunteers = [
    {
      id: 1,
      name: "Robert Kim",
      email: "robert.k@email.com",
      role: "Community Outreach Coordinator",
      startDate: "2024-08-15",
      hoursThisMonth: 18,
      totalHours: 45,
      rating: 4.8,
      status: "active",
      backgroundCheck: "completed",
      lastActivity: "2 days ago"
    },
    {
      id: 2,
      name: "Lisa Chen",
      email: "lisa.c@email.com",
      role: "Event Setup Team",
      startDate: "2024-07-10",
      hoursThisMonth: 12,
      totalHours: 67,
      rating: 4.9,
      status: "active",
      backgroundCheck: "completed",
      lastActivity: "1 week ago"
    }
  ];

  const handleCreateOpportunity = () => {
    setCreateOpportunityOpen(false);
  };

  const handleApplicationAction = (_applicationId: number, _action: 'approve' | 'reject' | 'interview') => {
    // Handle application action logic here
  };

  const handleEditOpportunity = (_opportunityId: number) => {
    // Handle opportunity editing logic here
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Volunteer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage volunteer opportunities, applications, and active volunteers
          </p>
        </div>
        <Dialog open={createOpportunityOpen} onOpenChange={setCreateOpportunityOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Volunteer Opportunity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Opportunity Title</Label>
                <Input id="title" placeholder="Enter opportunity title" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Detailed description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth Ministry</SelectItem>
                      <SelectItem value="outreach">Outreach</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="worship">Worship</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="event-based">Event-based</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commitment">Time Commitment</Label>
                  <Input id="commitment" placeholder="e.g., 2 hours/week" />
                </div>
                <div>
                  <Label htmlFor="needed">Volunteers Needed</Label>
                  <Input id="needed" type="number" placeholder="3" />
                </div>
              </div>
              <div>
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input id="skills" placeholder="Leadership, Communication, Organization" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="backgroundCheck" />
                <Label htmlFor="backgroundCheck">Requires background check</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateOpportunityOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOpportunity}>
                  Create Opportunity
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HandHeart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Opportunities
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
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Volunteers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  47
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending Applications
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  8
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Hours This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  234
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities List */}
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                        <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                          {opportunity.status}
                        </Badge>
                        <Badge variant="outline">{opportunity.category}</Badge>
                        <Badge variant={
                          opportunity.urgency === 'high' ? 'destructive' :
                          opportunity.urgency === 'medium' ? 'default' : 'secondary'
                        }>
                          {opportunity.urgency} priority
                        </Badge>
                        {opportunity.backgroundCheck && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Background check required
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {opportunity.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {opportunity.commitment}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          {opportunity.filled}/{opportunity.needed} filled
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Coordinator: {opportunity.coordinator}</span>
                          <span>Start: {format(new Date(opportunity.startDate), 'MMM d, yyyy')}</span>
                          <span>{opportunity.applicants} applicants</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditOpportunity(opportunity.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Background Check</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {application.applicant.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{application.applicant.name}</p>
                            <p className="text-sm text-gray-500">{application.applicant.email}</p>
                            <p className="text-xs text-gray-400">{application.applicant.experience}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{application.opportunityTitle}</p>
                        <p className="text-sm text-gray-500">Available: {application.availability}</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(application.applicationDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          application.backgroundCheckStatus === 'completed' ? 'default' :
                          application.backgroundCheckStatus === 'in_progress' ? 'secondary' : 'destructive'
                        }>
                          {application.backgroundCheckStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          application.status === 'approved' ? 'default' :
                          application.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(application.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(application.id, 'interview')}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(application.id, 'reject')}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVolunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {volunteer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{volunteer.name}</p>
                            <p className="text-sm text-gray-500">{volunteer.email}</p>
                            <p className="text-xs text-gray-400">
                              Started {format(new Date(volunteer.startDate), 'MMM yyyy')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{volunteer.role}</p>
                        <p className="text-sm text-gray-500">Last active: {volunteer.lastActivity}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{volunteer.hoursThisMonth}h this month</p>
                          <p className="text-sm text-gray-500">{volunteer.totalHours}h total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-lg">*</span>
                          <span className="ml-1 font-medium">{volunteer.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={volunteer.status === 'active' ? 'default' : 'secondary'}>
                          {volunteer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Monthly Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total volunteer hours:</span>
                      <span className="font-medium">234 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New volunteers recruited:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retention rate:</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average satisfaction:</span>
                      <span className="font-medium">4.6/5</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Export Options</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Volunteer List
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Hours Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Application Data
                    </Button>
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

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GraduationCap,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Award,
  Clock,
  Search,
  CheckCircle2,
  Eye,
  UserPlus,
  FileText,
  Star,
} from "lucide-react";
import { useChurch } from "@/hooks/useChurch";
import { onlineClassesApi, membersApi, type DiscipleshipPlan } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const CATEGORY_OPTIONS = [
  { value: 'doctrine', label: 'Doctrine' },
  { value: 'conduct', label: 'Conduct' },
  { value: 'character', label: 'Character' },
  { value: 'service', label: 'Service' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
    draft: { variant: "secondary", color: "bg-gray-100 text-gray-600" },
    active: { variant: "default", color: "bg-green-100 text-green-700" },
    archived: { variant: "outline", color: "bg-gray-100 text-gray-500" },
    completed: { variant: "default", color: "bg-blue-100 text-blue-700" },
    paused: { variant: "outline", color: "bg-amber-100 text-amber-700" },
    forming: { variant: "secondary", color: "bg-purple-100 text-purple-700" },
  };
  const config = variants[status] || { variant: "secondary" as const, color: "" };
  return (
    <Badge variant={config.variant} className={`capitalize ${config.color}`}>
      {status}
    </Badge>
  );
}

function getDifficultyBadge(difficulty: string) {
  const colors: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-amber-100 text-amber-700",
    advanced: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[difficulty] || ''}`}>
      {difficulty}
    </span>
  );
}

function getCategoryBadge(category: string) {
  const colors: Record<string, string> = {
    doctrine: "bg-blue-100 text-blue-700",
    conduct: "bg-purple-100 text-purple-700",
    character: "bg-emerald-100 text-emerald-700",
    service: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[category] || ''}`}>
      {category}
    </span>
  );
}

export default function OnlineClasses() {
  const { toast } = useToast();
  const { churchId } = useChurch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Course dialog state
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<DiscipleshipPlan | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    category: "doctrine" as DiscipleshipPlan['category'],
    difficulty: "beginner" as DiscipleshipPlan['difficulty'],
    estimatedDuration: "",
    coverImageUrl: "",
    status: "draft" as DiscipleshipPlan['status'],
    isPublic: true,
  });

  // Enrollment dialog
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<DiscipleshipPlan | null>(null);
  const [enrollUserId, setEnrollUserId] = useState("");

  // View course dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<DiscipleshipPlan | null>(null);

  // Queries
  const { data: plansResponse, isLoading: loadingPlans } = useQuery({
    queryKey: ['discipleship-plans', churchId, statusFilter],
    queryFn: () => onlineClassesApi.listPlans(churchId!, statusFilter !== 'all' ? statusFilter : undefined),
    enabled: !!churchId,
  });

  const { data: progressResponse, isLoading: loadingProgress } = useQuery({
    queryKey: ['discipleship-progress', churchId],
    queryFn: () => onlineClassesApi.listProgress(churchId!),
    enabled: !!churchId,
  });

  const { data: groupsResponse, isLoading: loadingGroups } = useQuery({
    queryKey: ['discipleship-groups', churchId],
    queryFn: () => onlineClassesApi.listGroups(churchId!),
    enabled: !!churchId,
  });

  const { data: statsResponse } = useQuery({
    queryKey: ['discipleship-stats', churchId],
    queryFn: () => onlineClassesApi.getStats(churchId!),
    enabled: !!churchId,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['discipleship-certificates', churchId],
    queryFn: () => onlineClassesApi.listCertificates(churchId!),
    enabled: !!churchId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', churchId],
    queryFn: () => membersApi.list(churchId!),
    enabled: !!churchId && enrollDialogOpen,
  });

  const plans = plansResponse?.data || [];
  const progress = progressResponse?.data || [];
  const groups = groupsResponse?.data || [];
  const stats = statsResponse?.data;

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: Partial<DiscipleshipPlan>) => onlineClassesApi.createPlan(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship-plans', churchId] });
      queryClient.invalidateQueries({ queryKey: ['discipleship-stats', churchId] });
      toast({ title: "Course created successfully" });
      setCourseDialogOpen(false);
      resetCourseForm();
    },
    onError: () => toast({ title: "Failed to create course", variant: "destructive" }),
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DiscipleshipPlan> }) =>
      onlineClassesApi.updatePlan(churchId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship-plans', churchId] });
      queryClient.invalidateQueries({ queryKey: ['discipleship-stats', churchId] });
      toast({ title: "Course updated successfully" });
      setCourseDialogOpen(false);
      resetCourseForm();
    },
    onError: () => toast({ title: "Failed to update course", variant: "destructive" }),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => onlineClassesApi.deletePlan(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship-plans', churchId] });
      queryClient.invalidateQueries({ queryKey: ['discipleship-stats', churchId] });
      toast({ title: "Course deleted successfully" });
    },
    onError: () => toast({ title: "Failed to delete course", variant: "destructive" }),
  });

  const enrollMutation = useMutation({
    mutationFn: (data: { userId: string; planId: number }) => onlineClassesApi.enrollUser(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discipleship-progress', churchId] });
      queryClient.invalidateQueries({ queryKey: ['discipleship-plans', churchId] });
      queryClient.invalidateQueries({ queryKey: ['discipleship-stats', churchId] });
      toast({ title: "Member enrolled successfully" });
      setEnrollDialogOpen(false);
      setSelectedCourseForEnroll(null);
      setEnrollUserId("");
    },
    onError: () => toast({ title: "Failed to enroll member", variant: "destructive" }),
  });

  // Form handlers
  function resetCourseForm() {
    setEditingCourse(null);
    setCourseForm({
      name: "",
      description: "",
      category: "doctrine",
      difficulty: "beginner",
      estimatedDuration: "",
      coverImageUrl: "",
      status: "draft",
      isPublic: true,
    });
  }

  function openCreateCourse() {
    resetCourseForm();
    setCourseDialogOpen(true);
  }

  function openEditCourse(course: DiscipleshipPlan) {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description || "",
      category: course.category,
      difficulty: course.difficulty,
      estimatedDuration: course.estimatedDuration || "",
      coverImageUrl: course.coverImageUrl || "",
      status: course.status,
      isPublic: course.isPublic,
    });
    setCourseDialogOpen(true);
  }

  function openViewCourse(course: DiscipleshipPlan) {
    setViewingCourse(course);
    setViewDialogOpen(true);
  }

  function openEnrollDialog(course: DiscipleshipPlan) {
    setSelectedCourseForEnroll(course);
    setEnrollDialogOpen(true);
  }

  function handleCourseSubmit() {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id.toString(), data: courseForm });
    } else {
      createCourseMutation.mutate(courseForm);
    }
  }

  function handleEnroll() {
    if (!selectedCourseForEnroll || !enrollUserId) return;
    enrollMutation.mutate({ userId: enrollUserId, planId: selectedCourseForEnroll.id });
  }

  // Filter data
  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Please select a church to manage online classes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-500" />
            Online Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Digital discipleship and education platform
          </p>
        </div>
        <Button onClick={openCreateCourse} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{stats?.plans?.totalPlans ?? plans.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Learners</p>
                <p className="text-2xl font-bold">{stats?.overview?.currentlyActive ?? progress.filter(p => p.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completions</p>
                <p className="text-2xl font-bold">{stats?.overview?.completedAtLeastOnePlan ?? progress.filter(p => p.status === 'completed').length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold">{stats?.certificates?.totalIssued ?? certificates.length}</p>
              </div>
              <Award className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Enrollments
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <Award className="h-4 w-4" />
              Certificates
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === "courses" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4 mt-4">
          {loadingPlans ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Loading courses...
              </CardContent>
            </Card>
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No courses found</p>
                <Button onClick={openCreateCourse} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map(course => {
                const completionRate = course.enrolledCount > 0
                  ? Math.round((course.completedCount / course.enrolledCount) * 100)
                  : 0;

                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {course.coverImageUrl ? (
                      <img src={course.coverImageUrl} alt="" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-blue-500/50" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-1">{course.name}</h3>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {course.description || "No description"}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryBadge(course.category)}
                        {getDifficultyBadge(course.difficulty)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {course.totalLessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolledCount} enrolled
                        </span>
                      </div>
                      {course.enrolledCount > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Completion Rate</span>
                            <span>{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-1.5" />
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openViewCourse(course)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEnrollDialog(course)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditCourse(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this course?')) {
                              deleteCourseMutation.mutate(course.id.toString());
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4 mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingProgress ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading enrollments...
                    </TableCell>
                  </TableRow>
                ) : progress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  progress.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.user?.profileImageUrl} />
                            <AvatarFallback>
                              {item.user ? `${item.user.firstName[0]}${item.user.lastName[0]}` : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.plan?.name || 'Unknown Course'}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{item.completedLessons} / {item.plan?.totalLessons || 0}</span>
                            <span>{Math.round(item.progressPercentage)}%</span>
                          </div>
                          <Progress value={item.progressPercentage} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{format(parseISO(item.startedAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(parseISO(item.lastActivityAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4 mt-4">
          {loadingGroups ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Loading groups...
              </CardContent>
            </Card>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No learning groups found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <Card key={group.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {getStatusBadge(group.status)}
                    </div>
                    <CardDescription>{group.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Leader</span>
                        <span className="font-medium">{group.leaderName || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">{group.memberCount} / {group.maxMembers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meeting</span>
                        <span className="font-medium capitalize">
                          {group.meetingDay} {group.meetingTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Format</span>
                        <span className="font-medium capitalize">{group.locationType.replace('_', ' ')}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Group Progress</span>
                          <span>{Math.round(group.groupProgressPercentage)}%</span>
                        </div>
                        <Progress value={group.groupProgressPercentage} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4 mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issued Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No certificates issued yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  certificates.map(cert => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono">{cert.certificateNumber}</TableCell>
                      <TableCell>{cert.userName}</TableCell>
                      <TableCell>{cert.planName}</TableCell>
                      <TableCell>{format(parseISO(cert.issuedAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course details' : 'Create a new discipleship course'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                value={courseForm.name}
                onChange={(e) => setCourseForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., New Believers Foundations"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what students will learn..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={courseForm.category}
                  onValueChange={(v) => setCourseForm(f => ({ ...f, category: v as DiscipleshipPlan['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={courseForm.difficulty}
                  onValueChange={(v) => setCourseForm(f => ({ ...f, difficulty: v as DiscipleshipPlan['difficulty'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={courseForm.status}
                  onValueChange={(v) => setCourseForm(f => ({ ...f, status: v as DiscipleshipPlan['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Duration</Label>
                <Input
                  value={courseForm.estimatedDuration}
                  onChange={(e) => setCourseForm(f => ({ ...f, estimatedDuration: e.target.value }))}
                  placeholder="e.g., 8 weeks"
                />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL (optional)</Label>
                <Input
                  value={courseForm.coverImageUrl}
                  onChange={(e) => setCourseForm(f => ({ ...f, coverImageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCourseSubmit} disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Member</DialogTitle>
            <DialogDescription>
              {selectedCourseForEnroll && `Enroll a member in "${selectedCourseForEnroll.name}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Member</Label>
            <Select value={enrollUserId} onValueChange={setEnrollUserId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                {(members.data || []).map((m: { id: string; firstName: string; lastName: string; email: string }) => (
                  <SelectItem key={m.id} value={m.userId || m.id}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={!enrollUserId || enrollMutation.isPending}>
              Enroll Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Course Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {viewingCourse && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  {viewingCourse.coverImageUrl ? (
                    <img src={viewingCourse.coverImageUrl} alt="" className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-blue-500/50" />
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-xl">{viewingCourse.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      {getStatusBadge(viewingCourse.status)}
                      {getCategoryBadge(viewingCourse.category)}
                      {getDifficultyBadge(viewingCourse.difficulty)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {viewingCourse.description && (
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-muted-foreground">{viewingCourse.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <FileText className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{viewingCourse.totalLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{viewingCourse.enrolledCount}</p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                    <p className="text-2xl font-bold">{viewingCourse.completedCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
                {viewingCourse.averageRating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{viewingCourse.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">average rating</span>
                  </div>
                )}
                {viewingCourse.estimatedDuration && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>Estimated duration: {viewingCourse.estimatedDuration}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                <Button onClick={() => {
                  setViewDialogOpen(false);
                  openEnrollDialog(viewingCourse);
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll Member
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

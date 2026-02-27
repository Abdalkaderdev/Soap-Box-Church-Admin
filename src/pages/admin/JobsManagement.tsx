/**
 * Jobs Management Page for Church Admin
 * Employer dashboard for managing job postings and applications
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Briefcase,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Archive,
  RotateCcw,
  MessageSquare,
  History,
} from 'lucide-react';
import { format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

type JobStatus = 'draft' | 'active' | 'closed';
type JobType = 'full_time' | 'part_time' | 'contract' | 'volunteer' | 'internship';
type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'offered' | 'hired' | 'rejected' | 'withdrawn';

interface Job {
  id: string;
  churchId: string;
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  requirements: string;
  status: JobStatus;
  applicationsCount: number;
  postedDate: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobCreateInput {
  title: string;
  description: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  requirements: string;
  status: JobStatus;
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

interface Application {
  id: string;
  jobId: string;
  job?: Job;
  applicantId: string;
  applicant?: Applicant;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
  appliedDate: string;
  updatedAt: string;
  activityHistory?: ActivityHistoryItem[];
}

interface ActivityHistoryItem {
  id: string;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
}

interface JobsResponse {
  data: Job[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface ApplicationsResponse {
  data: Application[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Draft', color: 'text-gray-500', icon: FileText },
  active: { label: 'Active', color: 'text-green-500', icon: CheckCircle },
  closed: { label: 'Closed', color: 'text-red-500', icon: XCircle },
};

const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  reviewing: { label: 'Reviewing', color: 'text-blue-600', bg: 'bg-blue-100' },
  interview: { label: 'Interview', color: 'text-purple-600', bg: 'bg-purple-100' },
  offered: { label: 'Offered', color: 'text-green-600', bg: 'bg-green-100' },
  hired: { label: 'Hired', color: 'text-green-700', bg: 'bg-green-200' },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-100' },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  volunteer: 'Volunteer',
  internship: 'Internship',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function JobsManagement() {
  const { isAuthenticated, churchId, hasRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = useState<'postings' | 'applications'>('postings');

  // Job postings state
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsSearch, setJobsSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Applications state
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsSearch, setApplicationsSearch] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('');
  const [applicationJobFilter, setApplicationJobFilter] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  // Job form state
  const [jobForm, setJobForm] = useState<JobCreateInput>({
    title: '',
    description: '',
    location: '',
    jobType: 'full_time',
    salaryMin: undefined,
    salaryMax: undefined,
    requirements: '',
    status: 'draft',
  });

  // Application notes state
  const [applicationNotes, setApplicationNotes] = useState('');

  // Check for admin role
  const isChurchAdmin = hasRole(['admin', 'pastor', 'staff']);

  // ============================================================================
  // API QUERIES
  // ============================================================================

  // Fetch jobs
  const { data: jobsData, isLoading: loadingJobs } = useQuery<JobsResponse>({
    queryKey: ['jobs', churchId, jobsPage, jobsSearch, jobStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (churchId) params.set('churchId', churchId);
      params.set('page', jobsPage.toString());
      params.set('pageSize', '20');
      if (jobsSearch) params.set('search', jobsSearch);
      if (jobStatusFilter) params.set('status', jobStatusFilter);

      return api.get<JobsResponse>(`/jobs?${params.toString()}`);
    },
    enabled: !!churchId && isChurchAdmin,
  });

  // Fetch applications
  const { data: applicationsData, isLoading: loadingApplications } = useQuery<ApplicationsResponse>({
    queryKey: ['applications', churchId, applicationsPage, applicationsSearch, applicationStatusFilter, applicationJobFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (churchId) params.set('churchId', churchId);
      params.set('page', applicationsPage.toString());
      params.set('pageSize', '20');
      if (applicationsSearch) params.set('search', applicationsSearch);
      if (applicationStatusFilter) params.set('status', applicationStatusFilter);
      if (applicationJobFilter) params.set('jobId', applicationJobFilter);

      return api.get<ApplicationsResponse>(`/jobs/applications?${params.toString()}`);
    },
    enabled: !!churchId && isChurchAdmin,
  });

  // Fetch job applications for a specific job
  const { data: jobApplicationsData, isLoading: loadingJobApplications } = useQuery<ApplicationsResponse>({
    queryKey: ['job-applications', selectedJob?.id],
    queryFn: async () => {
      if (!selectedJob) return { data: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } };
      return api.get<ApplicationsResponse>(`/jobs/${selectedJob.id}/applications`);
    },
    enabled: !!selectedJob,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobCreateInput) => {
      return api.post<Job>('/jobs', { ...data, churchId });
    },
    onSuccess: () => {
      toast({
        title: 'Job Created',
        description: 'The job posting has been created successfully.',
        variant: 'success',
      });
      setJobFormOpen(false);
      resetJobForm();
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Create Job',
        description: error.message || 'An error occurred while creating the job.',
        variant: 'destructive',
      });
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobCreateInput> }) => {
      return api.put<Job>(`/jobs/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Job Updated',
        description: 'The job posting has been updated successfully.',
        variant: 'success',
      });
      setJobFormOpen(false);
      setEditingJob(null);
      resetJobForm();
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Update Job',
        description: error.message || 'An error occurred while updating the job.',
        variant: 'destructive',
      });
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Job Deleted',
        description: 'The job posting has been deleted.',
        variant: 'success',
      });
      setDeleteJobId(null);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Delete Job',
        description: error.message || 'An error occurred while deleting the job.',
        variant: 'destructive',
      });
    },
  });

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ApplicationStatus; notes?: string }) => {
      return api.put<Application>(`/jobs/applications/${id}/status`, { status, notes });
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'The application status has been updated.',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Update Status',
        description: error.message || 'An error occurred while updating the status.',
        variant: 'destructive',
      });
    },
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      location: '',
      jobType: 'full_time',
      salaryMin: undefined,
      salaryMax: undefined,
      requirements: '',
      status: 'draft',
    });
  };

  const openEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      requirements: job.requirements,
      status: job.status,
    });
    setJobFormOpen(true);
  };

  const handleJobSubmit = () => {
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: jobForm });
    } else {
      createJobMutation.mutate(jobForm);
    }
  };

  const handleToggleJobStatus = (job: Job) => {
    const newStatus: JobStatus = job.status === 'active' ? 'closed' : 'active';
    updateJobMutation.mutate({ id: job.id, data: { status: newStatus } });
  };

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    if (max) return `Up to ${formatter.format(max)}`;
    return 'Not specified';
  };

  const getApplicantName = (application: Application) => {
    if (application.applicant) {
      return `${application.applicant.firstName} ${application.applicant.lastName}`;
    }
    return 'Unknown Applicant';
  };

  const toggleSelectApplication = (id: string) => {
    setSelectedApplications((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleSelectAllApplications = () => {
    const allIds = applicationsData?.data.map((a) => a.id) || [];
    if (selectedApplications.length === allIds.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(allIds);
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const jobs = jobsData?.data || [];
  const jobsPagination = jobsData?.pagination;
  const applications = applicationsData?.data || [];
  const applicationsPagination = applicationsData?.pagination;

  // Filter jobs for job dropdown in applications filter
  const allJobs = useMemo(() => {
    return jobs;
  }, [jobs]);

  // ============================================================================
  // RENDER GUARDS
  // ============================================================================

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in with admin credentials to manage jobs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isChurchAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to manage job postings. Please contact your church administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Jobs Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage job postings and review applications
          </p>
        </div>
        <Button onClick={() => { resetJobForm(); setEditingJob(null); setJobFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Job
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'postings' | 'applications')}>
        <TabsList>
          <TabsTrigger value="postings" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Applications
          </TabsTrigger>
        </TabsList>

        {/* Job Postings Tab */}
        <TabsContent value="postings" className="space-y-4 mt-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    className="pl-10"
                    value={jobsSearch}
                    onChange={(e) => {
                      setJobsSearch(e.target.value);
                      setJobsPage(1);
                    }}
                  />
                </div>
                <Select
                  value={jobStatusFilter}
                  onValueChange={(v) => {
                    setJobStatusFilter(v);
                    setJobsPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Table */}
          <Card>
            <CardContent className="pt-6">
              {loadingJobs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No job postings</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first job posting to start receiving applications.
                  </p>
                  <Button onClick={() => { resetJobForm(); setEditingJob(null); setJobFormOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {jobs.map((job) => {
                      const statusConfig = JOB_STATUS_CONFIG[job.status];
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div key={job.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </p>
                            </div>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {job.applicationsCount} applications
                            </span>
                            <span className="text-muted-foreground">
                              {format(new Date(job.postedDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditJob(job)}>
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Applications</TableHead>
                          <TableHead>Posted Date</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => {
                          const statusConfig = JOB_STATUS_CONFIG[job.status];
                          const StatusIcon = statusConfig.icon;
                          return (
                            <TableRow key={job.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{job.title}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.location}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`flex items-center gap-1 ${statusConfig.color}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span>{statusConfig.label}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">{job.applicationsCount}</Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(job.postedDate), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditJob(job)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedJob(job)}>
                                      <Users className="w-4 h-4 mr-2" />
                                      View Applications
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleToggleJobStatus(job)}>
                                      {job.status === 'active' ? (
                                        <>
                                          <Archive className="w-4 h-4 mr-2" />
                                          Close Job
                                        </>
                                      ) : (
                                        <>
                                          <RotateCcw className="w-4 h-4 mr-2" />
                                          Reopen Job
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => setDeleteJobId(job.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {jobsPagination && jobsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(jobsPage - 1) * 20 + 1} to{' '}
                        {Math.min(jobsPage * 20, jobsPagination.totalItems)} of {jobsPagination.totalItems} jobs
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={jobsPage <= 1}
                          onClick={() => setJobsPage(jobsPage - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {jobsPage} of {jobsPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={jobsPage >= jobsPagination.totalPages}
                          onClick={() => setJobsPage(jobsPage + 1)}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4 mt-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by applicant name or email..."
                    className="pl-10"
                    value={applicationsSearch}
                    onChange={(e) => {
                      setApplicationsSearch(e.target.value);
                      setApplicationsPage(1);
                    }}
                  />
                </div>
                <Select
                  value={applicationJobFilter}
                  onValueChange={(v) => {
                    setApplicationJobFilter(v);
                    setApplicationsPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All jobs</SelectItem>
                    {allJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={applicationStatusFilter}
                  onValueChange={(v) => {
                    setApplicationStatusFilter(v);
                    setApplicationsPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {Object.entries(APPLICATION_STATUS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardContent className="pt-6">
              {loadingApplications ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No applications</h3>
                  <p className="text-muted-foreground">
                    Applications will appear here once candidates apply to your job postings.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {applications.map((application) => {
                      const statusConfig = APPLICATION_STATUS_CONFIG[application.status];
                      return (
                        <div
                          key={application.id}
                          className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{getApplicantName(application)}</p>
                              <p className="text-sm text-muted-foreground">
                                {application.job?.title || 'Unknown Job'}
                              </p>
                            </div>
                            <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                            </span>
                            {application.resumeUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-3 h-3 mr-1" />
                                  Resume
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedApplications.length === applications.length && applications.length > 0}
                              onCheckedChange={toggleSelectAllApplications}
                            />
                          </TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => {
                          const statusConfig = APPLICATION_STATUS_CONFIG[application.status];
                          return (
                            <TableRow key={application.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedApplications.includes(application.id)}
                                  onCheckedChange={() => toggleSelectApplication(application.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{getApplicantName(application)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {application.applicant?.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{application.job?.title || 'Unknown Job'}</TableCell>
                              <TableCell>
                                <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedApplication(application)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {application.resumeUrl && (
                                      <DropdownMenuItem asChild>
                                        <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                          <Download className="w-4 h-4 mr-2" />
                                          Download Resume
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedApplication(application);
                                        setApplicationNotes(application.notes || '');
                                      }}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Change Status
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {applicationsPagination && applicationsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(applicationsPage - 1) * 20 + 1} to{' '}
                        {Math.min(applicationsPage * 20, applicationsPagination.totalItems)} of {applicationsPagination.totalItems} applications
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={applicationsPage <= 1}
                          onClick={() => setApplicationsPage(applicationsPage - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {applicationsPage} of {applicationsPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={applicationsPage >= applicationsPagination.totalPages}
                          onClick={() => setApplicationsPage(applicationsPage + 1)}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================================== */}
      {/* MODALS AND DIALOGS */}
      {/* ======================================================================== */}

      {/* Create/Edit Job Modal */}
      <Dialog open={jobFormOpen} onOpenChange={(open) => { setJobFormOpen(open); if (!open) { setEditingJob(null); resetJobForm(); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</DialogTitle>
            <DialogDescription>
              {editingJob ? 'Update the job posting details.' : 'Fill in the details to create a new job posting.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Youth Pastor, Worship Leader"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                className="min-h-[150px]"
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Austin, TX or Remote"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select
                  value={jobForm.jobType}
                  onValueChange={(v) => setJobForm({ ...jobForm, jobType: v as JobType })}
                >
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary (optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="50000"
                    className="pl-10"
                    value={jobForm.salaryMin || ''}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary (optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="75000"
                    className="pl-10"
                    value={jobForm.salaryMax || ''}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List the qualifications, skills, and experience required..."
                className="min-h-[100px]"
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={jobForm.status}
                onValueChange={(v) => setJobForm({ ...jobForm, status: v as JobStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft - Save for later</SelectItem>
                  <SelectItem value="active">Active - Publish now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setJobFormOpen(false); setEditingJob(null); resetJobForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleJobSubmit}
              disabled={!jobForm.title || !jobForm.description || !jobForm.location || createJobMutation.isPending || updateJobMutation.isPending}
            >
              {(createJobMutation.isPending || updateJobMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingJob ? 'Save Changes' : (jobForm.status === 'active' ? 'Publish Job' : 'Save as Draft')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Applications Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.applicationsCount} application(s) received
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 font-medium">{selectedJob.location}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{JOB_TYPE_LABELS[selectedJob.jobType]}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Salary:</span>
                  <span className="ml-2 font-medium">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={`ml-2 ${JOB_STATUS_CONFIG[selectedJob.status].color}`}>
                    {JOB_STATUS_CONFIG[selectedJob.status].label}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Applications</h4>
                {loadingJobApplications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : !jobApplicationsData?.data.length ? (
                  <p className="text-muted-foreground text-center py-8">No applications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {jobApplicationsData.data.map((app) => {
                      const statusConfig = APPLICATION_STATUS_CONFIG[app.status];
                      return (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => { setSelectedJob(null); setSelectedApplication(app); setApplicationNotes(app.notes || ''); }}
                        >
                          <div>
                            <p className="font-medium">{getApplicantName(app)}</p>
                            <p className="text-sm text-muted-foreground">{app.applicant?.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(app.appliedDate), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => { setSelectedApplication(null); setApplicationNotes(''); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application for {selectedApplication?.job?.title || 'Unknown Job'}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Applicant Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{getApplicantName(selectedApplication)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{selectedApplication.applicant?.email}</span>
                  </div>
                  {selectedApplication.applicant?.phone && (
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2">{selectedApplication.applicant.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="ml-2">{format(new Date(selectedApplication.appliedDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Cover Letter
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.resumeUrl && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resume
                  </h4>
                  <Button variant="outline" asChild>
                    <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume
                    </a>
                  </Button>
                </div>
              )}

              <Separator />

              {/* Status Update */}
              <div>
                <h4 className="font-medium mb-3">Update Status</h4>
                <div className="space-y-4">
                  <Select
                    value={selectedApplication.status}
                    onValueChange={(v) => {
                      updateApplicationStatusMutation.mutate({
                        id: selectedApplication.id,
                        status: v as ApplicationStatus,
                        notes: applicationNotes,
                      });
                      setSelectedApplication({ ...selectedApplication, status: v as ApplicationStatus });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(APPLICATION_STATUS_CONFIG).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add internal notes about this application..."
                      value={applicationNotes}
                      onChange={(e) => setApplicationNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateApplicationStatusMutation.mutate({
                          id: selectedApplication.id,
                          status: selectedApplication.status,
                          notes: applicationNotes,
                        });
                      }}
                      disabled={updateApplicationStatusMutation.isPending}
                    >
                      {updateApplicationStatusMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity History */}
              {selectedApplication.activityHistory && selectedApplication.activityHistory.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Activity History
                  </h4>
                  <div className="space-y-2">
                    {selectedApplication.activityHistory.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div>
                          <p>{activity.description}</p>
                          <p className="text-muted-foreground text-xs">
                            {activity.userName && `${activity.userName} - `}
                            {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedApplication(null); setApplicationNotes(''); }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Job Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Job Posting
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
              All applications associated with this job will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && deleteJobMutation.mutate(deleteJobId)}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteJobMutation.isPending}
            >
              {deleteJobMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  MessageSquare,
  Bell,
  Plus,
  Search,
  Send,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Loader2,
  Share2,
  Heart,
  MessageCircle,
  Image,
  Megaphone,
  Calendar,
  LayoutTemplate,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  useMessages,
  useMessageTemplates,
  useAnnouncements,
  useCommunicationStats,
  useSendMessage,
  useSaveDraft,
  useDeleteAnnouncement,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  type Announcement,
  type MessageFilters,
} from '@/hooks/useCommunications';
import { useAuth } from '@/hooks/useAuth';
import type { Message as ApiMessage, MessageTemplate, MessageType, RecipientFilter, TemplateCategory } from '@/types';

// Using local interfaces that map from API types
interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push';
  recipients: string;
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentAt?: string;
  scheduledFor?: string;
  openRate?: number;
  clickRate?: number;
}

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject: string;
  content: string;
  category: string;
  lastUsed: string;
}

// Template categories (matches TemplateCategory type from @/types)
const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'welcome',
  'event',
  'newsletter',
  'reminder',
  'follow-up',
  'announcement',
  'thank-you',
  'general',
];

interface CommunityPost {
  id: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  likes: number;
  comments: number;
  hasImage: boolean;
  pinned: boolean;
}

// TODO: Replace with real API when community posts endpoint is available
// Currently there is no communityPostsApi in the backend
const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    content: 'Reminder: Our Easter service times will be at 8am, 10am, and 12pm. Invite your friends and family! ',
    author: 'Pastor John',
    authorRole: 'Senior Pastor',
    createdAt: '2026-02-25T10:00:00Z',
    likes: 45,
    comments: 12,
    hasImage: false,
    pinned: true,
  },
  {
    id: '2',
    content: 'Thank you to everyone who volunteered at the food drive this weekend. Together we packed over 500 meals for families in need!',
    author: 'Sarah Mitchell',
    authorRole: 'Outreach Coordinator',
    createdAt: '2026-02-24T15:30:00Z',
    likes: 89,
    comments: 23,
    hasImage: true,
    pinned: false,
  },
  {
    id: '3',
    content: 'Youth group meets every Wednesday at 7pm. This week we\'re discussing "Finding Your Purpose". All teens welcome!',
    author: 'Mike Thompson',
    authorRole: 'Youth Pastor',
    createdAt: '2026-02-23T09:00:00Z',
    likes: 32,
    comments: 8,
    hasImage: false,
    pinned: false,
  },
];

const typeIcons: Record<Message['type'], React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  sms: <MessageSquare className="h-4 w-4" />,
  push: <Bell className="h-4 w-4" />,
};

const statusColors: Record<Message['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusIcons: Record<Message['status'], React.ReactNode> = {
  draft: <FileText className="h-3 w-3" />,
  scheduled: <Clock className="h-3 w-3" />,
  sent: <CheckCircle className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

function MessageCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-40 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full mt-3" />
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function Communications() {
  // churchId is used internally by hooks via useAuth
  useAuth();

  // Fetch data using individual hooks for better control
  const [messageFilters] = useState<MessageFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useMessages(messageFilters);

  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useMessageTemplates();

  const {
    data: announcementsData,
    isLoading: isLoadingAnnouncements,
    error: announcementsError,
  } = useAnnouncements();

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useCommunicationStats();

  const sendMessageMutation = useSendMessage();
  const saveDraftMutation = useSaveDraft();
  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const duplicateTemplateMutation = useDuplicateTemplate();

  // Map API messages to UI format
  const messages: Message[] = (messagesData?.data ?? []).map((msg: ApiMessage) => ({
    id: msg.id,
    subject: msg.subject,
    content: msg.body,
    type: msg.type as Message['type'],
    recipients: msg.recipientCount > 0 ? 'Members' : 'None',
    recipientCount: msg.recipientCount,
    status: msg.status as Message['status'],
    sentAt: msg.sentAt,
    scheduledFor: msg.scheduledFor,
    openRate: msg.stats?.openRate,
    clickRate: msg.stats?.clickRate,
  }));

  // Map API templates to UI format
  const templates: Template[] = (templatesData ?? []).map((tmpl: MessageTemplate) => ({
    id: tmpl.id,
    name: tmpl.name,
    type: tmpl.type as Template['type'],
    subject: tmpl.subject || '',
    content: tmpl.body || '',
    category: tmpl.category || 'general',
    lastUsed: tmpl.updatedAt,
  }));

  // Use announcements from API
  const announcements: Announcement[] = announcementsData ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Template management state
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [isDuplicateTemplateOpen, setIsDuplicateTemplateOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [templateToDuplicate, setTemplateToDuplicate] = useState<Template | null>(null);
  const [duplicateTemplateName, setDuplicateTemplateName] = useState('');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState<string>('all');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');

  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState<string>('email');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('general');

  // Form state for new message
  const [messageType, setMessageType] = useState<string>('');
  const [recipients, setRecipients] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [scheduleForLater, setScheduleForLater] = useState(false);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || msg.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Use stats from API
  const totalSent = statsData?.totalSent ?? 0;
  const totalRecipients = statsData?.totalDelivered ?? 0;
  const avgOpenRate = statsData?.averageOpenRate ? Math.round(statsData.averageOpenRate) : 0;
  const scheduledCount = messages.filter((m) => m.status === 'scheduled').length;

  const error = messagesError || templatesError || announcementsError || statsError;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Map recipient selection to proper filter
  const getRecipientFilter = (recipientSelection: string): RecipientFilter | undefined => {
    switch (recipientSelection) {
      case 'all':
        return {}; // No filter = all members
      case 'active':
        return { membershipStatus: ['active'] };
      case 'volunteers':
        return { tags: ['volunteer'] };
      case 'youth':
        return { tags: ['youth', 'parent'] };
      case 'leaders':
        return { tags: ['ministry-leader'] };
      default:
        return undefined;
    }
  };

  // Template form reset helper
  const resetTemplateForm = () => {
    setTemplateName('');
    setTemplateType('email');
    setTemplateSubject('');
    setTemplateContent('');
    setTemplateCategory('general');
  };

  // Handle create template
  const handleCreateTemplate = async () => {
    if (!templateName || !templateType || !templateContent) {
      return;
    }

    await createTemplateMutation.mutateAsync({
      name: templateName,
      type: templateType as MessageType,
      subject: templateSubject,
      body: templateContent,
      category: templateCategory as TemplateCategory,
    });

    resetTemplateForm();
    setIsCreateTemplateOpen(false);
  };

  // Handle edit template
  const handleEditTemplate = async () => {
    if (!templateToEdit || !templateName || !templateType || !templateContent) {
      return;
    }

    await updateTemplateMutation.mutateAsync({
      templateId: templateToEdit.id,
      data: {
        name: templateName,
        type: templateType as MessageType,
        subject: templateSubject,
        body: templateContent,
        category: templateCategory as TemplateCategory,
      },
    });

    resetTemplateForm();
    setTemplateToEdit(null);
    setIsEditTemplateOpen(false);
  };

  // Handle delete template
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    await deleteTemplateMutation.mutateAsync(templateToDelete.id);
    setTemplateToDelete(null);
  };

  // Handle duplicate template
  const handleDuplicateTemplate = async () => {
    if (!templateToDuplicate || !duplicateTemplateName) return;

    await duplicateTemplateMutation.mutateAsync({
      templateId: templateToDuplicate.id,
      name: duplicateTemplateName,
    });

    setTemplateToDuplicate(null);
    setDuplicateTemplateName('');
    setIsDuplicateTemplateOpen(false);
  };

  // Open duplicate dialog with template data
  const openDuplicateTemplate = (template: Template) => {
    setTemplateToDuplicate(template);
    setDuplicateTemplateName(`${template.name} (Copy)`);
    setIsDuplicateTemplateOpen(true);
  };

  // Open edit dialog with template data
  const openEditTemplate = (template: Template) => {
    setTemplateToEdit(template);
    setTemplateName(template.name);
    setTemplateType(template.type);
    setTemplateSubject(template.subject);
    setTemplateContent(template.content);
    setTemplateCategory(template.category);
    setIsEditTemplateOpen(true);
  };

  // Use template to pre-fill message composer
  const useTemplate = (template: Template) => {
    setMessageType(template.type);
    setSubject(template.subject);
    setContent(template.content);
    setIsComposeOpen(true);
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(templateSearchQuery.toLowerCase());
    const matchesType = templateTypeFilter === 'all' || template.type === templateTypeFilter;
    const matchesCategory = templateCategoryFilter === 'all' || template.category === templateCategoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleSendMessage = async () => {
    if (!messageType || !recipients || !subject || !content) {
      return;
    }

    await sendMessageMutation.mutateAsync({
      type: messageType as MessageType,
      recipientFilter: getRecipientFilter(recipients),
      subject,
      body: content,
      scheduledFor: scheduleForLater ? new Date(Date.now() + 86400000).toISOString() : undefined,
    });

    // Reset form and close dialog
    setMessageType('');
    setRecipients('');
    setSubject('');
    setContent('');
    setScheduleForLater(false);
    setIsComposeOpen(false);
  };

  const handleSaveDraft = async () => {
    if (!messageType || !subject || !content) {
      return;
    }

    await saveDraftMutation.mutateAsync({
      type: messageType as MessageType,
      recipientFilter: recipients ? getRecipientFilter(recipients) : undefined,
      subject,
      body: content,
    });

    // Reset form and close dialog
    setMessageType('');
    setRecipients('');
    setSubject('');
    setContent('');
    setScheduleForLater(false);
    setIsComposeOpen(false);
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load communications. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground mt-1">
            Send emails, SMS, and push notifications
          </p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>
                Create and send a message to your church members
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Template Selector */}
              {templates.length > 0 && (
                <div className="grid gap-2">
                  <Label>Start from Template (optional)</Label>
                  <Select
                    value=""
                    onValueChange={(templateId) => {
                      const template = templates.find((t) => t.id === templateId);
                      if (template) {
                        setMessageType(template.type);
                        setSubject(template.subject);
                        setContent(template.content);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <span>{template.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {template.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="msgType">Message Type</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select value={recipients} onValueChange={setRecipients}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="active">Active Members</SelectItem>
                      <SelectItem value="volunteers">Volunteers</SelectItem>
                      <SelectItem value="youth">Youth & Parents</SelectItem>
                      <SelectItem value="leaders">Ministry Leaders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Message Content</Label>
                <textarea
                  id="content"
                  className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Write your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={scheduleForLater}
                  onCheckedChange={(checked) => setScheduleForLater(checked as boolean)}
                />
                <label htmlFor="schedule" className="text-sm">
                  Schedule for later
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                >
                  {saveDraftMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRecipients.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">People reached</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgOpenRate}%</div>
                <p className="text-xs text-muted-foreground">Email opens</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledCount}</div>
                <p className="text-xs text-muted-foreground">Messages queued</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="messages" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Messages
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Templates
          </TabsTrigger>
          <TabsTrigger value="announcements" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="community" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Megaphone className="mr-2 h-4 w-4" />
            Community Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message List */}
          <div className="space-y-3">
            {isLoadingMessages ? (
              <>
                <MessageCardSkeleton />
                <MessageCardSkeleton />
                <MessageCardSkeleton />
              </>
            ) : filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No messages found.
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {typeIcons[message.type]}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{message.subject}</h3>
                            <Badge className={`${statusColors[message.status]} flex items-center gap-1`}>
                              {statusIcons[message.status]}
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {message.content}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {message.recipients} ({message.recipientCount})
                            </span>
                            {message.sentAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Sent {formatDate(message.sentAt)}
                              </span>
                            )}
                            {message.scheduledFor && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Scheduled for {formatDate(message.scheduledFor)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {message.openRate && (
                          <div className="text-right hidden md:block">
                            <div className="text-sm font-medium">{message.openRate}%</div>
                            <div className="text-xs text-muted-foreground">Open rate</div>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Template Header with Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Message Templates</h2>
              <p className="text-sm text-muted-foreground">
                Save time with reusable message templates
              </p>
            </div>
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetTemplateForm();
                    setIsCreateTemplateOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable message template for quick communication
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="templateName">Template Name *</Label>
                      <Input
                        id="templateName"
                        placeholder="e.g., Weekly Newsletter"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="templateType">Type *</Label>
                      <Select value={templateType} onValueChange={setTemplateType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </div>
                          </SelectItem>
                          <SelectItem value="sms">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              SMS
                            </div>
                          </SelectItem>
                          <SelectItem value="push">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              Push Notification
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="templateCategory">Category</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {templateType === 'email' && (
                    <div className="grid gap-2">
                      <Label htmlFor="templateSubject">Subject Line</Label>
                      <Input
                        id="templateSubject"
                        placeholder="Enter email subject"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="templateContent">Content *</Label>
                    <textarea
                      id="templateContent"
                      className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      placeholder="Write your template content here... You can use variables like {{firstName}}, {{churchName}}, etc."
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{churchName}}'}, {'{{date}}'}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetTemplateForm();
                        setIsCreateTemplateOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTemplate}
                      disabled={createTemplateMutation.isPending || !templateName || !templateContent}
                    >
                      {createTemplateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <LayoutTemplate className="mr-2 h-4 w-4" />
                          Create Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Template Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={templateTypeFilter} onValueChange={setTemplateTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateCategoryFilter} onValueChange={setTemplateCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingTemplates ? (
              <>
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
              </>
            ) : filteredTemplates.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {templates.length === 0
                      ? 'Create your first template to get started.'
                      : 'No templates match your search criteria.'}
                  </p>
                  {templates.length === 0 && (
                    <Button onClick={() => setIsCreateTemplateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {template.type === 'email' && <Mail className="h-3 w-3" />}
                        {template.type === 'sms' && <MessageSquare className="h-3 w-3" />}
                        {template.type === 'push' && <Bell className="h-3 w-3" />}
                        {template.type}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => useTemplate(template)}>
                            <Send className="mr-2 h-4 w-4" />
                            Use Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditTemplate(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDuplicateTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setTemplateToDelete(template)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                    {template.subject && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {template.subject}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {template.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(template.lastUsed).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => useTemplate(template)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Edit Template Dialog */}
          <Dialog open={isEditTemplateOpen} onOpenChange={setIsEditTemplateOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Template</DialogTitle>
                <DialogDescription>
                  Update your message template
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editTemplateName">Template Name *</Label>
                    <Input
                      id="editTemplateName"
                      placeholder="e.g., Weekly Newsletter"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editTemplateType">Type *</Label>
                    <Select value={templateType} onValueChange={setTemplateType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            SMS
                          </div>
                        </SelectItem>
                        <SelectItem value="push">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Push Notification
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTemplateCategory">Category</Label>
                  <Select value={templateCategory} onValueChange={setTemplateCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {templateType === 'email' && (
                  <div className="grid gap-2">
                    <Label htmlFor="editTemplateSubject">Subject Line</Label>
                    <Input
                      id="editTemplateSubject"
                      placeholder="Enter email subject"
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="editTemplateContent">Content *</Label>
                  <textarea
                    id="editTemplateContent"
                    className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Write your template content here..."
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available variables: {'{{firstName}}'}, {'{{lastName}}'}, {'{{churchName}}'}, {'{{date}}'}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetTemplateForm();
                      setTemplateToEdit(null);
                      setIsEditTemplateOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditTemplate}
                    disabled={updateTemplateMutation.isPending || !templateName || !templateContent}
                  >
                    {updateTemplateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Template Confirmation Dialog */}
          <AlertDialog
            open={templateToDelete !== null}
            onOpenChange={(open) => !open && setTemplateToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the template "{templateToDelete?.name}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTemplate}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Duplicate Template Dialog */}
          <Dialog open={isDuplicateTemplateOpen} onOpenChange={setIsDuplicateTemplateOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Duplicate Template</DialogTitle>
                <DialogDescription>
                  Create a copy of "{templateToDuplicate?.name}" with a new name
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="duplicateTemplateName">New Template Name *</Label>
                  <Input
                    id="duplicateTemplateName"
                    placeholder="Enter name for the duplicate"
                    value={duplicateTemplateName}
                    onChange={(e) => setDuplicateTemplateName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTemplateToDuplicate(null);
                      setDuplicateTemplateName('');
                      setIsDuplicateTemplateOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDuplicateTemplate}
                    disabled={duplicateTemplateMutation.isPending || !duplicateTemplateName}
                  >
                    {duplicateTemplateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Duplicating...
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Church Announcements</CardTitle>
              <CardDescription>
                Announcements displayed in the church app and website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAnnouncements ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No announcements yet. Create your first announcement to get started.
                </div>
              ) : (
                <>
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          {announcement.active && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                          {announcement.priority === 'high' && (
                            <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                          disabled={deleteAnnouncementMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Announcement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          {/* New Post Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Share an update with your community..."
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Image className="h-4 w-4 mr-1" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Event
                      </Button>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Share2 className="h-4 w-4 mr-2" />
                      Post to Community
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List - TODO: Replace with real API when available */}
          <div className="space-y-4">
            {mockCommunityPosts.map((post) => (
              <Card key={post.id} className={post.pinned ? 'border-primary/30 bg-primary/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.author}</span>
                          <Badge variant="secondary" className="text-xs">{post.authorRole}</Badge>
                          {post.pinned && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {post.pinned ? 'Unpin' : 'Pin'} Post
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                      {post.hasImage && (
                        <div className="mt-3 rounded-lg bg-muted h-48 flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex items-center gap-6 mt-4 pt-3 border-t">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments} comments</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

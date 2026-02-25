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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCommunications } from '@/hooks/useCommunications';

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
  category: string;
  lastUsed: string;
}

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
  const { data, isLoading, error, sendMessage, isSending } = useCommunications();

  // Map API messages to UI format
  const messages: Message[] = (data?.messages ?? []).map((msg) => ({
    id: msg.id,
    subject: msg.subject,
    content: msg.body, // API uses 'body', UI uses 'content'
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
  const templates: Template[] = (data?.templates ?? []).map((tmpl) => ({
    id: tmpl.id,
    name: tmpl.name,
    type: tmpl.type as Template['type'],
    category: 'General', // Default category since API doesn't have this
    lastUsed: tmpl.updatedAt, // Use updatedAt as proxy for lastUsed
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

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

  const totalSent = messages.filter((m) => m.status === 'sent').length;
  const totalRecipients = messages
    .filter((m) => m.status === 'sent')
    .reduce((sum, m) => sum + m.recipientCount, 0);
  const messagesWithOpenRate = messages.filter((m) => m.openRate);
  const avgOpenRate = messagesWithOpenRate.length > 0
    ? Math.round(
        messagesWithOpenRate.reduce((sum, m) => sum + (m.openRate || 0), 0) /
          messagesWithOpenRate.length
      )
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSendMessage = async () => {
    if (!messageType || !recipients || !subject || !content) {
      return;
    }

    await sendMessage({
      type: messageType as Message['type'],
      recipients,
      subject,
      content,
      scheduleForLater,
    });

    // Reset form and close dialog
    setMessageType('');
    setRecipients('');
    setSubject('');
    setContent('');
    setScheduleForLater(false);
    setIsComposeOpen(false);
  };

  const handleSaveDraft = () => {
    // Save as draft logic would go here
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
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending}>
                  {isSending ? (
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
        {isLoading ? (
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
                <div className="text-2xl font-bold">
                  {messages.filter((m) => m.status === 'scheduled').length}
                </div>
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
            {isLoading ? (
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
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Save time with reusable message templates
            </p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
                <TemplateCardSkeleton />
              </>
            ) : templates.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No templates found.
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Last used: {new Date(template.lastUsed).toLocaleDateString()}
                    </p>
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  {[
                    {
                      title: 'Easter Services',
                      content: 'Join us for special Easter services on April 5th at 9 AM and 11 AM.',
                      active: true,
                      expires: '2026-04-06',
                    },
                    {
                      title: 'Building Fund Update',
                      content: 'We have reached 75% of our building fund goal!',
                      active: true,
                      expires: '2026-03-15',
                    },
                    {
                      title: 'New Small Groups',
                      content: 'Spring small groups are forming now. Sign up in the lobby!',
                      active: true,
                      expires: '2026-03-01',
                    },
                  ].map((announcement, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          {announcement.active && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Expires: {new Date(announcement.expires).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Announcement
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

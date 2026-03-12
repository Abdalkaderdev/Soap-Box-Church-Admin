import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Send,
  Archive,
  Eye,
  Calendar,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Search,
  Clock,
  CheckCircle2,
  BarChart3,
  Image,
  Video,
  Paperclip,
  Pin,
} from "lucide-react";
import { useChurch } from "@/hooks/useChurch";
import { announcementsApi, campusApi, type Announcement } from "@/lib/api";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Everyone' },
  { value: 'members', label: 'Members Only' },
  { value: 'visitors', label: 'Visitors' },
  { value: 'leaders', label: 'Leaders & Staff' },
];

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; color: string }> = {
    draft: { variant: "secondary", icon: <Clock className="h-3 w-3" />, color: "text-gray-500" },
    scheduled: { variant: "outline", icon: <Calendar className="h-3 w-3" />, color: "text-blue-500" },
    published: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-green-500" },
    archived: { variant: "secondary", icon: <Archive className="h-3 w-3" />, color: "text-gray-400" },
  };
  const config = variants[status] || { variant: "secondary" as const, icon: null, color: "" };
  return (
    <Badge variant={config.variant} className={`gap-1 capitalize ${config.color}`}>
      {config.icon}
      {status}
    </Badge>
  );
}

function getPriorityBadge(priority: string) {
  const colors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    normal: "bg-blue-100 text-blue-600",
    high: "bg-amber-100 text-amber-600",
    urgent: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors[priority] || colors.normal}`}>
      {priority}
    </span>
  );
}

export default function Announcements() {
  const { churchId } = useChurch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Status filter for future use
  const [statusFilter] = useState<string>("all");
  void statusFilter; // Prevent unused variable warning

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    videoUrl: "",
    publishAt: "",
    expiresAt: "",
    status: "draft" as Announcement['status'],
    targetAudience: "all" as Announcement['targetAudience'],
    targetCampusId: "",
    showOnApp: true,
    sendEmail: false,
    sendSms: false,
    showOnWebsite: false,
    priority: "normal" as Announcement['priority'],
    isPinned: false,
    pinnedUntil: "",
  });

  // View dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);

  // Queries
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements', churchId, statusFilter],
    queryFn: () => announcementsApi.list(churchId!, statusFilter !== 'all' ? statusFilter : undefined),
    enabled: !!churchId,
  });

  const { data: stats } = useQuery({
    queryKey: ['announcement-stats', churchId],
    queryFn: () => announcementsApi.getStats(churchId!),
    enabled: !!churchId,
  });

  const { data: campuses = [] } = useQuery({
    queryKey: ['campuses', churchId],
    queryFn: () => campusApi.listCampuses(churchId!),
    enabled: !!churchId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Announcement>) => announcementsApi.create(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', churchId] });
      queryClient.invalidateQueries({ queryKey: ['announcement-stats', churchId] });
      toast.success("Announcement created successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create announcement"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      announcementsApi.update(churchId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', churchId] });
      queryClient.invalidateQueries({ queryKey: ['announcement-stats', churchId] });
      toast.success("Announcement updated successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update announcement"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.delete(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', churchId] });
      queryClient.invalidateQueries({ queryKey: ['announcement-stats', churchId] });
      toast.success("Announcement deleted successfully");
    },
    onError: () => toast.error("Failed to delete announcement"),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.publish(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', churchId] });
      queryClient.invalidateQueries({ queryKey: ['announcement-stats', churchId] });
      toast.success("Announcement published successfully");
    },
    onError: () => toast.error("Failed to publish announcement"),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.archive(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', churchId] });
      queryClient.invalidateQueries({ queryKey: ['announcement-stats', churchId] });
      toast.success("Announcement archived successfully");
    },
    onError: () => toast.error("Failed to archive announcement"),
  });

  // Form handlers
  function resetForm() {
    setEditingAnnouncement(null);
    setForm({
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      videoUrl: "",
      publishAt: "",
      expiresAt: "",
      status: "draft",
      targetAudience: "all",
      targetCampusId: "",
      showOnApp: true,
      sendEmail: false,
      sendSms: false,
      showOnWebsite: false,
      priority: "normal",
      isPinned: false,
      pinnedUntil: "",
    });
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(announcement: Announcement) {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      excerpt: announcement.excerpt || "",
      imageUrl: announcement.imageUrl || "",
      videoUrl: announcement.videoUrl || "",
      publishAt: announcement.publishAt ? format(parseISO(announcement.publishAt), 'yyyy-MM-dd\'T\'HH:mm') : "",
      expiresAt: announcement.expiresAt ? format(parseISO(announcement.expiresAt), 'yyyy-MM-dd\'T\'HH:mm') : "",
      status: announcement.status,
      targetAudience: announcement.targetAudience,
      targetCampusId: announcement.targetCampusId?.toString() || "",
      showOnApp: announcement.showOnApp,
      sendEmail: announcement.sendEmail,
      sendSms: announcement.sendSms,
      showOnWebsite: announcement.showOnWebsite,
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      pinnedUntil: announcement.pinnedUntil ? format(parseISO(announcement.pinnedUntil), 'yyyy-MM-dd') : "",
    });
    setDialogOpen(true);
  }

  function openViewDialog(announcement: Announcement) {
    setViewingAnnouncement(announcement);
    setViewDialogOpen(true);
  }

  function handleSubmit() {
    const data: Partial<Announcement> = {
      title: form.title,
      content: form.content,
      excerpt: form.excerpt || undefined,
      imageUrl: form.imageUrl || undefined,
      videoUrl: form.videoUrl || undefined,
      publishAt: form.publishAt || undefined,
      expiresAt: form.expiresAt || undefined,
      status: form.status,
      targetAudience: form.targetAudience,
      targetCampusId: form.targetCampusId ? parseInt(form.targetCampusId) : undefined,
      showOnApp: form.showOnApp,
      sendEmail: form.sendEmail,
      sendSms: form.sendSms,
      showOnWebsite: form.showOnWebsite,
      priority: form.priority,
      isPinned: form.isPinned,
      pinnedUntil: form.pinnedUntil || undefined,
    };

    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id.toString(), data });
    } else {
      createMutation.mutate(data);
    }
  }

  // Filter announcements
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pinned") return matchesSearch && a.isPinned;
    return matchesSearch && a.status === activeTab;
  });

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Please select a church to manage announcements.</p>
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
            <Megaphone className="h-8 w-8 text-orange-500" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage church-wide announcements and news
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Megaphone className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{stats?.total ?? announcements.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-gray-500" />
              <p className="text-2xl font-bold">{stats?.draft ?? 0}</p>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats?.scheduled ?? 0}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats?.published ?? 0}</p>
              <p className="text-xs text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Send className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats?.thisMonth ?? 0}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
              <p className="text-2xl font-bold">{stats?.totalViews ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{stats?.totalClicks ?? 0}</p>
              <p className="text-xs text-muted-foreground">Clicks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Megaphone className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2">
              <Clock className="h-4 w-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Published
            </TabsTrigger>
            <TabsTrigger value="pinned" className="gap-2">
              <Pin className="h-4 w-4" />
              Pinned
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Announcements Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading announcements...
                </TableCell>
              </TableRow>
            ) : filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map(announcement => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    {announcement.isPinned && (
                      <Pin className="h-4 w-4 text-amber-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium line-clamp-1">{announcement.title}</p>
                      {announcement.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{announcement.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {announcement.imageUrl && <Image className="h-3 w-3 text-muted-foreground" />}
                        {announcement.videoUrl && <Video className="h-3 w-3 text-muted-foreground" />}
                        {announcement.attachments && announcement.attachments.length > 0 && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                  <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                  <TableCell className="capitalize">{announcement.targetAudience}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {announcement.showOnApp && (
                        <span title="Mobile App"><Smartphone className="h-4 w-4 text-blue-500" /></span>
                      )}
                      {announcement.sendEmail && (
                        <span title="Email"><Mail className="h-4 w-4 text-green-500" /></span>
                      )}
                      {announcement.sendSms && (
                        <span title="SMS"><MessageSquare className="h-4 w-4 text-purple-500" /></span>
                      )}
                      {announcement.showOnWebsite && (
                        <span title="Website"><Globe className="h-4 w-4 text-amber-500" /></span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(parseISO(announcement.createdAt), 'MMM d, yyyy')}</p>
                      {announcement.author && (
                        <p className="text-muted-foreground">
                          by {announcement.author.firstName} {announcement.author.lastName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openViewDialog(announcement)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {announcement.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => publishMutation.mutate(announcement.id.toString())}
                          title="Publish"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {announcement.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => archiveMutation.mutate(announcement.id.toString())}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(announcement)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this announcement?')) {
                            deleteMutation.mutate(announcement.id.toString());
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
            <DialogDescription>
              {editingAnnouncement ? 'Update announcement details' : 'Create a new announcement for your congregation'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Title and Priority */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v as Announcement['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your announcement content here..."
                rows={6}
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label>Excerpt (optional)</Label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short preview text"
              />
            </div>

            {/* Media */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image URL (optional)</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL (optional)</Label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Announcement['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Publish At (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.publishAt}
                  onChange={(e) => setForm(f => ({ ...f, publishAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            {/* Targeting */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.targetAudience}
                  onValueChange={(v) => setForm(f => ({ ...f, targetAudience: v as Announcement['targetAudience'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campus (optional)</Label>
                <Select
                  value={form.targetCampusId}
                  onValueChange={(v) => setForm(f => ({ ...f, targetCampusId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All campuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Campuses</SelectItem>
                    {campuses.map((c: { id: number; name: string }) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Channels */}
            <div className="space-y-3">
              <Label>Publishing Channels</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Mobile App</span>
                  </div>
                  <Switch
                    checked={form.showOnApp}
                    onCheckedChange={(v) => setForm(f => ({ ...f, showOnApp: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={form.sendEmail}
                    onCheckedChange={(v) => setForm(f => ({ ...f, sendEmail: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Switch
                    checked={form.sendSms}
                    onCheckedChange={(v) => setForm(f => ({ ...f, sendSms: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Website</span>
                  </div>
                  <Switch
                    checked={form.showOnWebsite}
                    onCheckedChange={(v) => setForm(f => ({ ...f, showOnWebsite: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Pinning */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Pin className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Pin Announcement</p>
                  <p className="text-sm text-muted-foreground">Keep this at the top of the list</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={form.isPinned}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isPinned: v }))}
                />
                {form.isPinned && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Until:</Label>
                    <Input
                      type="date"
                      value={form.pinnedUntil}
                      onChange={(e) => setForm(f => ({ ...f, pinnedUntil: e.target.value }))}
                      className="w-40"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingAnnouncement?.isPinned && <Pin className="h-5 w-5 text-amber-500" />}
              {viewingAnnouncement?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {viewingAnnouncement && getStatusBadge(viewingAnnouncement.status)}
              {viewingAnnouncement && getPriorityBadge(viewingAnnouncement.priority)}
            </DialogDescription>
          </DialogHeader>
          {viewingAnnouncement && (
            <div className="space-y-4 py-4">
              {viewingAnnouncement.imageUrl && (
                <img
                  src={viewingAnnouncement.imageUrl}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{viewingAnnouncement.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Target Audience</p>
                  <p className="font-medium capitalize">{viewingAnnouncement.targetAudience}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Author</p>
                  <p className="font-medium">
                    {viewingAnnouncement.author
                      ? `${viewingAnnouncement.author.firstName} ${viewingAnnouncement.author.lastName}`
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{format(parseISO(viewingAnnouncement.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Channels</p>
                  <div className="flex items-center gap-2 mt-1">
                    {viewingAnnouncement.showOnApp && <Smartphone className="h-4 w-4 text-blue-500" />}
                    {viewingAnnouncement.sendEmail && <Mail className="h-4 w-4 text-green-500" />}
                    {viewingAnnouncement.sendSms && <MessageSquare className="h-4 w-4 text-purple-500" />}
                    {viewingAnnouncement.showOnWebsite && <Globe className="h-4 w-4 text-amber-500" />}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-medium">{viewingAnnouncement.viewCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Clicks</p>
                  <p className="font-medium">{viewingAnnouncement.clickCount}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {viewingAnnouncement && viewingAnnouncement.status === 'draft' && (
              <Button onClick={() => {
                publishMutation.mutate(viewingAnnouncement.id.toString());
                setViewDialogOpen(false);
              }}>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Heart,
  Check,
  Share2,
  Lock,
  Calendar,
  Users,
  HandHeart,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { prayerApi } from "@/lib/api";
import type { PrayerFilters } from "@/lib/api";
import type { PrayerRequest, PrayerCategory, PrayerStatus, PrayerCreateInput } from "@/types";

type StatusFilter = "all" | "active" | "answered";

// Category options for the dropdown
const CATEGORY_OPTIONS: { value: PrayerCategory; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "family", label: "Family" },
  { value: "finances", label: "Finances" },
  { value: "spiritual", label: "Spiritual Growth" },
  { value: "relationships", label: "Relationships" },
  { value: "work", label: "Work/Career" },
  { value: "grief", label: "Grief & Loss" },
  { value: "thanksgiving", label: "Thanksgiving" },
  { value: "other", label: "Other" },
];

export default function PrayerRequests() {
  const { churchId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<string | null>(null);
  const [answeredDialogOpen, setAnsweredDialogOpen] = useState<string | null>(null);
  const [answeredNote, setAnsweredNote] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Form state for new prayer request
  const [newRequest, setNewRequest] = useState<{
    title: string;
    description: string;
    isPrivate: boolean;
    isUrgent: boolean;
    category: PrayerCategory;
    isAnonymous: boolean;
  }>({
    title: "",
    description: "",
    isPrivate: false,
    isUrgent: false,
    category: "other",
    isAnonymous: false,
  });

  // Build filters for API call
  const filters: PrayerFilters = useMemo(() => {
    const f: PrayerFilters = {
      page,
      pageSize,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    if (statusFilter !== "all") {
      f.status = statusFilter as PrayerStatus;
    }

    if (categoryFilter !== "all") {
      f.category = categoryFilter as PrayerCategory;
    }

    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }

    return f;
  }, [page, pageSize, statusFilter, categoryFilter, searchQuery]);

  // Fetch prayer requests
  const {
    data: prayerData,
    isLoading: loadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["prayer-requests", churchId, filters],
    queryFn: () => prayerApi.list(churchId!, filters),
    enabled: Boolean(churchId),
  });

  // Fetch prayer stats
  const {
    data: stats,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ["prayer-stats", churchId],
    queryFn: () => prayerApi.getStats(churchId!),
    enabled: Boolean(churchId),
  });

  // Create prayer request mutation
  const createMutation = useMutation({
    mutationFn: (data: PrayerCreateInput) => prayerApi.create(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests", churchId] });
      queryClient.invalidateQueries({ queryKey: ["prayer-stats", churchId] });
      setIsAddDialogOpen(false);
      setNewRequest({
        title: "",
        description: "",
        isPrivate: false,
        isUrgent: false,
        category: "other",
        isAnonymous: false,
      });
      toast({
        title: "Prayer Request Submitted",
        description: "Your prayer request has been shared with the community.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit prayer request",
        variant: "destructive",
      });
    },
  });

  // Mark as prayed mutation
  const prayedMutation = useMutation({
    mutationFn: (requestId: string) => prayerApi.markPrayed(churchId!, requestId),
    onSuccess: (data, requestId) => {
      // Optimistically update the prayer count in the cache
      queryClient.setQueryData(
        ["prayer-requests", churchId, filters],
        (oldData: typeof prayerData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((req) =>
              req.id === requestId
                ? { ...req, prayerCount: data.prayerCount }
                : req
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["prayer-stats", churchId] });
      toast({
        title: "Prayed",
        description: "Thank you for lifting up this request in prayer.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record prayer",
        variant: "destructive",
      });
    },
  });

  // Mark as answered mutation
  const answeredMutation = useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note?: string }) =>
      prayerApi.markAnswered(churchId!, requestId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests", churchId] });
      queryClient.invalidateQueries({ queryKey: ["prayer-stats", churchId] });
      setAnsweredDialogOpen(null);
      setAnsweredNote("");
      toast({
        title: "Praise God!",
        description: "This prayer request has been marked as answered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark as answered",
        variant: "destructive",
      });
    },
  });

  // Update prayer request mutation (for sharing with team)
  const updateMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: { isPrivate?: boolean } }) =>
      prayerApi.update(churchId!, requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests", churchId] });
      setShareDialogOpen(null);
      toast({
        title: "Shared",
        description: "Prayer request has been shared with the prayer team.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share request",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handlePrayed = (id: string) => {
    prayedMutation.mutate(id);
  };

  const handleMarkAnswered = (id: string) => {
    answeredMutation.mutate({ requestId: id, note: answeredNote || undefined });
  };

  const handleShareWithTeam = (id: string) => {
    updateMutation.mutate({ requestId: id, data: { isPrivate: false } });
  };

  const handleAddRequest = () => {
    if (!newRequest.title || !newRequest.description) return;

    const requestData: PrayerCreateInput = {
      title: newRequest.title,
      description: newRequest.description,
      category: newRequest.category,
      isPrivate: newRequest.isPrivate,
      isUrgent: newRequest.isUrgent,
      isAnonymous: newRequest.isAnonymous,
      submitterName: newRequest.isAnonymous ? undefined : (user ? `${user.firstName} ${user.lastName}` : undefined),
      submitterEmail: newRequest.isAnonymous ? undefined : user?.email,
    };

    createMutation.mutate(requestData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get display name for a prayer request respecting privacy
  const getDisplayName = (request: PrayerRequest): string => {
    if (request.isAnonymous) return "Anonymous";
    if (request.member) {
      return `${request.member.firstName} ${request.member.lastName}`;
    }
    return request.submitterName || "Anonymous";
  };

  // Get category label
  const getCategoryLabel = (category: PrayerCategory): string => {
    const option = CATEGORY_OPTIONS.find((c) => c.value === category);
    return option?.label || category;
  };

  const prayerRequests = prayerData?.data || [];
  const pagination = prayerData?.pagination;

  // Loading state
  if (!churchId) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Church Selected</h3>
          <p className="text-muted-foreground">Please log in to access prayer requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy-900">
            Prayer Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Share and uplift one another in prayer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchRequests()}
            disabled={loadingRequests}
          >
            <RefreshCw className={`h-4 w-4 ${loadingRequests ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-burgundy-700 hover:bg-burgundy-800 shadow-warm">
                <Plus className="h-4 w-4 mr-2" />
                New Prayer Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-ivory-50">
              <DialogHeader>
                <DialogTitle className="font-serif text-burgundy-900">
                  Submit a Prayer Request
                </DialogTitle>
                <DialogDescription>
                  Share your prayer need with our church family
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of your request"
                    value={newRequest.title}
                    onChange={(e) =>
                      setNewRequest((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newRequest.category}
                    onValueChange={(value) =>
                      setNewRequest((prev) => ({ ...prev, category: value as PrayerCategory }))
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Prayer Request</Label>
                  <Textarea
                    id="description"
                    placeholder="Share your prayer need..."
                    rows={4}
                    value={newRequest.description}
                    onChange={(e) =>
                      setNewRequest((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="bg-white resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-walnut-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <Label htmlFor="private-toggle" className="text-base">
                        Private Request
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only visible to the prayer team and staff
                      </p>
                    </div>
                    <Switch
                      id="private-toggle"
                      checked={newRequest.isPrivate}
                      onCheckedChange={(checked) =>
                        setNewRequest((prev) => ({ ...prev, isPrivate: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-walnut-200 p-4 bg-white">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous-toggle" className="text-base">
                        Submit Anonymously
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Your name will not be shown
                      </p>
                    </div>
                    <Switch
                      id="anonymous-toggle"
                      checked={newRequest.isAnonymous}
                      onCheckedChange={(checked) =>
                        setNewRequest((prev) => ({ ...prev, isAnonymous: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-orange-200 p-4 bg-orange-50">
                    <div className="space-y-0.5">
                      <Label htmlFor="urgent-toggle" className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Urgent Request
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mark as needing immediate prayer
                      </p>
                    </div>
                    <Switch
                      id="urgent-toggle"
                      checked={newRequest.isUrgent}
                      onCheckedChange={(checked) =>
                        setNewRequest((prev) => ({ ...prev, isUrgent: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRequest}
                  disabled={!newRequest.title || !newRequest.description || createMutation.isPending}
                  className="bg-burgundy-700 hover:bg-burgundy-800"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-ivory-50 border-walnut-200 shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <HandHeart className="h-4 w-4 text-burgundy-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-burgundy-900">
                {stats?.totalRequests ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-ivory-50 border-walnut-200 shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Heart className="h-4 w-4 text-burgundy-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-burgundy-900">
                {stats?.activeRequests ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-sage-50 border-sage-200 shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered Prayers</CardTitle>
            <Sparkles className="h-4 w-4 text-sage-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-sage-800">
                {stats?.answeredRequests ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-ivory-50 border-walnut-200 shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Times Prayed</CardTitle>
            <Users className="h-4 w-4 text-burgundy-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-burgundy-900">
                {stats?.totalPrayers ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-ivory-50 border-walnut-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="prayer-search"
                name="prayer-search"
                placeholder="Search by title, description, or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="pl-9 bg-white"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
              name="category-filter"
            >
              <SelectTrigger id="category-filter" className="w-full sm:w-[180px] bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(1);
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-walnut-100">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-burgundy-700 data-[state=active]:text-white"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-burgundy-700 data-[state=active]:text-white"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="answered"
                  className="data-[state=active]:bg-sage-600 data-[state=active]:text-white"
                >
                  Answered
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {requestsError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900">Error Loading Prayer Requests</h3>
              <p className="text-sm text-red-700 mt-1">
                {(requestsError as Error).message || "Please try again later."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetchRequests()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loadingRequests && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-ivory-50 border-walnut-200 shadow-warm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-20 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
              <CardFooter className="pt-0 gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Prayer Requests Grid */}
      {!loadingRequests && !requestsError && prayerRequests.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prayerRequests.map((request) => (
              <Card
                key={request.id}
                className={`flex flex-col shadow-warm transition-all hover:shadow-warm-lg ${
                  request.status === "answered"
                    ? "bg-sage-50 border-sage-200"
                    : request.isUrgent
                    ? "bg-orange-50 border-orange-200"
                    : "bg-ivory-50 border-walnut-200"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-burgundy-900 truncate">
                        {getDisplayName(request)}
                      </h3>
                      {request.isPrivate && (
                        <Lock className="h-3.5 w-3.5 text-walnut-500 flex-shrink-0" />
                      )}
                      {request.isUrgent && request.status === "active" && (
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {request.status === "answered" ? (
                        <Badge className="bg-sage-100 text-sage-800 hover:bg-sage-100">
                          <Check className="h-3 w-3 mr-1" />
                          Answered
                        </Badge>
                      ) : request.isUrgent ? (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          Urgent
                        </Badge>
                      ) : (
                        <Badge className="bg-burgundy-100 text-burgundy-800 hover:bg-burgundy-100">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {request.category && (
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(request.category)}
                      </Badge>
                    )}
                    {request.title && (
                      <span className="text-sm font-medium text-burgundy-700 truncate">
                        {request.title}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                    {request.description}
                  </p>
                  {request.answeredNote && request.status === "answered" && (
                    <div className="mt-3 p-2 bg-sage-100 rounded-md">
                      <p className="text-xs text-sage-800 italic">
                        "{request.answeredNote}"
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(request.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-burgundy-300 text-burgundy-500" />
                      {request.prayerCount} prayers
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrayed(request.id)}
                    disabled={prayedMutation.isPending}
                    className="flex-1 border-burgundy-200 text-burgundy-700 hover:bg-burgundy-50 hover:text-burgundy-800"
                  >
                    {prayedMutation.isPending && prayedMutation.variables === request.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4 mr-1" />
                    )}
                    Prayed
                  </Button>
                  {request.status === "active" && (
                    <>
                      {/* Mark as Answered Dialog */}
                      <Dialog
                        open={answeredDialogOpen === request.id}
                        onOpenChange={(open) => {
                          setAnsweredDialogOpen(open ? request.id : null);
                          if (!open) setAnsweredNote("");
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-sage-300 text-sage-700 hover:bg-sage-50 hover:text-sage-800"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Answered
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm bg-ivory-50">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-burgundy-900">
                              Mark as Answered
                            </DialogTitle>
                            <DialogDescription>
                              Share how God answered this prayer (optional)
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Textarea
                              id="answered-note"
                              name="answered-note"
                              placeholder="Share a testimony of how this prayer was answered..."
                              rows={3}
                              value={answeredNote}
                              onChange={(e) => setAnsweredNote(e.target.value)}
                              className="bg-white resize-none"
                            />
                          </div>
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAnsweredDialogOpen(null);
                                setAnsweredNote("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleMarkAnswered(request.id)}
                              disabled={answeredMutation.isPending}
                              className="bg-sage-600 hover:bg-sage-700"
                            >
                              {answeredMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              <Sparkles className="h-4 w-4 mr-2" />
                              Praise Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Share with Team Dialog (only for private requests) */}
                      {request.isPrivate && (
                        <Dialog
                          open={shareDialogOpen === request.id}
                          onOpenChange={(open) =>
                            setShareDialogOpen(open ? request.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-walnut-600 hover:text-walnut-800"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm bg-ivory-50">
                            <DialogHeader>
                              <DialogTitle className="font-serif text-burgundy-900">
                                Share with Community
                              </DialogTitle>
                              <DialogDescription>
                                This will make the prayer request visible to the entire
                                church community instead of just the prayer team.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShareDialogOpen(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleShareWithTeam(request.id)}
                                disabled={updateMutation.isPending}
                                className="bg-burgundy-700 hover:bg-burgundy-800"
                              >
                                {updateMutation.isPending && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Request
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{" "}
                {pagination.totalItems} requests
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loadingRequests && !requestsError && prayerRequests.length === 0 && (
        <Card className="bg-ivory-50 border-walnut-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HandHeart className="h-12 w-12 text-burgundy-300 mb-4" />
            <h3 className="text-lg font-serif font-medium text-burgundy-900">
              No prayer requests found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Be the first to share a prayer request with our community."}
            </p>
            {!searchQuery && statusFilter === "all" && categoryFilter === "all" && (
              <Button
                className="mt-4 bg-burgundy-700 hover:bg-burgundy-800"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Prayer Request
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

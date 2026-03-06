import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../App";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal,
  X,
  HandHeart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// Types
interface ScriptureEntry {
  reference: string;
  text: string;
}

interface Devotional {
  id: number;
  title: string;
  mainScripture: ScriptureEntry;
  teachingContent: string;
  supportingScriptures: ScriptureEntry[];
  prayer: string;
  authorId: string;
  authorName?: string;
  publishDate: string;
  category: string;
  tags: string[];
  featuredImageUrl?: string;
  status: "draft" | "published" | "scheduled";
  createdAt: string;
  updatedAt: string;
}

interface DevotionalFormData {
  title: string;
  mainScripture: ScriptureEntry;
  teachingContent: string;
  supportingScriptures: ScriptureEntry[];
  prayer: string;
  publishDate: string;
  category: string;
  tags: string;
  featuredImageUrl: string;
  status: "draft" | "published" | "scheduled";
  authorName: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

// Fetch devotionals
async function fetchDevotionals(
  churchId: string,
  params: {
    page: number;
    status?: string;
    search?: string;
  }
): Promise<{
  items: Devotional[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: "10",
  });
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);

  const response = await fetch(
    `${API_BASE}/api/church-admin/${churchId}/devotionals?${searchParams}`,
    { credentials: "include" }
  );
  if (!response.ok) throw new Error("Failed to fetch devotionals");
  return response.json();
}

// Create devotional
async function createDevotional(
  churchId: string,
  data: DevotionalFormData
): Promise<Devotional> {
  const response = await fetch(
    `${API_BASE}/api/church-admin/${churchId}/devotionals`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...data,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    }
  );
  if (!response.ok) throw new Error("Failed to create devotional");
  return response.json();
}

// Update devotional
async function updateDevotional(
  churchId: string,
  id: number,
  data: DevotionalFormData
): Promise<Devotional> {
  const response = await fetch(
    `${API_BASE}/api/church-admin/${churchId}/devotionals/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...data,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    }
  );
  if (!response.ok) throw new Error("Failed to update devotional");
  return response.json();
}

// Delete devotional
async function deleteDevotional(
  churchId: string,
  id: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/church-admin/${churchId}/devotionals/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) throw new Error("Failed to delete devotional");
}

const emptyFormData: DevotionalFormData = {
  title: "",
  mainScripture: { reference: "", text: "" },
  teachingContent: "",
  supportingScriptures: [],
  prayer: "",
  publishDate: new Date().toISOString().split("T")[0],
  category: "general",
  tags: "",
  featuredImageUrl: "",
  status: "draft",
  authorName: "",
};

export default function DevotionalsAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const churchId = user?.churchId || "1";

  // State
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDevotional, setSelectedDevotional] =
    useState<Devotional | null>(null);
  const [formData, setFormData] =
    useState<DevotionalFormData>(emptyFormData);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ["devotionals", churchId, page, statusFilter, searchQuery],
    queryFn: () =>
      fetchDevotionals(churchId, {
        page,
        status: statusFilter,
        search: searchQuery,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formPayload: DevotionalFormData) =>
      createDevotional(churchId, formPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
      setIsCreateOpen(false);
      setFormData(emptyFormData);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formPayload: DevotionalFormData) =>
      updateDevotional(churchId, selectedDevotional!.id, formPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
      setIsEditOpen(false);
      setSelectedDevotional(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteDevotional(churchId, selectedDevotional!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
      setIsDeleteOpen(false);
      setSelectedDevotional(null);
    },
  });

  // Handlers
  const handleEdit = (devotional: Devotional) => {
    setSelectedDevotional(devotional);
    setFormData({
      title: devotional.title,
      mainScripture: devotional.mainScripture || { reference: "", text: "" },
      teachingContent: devotional.teachingContent || "",
      supportingScriptures: devotional.supportingScriptures || [],
      prayer: devotional.prayer || "",
      publishDate: devotional.publishDate.split("T")[0],
      category: devotional.category,
      tags: devotional.tags.join(", "),
      featuredImageUrl: devotional.featuredImageUrl || "",
      status: devotional.status,
      authorName: devotional.authorName || "",
    });
    setIsEditOpen(true);
  };

  const handlePreview = (devotional: Devotional) => {
    setSelectedDevotional(devotional);
    setIsPreviewOpen(true);
  };

  const handleDelete = (devotional: Devotional) => {
    setSelectedDevotional(devotional);
    setIsDeleteOpen(true);
  };

  const addSupportingScripture = () => {
    setFormData((f) => ({
      ...f,
      supportingScriptures: [
        ...f.supportingScriptures,
        { reference: "", text: "" },
      ],
    }));
  };

  const removeSupportingScripture = (index: number) => {
    setFormData((f) => ({
      ...f,
      supportingScriptures: f.supportingScriptures.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateSupportingScripture = (
    index: number,
    field: keyof ScriptureEntry,
    value: string
  ) => {
    setFormData((f) => ({
      ...f,
      supportingScriptures: f.supportingScriptures.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-spirit-500 hover:bg-spirit-600 text-white">
            Published
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-sanctuary-500 hover:bg-sanctuary-600 text-white">
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading devotionals. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-sanctuary-700">
            <BookOpen className="h-6 w-6 text-golden-400" />
            Devotionals Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage daily devotionals for your congregation
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Devotional
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-grace-300">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devotionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devotionals Table */}
      <Card className="border-grace-300">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sanctuary-500 border-t-transparent" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-grace-300">
                    <TableHead>Title</TableHead>
                    <TableHead>Main Scripture</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((devotional) => (
                    <TableRow
                      key={devotional.id}
                      className="border-grace-200 hover:bg-grace-50"
                    >
                      <TableCell className="font-medium text-sanctuary-800">
                        {devotional.title}
                      </TableCell>
                      <TableCell className="text-vesper-500">
                        {devotional.mainScripture?.reference || "---"}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-spirit-600">
                          {devotional.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(devotional.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          devotional.publishDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handlePreview(devotional)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(devotional)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(devotional)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.items || data.items.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No devotionals found. Create your first one!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages} ({data.total}{" "}
                    total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setFormData(emptyFormData);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sanctuary-700 text-xl">
              {isEditOpen ? "Edit Devotional" : "Create New Devotional"}
            </DialogTitle>
            <DialogDescription>
              {isEditOpen
                ? "Update the devotional content and settings"
                : "Use this structured template to create a devotional for your congregation"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-golden-500 border-b border-grace-300 pb-2">
                Basic Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Enter devotional title"
                  className="focus-visible:ring-sanctuary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="faith">Faith</SelectItem>
                      <SelectItem value="hope">Hope</SelectItem>
                      <SelectItem value="love">Love</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="worship">Worship</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      v: "draft" | "published" | "scheduled"
                    ) => setFormData((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        publishDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      authorName: e.target.value,
                    }))
                  }
                  placeholder="e.g., Pastor John Smith"
                />
              </div>
            </div>

            {/* Section 2: Main Scripture */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-golden-500 border-b border-grace-300 pb-2">
                Main Scripture <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-2">
                <Label htmlFor="mainScriptureRef">
                  Scripture Reference
                </Label>
                <Input
                  id="mainScriptureRef"
                  value={formData.mainScripture.reference}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      mainScripture: {
                        ...f.mainScripture,
                        reference: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., John 3:16-17"
                  className="focus-visible:ring-sanctuary-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mainScriptureText">Scripture Text</Label>
                <textarea
                  id="mainScriptureText"
                  value={formData.mainScripture.text}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      mainScripture: {
                        ...f.mainScripture,
                        text: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter the full scripture text here..."
                  className="w-full min-h-[80px] p-3 border rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanctuary-500 focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Section 3: Teaching Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-golden-500 border-b border-grace-300 pb-2">
                Teaching Content <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-2">
                <Label htmlFor="teachingContent">
                  Devotional Message
                </Label>
                <textarea
                  id="teachingContent"
                  value={formData.teachingContent}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      teachingContent: e.target.value,
                    }))
                  }
                  placeholder={
                    "Write the main devotional teaching here...\n\nConsider including:\n- An opening thought or illustration\n- How the scripture applies to daily life\n- Practical takeaways for the reader\n- A call to reflection or action"
                  }
                  className="w-full min-h-[240px] p-3 border rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanctuary-500 focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Section 4: Supporting Scriptures */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-grace-300 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-golden-500">
                  Supporting Scriptures
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSupportingScripture}
                  className="text-spirit-600 border-spirit-300 hover:bg-spirit-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Scripture
                </Button>
              </div>

              {formData.supportingScriptures.length === 0 && (
                <p className="text-sm text-muted-foreground italic py-2">
                  No supporting scriptures added yet. Click "Add
                  Scripture" to include additional references.
                </p>
              )}

              {formData.supportingScriptures.map((scripture, index) => (
                <div
                  key={index}
                  className="relative border border-grace-200 rounded-lg p-4 bg-grace-50 space-y-3"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSupportingScripture(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="space-y-2 pr-8">
                    <Label>Reference</Label>
                    <Input
                      value={scripture.reference}
                      onChange={(e) =>
                        updateSupportingScripture(
                          index,
                          "reference",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Romans 8:28"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <textarea
                      value={scripture.text}
                      onChange={(e) =>
                        updateSupportingScripture(
                          index,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder="Enter the scripture text..."
                      className="w-full min-h-[60px] p-3 border rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanctuary-500 focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section 5: Prayer */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-golden-500 border-b border-grace-300 pb-2">
                Closing Prayer
              </h3>
              <div className="space-y-2">
                <Label htmlFor="prayer">Prayer</Label>
                <textarea
                  id="prayer"
                  value={formData.prayer}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      prayer: e.target.value,
                    }))
                  }
                  placeholder="Write a closing prayer for this devotional..."
                  className="w-full min-h-[120px] p-3 border rounded-md bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanctuary-500 focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {/* Section 6: Media & Tags */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-golden-500 border-b border-grace-300 pb-2">
                Media & Tags
              </h3>
              <div className="space-y-2">
                <Label htmlFor="featuredImageUrl">
                  Featured Image URL (optional)
                </Label>
                <Input
                  id="featuredImageUrl"
                  value={formData.featuredImageUrl}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      featuredImageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="e.g., faith, encouragement, hope"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
                setFormData(emptyFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (isEditOpen) {
                  updateMutation.mutate(formData);
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
              className="bg-sanctuary-600 hover:bg-sanctuary-700 text-white"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditOpen
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Devotional Preview</DialogTitle>
            <DialogDescription>
              Preview of the selected devotional
            </DialogDescription>
          </DialogHeader>

          {selectedDevotional && (
            <div className="space-y-6 py-4">
              {/* Featured Image */}
              {selectedDevotional.featuredImageUrl && (
                <img
                  src={selectedDevotional.featuredImageUrl}
                  alt={selectedDevotional.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {/* Title */}
              <h2
                className="text-3xl font-bold text-sanctuary-800"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {selectedDevotional.title}
              </h2>

              {/* Main Scripture as blockquote */}
              {selectedDevotional.mainScripture && (
                <div className="border-l-4 border-golden-400 bg-grace-50 rounded-r-lg p-4">
                  <p
                    className="italic text-sanctuary-700 text-lg leading-relaxed"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    &ldquo;
                    {selectedDevotional.mainScripture.text ||
                      "Scripture text not provided"}
                    &rdquo;
                  </p>
                  <p className="mt-2 text-sm font-semibold text-golden-600">
                    &mdash;{" "}
                    {selectedDevotional.mainScripture.reference}
                  </p>
                </div>
              )}

              {/* Teaching Content */}
              {selectedDevotional.teachingContent && (
                <div className="prose dark:prose-invert max-w-none">
                  {selectedDevotional.teachingContent
                    .split("\n")
                    .filter((paragraph) => paragraph.trim())
                    .map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-vesper-700 leading-relaxed mb-3"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              )}

              {/* Supporting Scriptures */}
              {selectedDevotional.supportingScriptures &&
                selectedDevotional.supportingScriptures.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-spirit-600">
                      Supporting Scriptures
                    </h3>
                    <div className="space-y-2">
                      {selectedDevotional.supportingScriptures.map(
                        (scripture, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-spirit-300 pl-4 py-2"
                          >
                            <p className="text-sm italic text-vesper-600">
                              &ldquo;{scripture.text}&rdquo;
                            </p>
                            <p className="text-xs font-semibold text-spirit-500 mt-1">
                              &mdash; {scripture.reference}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Prayer */}
              {selectedDevotional.prayer && (
                <div className="bg-sanctuary-50 border border-sanctuary-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <HandHeart className="h-5 w-5 text-sanctuary-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-sanctuary-600">
                      Prayer
                    </h3>
                  </div>
                  <p
                    className="text-sanctuary-700 italic leading-relaxed"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {selectedDevotional.prayer}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedDevotional.tags &&
                selectedDevotional.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedDevotional.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-golden-300 text-golden-600"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

              {/* Author & Date */}
              <div className="border-t border-grace-300 pt-4 flex items-center justify-between text-sm text-muted-foreground">
                {selectedDevotional.authorName && (
                  <span className="text-vesper-500">
                    By {selectedDevotional.authorName}
                  </span>
                )}
                <span>
                  {new Date(
                    selectedDevotional.publishDate
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Devotional</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;
              {selectedDevotional?.title}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../App";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// Tabs may be used for future tab-based view
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// Types
interface Devotional {
  id: number;
  title: string;
  content: string;
  scriptureReference: string;
  scriptureText?: string;
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
  content: string;
  scriptureReference: string;
  scriptureText: string;
  publishDate: string;
  category: string;
  tags: string;
  featuredImageUrl: string;
  status: "draft" | "published" | "scheduled";
}

const API_BASE = import.meta.env.VITE_API_URL || "";

// Fetch devotionals
async function fetchDevotionals(churchId: string, params: {
  page: number;
  status?: string;
  search?: string;
}): Promise<{ items: Devotional[]; total: number; page: number; totalPages: number }> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: "10",
  });
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);

  const response = await fetch(`${API_BASE}/api/church-admin/${churchId}/devotionals?${searchParams}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch devotionals");
  return response.json();
}

// Create devotional
async function createDevotional(churchId: string, data: DevotionalFormData): Promise<Devotional> {
  const response = await fetch(`${API_BASE}/api/church-admin/${churchId}/devotionals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...data,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }),
  });
  if (!response.ok) throw new Error("Failed to create devotional");
  return response.json();
}

// Update devotional
async function updateDevotional(
  churchId: string,
  id: number,
  data: DevotionalFormData
): Promise<Devotional> {
  const response = await fetch(`${API_BASE}/api/church-admin/${churchId}/devotionals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...data,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }),
  });
  if (!response.ok) throw new Error("Failed to update devotional");
  return response.json();
}

// Delete devotional
async function deleteDevotional(churchId: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/church-admin/${churchId}/devotionals/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete devotional");
}

const emptyFormData: DevotionalFormData = {
  title: "",
  content: "",
  scriptureReference: "",
  scriptureText: "",
  publishDate: new Date().toISOString().split("T")[0],
  category: "general",
  tags: "",
  featuredImageUrl: "",
  status: "draft",
};

export default function DevotionalsAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const churchId = user?.churchId || "1"; // Default for dev

  // State
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [formData, setFormData] = useState<DevotionalFormData>(emptyFormData);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ["devotionals", churchId, page, statusFilter, searchQuery],
    queryFn: () => fetchDevotionals(churchId, { page, status: statusFilter, search: searchQuery }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: DevotionalFormData) => createDevotional(churchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
      setIsCreateOpen(false);
      setFormData(emptyFormData);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DevotionalFormData) =>
      updateDevotional(churchId, selectedDevotional!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotionals"] });
      setIsEditOpen(false);
      setSelectedDevotional(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDevotional(churchId, selectedDevotional!.id),
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
      content: devotional.content,
      scriptureReference: devotional.scriptureReference,
      scriptureText: devotional.scriptureText || "",
      publishDate: devotional.publishDate.split("T")[0],
      category: devotional.category,
      tags: devotional.tags.join(", "),
      featuredImageUrl: devotional.featuredImageUrl || "",
      status: devotional.status,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading devotionals. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Devotionals Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage daily devotionals for your congregation
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Devotional
        </Button>
      </div>

      {/* Filters */}
      <Card>
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
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Scripture</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Publish Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((devotional) => (
                    <TableRow key={devotional.id}>
                      <TableCell className="font-medium">{devotional.title}</TableCell>
                      <TableCell>{devotional.scriptureReference}</TableCell>
                      <TableCell className="capitalize">{devotional.category}</TableCell>
                      <TableCell>{getStatusBadge(devotional.status)}</TableCell>
                      <TableCell>
                        {new Date(devotional.publishDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(devotional)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(devotional)}>
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
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                    Page {data.page} of {data.totalPages} ({data.total} total)
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
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setFormData(emptyFormData);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditOpen ? "Edit Devotional" : "Create New Devotional"}
            </DialogTitle>
            <DialogDescription>
              {isEditOpen
                ? "Update the devotional content and settings"
                : "Create a new devotional for your congregation"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                placeholder="Enter devotional title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scriptureReference">Scripture Reference</Label>
                <Input
                  id="scriptureReference"
                  value={formData.scriptureReference}
                  onChange={(e) => setFormData((f) => ({ ...f, scriptureReference: e.target.value }))}
                  placeholder="e.g., John 3:16"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((f) => ({ ...f, category: v }))}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="scriptureText">Scripture Text</Label>
              <textarea
                id="scriptureText"
                value={formData.scriptureText}
                onChange={(e) => setFormData((f) => ({ ...f, scriptureText: e.target.value }))}
                placeholder="Enter the scripture text"
                className="w-full min-h-[80px] p-3 border rounded-md bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Devotional Content</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your devotional content here..."
                className="w-full min-h-[200px] p-3 border rounded-md bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData((f) => ({ ...f, publishDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: "draft" | "published" | "scheduled") =>
                    setFormData((f) => ({ ...f, status: v }))
                  }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g., faith, encouragement, hope"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImageUrl">Featured Image URL (optional)</Label>
              <Input
                id="featuredImageUrl"
                value={formData.featuredImageUrl}
                onChange={(e) => setFormData((f) => ({ ...f, featuredImageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
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
              disabled={createMutation.isPending || updateMutation.isPending}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDevotional?.title}</DialogTitle>
            <DialogDescription>
              {selectedDevotional?.scriptureReference}
            </DialogDescription>
          </DialogHeader>
          {selectedDevotional && (
            <div className="space-y-4 py-4">
              {selectedDevotional.featuredImageUrl && (
                <img
                  src={selectedDevotional.featuredImageUrl}
                  alt={selectedDevotional.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                {selectedDevotional.scriptureText || selectedDevotional.scriptureReference}
              </blockquote>
              <div className="prose dark:prose-invert max-w-none">
                {selectedDevotional.content.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDevotional.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
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
              Are you sure you want to delete "{selectedDevotional?.title}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
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

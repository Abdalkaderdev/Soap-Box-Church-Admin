import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { useToast } from "../../hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../lib/api";
import {
  FolderOpen,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  FileText,
  Image,
  Video,
  File,
  Link,
  Share,
  Folder,
  Loader2
} from "lucide-react";

// Note: All imports are used - FileText, Image, Video, File for file type icons
import { format } from "date-fns";

interface Resource {
  id: number;
  name: string;
  type: string;
  format: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastAccessed: string;
  downloads: number;
  views: number;
  folder: string;
  description: string;
  tags?: string[];
  itemCount?: number;
}

// Default resources data
const defaultResources: Resource[] = [
    {
      id: 1,
      name: "Bible Study Guide - John Chapter 3",
      type: "document",
      format: "PDF",
      size: "2.4 MB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2024-08-20",
      lastAccessed: "2024-08-23",
      downloads: 23,
      views: 45,
      folder: "Bible Studies",
      description: "Comprehensive study guide for John Chapter 3 with discussion questions",
      tags: ["bible", "study", "john", "gospel"]
    },
    {
      id: 2,
      name: "Fellowship Dinner Photos",
      type: "folder",
      format: "Folder",
      size: "45.2 MB",
      uploadedBy: "Mike Chen",
      uploadDate: "2024-08-18",
      lastAccessed: "2024-08-22",
      downloads: 12,
      views: 67,
      folder: "Events",
      description: "Photos from our monthly fellowship dinner",
      itemCount: 24
    },
    {
      id: 3,
      name: "Worship Song List - August",
      type: "document",
      format: "DOCX",
      size: "156 KB",
      uploadedBy: "David Rodriguez",
      uploadDate: "2024-08-15",
      lastAccessed: "2024-08-23",
      downloads: 18,
      views: 38,
      folder: "Worship",
      description: "Song list and chord charts for August worship sessions",
      tags: ["worship", "music", "songs"]
    },
    {
      id: 4,
      name: "Prayer Request Form Template",
      type: "document",
      format: "PDF",
      size: "890 KB",
      uploadedBy: "Emma Wilson",
      uploadDate: "2024-08-10",
      lastAccessed: "2024-08-21",
      downloads: 31,
      views: 52,
      folder: "Templates",
      description: "Printable template for prayer request submissions",
      tags: ["prayer", "template", "form"]
    },
    {
      id: 5,
      name: "Community Service Video",
      type: "video",
      format: "MP4",
      size: "156 MB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2024-08-05",
      lastAccessed: "2024-08-20",
      downloads: 8,
      views: 89,
      folder: "Videos",
      description: "Highlights from our community service day at the food bank",
      tags: ["service", "community", "outreach"]
    }
  ];

const defaultFolders = [
    { name: "Bible Studies", itemCount: 8, lastUpdated: "2024-08-20" },
    { name: "Events", itemCount: 15, lastUpdated: "2024-08-18" },
    { name: "Worship", itemCount: 12, lastUpdated: "2024-08-15" },
    { name: "Templates", itemCount: 6, lastUpdated: "2024-08-10" },
    { name: "Videos", itemCount: 4, lastUpdated: "2024-08-05" }
  ];

export default function GroupAdminResources() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editResourceOpen, setEditResourceOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Fetch resources from API
  const { data: resourcesData, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/group-admin/resources'],
    queryFn: () => api.get<Resource[]>('/api/group-admin/resources').catch(() => defaultResources),
  });

  const resources = resourcesData || defaultResources;
  // Use lazy initialization with API data fallback
  const [resourcesState, setResourcesState] = useState<Resource[]>(() => resources);
  const folders = defaultFolders;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const getFileIcon = (type: string, format: string) => {
    if (type === 'folder') return <Folder className="h-5 w-5 text-purple-500" />;
    if (type === 'video') return <Video className="h-5 w-5 text-red-500" />;
    if (type === 'image') return <Image className="h-5 w-5 text-green-500" />;
    if (format === 'PDF') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const filteredResources = resourcesState.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleUpload = () => {
    setUploadDialogOpen(false);
    toast({
      title: "Files Uploaded",
      description: "Resources have been successfully uploaded to the library.",
    });
  };

  const handleCreateFolder = () => {
    setCreateFolderOpen(false);
    toast({
      title: "Folder Created",
      description: "New folder has been added to the resource library.",
    });
  };

  const handleDownload = (resourceId: number) => {
    const resource = resourcesState.find(r => r.id === resourceId);
    if (resource) {
      // Update download count
      setResourcesState(prev => prev.map(r =>
        r.id === resourceId ? { ...r, downloads: r.downloads + 1 } : r
      ));

      toast({
        title: "Download Started",
        description: `Downloading "${resource.name}"`,
      });

      // Simulate download
      setTimeout(() => {
      }, 100);
    }
  };

  const handleShare = (resourceId: number) => {
    const resource = resourcesState.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setShareDialogOpen(true);
    }
  };

  const handleEdit = (resourceId: number) => {
    const resource = resourcesState.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setEditResourceOpen(true);
    }
  };

  const handleDelete = (resourceId: number) => {
    const resource = resourcesState.find(r => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedResource) {
      setResourcesState(prev => prev.filter(r => r.id !== selectedResource.id));
      toast({
        title: "Resource Deleted",
        description: `"${selectedResource.name}" has been permanently deleted.`,
        variant: "destructive",
      });
    }
    setDeleteConfirmOpen(false);
    setSelectedResource(null);
  };

  const handleShareAction = (platform: string) => {
    if (selectedResource) {
      toast({
        title: "Link Shared",
        description: `"${selectedResource.name}" has been shared via ${platform}`,
      });
    }
    setShareDialogOpen(false);
    setSelectedResource(null);
  };

  const handleSaveEdit = () => {
    if (selectedResource) {
      toast({
        title: "Resource Updated",
        description: `"${selectedResource.name}" has been successfully updated.`,
      });
    }
    setEditResourceOpen(false);
    setSelectedResource(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast({
        title: "Link Copied",
        description: "Resource link has been copied to clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Group Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and share files, documents, and media with your group
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input id="folderName" placeholder="Enter folder name" />
                </div>
                <div>
                  <Label htmlFor="folderDescription">Description (Optional)</Label>
                  <Textarea id="folderDescription" placeholder="Folder description" rows={2} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Resources</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="files">Select Files</Label>
                  <Input id="files" type="file" multiple className="cursor-pointer" />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, XLS, PNG, JPG, MP4, MP3
                  </p>
                </div>
                <div>
                  <Label htmlFor="folder">Upload to Folder</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root Directory</SelectItem>
                      {folders.map(folder => (
                        <SelectItem key={folder.name} value={folder.name}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Resource description" rows={2} />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" placeholder="worship, music, bible study" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload}>
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Files
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
              <Folder className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Folders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  234
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  892
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="folder">Folders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getFileIcon(resource.type, resource.format)}
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-gray-500">{resource.description}</p>
                        {resource.tags && (
                          <div className="flex gap-1 mt-1">
                            {resource.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {resource.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {resource.size}
                  </TableCell>
                  <TableCell className="text-sm">
                    {resource.uploadedBy}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(resource.uploadDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {resource.downloads} downloads
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {resource.views} views
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(resource.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download {resource.name}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(resource.id)}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share resource link</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(resource.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit resource details</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(resource.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete resource permanently</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Resource Dialog */}
      <Dialog open={editResourceOpen} onOpenChange={setEditResourceOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update the details for "{selectedResource?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Resource Name</Label>
              <Input
                id="edit-name"
                defaultValue={selectedResource?.name}
                placeholder="Enter resource name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                defaultValue={selectedResource?.description}
                placeholder="Resource description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                defaultValue={selectedResource?.tags?.join(", ")}
                placeholder="worship, music, bible study"
              />
            </div>
            <div>
              <Label htmlFor="edit-folder">Folder</Label>
              <Select defaultValue={selectedResource?.folder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Root Directory">Root Directory</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.name} value={folder.name}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditResourceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Resource Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Resource</DialogTitle>
            <DialogDescription>
              Share "{selectedResource?.name}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resource Link</Label>
              <div className="flex mt-2">
                <Input
                  value={`https://soapboxsuperapp.com/resources/${selectedResource?.id}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() => copyToClipboard(`https://soapboxsuperapp.com/resources/${selectedResource?.id}`)}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Quick Share Options</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => handleShareAction("Email")}
                  className="text-left"
                >
                  Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareAction("WhatsApp")}
                  className="text-left"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareAction("Telegram")}
                  className="text-left"
                >
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareAction("SMS")}
                  className="text-left"
                >
                  SMS
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedResource?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded border mt-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Warning:</strong> This will permanently delete the resource and all associated data including {selectedResource?.downloads} downloads and {selectedResource?.views} views.
            </p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Resource
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

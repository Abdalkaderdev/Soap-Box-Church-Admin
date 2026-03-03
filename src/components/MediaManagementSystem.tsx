import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import {
  Upload,
  Video,
  Music,
  FileText,
  Folder,
  Download,
  Edit2,
  Trash2,
  MoreHorizontal,
  Search,
  Grid,
  List,
  Play,
  Copy,
  RefreshCw,
  ImageIcon,
  HardDrive,
  Share2
} from "lucide-react";
import { format } from "date-fns";

interface MediaFile {
  id: number;
  churchId?: number;
  uploadedBy: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  publicUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  title?: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  downloadCount: number;
  viewCount: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  metadata?: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const MEDIA_CATEGORIES = [
  "sermon",
  "worship",
  "event",
  "announcement",
  "ministry",
  "youth",
  "children",
  "music",
  "teaching",
  "testimonial",
  "other"
];

const FILE_TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  other: FileText
};

// File management component
function FileManagementTab({ fileTypeFilter }: { fileTypeFilter?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>(fileTypeFilter || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [playingVideo, setPlayingVideo] = useState<MediaFile | null>(null);
  const [shareFile, setShareFile] = useState<MediaFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);

  // Fetch media files
  const { data: mediaFiles = [], isLoading: loadingFiles } = useQuery<MediaFile[]>({
    queryKey: ["/api/media/files"],
    staleTime: 0,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Media files have been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MediaFile> }) => {
      return await apiRequest("PATCH", `/api/media/files/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "File Updated",
        description: "Media file has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
      setEditingFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update media file.",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/media/files/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "Media file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media/files"] });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const MAX_FILES = 50;
    if (files.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `You can upload up to ${MAX_FILES} files at once.`,
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Individual files cannot exceed 100MB.`,
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    setSelectedFiles(files);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`files`, file);
    });

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(formData);
    event.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = Array.isArray(mediaFiles) ? mediaFiles.filter((file: MediaFile) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesFileType = selectedFileType === 'all' || file.fileType === selectedFileType;
    const matchesFilter = !fileTypeFilter || file.fileType === fileTypeFilter;

    return matchesSearch && matchesCategory && matchesFileType && matchesFilter;
  }) : [];

  const getFileTypeIcon = (fileType: string) => {
    const IconComponent = FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Files upload automatically when selected. You can select multiple files at once.
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
              Limits: Up to 50 files per upload - Maximum 100MB per file
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="font-medium">Uploading {selectedFiles.length} file(s)...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            ) : (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Files to Upload
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
          <CardDescription>
            Browse and manage your uploaded files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {MEDIA_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Files Grid/List */}
          {loadingFiles ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className={viewMode === 'grid' ?
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' :
              'space-y-2'
            }>
              {filteredFiles.map((file: MediaFile) => (
                <Card
                  key={file.id}
                  className={`${viewMode === 'list' ? 'p-4' : ''} ${file.fileType === 'video' ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                  onClick={() => file.fileType === 'video' && setPlayingVideo(file)}
                >
                  <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-0'}>
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center'} gap-3`}>
                      <div className={`flex ${viewMode === 'grid' ? 'justify-center' : ''} relative`}>
                        {file.thumbnailUrl && file.fileType === 'image' ? (
                          <img
                            src={file.thumbnailUrl}
                            alt={file.title || file.originalName}
                            className={`object-cover rounded ${viewMode === 'grid' ? 'w-full h-32' : 'w-16 h-16'}`}
                          />
                        ) : file.fileType === 'audio' && file.publicUrl ? (
                          <div className={`${viewMode === 'grid' ? 'w-full' : 'w-full'} bg-gray-100 dark:bg-gray-800 rounded flex flex-col items-center justify-center p-4`}>
                            <Music className="h-8 w-8 text-blue-500 mb-2" />
                            <audio
                              controls
                              className="w-full"
                              preload="metadata"
                            >
                              <source src={file.publicUrl} type={file.mimeType} />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        ) : (
                          <div className={`${viewMode === 'grid' ? 'w-full h-32' : 'w-16 h-16'} bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center`}>
                            {getFileTypeIcon(file.fileType)}
                          </div>
                        )}
                        {file.fileType === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-purple-600/80 rounded-full p-2">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{file.title || file.originalName}</h4>
                            {file.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{file.description}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(file.fileType === 'video' || file.fileType === 'image') && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setShareFile(file);
                                }}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              )}
                              {file.publicUrl && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(file.publicUrl, '_blank');
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setEditingFile(file);
                              }}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteFile(file);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">{file.fileType}</Badge>
                          <Badge variant="outline" className="text-xs">{formatFileSize(file.fileSize)}</Badge>
                          {file.category && file.category !== 'other' && (
                            <Badge variant="outline" className="text-xs">{file.category}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loadingFiles && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{playingVideo?.title || playingVideo?.originalName}</DialogTitle>
            <DialogDescription>
              {playingVideo?.description}
            </DialogDescription>
          </DialogHeader>
          {playingVideo?.publicUrl && (
            <div className="mt-4">
              <video
                controls
                autoPlay
                className="w-full max-h-[60vh] rounded-lg bg-black"
                src={playingVideo.publicUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={!!shareFile} onOpenChange={() => setShareFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share {shareFile?.title || shareFile?.originalName}</DialogTitle>
            <DialogDescription>
              Share this {shareFile?.fileType} with others
            </DialogDescription>
          </DialogHeader>
          {shareFile?.publicUrl && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Input
                  value={shareFile.publicUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(shareFile.publicUrl || '');
                    toast({ title: "Link copied to clipboard!" });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={!!editingFile} onOpenChange={(open) => !open && setEditingFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit File Details</DialogTitle>
            <DialogDescription>
              Update the title, description, and other details for this file
            </DialogDescription>
          </DialogHeader>

          {editingFile && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get('title') as string;
              const description = formData.get('description') as string;
              const tagsInput = formData.get('tags') as string;

              const updateData: Partial<MediaFile> = {
                title: title || editingFile.originalName,
                tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []
              };

              if (description) {
                updateData.description = description;
              }

              updateFileMutation.mutate({
                id: editingFile.id,
                data: updateData
              });
            }} className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  {editingFile.fileType === 'video' && <Video className="h-5 w-5 text-purple-500" />}
                  {editingFile.fileType === 'audio' && <Music className="h-5 w-5 text-blue-500" />}
                  {editingFile.fileType === 'image' && <ImageIcon className="h-5 w-5 text-green-500" />}
                  {editingFile.fileType === 'document' && <FileText className="h-5 w-5 text-orange-500" />}
                  <span className="font-medium">{editingFile.originalName}</span>
                </div>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <div>Type: {editingFile.mimeType}</div>
                  <div>Size: {(editingFile.fileSize / (1024 * 1024)).toFixed(2)} MB</div>
                  <div>Uploaded: {format(new Date(editingFile.createdAt || new Date()), 'MMM d, yyyy')}</div>
                  <div>Views: {editingFile.viewCount || 0} - Downloads: {editingFile.downloadCount || 0}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingFile.title || editingFile.originalName}
                  placeholder="Enter file title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingFile.description || ''}
                  placeholder="Enter file description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingFile.tags?.join(', ') || ''}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingFile(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateFileMutation.isPending}
                >
                  {updateFileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteFile?.fileType}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete <strong>{deleteFile?.title || deleteFile?.originalName}</strong>?
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone. The file will be permanently removed from storage.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteFile) {
                  deleteFileMutation.mutate(deleteFile.id);
                  setDeleteFile(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function MediaManagementSystem() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'files';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Management</h2>
          <p className="text-muted-foreground">
            Unified hub for videos, images, and all your church's media files
          </p>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            All Files
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-0">
          <FileManagementTab />
        </TabsContent>

        <TabsContent value="videos" className="space-y-0">
          <FileManagementTab fileTypeFilter="video" />
        </TabsContent>

        <TabsContent value="audio" className="space-y-0">
          <FileManagementTab fileTypeFilter="audio" />
        </TabsContent>

        <TabsContent value="images" className="space-y-0">
          <FileManagementTab fileTypeFilter="image" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

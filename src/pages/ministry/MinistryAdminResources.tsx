import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  FolderOpen,
  Upload,
  Download,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Share,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag,
  Folder,
  Star
} from "lucide-react";
import { format } from "date-fns";

export default function MinistryAdminResources() {
  const [activeTab, setActiveTab] = useState("library");
  const [uploadResourceOpen, setUploadResourceOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock resources data
  const resources = [
    {
      id: 1,
      name: "Youth Ministry Curriculum 2024",
      type: "pdf",
      category: "Curriculum",
      description: "Complete curriculum for youth ministry programs including lesson plans and activities",
      size: "2.5 MB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2024-08-20T10:30:00Z",
      downloads: 24,
      views: 89,
      folder: "Youth Ministry",
      tags: ["curriculum", "youth", "2024"],
      access: "ministry",
      starred: true,
      shared: 8
    },
    {
      id: 2,
      name: "Bible Study Discussion Guide",
      type: "docx",
      category: "Study Materials",
      description: "Discussion questions and study guide for Genesis study series",
      size: "1.8 MB",
      uploadedBy: "Mike Chen",
      uploadDate: "2024-08-18T15:45:00Z",
      downloads: 18,
      views: 67,
      folder: "Bible Study",
      tags: ["bible-study", "genesis", "discussion"],
      access: "public",
      starred: false,
      shared: 12
    },
    {
      id: 3,
      name: "Community Outreach Presentation",
      type: "pptx",
      category: "Presentations",
      description: "PowerPoint presentation for community outreach planning meeting",
      size: "5.2 MB",
      uploadedBy: "Emma Wilson",
      uploadDate: "2024-08-15T09:20:00Z",
      downloads: 15,
      views: 45,
      folder: "Outreach",
      tags: ["outreach", "community", "presentation"],
      access: "ministry",
      starred: true,
      shared: 6
    },
    {
      id: 4,
      name: "Worship Songs Collection",
      type: "mp3",
      category: "Music",
      description: "Collection of worship songs for ministry events and gatherings",
      size: "45.8 MB",
      uploadedBy: "David Rodriguez",
      uploadDate: "2024-08-12T14:10:00Z",
      downloads: 32,
      views: 78,
      folder: "Worship",
      tags: ["worship", "music", "songs"],
      access: "ministry",
      starred: false,
      shared: 15
    },
    {
      id: 5,
      name: "Ministry Leadership Training Video",
      type: "mp4",
      category: "Training",
      description: "Leadership training video for ministry coordinators and group leaders",
      size: "125.3 MB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2024-08-10T11:30:00Z",
      downloads: 19,
      views: 56,
      folder: "Training",
      tags: ["leadership", "training", "video"],
      access: "leaders",
      starred: true,
      shared: 4
    }
  ];

  // Mock folders
  const folders = [
    { name: "Youth Ministry", itemCount: 8, lastModified: "2024-08-20", access: "ministry" },
    { name: "Bible Study", itemCount: 12, lastModified: "2024-08-18", access: "public" },
    { name: "Outreach", itemCount: 6, lastModified: "2024-08-15", access: "ministry" },
    { name: "Worship", itemCount: 15, lastModified: "2024-08-12", access: "ministry" },
    { name: "Training", itemCount: 9, lastModified: "2024-08-10", access: "leaders" },
    { name: "Administrative", itemCount: 4, lastModified: "2024-08-08", access: "leaders" }
  ];

  // Mock analytics
  const resourceAnalytics = {
    totalResources: 67,
    totalDownloads: 234,
    totalViews: 1456,
    storageUsed: "2.8 GB",
    storageLimit: "10 GB",
    topCategories: {
      "Study Materials": 24,
      "Curriculum": 18,
      "Training": 12,
      "Music": 8,
      "Presentations": 5
    },
    mostDownloaded: [
      { name: "Youth Ministry Curriculum 2024", downloads: 24 },
      { name: "Worship Songs Collection", downloads: 32 },
      { name: "Bible Study Discussion Guide", downloads: 18 }
    ]
  };

  const filteredResources = resources.filter(resource => {
    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    return matchesCategory && matchesType;
  });

  const handleUploadResource = () => {
    setUploadResourceOpen(false);
  };

  const handleCreateFolder = () => {
    setCreateFolderOpen(false);
  };

  const handleDownload = (_resourceId: number) => {
    // Handle resource download logic here
  };

  const handleShare = (_resourceId: number) => {
    // Handle resource sharing logic here
  };

  const handleEdit = (_resourceId: number) => {
    // Handle resource editing logic here
  };

  const handleDelete = (_resourceId: number) => {
    // Handle resource deletion logic here
  };

  const handleToggleStar = (_resourceId: number) => {
    // Handle resource star toggle logic here
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'doc':
        return <FileText className="h-8 w-8 text-purple-600" />;
      case 'jpg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-green-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-8 w-8 text-purple-600" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="h-8 w-8 text-orange-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'ministry': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'leaders': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and share resources across all ministry groups
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
                  <Label htmlFor="folderAccess">Access Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ministry">Ministry Only</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
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

          <Dialog open={uploadResourceOpen} onOpenChange={setUploadResourceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">File Upload</Label>
                  <Input id="file" type="file" />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum file size: 100MB
                  </p>
                </div>
                <div>
                  <Label htmlFor="resourceName">Resource Name</Label>
                  <Input id="resourceName" placeholder="Enter resource name" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Resource description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curriculum">Curriculum</SelectItem>
                        <SelectItem value="study-materials">Study Materials</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="presentations">Presentations</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="folder">Folder</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map(folder => (
                          <SelectItem key={folder.name} value={folder.name}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" placeholder="worship, music, songs" />
                </div>
                <div>
                  <Label htmlFor="access">Access Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ministry">Ministry Only</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setUploadResourceOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadResource}>
                    Upload Resource
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
                  Total Resources
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resourceAnalytics.totalResources}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resourceAnalytics.totalDownloads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resourceAnalytics.totalViews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Storage Used
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resourceAnalytics.storageUsed}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                  <div className="bg-orange-500 h-1 rounded-full" style={{width: '28%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="library">Resource Library</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search resources..." className="pl-10" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Curriculum">Curriculum</SelectItem>
                      <SelectItem value="Study Materials">Study Materials</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Presentations">Presentations</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="File Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word Document</SelectItem>
                      <SelectItem value="pptx">PowerPoint</SelectItem>
                      <SelectItem value="mp3">Audio</SelectItem>
                      <SelectItem value="mp4">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(resource.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{resource.name}</h3>
                          {resource.starred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{resource.category}</Badge>
                          <Badge className={getAccessColor(resource.access)}>
                            {resource.access}
                          </Badge>
                          <span className="text-sm text-gray-500">{resource.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStar(resource.id)}
                    >
                      <Star className={`h-4 w-4 ${resource.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                    <div>
                      <div className="font-semibold text-purple-600">{resource.downloads}</div>
                      <div className="text-gray-500">Downloads</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">{resource.views}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">{resource.shared}</div>
                      <div className="text-gray-500">Shares</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span>By {resource.uploadedBy}</span>
                    <span>{format(new Date(resource.uploadDate), 'MMM d, yyyy')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload(resource.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare(resource.id)}>
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(resource.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(resource.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Folder className="h-8 w-8 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{folder.name}</h3>
                      <p className="text-sm text-gray-500">
                        {folder.itemCount} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getAccessColor(folder.access)}>
                      {folder.access}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(folder.lastModified), 'MMM d')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(resourceAnalytics.topCategories).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span>{category}:</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{width: `${(count / resourceAnalytics.totalResources) * 100}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Downloaded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourceAnalytics.mostDownloaded.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <Badge variant="outline">{item.downloads} downloads</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

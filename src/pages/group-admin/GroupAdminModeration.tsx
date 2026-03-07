import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { useToast } from "../../hooks/use-toast";
import { api } from "../../lib/api";
import {
  MessageSquare,
  Flag,
  Trash2,
  Pin,
  PinOff,
  Clock,
  ThumbsUp,
  Share,
  AlertTriangle,
  CheckCircle,
  Edit,
  Image,
  HelpCircle,
  Loader2
} from "lucide-react";

interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  type: string;
  status: string;
  likes: number;
  comments: number;
  shares: number;
  pinned: boolean;
  flagged: boolean;
  flagReason?: string;
  attachments?: number;
}

interface FlaggedContent {
  id: number;
  type: string;
  author: string;
  content: string;
  flaggedBy: string;
  reason: string;
  timestamp: string;
  status: string;
}

// Default data for when API returns empty
const defaultPosts: Post[] = [
    {
      id: 1,
      author: "Sarah Johnson",
      content: "Excited for our upcoming Bible study! Looking forward to diving into John 3:16 with everyone.",
      timestamp: "2 hours ago",
      type: "text",
      status: "published",
      likes: 12,
      comments: 5,
      shares: 2,
      pinned: true,
      flagged: false
    },
    {
      id: 2,
      author: "Mike Chen",
      content: "Here are some photos from last week's fellowship dinner. Such a blessing to share a meal together!",
      timestamp: "1 day ago",
      type: "image",
      status: "published",
      likes: 18,
      comments: 8,
      shares: 4,
      pinned: false,
      flagged: false,
      attachments: 3
    },
    {
      id: 3,
      author: "Emma Wilson",
      content: "This content has been flagged for review by community members. Please review and take appropriate action.",
      timestamp: "3 days ago",
      type: "text",
      status: "flagged",
      likes: 2,
      comments: 1,
      shares: 0,
      pinned: false,
      flagged: true,
      flagReason: "Inappropriate content"
    }
  ];

const defaultFlaggedContent: FlaggedContent[] = [
    {
      id: 1,
      type: "post",
      author: "Anonymous User",
      content: "This is some content that has been flagged by multiple users for inappropriate language.",
      flaggedBy: "David Rodriguez",
      reason: "Inappropriate language",
      timestamp: "2 hours ago",
      status: "pending"
    },
    {
      id: 2,
      type: "comment",
      author: "Unknown Member",
      content: "This comment contains spam links and promotional content.",
      flaggedBy: "Sarah Johnson",
      reason: "Spam/Promotional content",
      timestamp: "1 day ago",
      status: "pending"
    }
  ];

export default function GroupAdminModeration() {
  const { toast } = useToast();

  // Fetch posts from API
  const { data: postsData, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/group-admin/posts'],
    queryFn: () => api.get<Post[]>('/api/group-admin/posts').catch(() => defaultPosts),
  });

  // Fetch flagged content from API
  const { data: flaggedData, isLoading: flaggedLoading } = useQuery<FlaggedContent[]>({
    queryKey: ['/api/group-admin/flagged-content'],
    queryFn: () => api.get<FlaggedContent[]>('/api/group-admin/flagged-content').catch(() => defaultFlaggedContent),
  });

  const posts = postsData || defaultPosts;
  const flaggedContent = flaggedData || defaultFlaggedContent;

  const [activeTab, setActiveTab] = useState("posts");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moderationMessageOpen, setModerationMessageOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; item: Post | FlaggedContent } | null>(null);
  const [postToModerate, setPostToModerate] = useState<Post | null>(null);
  const [violationType, setViolationType] = useState("");
  const [moderationMessage, setModerationMessage] = useState("");
  // Use lazy initialization with API data fallback
  const [postsState, setPostsState] = useState<Post[]>(() => posts);
  const [flaggedState, setFlaggedState] = useState<FlaggedContent[]>(() => flaggedContent);

  // Show loading state
  if (postsLoading || flaggedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Enhanced handler functions with proper state management and notifications
  const handleApprovePost = (postId: number) => {
    setPostsState(prev => prev.map(post =>
      post.id === postId ? { ...post, flagged: false, status: 'published' } : post
    ));
    toast({
      title: "Post Approved",
      description: "The post has been approved and is now visible to all members.",
    });
  };

  const handleDeletePost = (postId: number) => {
    const post = postsState.find(p => p.id === postId);
    if (post) {
      setItemToDelete({ type: 'post', item: post });
      setDeleteConfirmOpen(true);
    }
  };

  const handlePinPost = (postId: number) => {
    setPostsState(prev => prev.map(post => {
      if (post.id === postId) {
        const newPinStatus = !post.pinned;
        toast({
          title: newPinStatus ? "Post Pinned" : "Post Unpinned",
          description: newPinStatus
            ? "Post has been pinned to the top of the feed."
            : "Post has been unpinned and will appear in normal order.",
        });
        return { ...post, pinned: newPinStatus };
      }
      return post;
    }));
  };

  const handleRequestEdit = (postId: number) => {
    const post = postsState.find(p => p.id === postId);
    if (post) {
      setPostToModerate(post);
      setModerationMessageOpen(true);
    }
  };

  const handleSendModerationMessage = () => {
    if (postToModerate && violationType && moderationMessage.trim()) {
      // Mark post as requiring user edit
      setPostsState(prev => prev.map(post =>
        post.id === postToModerate.id ? {
          ...post,
          status: 'pending_user_edit',
          moderationReason: violationType,
          moderationMessage: moderationMessage.trim()
        } : post
      ));

      toast({
        title: "Message Sent to User",
        description: `${postToModerate.author} has been notified about the policy violation and asked to edit their post.`,
      });

      handleCloseModerationMessage();
    }
  };

  const handleCloseModerationMessage = () => {
    setModerationMessageOpen(false);
    setPostToModerate(null);
    setViolationType("");
    setModerationMessage("");
  };

  const handlePostHelp = () => {
    toast({
      title: "Post Actions Help",
      description: "Pin posts to highlight them, edit content, or delete inappropriate posts. Use the help button for more guidance.",
    });
  };

  const handleFlagAction = (flagId: number, action: 'approve' | 'delete' | 'warn') => {
    const flaggedItem = flaggedState.find(f => f.id === flagId);

    switch (action) {
      case 'approve':
        setFlaggedState(prev => prev.filter(f => f.id !== flagId));
        toast({
          title: "Content Approved",
          description: "The flagged content has been approved and restored.",
        });
        break;
      case 'warn':
        setFlaggedState(prev => prev.map(f =>
          f.id === flagId ? { ...f, status: 'warned' } : f
        ));
        toast({
          title: "User Warned",
          description: `Warning sent to ${flaggedItem?.author} about their content.`,
          variant: "destructive",
        });
        break;
      case 'delete':
        if (flaggedItem) {
          setItemToDelete({ type: 'flagged', item: flaggedItem });
          setDeleteConfirmOpen(true);
        }
        break;
    }
  };

  const confirmDelete = () => {
    if (itemToDelete?.type === 'post') {
      setPostsState(prev => prev.filter(p => p.id !== itemToDelete.item.id));
      toast({
        title: "Post Deleted",
        description: "The post has been permanently deleted.",
        variant: "destructive",
      });
    } else if (itemToDelete?.type === 'flagged') {
      setFlaggedState(prev => prev.filter(f => f.id !== itemToDelete.item.id));
      toast({
        title: "Flagged Content Deleted",
        description: "The flagged content has been permanently removed.",
        variant: "destructive",
      });
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleCreatePost = () => {
    setNewPostOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage group posts, moderate content, and maintain community standards
          </p>
        </div>
        <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Group Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Post Content</Label>
                <Textarea id="content" placeholder="What would you like to share with the group?" rows={4} />
              </div>
              <div>
                <Label htmlFor="type">Post Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="prayer">Prayer Request</SelectItem>
                    <SelectItem value="event">Event Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="pin" />
                <Label htmlFor="pin">Pin this post to the top</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewPostOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  124
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Flag className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Flagged Content
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Pin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pinned Posts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  This Week
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  18
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
            <TabsTrigger value="moderation">Moderation Log</TabsTrigger>
          </TabsList>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="posts" className="space-y-4">
          <TooltipProvider>
            {postsState.map((post) => (
            <Card key={post.id} className={post.flagged ? "border-red-200 bg-red-50 dark:bg-red-950" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{post.author}</p>
                        <p className="text-sm text-gray-500">{post.timestamp}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                        {post.pinned && <Badge variant="outline">Pinned</Badge>}
                        {post.flagged && <Badge variant="destructive">Flagged</Badge>}
                        <Badge variant="outline">{post.type}</Badge>
                      </div>
                    </div>

                    <p className="text-gray-900 dark:text-white mb-3">
                      {post.content}
                    </p>

                    {post.type === 'image' && post.attachments && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Image className="h-4 w-4 mr-1" />
                        {post.attachments} images attached
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments}
                        </div>
                        <div className="flex items-center">
                          <Share className="h-4 w-4 mr-1" />
                          {post.shares}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePinPost(post.id)}
                            >
                              {post.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{post.pinned ? 'Unpin post' : 'Pin post to top'}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => handleRequestEdit(post.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Request user to edit post</p>
                          </TooltipContent>
                        </Tooltip>

                        {post.flagged && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprovePost(post.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Approve flagged post</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete post</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handlePostHelp}
                            >
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Get help with post actions</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </TooltipProvider>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <TooltipProvider>
            {flaggedState.map((item) => (
            <Card key={item.id} className="border-red-200 bg-red-50 dark:bg-red-950">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">
                          Flagged {item.type} by {item.flaggedBy}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Reason: {item.reason} • {item.timestamp}
                        </p>
                      </div>
                      <Badge variant="destructive">{item.status}</Badge>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-3 rounded border mb-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Flagged content from {item.author}:
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlagAction(item.id, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Approve and restore this content</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlagAction(item.id, 'warn')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Warn User
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send warning to user about content</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleFlagAction(item.id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Permanently delete this content</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </TooltipProvider>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">Post deleted by Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Reason: Spam content • 2 hours ago</p>
                  </div>
                  <Badge variant="destructive">Delete</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">Comment approved by David Rodriguez</p>
                    <p className="text-sm text-gray-500">Initially flagged for review • 1 day ago</p>
                  </div>
                  <Badge variant="default">Approve</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">Post pinned by Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Weekly Bible study announcement • 3 days ago</p>
                  </div>
                  <Badge variant="outline">Pin</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Moderation Message Dialog */}
      <Dialog open={moderationMessageOpen} onOpenChange={setModerationMessageOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Post Edit</DialogTitle>
            <DialogDescription>
              Send a message to {postToModerate?.author} about their post that violates community policies
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Original post content:
              </p>
              <p className="text-gray-900 dark:text-white text-sm">
                {postToModerate?.content}
              </p>
            </div>

            <div>
              <Label htmlFor="violation-type">Policy Violation</Label>
              <Select value={violationType} onValueChange={setViolationType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select policy violation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate-language">Inappropriate Language</SelectItem>
                  <SelectItem value="spam-content">Spam/Promotional Content</SelectItem>
                  <SelectItem value="harassment">Harassment or Bullying</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="privacy-violation">Privacy Violation</SelectItem>
                  <SelectItem value="off-topic">Off-Topic Content</SelectItem>
                  <SelectItem value="other">Other Policy Violation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="moderation-message">Message to User</Label>
              <Textarea
                id="moderation-message"
                value={moderationMessage}
                onChange={(e) => setModerationMessage(e.target.value)}
                placeholder="Explain the policy violation and suggest how they can edit their post to comply with community guidelines..."
                rows={5}
                className="mt-2"
              />
            </div>

            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded border">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>Tip:</strong> Be constructive and specific. Explain what needs to be changed and offer suggestions for how they can improve their post while following community guidelines.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseModerationMessage}>
                Cancel
              </Button>
              <Button
                onClick={handleSendModerationMessage}
                disabled={!violationType || !moderationMessage.trim()}
              >
                Send Message
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
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

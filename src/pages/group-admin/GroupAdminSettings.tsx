import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/use-toast";
import {
  Settings,
  Shield,
  Lock,
  Archive,
  AlertTriangle,
  Save,
  Mail,
  Calendar,
  Bell,
  UserPlus,
  QrCode,
  Loader2
} from "lucide-react";

interface GroupSettings {
  basic: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    meetingLocation: string;
    meetingTime: string;
  };
  privacy: {
    visibility: string;
    requireApproval: boolean;
    allowGuestPosts: boolean;
    showMemberList: boolean;
    allowMemberInvites: boolean;
    searchable: boolean;
  };
  permissions: {
    membersCanPost: boolean;
    membersCanComment: boolean;
    membersCanUploadFiles: boolean;
    membersCanCreateEvents: boolean;
    autoModeratePosts: boolean;
    requirePostApproval: boolean;
  };
  notifications: {
    newMemberJoins: boolean;
    newPosts: boolean;
    newComments: boolean;
    eventReminders: boolean;
    weeklyDigest: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

// Default settings
const defaultSettings: GroupSettings = {
    basic: {
      name: "Young Adults Bible Study",
      description: "A vibrant community of young adults studying God's word together",
      category: "Bible Study",
      tags: ["bible", "young adults", "fellowship"],
      meetingLocation: "Community Center Room A",
      meetingTime: "Every Thursday 7:00 PM"
    },
    privacy: {
      visibility: "public", // public, private, invite-only
      requireApproval: true,
      allowGuestPosts: false,
      showMemberList: true,
      allowMemberInvites: true,
      searchable: true
    },
    permissions: {
      membersCanPost: true,
      membersCanComment: true,
      membersCanUploadFiles: true,
      membersCanCreateEvents: false,
      autoModeratePosts: true,
      requirePostApproval: false
    },
    notifications: {
      newMemberJoins: true,
      newPosts: true,
      newComments: false,
      eventReminders: true,
      weeklyDigest: true,
      emailNotifications: true,
      pushNotifications: true
    }
  };

export default function GroupAdminSettings() {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings from API
  const { data: settingsData, isLoading } = useQuery<GroupSettings>({
    queryKey: ['/api/group-admin/settings'],
    queryFn: () => api.get<GroupSettings>('/api/group-admin/settings').catch(() => defaultSettings),
  });

  // Use lazy initialization with API data fallback
  const [groupSettings, setGroupSettings] = useState<GroupSettings>(() => settingsData || defaultSettings);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (settings: GroupSettings) => api.put('/api/group-admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/group-admin/settings'] });
      toast({ title: "Settings Saved", description: "Your group settings have been updated." });
    },
    onError: () => {
      toast({ title: "Failed to save settings", description: "Please try again.", variant: "destructive" });
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const handleSaveSettings = () => {
    saveMutation.mutate(groupSettings);
  };

  const handleArchiveGroup = () => {
    setArchiveDialogOpen(false);
    toast({ title: "Group Archived", description: "The group has been archived and is no longer visible." });
  };

  const handleSettingChange = (section: string, key: string, value: string | boolean | string[]) => {
    setGroupSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveInProgress = saveMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Group Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure your group preferences, privacy, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSaveSettings}
            disabled={saveInProgress}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveInProgress ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={groupSettings.basic.name}
                    onChange={(e) => handleSettingChange('basic', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={groupSettings.basic.category}
                    onValueChange={(value) => handleSettingChange('basic', 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bible Study">Bible Study</SelectItem>
                      <SelectItem value="Prayer Group">Prayer Group</SelectItem>
                      <SelectItem value="Fellowship">Fellowship</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Youth Ministry">Youth Ministry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={groupSettings.basic.description}
                  onChange={(e) => handleSettingChange('basic', 'description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Meeting Location</Label>
                  <Input
                    id="location"
                    value={groupSettings.basic.meetingLocation}
                    onChange={(e) => handleSettingChange('basic', 'meetingLocation', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Meeting Time</Label>
                  <Input
                    id="time"
                    value={groupSettings.basic.meetingTime}
                    onChange={(e) => handleSettingChange('basic', 'meetingTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={groupSettings.basic.tags.join(', ')}
                  onChange={(e) => handleSettingChange('basic', 'tags', e.target.value.split(', '))}
                  placeholder="bible, fellowship, young adults"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Group Visibility</Label>
                <Select
                  value={groupSettings.privacy.visibility}
                  onValueChange={(value) => handleSettingChange('privacy', 'visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can find and join</SelectItem>
                    <SelectItem value="private">Private - Members only, not searchable</SelectItem>
                    <SelectItem value="invite-only">Invite Only - Admin approval required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval for New Members</Label>
                    <p className="text-sm text-gray-500">New members must be approved by group admins</p>
                  </div>
                  <Switch
                    checked={groupSettings.privacy.requireApproval}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'requireApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Guest Posts</Label>
                    <p className="text-sm text-gray-500">Non-members can post with approval</p>
                  </div>
                  <Switch
                    checked={groupSettings.privacy.allowGuestPosts}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'allowGuestPosts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Member List</Label>
                    <p className="text-sm text-gray-500">Display list of group members</p>
                  </div>
                  <Switch
                    checked={groupSettings.privacy.showMemberList}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'showMemberList', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Member Invitations</Label>
                    <p className="text-sm text-gray-500">Members can invite others to join</p>
                  </div>
                  <Switch
                    checked={groupSettings.privacy.allowMemberInvites}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'allowMemberInvites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Searchable</Label>
                    <p className="text-sm text-gray-500">Group appears in search results</p>
                  </div>
                  <Switch
                    checked={groupSettings.privacy.searchable}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'searchable', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Member Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Members Can Post</Label>
                    <p className="text-sm text-gray-500">Allow members to create posts</p>
                  </div>
                  <Switch
                    checked={groupSettings.permissions.membersCanPost}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'membersCanPost', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Members Can Comment</Label>
                    <p className="text-sm text-gray-500">Allow members to comment on posts</p>
                  </div>
                  <Switch
                    checked={groupSettings.permissions.membersCanComment}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'membersCanComment', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Members Can Upload Files</Label>
                    <p className="text-sm text-gray-500">Allow file uploads and resource sharing</p>
                  </div>
                  <Switch
                    checked={groupSettings.permissions.membersCanUploadFiles}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'membersCanUploadFiles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Members Can Create Events</Label>
                    <p className="text-sm text-gray-500">Allow members to create group events</p>
                  </div>
                  <Switch
                    checked={groupSettings.permissions.membersCanCreateEvents}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'membersCanCreateEvents', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Moderate Posts</Label>
                    <p className="text-sm text-gray-500">Automatically flag inappropriate content</p>
                  </div>
                  <Switch
                    checked={groupSettings.permissions.autoModeratePosts}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'autoModeratePosts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Post Approval</Label>
                    <p className="text-sm text-gray-500">All posts need admin approval before publishing</p>
                  </div>
                  <Switch
                    checked={groupSettings.permissions.requirePostApproval}
                    onCheckedChange={(checked) => handleSettingChange('permissions', 'requirePostApproval', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Member Joins</Label>
                    <p className="text-sm text-gray-500">Notify when someone joins the group</p>
                  </div>
                  <Switch
                    checked={groupSettings.notifications.newMemberJoins}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'newMemberJoins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Posts</Label>
                    <p className="text-sm text-gray-500">Notify about new posts in the group</p>
                  </div>
                  <Switch
                    checked={groupSettings.notifications.newPosts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'newPosts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Comments</Label>
                    <p className="text-sm text-gray-500">Notify about comments on posts</p>
                  </div>
                  <Switch
                    checked={groupSettings.notifications.newComments}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'newComments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Event Reminders</Label>
                    <p className="text-sm text-gray-500">Send reminders for upcoming events</p>
                  </div>
                  <Switch
                    checked={groupSettings.notifications.eventReminders}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'eventReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-gray-500">Send weekly summary of group activity</p>
                  </div>
                  <Switch
                    checked={groupSettings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyDigest', checked)}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Delivery Methods</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={groupSettings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications on mobile</p>
                    </div>
                    <Switch
                      checked={groupSettings.notifications.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Group Tools</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Bulk Invite Members
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Export Member List
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Sync with Calendar
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-3 text-red-600">Danger Zone</h4>
                <div className="space-y-3">
                  <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Archive Group
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Archiving this group will hide it from all members and make it read-only.
                          This action can be reversed, but the group will not be accessible until reactivated.
                        </p>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-red-800">
                            Are you sure you want to archive this group?
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            Members will no longer be able to post or interact with the group.
                          </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleArchiveGroup}>
                            Archive Group
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

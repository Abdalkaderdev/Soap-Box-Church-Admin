import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import {
  Settings,
  Bell,
  Users,
  Database,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  RotateCcw
} from "lucide-react";

export default function MinistryAdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Mock settings data
  const ministrySettings = {
    general: {
      ministryName: "Grace Community Ministry",
      description: "A vibrant community focused on spiritual growth and service",
      timezone: "America/New_York",
      language: "en",
      publiclyVisible: true,
      allowNewMembers: true,
      requireApproval: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyDigest: true,
      eventReminders: true,
      prayerUpdates: true,
      moderationAlerts: true,
      systemUpdates: false
    },
    privacy: {
      memberDirectory: "ministry",
      eventVisibility: "public",
      prayerWallAccess: "ministry",
      resourceSharing: "leaders",
      contentModeration: "automatic",
      dataRetention: "2-years"
    },
    permissions: {
      groupCreation: "leaders",
      eventCreation: "members",
      resourceUpload: "leaders",
      memberInvitation: "members",
      contentModeration: "leaders",
      reportAccess: "leaders"
    },
    integrations: {
      emailService: "enabled",
      smsService: "disabled",
      calendarSync: "enabled",
      socialMedia: "partial",
      backupService: "enabled",
      analyticsTracking: true
    }
  };

  // Mock ministry statistics
  const ministryStats = {
    totalMembers: 156,
    totalGroups: 8,
    totalEvents: 23,
    storageUsed: "2.8 GB",
    storageLimit: "10 GB",
    lastBackup: "2024-08-22T14:30:00Z",
    uptime: "99.8%",
    activeIntegrations: 4
  };

  const handleSaveSettings = (_category: string) => {
    // Save settings
  };

  const handleBackupData = () => {
    setBackupDialogOpen(false);
    // Create backup
  };

  const handleResetSettings = () => {
    setResetDialogOpen(false);
    // Reset settings to defaults
  };

  const handleExportData = () => {
    // Export ministry data
  };

  const handleImportData = () => {
    // Import ministry data
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ministry Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure your ministry preferences and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryStats.totalMembers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Storage Used
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryStats.storageUsed}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                  <div className="bg-green-500 h-1 rounded-full" style={{width: '28%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  System Uptime
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryStats.uptime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Integrations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ministryStats.activeIntegrations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ministryName">Ministry Name</Label>
                <Input
                  id="ministryName"
                  defaultValue={ministrySettings.general.ministryName}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={ministrySettings.general.description}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={ministrySettings.general.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue={ministrySettings.general.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publiclyVisible">Publicly Visible</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Allow your ministry to appear in public searches
                    </p>
                  </div>
                  <Switch
                    id="publiclyVisible"
                    defaultChecked={ministrySettings.general.publiclyVisible}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowNewMembers">Accept New Members</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Allow new people to join your ministry
                    </p>
                  </div>
                  <Switch
                    id="allowNewMembers"
                    defaultChecked={ministrySettings.general.allowNewMembers}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireApproval">Require Approval</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Manually approve all new member requests
                    </p>
                  </div>
                  <Switch
                    id="requireApproval"
                    defaultChecked={ministrySettings.general.requireApproval}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('general')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Receive important updates via email
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={ministrySettings.notifications.emailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3 text-green-600" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Receive urgent alerts via text message
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={ministrySettings.notifications.smsNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Browser and mobile app notifications
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={ministrySettings.notifications.pushNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-orange-600" />
                    <div>
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Summary of ministry activities each week
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked={ministrySettings.notifications.weeklyDigest} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Specific Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Event Reminders</Label>
                    <Switch defaultChecked={ministrySettings.notifications.eventReminders} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Prayer Updates</Label>
                    <Switch defaultChecked={ministrySettings.notifications.prayerUpdates} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Moderation Alerts</Label>
                    <Switch defaultChecked={ministrySettings.notifications.moderationAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>System Updates</Label>
                    <Switch defaultChecked={ministrySettings.notifications.systemUpdates} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('notifications')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memberDirectory">Member Directory Access</Label>
                  <Select defaultValue={ministrySettings.privacy.memberDirectory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ministry">Ministry Members Only</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventVisibility">Event Visibility</Label>
                  <Select defaultValue={ministrySettings.privacy.eventVisibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ministry">Ministry Members Only</SelectItem>
                      <SelectItem value="groups">Group Members Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prayerWallAccess">Prayer Wall Access</Label>
                  <Select defaultValue={ministrySettings.privacy.prayerWallAccess}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ministry">Ministry Members Only</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resourceSharing">Resource Sharing</Label>
                  <Select defaultValue={ministrySettings.privacy.resourceSharing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="ministry">Ministry Members Only</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contentModeration">Content Moderation</Label>
                  <Select defaultValue={ministrySettings.privacy.contentModeration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual Review</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dataRetention">Data Retention</Label>
                  <Select defaultValue={ministrySettings.privacy.dataRetention}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('privacy')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupCreation">Group Creation</Label>
                  <Select defaultValue={ministrySettings.permissions.groupCreation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventCreation">Event Creation</Label>
                  <Select defaultValue={ministrySettings.permissions.eventCreation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resourceUpload">Resource Upload</Label>
                  <Select defaultValue={ministrySettings.permissions.resourceUpload}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="memberInvitation">Member Invitation</Label>
                  <Select defaultValue={ministrySettings.permissions.memberInvitation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="members">Members</SelectItem>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contentModeration">Content Moderation</Label>
                  <Select defaultValue={ministrySettings.permissions.contentModeration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                      <SelectItem value="moderators">Moderators</SelectItem>
                      <SelectItem value="auto">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reportAccess">Report Access</Label>
                  <Select defaultValue={ministrySettings.permissions.reportAccess}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leaders">Leaders Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="ministry-admin">Ministry Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('permissions')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Backup Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Last backup: August 22, 2024
                  </p>
                  <div className="flex gap-2">
                    <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Create Backup
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Data Backup</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            This will create a complete backup of your ministry data including members, groups, events, and settings.
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setBackupDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleBackupData}>
                              Create Backup
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Data Export</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Export all ministry data in various formats
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API & Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value="sk_live_xxxxxxxxxxxxxxxxxxxxx"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Email Service</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Calendar Sync</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">SMS Service</span>
                      <Badge className="ml-2 bg-gray-100 text-gray-800">Inactive</Badge>
                    </div>
                    <Button size="sm" variant="outline">Setup</Button>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Analytics</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Reset All Settings</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Restore all settings to their default values
                    </p>
                  </div>
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          Reset All Settings
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm">
                          This action will reset all ministry settings to their default values.
                          This cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleResetSettings}>
                            Reset Settings
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Delete Ministry</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Permanently delete this ministry and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Ministry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

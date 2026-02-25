import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Church,
  Bell,
  Shield,
  Database,
  Palette,
  Mail,
  Users,
  AlertCircle,
  Loader2,
  Check,
  Monitor,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import {
  useSettings,
  useUpdateChurchInfo,
  useUpdateUserPreferences,
  useUpdateNotificationSettings,
  useEnableTwoFactor,
  useChangePassword,
  useRevokeSession,
  useExportData,
  useStaffMembers,
  type ChurchInfo,
  type UserPreferences,
  type NotificationSettings,
} from "@/hooks/useSettings";

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-4 mt-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function Settings() {
  const { churchInfo, preferences, notifications, security, isLoading, error } = useSettings();
  const { data: staffMembers, isLoading: staffLoading } = useStaffMembers();

  const updateChurchInfoMutation = useUpdateChurchInfo();
  const updatePreferencesMutation = useUpdateUserPreferences();
  const updateNotificationsMutation = useUpdateNotificationSettings();
  const enableTwoFactorMutation = useEnableTwoFactor();
  const changePasswordMutation = useChangePassword();
  const revokeSessionMutation = useRevokeSession();
  const exportDataMutation = useExportData();

  // Form states
  const [churchForm, setChurchForm] = useState<Partial<ChurchInfo>>({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initialize form when data loads
  const handleChurchFormChange = (field: keyof ChurchInfo, value: string) => {
    setChurchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChurchInfo = async () => {
    try {
      await updateChurchInfoMutation.mutateAsync(churchForm);
      setSaveSuccess("church");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleNotificationToggle = async (setting: keyof NotificationSettings, value: boolean) => {
    try {
      await updateNotificationsMutation.mutateAsync({ [setting]: value });
    } catch {
      // Error handled by mutation
    }
  };

  const handleThemeChange = async (theme: UserPreferences["theme"]) => {
    try {
      await updatePreferencesMutation.mutateAsync({ theme });
    } catch {
      // Error handled by mutation
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaveSuccess("password");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportDataMutation.mutateAsync({
        format: "json",
        includeMembers: true,
        includeDonations: true,
        includeEvents: true,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `church-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Error handled by mutation
    }
  };

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your church administration settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="church" className="gap-2">
            <Church className="h-4 w-4" />
            <span className="hidden sm:inline">Church Info</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={preferences?.theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleThemeChange("light")}
                        disabled={updatePreferencesMutation.isPending}
                      >
                        <Sun className="h-4 w-4 mr-1" />
                        Light
                      </Button>
                      <Button
                        variant={preferences?.theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleThemeChange("dark")}
                        disabled={updatePreferencesMutation.isPending}
                      >
                        <Moon className="h-4 w-4 mr-1" />
                        Dark
                      </Button>
                      <Button
                        variant={preferences?.theme === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleThemeChange("system")}
                        disabled={updatePreferencesMutation.isPending}
                      >
                        <Monitor className="h-4 w-4 mr-1" />
                        System
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={preferences?.language || "English (US)"}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data & Storage
                  </CardTitle>
                  <CardDescription>
                    Manage your data and storage settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download all your church data as a backup.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={exportDataMutation.isPending}
                    >
                      {exportDataMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Export"
                      )}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Import Data</p>
                      <p className="text-sm text-muted-foreground">
                        Import data from another system or backup.
                      </p>
                    </div>
                    <Button variant="outline">Import</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="church" className="space-y-6">
          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Church className="h-5 w-5" />
                    Church Information
                    {saveSuccess === "church" && (
                      <Badge className="bg-green-100 text-green-800 ml-2">
                        <Check className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Update your church's basic information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="churchName">Church Name</Label>
                      <Input
                        id="churchName"
                        placeholder="Enter church name"
                        defaultValue={churchInfo?.name || ""}
                        onChange={(e) => handleChurchFormChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="denomination">Denomination</Label>
                      <Input
                        id="denomination"
                        placeholder="Enter denomination"
                        defaultValue={churchInfo?.denomination || ""}
                        onChange={(e) => handleChurchFormChange("denomination", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        defaultValue={churchInfo?.address || ""}
                        onChange={(e) => handleChurchFormChange("address", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        defaultValue={churchInfo?.phone || ""}
                        onChange={(e) => handleChurchFormChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://yourchurch.com"
                        defaultValue={churchInfo?.website || ""}
                        onChange={(e) => handleChurchFormChange("website", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveChurchInfo}
                      disabled={updateChurchInfoMutation.isPending}
                    >
                      {updateChurchInfoMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff & Leadership
                  </CardTitle>
                  <CardDescription>
                    Manage staff accounts and permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {staffLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : !staffMembers || staffMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No staff members added yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {staffMembers.map((staff) => (
                        <div
                          key={staff.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{staff.role}</Badge>
                            <Badge
                              className={
                                staff.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {staff.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Configure email notification preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Member Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new members register.
                    </p>
                  </div>
                  <Switch
                    checked={notifications?.newMemberAlerts ?? true}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("newMemberAlerts", checked)
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Donation Receipts</p>
                    <p className="text-sm text-muted-foreground">
                      Send automatic receipts for donations.
                    </p>
                  </div>
                  <Switch
                    checked={notifications?.donationReceipts ?? true}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("donationReceipts", checked)
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Event Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Send reminders before upcoming events.
                    </p>
                  </div>
                  <Switch
                    checked={notifications?.eventReminders ?? true}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("eventReminders", checked)
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Volunteer Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Send reminders for volunteer assignments.
                    </p>
                  </div>
                  <Switch
                    checked={notifications?.volunteerReminders ?? true}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("volunteerReminders", checked)
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of church activity.
                    </p>
                  </div>
                  <Switch
                    checked={notifications?.weeklyDigest ?? false}
                    onCheckedChange={(checked: boolean) =>
                      handleNotificationToggle("weeklyDigest", checked)
                    }
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Button
                      variant={security?.twoFactorEnabled ? "secondary" : "outline"}
                      onClick={() => enableTwoFactorMutation.mutate({ method: "app" })}
                      disabled={enableTwoFactorMutation.isPending}
                    >
                      {security?.twoFactorEnabled ? "Enabled" : "Enable"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update your account password.
                      </p>
                      {saveSuccess === "password" && (
                        <Alert className="mb-4 bg-green-50 border-green-200">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Password changed successfully.
                          </AlertDescription>
                        </Alert>
                      )}
                      {changePasswordMutation.isError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Failed to change password. Please check your current password.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <Button
                          onClick={handleChangePassword}
                          disabled={
                            changePasswordMutation.isPending ||
                            !passwordForm.currentPassword ||
                            !passwordForm.newPassword ||
                            passwordForm.newPassword !== passwordForm.confirmPassword
                          }
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      View and manage your active sessions.
                    </p>
                    {security?.activeSessions && security.activeSessions.length > 0 ? (
                      <div className="space-y-3">
                        {security.activeSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{session.device}</p>
                                {session.current && (
                                  <Badge className="bg-green-100 text-green-800">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {session.browser} - {session.location}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last active: {new Date(session.lastActive).toLocaleString()}
                              </p>
                            </div>
                            {!session.current && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeSessionMutation.mutate(session.id)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No active sessions information available.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

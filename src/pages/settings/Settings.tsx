import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Church,
  Bell,
  Link2,
  Users,
  Heart,
  Palette,
  Mail,
  MessageSquare,
  Smartphone,
  AlertCircle,
  Loader2,
  Check,
  Monitor,
  Moon,
  Sun,
  Upload,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Key,
  ShieldCheck,
  Clock,
  DollarSign,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  settingsApi,
  fundsApi,
  type GeneralSettings,
  type NotificationSettings as ApiNotificationSettings,
  type IntegrationSettings,
  type AppearanceSettings,
} from "@/lib/api";
import type { Fund } from "@/types";

// ===================================================================
// Types
// ===================================================================

interface ServiceTime {
  id: string;
  day: string;
  time: string;
  name: string;
}

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastActive: string;
  status: 'active' | 'invited' | 'disabled';
}


// ===================================================================
// Query Keys
// ===================================================================

const settingsQueryKeys = {
  all: (churchId: string | null) => ['settings', churchId] as const,
  general: (churchId: string | null) => [...settingsQueryKeys.all(churchId), 'general'] as const,
  notifications: (churchId: string | null) => [...settingsQueryKeys.all(churchId), 'notifications'] as const,
  integrations: (churchId: string | null) => [...settingsQueryKeys.all(churchId), 'integrations'] as const,
  appearance: (churchId: string | null) => [...settingsQueryKeys.all(churchId), 'appearance'] as const,
  team: (churchId: string | null) => [...settingsQueryKeys.all(churchId), 'team'] as const,
  roles: (churchId: string | null) => [...settingsQueryKeys.all(churchId), 'roles'] as const,
  funds: (churchId: string | null) => ['funds', churchId] as const,
};

// ===================================================================
// Skeleton Component
// ===================================================================

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

// ===================================================================
// Form Section Component
// ===================================================================

interface FormSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
}

function FormSection({ title, description, icon, children, onSave, isSaving, saveSuccess }: FormSectionProps) {
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="font-serif text-xl">{title}</CardTitle>
              <CardDescription className="mt-0.5">{description}</CardDescription>
            </div>
          </div>
          {saveSuccess && (
            <Badge className="bg-accent/20 text-accent border-accent/30">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {onSave && (
          <>
            <Separator className="bg-border/50" />
            <div className="flex justify-end">
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ===================================================================
// Main Settings Component
// ===================================================================

export default function Settings() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  // ===================================================================
  // API Queries
  // ===================================================================

  // General settings query
  const {
    data: generalSettings,
    isLoading: generalLoading,
    error: generalError,
  } = useQuery({
    queryKey: settingsQueryKeys.general(churchId),
    queryFn: () => settingsApi.getGeneral(churchId!),
    enabled: !!churchId,
  });

  // Notification settings query
  const {
    data: notificationSettings,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: settingsQueryKeys.notifications(churchId),
    queryFn: () => settingsApi.getNotifications(churchId!),
    enabled: !!churchId,
  });

  // Integration settings query
  const {
    data: integrationSettings,
    isLoading: integrationsLoading,
    error: _integrationsError,
  } = useQuery({
    queryKey: settingsQueryKeys.integrations(churchId),
    queryFn: () => settingsApi.getIntegrations(churchId!),
    enabled: !!churchId,
  });

  // Appearance settings query
  const {
    data: appearanceSettings,
    isLoading: appearanceLoading,
    error: appearanceError,
  } = useQuery({
    queryKey: settingsQueryKeys.appearance(churchId),
    queryFn: () => settingsApi.getAppearance(churchId!),
    enabled: !!churchId,
  });

  // Team members query
  const {
    data: teamMembers,
    isLoading: teamLoading,
    error: _teamError,
  } = useQuery({
    queryKey: settingsQueryKeys.team(churchId),
    queryFn: () => settingsApi.getTeamMembers(churchId!),
    enabled: !!churchId,
  });

  // Roles query
  const {
    data: roles,
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: settingsQueryKeys.roles(churchId),
    queryFn: () => settingsApi.getRoles(churchId!),
    enabled: !!churchId,
  });

  // Funds query for giving settings
  const {
    data: funds,
    isLoading: fundsLoading,
    error: _fundsError,
  } = useQuery({
    queryKey: settingsQueryKeys.funds(churchId),
    queryFn: () => fundsApi.list(churchId!),
    enabled: !!churchId,
  });

  // ===================================================================
  // API Mutations
  // ===================================================================

  // Update general settings mutation
  const updateGeneralMutation = useMutation({
    mutationFn: (data: Partial<GeneralSettings>) =>
      settingsApi.updateGeneral(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.general(churchId) });
    },
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (data: Partial<ApiNotificationSettings>) =>
      settingsApi.updateNotifications(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.notifications(churchId) });
    },
  });

  // Update integration settings mutation
  const updateIntegrationsMutation = useMutation({
    mutationFn: (data: Partial<IntegrationSettings>) =>
      settingsApi.updateIntegrations(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.integrations(churchId) });
    },
  });

  // Update appearance settings mutation
  const updateAppearanceMutation = useMutation({
    mutationFn: (data: Partial<AppearanceSettings>) =>
      settingsApi.updateAppearance(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.appearance(churchId) });
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(churchId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.general(churchId) });
    },
  });

  // Invite team member mutation
  const inviteTeamMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: string; firstName?: string; lastName?: string }) =>
      settingsApi.inviteTeamMember(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.team(churchId) });
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: (userId: string) => settingsApi.removeTeamMember(churchId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.team(churchId) });
    },
  });

  // Create fund mutation
  const createFundMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; goal?: number; isDefault?: boolean }) =>
      fundsApi.create(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.funds(churchId) });
    },
  });

  // Update fund mutation
  const updateFundMutation = useMutation({
    mutationFn: ({ fundId, data }: { fundId: string; data: { name?: string; description?: string; goal?: number; isActive?: boolean } }) =>
      fundsApi.update(churchId!, fundId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.funds(churchId) });
    },
  });

  // ===================================================================
  // Form states
  // ===================================================================

  const [generalForm, setGeneralForm] = useState<Partial<GeneralSettings>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Service times state (local until we have API support)
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([
    { id: "1", day: "Sunday", time: "09:00", name: "Early Service" },
    { id: "2", day: "Sunday", time: "11:00", name: "Main Service" },
    { id: "3", day: "Wednesday", time: "19:00", name: "Bible Study" },
  ]);

  // Team member invite states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Giving settings states
  const [newFundName, setNewFundName] = useState("");
  const [defaultAmounts, setDefaultAmounts] = useState([25, 50, 100, 250]);

  // API key display state
  const [showApiKey, setShowApiKey] = useState(false);
  const apiKey = integrationSettings?.stripePublicKey || "Not configured"; // Fetched from API

  // ===================================================================
  // Initialize form with fetched data
  // ===================================================================

  useEffect(() => {
    if (generalSettings) {
      setGeneralForm({});
    }
  }, [generalSettings]);

  // ===================================================================
  // Combined loading/error states
  // ===================================================================

  const error = generalError || notificationsError || appearanceError;

  // ===================================================================
  // Handlers
  // ===================================================================

  const handleGeneralFormChange = (field: keyof GeneralSettings, value: string) => {
    setGeneralForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof GeneralSettings['address'], value: string) => {
    setGeneralForm((prev) => ({
      ...prev,
      address: {
        ...(generalSettings?.address || { street: '', city: '', state: '', zipCode: '', country: '' }),
        ...(prev.address || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveSection = async (section: string, saveFn: () => Promise<void>) => {
    try {
      await saveFn();
      setSaveSuccess((prev) => ({ ...prev, [section]: true }));
      setTimeout(() => setSaveSuccess((prev) => ({ ...prev, [section]: false })), 3000);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveGeneralSettings = async () => {
    await handleSaveSection("general", async () => {
      await updateGeneralMutation.mutateAsync(generalForm);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        await uploadLogoMutation.mutateAsync(file);
      } catch {
        // Error handled by mutation
        setLogoPreview(null);
      }
    }
  };

  const handleAddServiceTime = () => {
    const newService: ServiceTime = {
      id: Date.now().toString(),
      day: "Sunday",
      time: "10:00",
      name: "New Service",
    };
    setServiceTimes([...serviceTimes, newService]);
  };

  const handleRemoveServiceTime = (id: string) => {
    setServiceTimes(serviceTimes.filter((s) => s.id !== id));
  };

  const handleNotificationToggle = async (setting: keyof ApiNotificationSettings, value: boolean) => {
    try {
      await updateNotificationsMutation.mutateAsync({ [setting]: value });
    } catch {
      // Error handled by mutation
    }
  };

  const handleInviteTeamMember = async () => {
    if (!inviteEmail) return;
    try {
      await inviteTeamMemberMutation.mutateAsync({ email: inviteEmail, role: inviteRole });
      setInviteEmail("");
      setInviteRole("member");
    } catch {
      // Error handled by mutation
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    try {
      await removeTeamMemberMutation.mutateAsync(userId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleAddFund = async () => {
    if (!newFundName.trim()) return;
    try {
      await createFundMutation.mutateAsync({ name: newFundName, description: "" });
      setNewFundName("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleUpdateFund = async (fundId: string, data: { name?: string; description?: string; isActive?: boolean }) => {
    try {
      await updateFundMutation.mutateAsync({ fundId, data });
    } catch {
      // Error handled by mutation
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const handleThemeChange = async (darkMode: boolean) => {
    try {
      await updateAppearanceMutation.mutateAsync({ darkMode });
    } catch {
      // Error handled by mutation
    }
  };

  const handleIntegrationToggle = async (integration: keyof IntegrationSettings, enabled: boolean) => {
    try {
      await updateIntegrationsMutation.mutateAsync({ [integration]: enabled });
    } catch {
      // Error handled by mutation
    }
  };

  // ===================================================================
  // Error state
  // ===================================================================

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
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="border-b border-border/50 pb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your church administration settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="church-profile" className="space-y-8">
        {/* Tab Navigation */}
        <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-secondary/50 p-1.5 rounded-xl">
          <TabsTrigger
            value="church-profile"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Church className="h-4 w-4" />
            <span className="hidden sm:inline">Church Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team Members</span>
          </TabsTrigger>
          <TabsTrigger
            value="giving"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Giving Settings</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg font-medium"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* =============================================================== */}
        {/* TAB 1: Church Profile */}
        {/* =============================================================== */}
        <TabsContent value="church-profile" className="space-y-6">
          {generalLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {/* Basic Information */}
              <FormSection
                title="Basic Information"
                description="Your church's name, address, and contact details."
                icon={<Church className="h-5 w-5" />}
                onSave={handleSaveGeneralSettings}
                isSaving={updateGeneralMutation.isPending}
                saveSuccess={saveSuccess.general}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="churchName" className="font-medium">
                      Church Name
                    </Label>
                    <Input
                      id="churchName"
                      placeholder="Enter church name"
                      defaultValue={generalSettings?.churchName || ""}
                      onChange={(e) => handleGeneralFormChange("churchName", e.target.value)}
                      className="font-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="font-medium">
                      Timezone
                    </Label>
                    <Input
                      id="timezone"
                      placeholder="e.g., America/New_York"
                      defaultValue={generalSettings?.timezone || ""}
                      onChange={(e) => handleGeneralFormChange("timezone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="font-medium">
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      defaultValue={generalSettings?.address?.street || ""}
                      onChange={(e) => handleAddressChange("street", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-medium">
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="City"
                      defaultValue={generalSettings?.address?.city || ""}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="font-medium">
                        State
                      </Label>
                      <Input
                        id="state"
                        placeholder="State"
                        defaultValue={generalSettings?.address?.state || ""}
                        onChange={(e) => handleAddressChange("state", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="font-medium">
                        ZIP Code
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="ZIP"
                        defaultValue={generalSettings?.address?.zipCode || ""}
                        onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      defaultValue={generalSettings?.phone || ""}
                      onChange={(e) => handleGeneralFormChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="info@yourchurch.org"
                      defaultValue={generalSettings?.email || ""}
                      onChange={(e) => handleGeneralFormChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website" className="font-medium">
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourchurch.org"
                      defaultValue={generalSettings?.website || ""}
                      onChange={(e) => handleGeneralFormChange("website", e.target.value)}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Logo Upload */}
              <FormSection
                title="Church Logo"
                description="Upload your church's logo for branding."
                icon={<Upload className="h-5 w-5" />}
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden">
                    {logoPreview || generalSettings?.logoUrl ? (
                      <img
                        src={logoPreview || generalSettings?.logoUrl}
                        alt="Church logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Church className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadLogoMutation.isPending}
                    >
                      {uploadLogoMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Logo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Recommended: 400x400px, PNG or JPG format
                    </p>
                  </div>
                </div>
              </FormSection>

              {/* Service Times */}
              <FormSection
                title="Service Times"
                description="Configure your regular worship service schedule."
                icon={<Clock className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  {serviceTimes.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-muted/30"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Service Name</Label>
                          <Input
                            value={service.name}
                            onChange={(e) => {
                              setServiceTimes(
                                serviceTimes.map((s) =>
                                  s.id === service.id ? { ...s, name: e.target.value } : s
                                )
                              );
                            }}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Day</Label>
                          <Select
                            value={service.day}
                            onValueChange={(value) => {
                              setServiceTimes(
                                serviceTimes.map((s) =>
                                  s.id === service.id ? { ...s, day: value } : s
                                )
                              );
                            }}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                                (day) => (
                                  <SelectItem key={day} value={day}>
                                    {day}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Time</Label>
                          <Input
                            type="time"
                            value={service.time}
                            onChange={(e) => {
                              setServiceTimes(
                                serviceTimes.map((s) =>
                                  s.id === service.id ? { ...s, time: e.target.value } : s
                                )
                              );
                            }}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveServiceTime(service.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddServiceTime} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Time
                  </Button>
                </div>
              </FormSection>
            </>
          )}
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 2: Notifications */}
        {/* =============================================================== */}
        <TabsContent value="notifications" className="space-y-6">
          {notificationsLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {/* Email Settings */}
              <FormSection
                title="Email Notifications"
                description="Configure which email notifications you receive."
                icon={<Mail className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  {[
                    { key: "emailNotifications", label: "Email Notifications", desc: "Enable or disable all email notifications." },
                    { key: "donationReceipts", label: "Donation Receipts", desc: "Send automatic receipts for donations." },
                    { key: "eventReminders", label: "Event Reminders", desc: "Reminders before upcoming events." },
                    { key: "volunteerReminders", label: "Volunteer Reminders", desc: "Reminders for volunteer assignments." },
                    { key: "membershipUpdates", label: "Membership Updates", desc: "Notifications about membership changes." },
                  ].map((item, idx) => (
                    <div key={item.key}>
                      {idx > 0 && <Separator className="bg-border/50 mb-4" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notificationSettings?.[item.key as keyof ApiNotificationSettings] ?? false}
                          onCheckedChange={(checked) => {
                            handleNotificationToggle(item.key as keyof ApiNotificationSettings, checked);
                          }}
                          disabled={updateNotificationsMutation.isPending}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* SMS Settings */}
              <FormSection
                title="SMS Notifications"
                description="Configure text message alerts."
                icon={<MessageSquare className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Enable text message notifications.</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.smsNotifications ?? false}
                      onCheckedChange={(checked) => handleNotificationToggle("smsNotifications", checked)}
                      disabled={updateNotificationsMutation.isPending}
                    />
                  </div>
                </div>
              </FormSection>

              {/* Push Notifications */}
              <FormSection
                title="Push Notifications"
                description="Configure browser and mobile push notifications."
                icon={<Smartphone className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div>
                      <p className="font-medium">Enable Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Allow notifications in your browser or mobile device.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings?.pushNotifications ?? false}
                      onCheckedChange={(checked) => handleNotificationToggle("pushNotifications", checked)}
                      disabled={updateNotificationsMutation.isPending}
                    />
                  </div>
                  {notificationSettings?.pushNotifications && (
                    <>
                      <Separator className="bg-border/50" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Birthday Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified about member birthdays.</p>
                        </div>
                        <Switch
                          checked={notificationSettings?.birthdayNotifications ?? false}
                          onCheckedChange={(checked) => handleNotificationToggle("birthdayNotifications", checked)}
                          disabled={updateNotificationsMutation.isPending}
                        />
                      </div>
                    </>
                  )}
                </div>
              </FormSection>
            </>
          )}
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 3: Integrations */}
        {/* =============================================================== */}
        <TabsContent value="integrations" className="space-y-6">
          {integrationsLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {/* Connected Apps */}
              <FormSection
                title="Connected Apps"
                description="Manage your third-party integrations."
                icon={<Link2 className="h-5 w-5" />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      key: "stripeEnabled",
                      name: "Stripe",
                      description: "Payment processing",
                      icon: "ST",
                      enabled: integrationSettings?.stripeEnabled,
                    },
                    {
                      key: "mailchimpEnabled",
                      name: "Mailchimp",
                      description: "Email marketing service",
                      icon: "MC",
                      enabled: integrationSettings?.mailchimpEnabled,
                    },
                    {
                      key: "googleCalendarEnabled",
                      name: "Google Calendar",
                      description: "Calendar synchronization",
                      icon: "GC",
                      enabled: integrationSettings?.googleCalendarEnabled,
                    },
                    {
                      key: "planningCenterEnabled",
                      name: "Planning Center",
                      description: "Church management platform",
                      icon: "PC",
                      enabled: integrationSettings?.planningCenterEnabled,
                    },
                  ].map((integration) => (
                    <div
                      key={integration.key}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                          {integration.icon}
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      {integration.enabled ? (
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIntegrationToggle(integration.key as keyof IntegrationSettings, true)}
                          disabled={updateIntegrationsMutation.isPending}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </FormSection>

              {/* API Keys */}
              <FormSection
                title="API Keys"
                description="Manage your API keys for custom integrations."
                icon={<Key className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Live API Key</p>
                        <p className="text-sm text-muted-foreground">Use this key for production integrations.</p>
                      </div>
                      <Badge variant="outline">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Production
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          readOnly
                          className="pr-20 font-mono text-sm bg-background"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={copyApiKey}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      Keep your API keys secure. Do not share them publicly or commit them to version control.
                    </AlertDescription>
                  </Alert>
                </div>
              </FormSection>
            </>
          )}
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 4: Team Members */}
        {/* =============================================================== */}
        <TabsContent value="team" className="space-y-6">
          {/* Invite Team Member */}
          <FormSection
            title="Invite Team Member"
            description="Add new administrators and staff to your team."
            icon={<Plus className="h-5 w-5" />}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="inviteEmail" className="font-medium">
                  Email Address
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="team@yourchurch.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor="inviteRole" className="font-medium">
                  Role
                </Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="inviteRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.name.toLowerCase()}>
                        {role.name}
                      </SelectItem>
                    )) || (
                      <>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="member">Staff Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleInviteTeamMember}
                  disabled={!inviteEmail || inviteTeamMemberMutation.isPending}
                >
                  {inviteTeamMemberMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          </FormSection>

          {/* Team Members List */}
          <FormSection
            title="Current Team"
            description="Manage your team members and their permissions."
            icon={<Users className="h-5 w-5" />}
          >
            {teamLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : !teamMembers || teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No team members added yet.</p>
                <p className="text-sm">Invite someone to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member: TeamMember) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {(member.firstName || member.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                      <Badge
                        className={
                          member.status === "active"
                            ? "bg-accent/20 text-accent border-accent/30"
                            : member.status === "invited"
                            ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {member.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTeamMember(member.id)}
                        disabled={removeTeamMemberMutation.isPending}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormSection>

          {/* Role Permissions */}
          <FormSection
            title="Role Permissions"
            description="Overview of permissions for each role."
            icon={<ShieldCheck className="h-5 w-5" />}
          >
            {rolesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-3 px-4 font-medium">Permission</th>
                      <th className="text-center py-3 px-4 font-medium">Admin</th>
                      <th className="text-center py-3 px-4 font-medium">Editor</th>
                      <th className="text-center py-3 px-4 font-medium">Staff</th>
                      <th className="text-center py-3 px-4 font-medium">Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Manage Settings", admin: true, editor: false, staff: false, viewer: false },
                      { name: "Manage Members", admin: true, editor: true, staff: true, viewer: false },
                      { name: "View Donations", admin: true, editor: true, staff: true, viewer: true },
                      { name: "Process Donations", admin: true, editor: true, staff: false, viewer: false },
                      { name: "Send Communications", admin: true, editor: true, staff: true, viewer: false },
                      { name: "Manage Events", admin: true, editor: true, staff: true, viewer: false },
                    ].map((perm, idx) => (
                      <tr key={perm.name} className={idx < 5 ? "border-b border-border/40" : ""}>
                        <td className="py-3 px-4">{perm.name}</td>
                        <td className="text-center py-3 px-4">
                          {perm.admin ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {perm.editor ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {perm.staff ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {perm.viewer ? (
                            <Check className="h-4 w-4 text-accent mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FormSection>
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 5: Giving Settings */}
        {/* =============================================================== */}
        <TabsContent value="giving" className="space-y-6">
          {fundsLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {/* Giving Funds */}
              <FormSection
                title="Giving Funds"
                description="Configure funds and categories for donations."
                icon={<Heart className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  {funds?.map((fund: Fund) => (
                    <div
                      key={fund.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-muted/30"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Fund Name</Label>
                          <Input
                            value={fund.name}
                            onChange={(e) => handleUpdateFund(fund.id, { name: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Description</Label>
                          <Input
                            value={fund.description || ""}
                            onChange={(e) => handleUpdateFund(fund.id, { description: e.target.value })}
                            placeholder="Brief description..."
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {fund.isDefault ? (
                          <Badge className="bg-primary/20 text-primary border-primary/30">Default</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary"
                          >
                            Set Default
                          </Button>
                        )}
                        {!fund.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateFund(fund.id, { isActive: false })}
                            disabled={updateFundMutation.isPending}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="New fund name..."
                      value={newFundName}
                      onChange={(e) => setNewFundName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddFund()}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddFund}
                      disabled={!newFundName.trim() || createFundMutation.isPending}
                    >
                      {createFundMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Fund
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </FormSection>

              {/* Default Amounts */}
              <FormSection
                title="Suggested Amounts"
                description="Configure default donation amount suggestions."
                icon={<DollarSign className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {defaultAmounts.map((amount, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 bg-muted/30"
                      >
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const newAmounts = [...defaultAmounts];
                            newAmounts[index] = parseInt(e.target.value) || 0;
                            setDefaultAmounts(newAmounts);
                          }}
                          className="w-20 h-8 text-center"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDefaultAmounts(defaultAmounts.filter((_, i) => i !== index))}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultAmounts([...defaultAmounts, 0])}
                      className="px-4 py-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Amount
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These amounts will be shown as quick-select options on the giving page.
                  </p>
                </div>
              </FormSection>

              {/* Giving Page Settings */}
              <FormSection
                title="Giving Page"
                description="Customize your online giving experience."
                icon={<Palette className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="givingMessage" className="font-medium">
                      Welcome Message
                    </Label>
                    <Textarea
                      id="givingMessage"
                      placeholder="Thank you for your generosity..."
                      className="min-h-[100px]"
                      defaultValue="Thank you for your generous heart. Your giving supports our mission and helps transform lives in our community."
                    />
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Recurring Donations</p>
                      <p className="text-sm text-muted-foreground">
                        Enable donors to set up automatic recurring gifts.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cover Processing Fees</p>
                      <p className="text-sm text-muted-foreground">
                        Allow donors to optionally cover transaction fees.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </FormSection>
            </>
          )}
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 6: Appearance */}
        {/* =============================================================== */}
        <TabsContent value="appearance" className="space-y-6">
          {appearanceLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {/* Theme Selection */}
              <FormSection
                title="Theme"
                description="Choose your preferred color scheme."
                icon={<Palette className="h-5 w-5" />}
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { value: false, label: "Light", icon: Sun, desc: "Bright and clean" },
                    { value: true, label: "Dark", icon: Moon, desc: "Easy on the eyes" },
                  ].map((theme) => (
                    <button
                      key={theme.label}
                      onClick={() => handleThemeChange(theme.value)}
                      disabled={updateAppearanceMutation.isPending}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                        appearanceSettings?.darkMode === theme.value
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          appearanceSettings?.darkMode === theme.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <theme.icon className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{theme.label}</p>
                        <p className="text-sm text-muted-foreground">{theme.desc}</p>
                      </div>
                      {appearanceSettings?.darkMode === theme.value && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      // System theme logic would go here
                    }}
                    disabled={updateAppearanceMutation.isPending}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Monitor className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">System</p>
                      <p className="text-sm text-muted-foreground">Match your device</p>
                    </div>
                  </button>
                </div>
              </FormSection>

              {/* Future Theme Features */}
              <FormSection
                title="Custom Branding"
                description="Customize your dashboard appearance (coming soon)."
                icon={<Palette className="h-5 w-5" />}
              >
                <div className="space-y-6 opacity-60">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-medium">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-10 w-10 rounded-lg border border-border"
                          style={{ backgroundColor: appearanceSettings?.primaryColor || "#723344" }}
                        />
                        <Input value={appearanceSettings?.primaryColor || "#723344"} disabled className="font-mono" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-10 w-10 rounded-lg border border-border"
                          style={{ backgroundColor: appearanceSettings?.accentColor || "#4a7c59" }}
                        />
                        <Input value={appearanceSettings?.accentColor || "#4a7c59"} disabled className="font-mono" />
                      </div>
                    </div>
                  </div>
                  <Alert className="border-border bg-muted/50">
                    <Palette className="h-4 w-4" />
                    <AlertTitle>Coming Soon</AlertTitle>
                    <AlertDescription>
                      Custom branding options including colors, fonts, and logo placement will be available in a future update.
                    </AlertDescription>
                  </Alert>
                </div>
              </FormSection>

              {/* Display Preferences */}
              <FormSection
                title="Display Preferences"
                description="Configure how information is displayed."
                icon={<Monitor className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Use a more compact layout with less spacing.</p>
                    </div>
                    <Switch
                      checked={appearanceSettings?.compactMode ?? false}
                      onCheckedChange={(checked) =>
                        updateAppearanceMutation.mutate({ compactMode: checked })
                      }
                      disabled={updateAppearanceMutation.isPending}
                    />
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Collapsed Sidebar</p>
                      <p className="text-sm text-muted-foreground">Start with the sidebar collapsed by default.</p>
                    </div>
                    <Switch
                      checked={appearanceSettings?.sidebarCollapsed ?? false}
                      onCheckedChange={(checked) =>
                        updateAppearanceMutation.mutate({ sidebarCollapsed: checked })
                      }
                      disabled={updateAppearanceMutation.isPending}
                    />
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat" className="font-medium">
                        Date Format
                      </Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger id="dateFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeFormat" className="font-medium">
                        Time Format
                      </Label>
                      <Select defaultValue="12h">
                        <SelectTrigger id="timeFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="space-y-2">
                    <Label htmlFor="language" className="font-medium">
                      Language
                    </Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language" className="w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FormSection>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  ShieldCheck,
  Building2,
  Church,
  UsersRound,
} from "lucide-react";
import {
  useOrganizationRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  type OrganizationRole,
  type RoleCreateInput,
} from "@/hooks/useOrganization";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVELS = [
  { value: 1, label: "Organization", icon: Building2 },
  { value: 2, label: "Ministry", icon: Church },
  { value: 3, label: "Department", icon: UsersRound },
  { value: 4, label: "Team", icon: Users },
] as const;

const RESOURCES = ["members", "events", "donations", "volunteers", "reports", "settings"] as const;
const ACTIONS = ["create", "read", "update", "delete", "manage"] as const;

type Resource = (typeof RESOURCES)[number];
type Action = (typeof ACTIONS)[number];

/** Encode a permission as "resource:action" */
function permissionKey(resource: Resource, action: Action) {
  return `${resource}:${action}`;
}

// Pre-populated system roles shown as placeholder/example data when the API
// returns no results. They are merged with real data when available.
const SYSTEM_ROLES: Omit<OrganizationRole, "id" | "churchId" | "createdAt" | "updatedAt">[] = [
  // Organization level
  {
    name: "Senior Pastor",
    description: "Full access to all organizational resources and settings",
    level: 1,
    isSystem: true,
    memberCount: 1,
    permissions: RESOURCES.flatMap((r) => ACTIONS.map((a) => permissionKey(r, a))),
  },
  {
    name: "Admin",
    description: "Administrative access to manage church operations",
    level: 1,
    isSystem: true,
    memberCount: 3,
    permissions: RESOURCES.flatMap((r) => ACTIONS.map((a) => permissionKey(r, a))),
  },
  {
    name: "Staff",
    description: "General staff access with read and update capabilities",
    level: 1,
    isSystem: true,
    memberCount: 8,
    permissions: RESOURCES.flatMap((r) => ["read", "update"].map((a) => permissionKey(r, a as Action))),
  },
  {
    name: "Global Leader",
    description: "Leadership view across all ministries and departments",
    level: 1,
    isSystem: true,
    memberCount: 4,
    permissions: ["members:read", "events:read", "events:update", "donations:read", "volunteers:read", "reports:read"],
  },
  // Ministry level
  {
    name: "Ministry Leader",
    description: "Full management of a specific ministry",
    level: 2,
    isSystem: true,
    memberCount: 6,
    permissions: ["members:read", "members:update", "events:create", "events:read", "events:update", "events:delete", "volunteers:read", "volunteers:update", "reports:read"],
  },
  {
    name: "Ministry Coordinator",
    description: "Coordinate events and volunteers within a ministry",
    level: 2,
    isSystem: true,
    memberCount: 10,
    permissions: ["members:read", "events:read", "events:update", "volunteers:read", "volunteers:update"],
  },
  {
    name: "Member",
    description: "Basic member access within a ministry",
    level: 2,
    isSystem: true,
    memberCount: 85,
    permissions: ["members:read", "events:read"],
  },
  // Department level
  {
    name: "Department Leader",
    description: "Manage all aspects of a department",
    level: 3,
    isSystem: true,
    memberCount: 12,
    permissions: ["members:read", "members:update", "events:create", "events:read", "events:update", "volunteers:read", "volunteers:update", "reports:read"],
  },
  {
    name: "Assistant Leader",
    description: "Support department leadership with operational tasks",
    level: 3,
    isSystem: true,
    memberCount: 8,
    permissions: ["members:read", "events:read", "events:update", "volunteers:read"],
  },
  {
    name: "Volunteer",
    description: "Volunteer access within a department",
    level: 3,
    isSystem: true,
    memberCount: 45,
    permissions: ["members:read", "events:read", "volunteers:read"],
  },
  // Team level
  {
    name: "Team Leader",
    description: "Lead and manage a specific team",
    level: 4,
    isSystem: true,
    memberCount: 20,
    permissions: ["members:read", "members:update", "events:read", "events:update", "volunteers:read", "volunteers:update"],
  },
  {
    name: "Team Member",
    description: "Standard team member access",
    level: 4,
    isSystem: true,
    memberCount: 120,
    permissions: ["members:read", "events:read"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPermissions(permissions: string[]): Record<Resource, Action[]> {
  const grouped: Record<string, Action[]> = {};
  for (const res of RESOURCES) {
    grouped[res] = [];
  }
  for (const p of permissions) {
    const [resource, action] = p.split(":") as [Resource, Action];
    if (grouped[resource] && ACTIONS.includes(action)) {
      grouped[resource].push(action);
    }
  }
  return grouped as Record<Resource, Action[]>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface RoleCardProps {
  role: OrganizationRole | Omit<OrganizationRole, "id" | "churchId" | "createdAt" | "updatedAt">;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function RoleCard({ role, onEdit, onDelete, isDeleting }: RoleCardProps) {
  const grouped = formatPermissions(role.permissions);
  const hasId = "id" in role;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{role.name}</CardTitle>
              {role.isSystem && (
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  System
                </Badge>
              )}
              <Badge variant={role.memberCount > 0 ? "default" : "outline"}>
                {"isActive" in role && !(role as { isActive: boolean }).isActive
                  ? "Inactive"
                  : "Active"}
              </Badge>
            </div>
            {role.description && (
              <CardDescription>{role.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            {!role.isSystem && hasId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{role.memberCount} member{role.memberCount !== 1 ? "s" : ""} assigned</span>
        </div>

        {/* Permission summary */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Permissions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RESOURCES.map((res) => {
              const actions = grouped[res];
              if (actions.length === 0) return null;
              return (
                <Badge key={res} variant="outline" className="text-xs font-normal capitalize">
                  {res}: {actions.join(", ")}
                </Badge>
              );
            })}
            {role.permissions.length === 0 && (
              <span className="text-xs text-muted-foreground">No permissions assigned</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Role Dialog (Create / Edit)
// ---------------------------------------------------------------------------

interface RoleFormState {
  name: string;
  description: string;
  level: number;
  permissions: Set<string>;
}

const emptyForm: RoleFormState = {
  name: "",
  description: "",
  level: 1,
  permissions: new Set(),
};

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole?: OrganizationRole | null;
  onSubmit: (data: RoleCreateInput & { level: number }) => void;
  isSubmitting: boolean;
}

function RoleDialog({ open, onOpenChange, editingRole, onSubmit, isSubmitting }: RoleDialogProps) {
  const [form, setForm] = useState<RoleFormState>(emptyForm);

  // Reset form when dialog opens
  const handleOpenChange = (next: boolean) => {
    if (next) {
      if (editingRole) {
        setForm({
          name: editingRole.name,
          description: editingRole.description ?? "",
          level: editingRole.level,
          permissions: new Set(editingRole.permissions),
        });
      } else {
        setForm({ ...emptyForm, permissions: new Set() });
      }
    }
    onOpenChange(next);
  };

  const togglePermission = (key: string) => {
    setForm((prev) => {
      const next = new Set(prev.permissions);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { ...prev, permissions: next };
    });
  };

  const toggleResource = (resource: Resource) => {
    setForm((prev) => {
      const next = new Set(prev.permissions);
      const keys = ACTIONS.map((a) => permissionKey(resource, a));
      const allSet = keys.every((k) => next.has(k));
      for (const k of keys) {
        if (allSet) {
          next.delete(k);
        } else {
          next.add(k);
        }
      }
      return { ...prev, permissions: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description || undefined,
      level: form.level,
      permissions: Array.from(form.permissions),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update the role details and permissions."
                : "Define a new role with specific permissions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Worship Coordinator"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                placeholder="Briefly describe what this role is responsible for"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={String(form.level)}
                onValueChange={(v) => setForm((p) => ({ ...p, level: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={String(l.value)}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permissions checklist */}
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="rounded-md border">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_repeat(5,_minmax(0,_80px))] gap-2 px-4 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
                  <span>Resource</span>
                  {ACTIONS.map((a) => (
                    <span key={a} className="text-center capitalize">
                      {a}
                    </span>
                  ))}
                </div>

                {/* Resource rows */}
                {RESOURCES.map((resource) => {
                  const keys = ACTIONS.map((a) => permissionKey(resource, a));
                  const allChecked = keys.every((k) => form.permissions.has(k));
                  const someChecked = !allChecked && keys.some((k) => form.permissions.has(k));

                  return (
                    <div
                      key={resource}
                      className="grid grid-cols-[1fr_repeat(5,_minmax(0,_80px))] gap-2 px-4 py-2.5 border-b last:border-b-0 items-center"
                    >
                      <button
                        type="button"
                        onClick={() => toggleResource(resource)}
                        className="text-sm font-medium capitalize text-left hover:underline"
                      >
                        {resource}
                        {someChecked && (
                          <span className="ml-1 text-xs text-muted-foreground">(partial)</span>
                        )}
                        {allChecked && (
                          <span className="ml-1 text-xs text-muted-foreground">(all)</span>
                        )}
                      </button>
                      {ACTIONS.map((action) => {
                        const key = permissionKey(resource, action);
                        return (
                          <div key={key} className="flex justify-center">
                            <Checkbox
                              checked={form.permissions.has(key)}
                              onCheckedChange={() => togglePermission(key)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRole ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RolesPermissions() {
  const { data: apiRoles, isLoading } = useOrganizationRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [activeTab, setActiveTab] = useState("1");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OrganizationRole | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Merge API roles with system defaults for display purposes.
  // If the API returned data we use it; otherwise fall back to the static list.
  const roles = useMemo(() => {
    if (apiRoles && apiRoles.length > 0) return apiRoles;

    // Generate pseudo-IDs for the static system roles so the UI can key on them
    return SYSTEM_ROLES.map((r, i) => ({
      ...r,
      id: `system-${i}`,
      churchId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) as OrganizationRole[];
  }, [apiRoles]);

  const rolesByLevel = useMemo(() => {
    const grouped: Record<number, OrganizationRole[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const role of roles) {
      const bucket = grouped[role.level];
      if (bucket) {
        bucket.push(role);
      }
    }
    return grouped;
  }, [roles]);

  // Handlers
  const handleCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (role: OrganizationRole) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDelete = async (role: OrganizationRole) => {
    if (role.isSystem) return;
    setDeletingId(role.id);
    try {
      await deleteRole.mutateAsync(role.id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data: RoleCreateInput & { level: number }) => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, data });
      } else {
        await createRole.mutateAsync(data);
      }
      setDialogOpen(false);
      setEditingRole(null);
    } catch {
      // Mutation error is handled by react-query
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Roles &amp; Permissions</h1>
          </div>
          <p className="text-muted-foreground">
            Manage organizational roles across all levels of your church structure.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {LEVELS.map((level) => {
            const Icon = level.icon;
            return (
              <TabsTrigger key={level.value} value={String(level.value)} className="gap-1.5">
                <Icon className="h-4 w-4" />
                {level.label}
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {rolesByLevel[level.value]?.length ?? 0}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {LEVELS.map((level) => (
          <TabsContent key={level.value} value={String(level.value)} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (rolesByLevel[level.value]?.length ?? 0) === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No roles at this level</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a role to define permissions for the {level.label.toLowerCase()} level.
                  </p>
                  <Button variant="outline" onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rolesByLevel[level.value].map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={() => handleEdit(role)}
                    onDelete={() => handleDelete(role)}
                    isDeleting={deletingId === role.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create / Edit Dialog */}
      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRole={editingRole}
        onSubmit={handleSubmit}
        isSubmitting={createRole.isPending || updateRole.isPending}
      />
    </div>
  );
}

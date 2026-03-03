import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { z } from "zod";
import { Trash2, Edit, QrCode, Download, Eye, EyeOff, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

// QR Code form schema
const qrCodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  maxUsesPerDay: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

type QrCodeFormData = z.infer<typeof qrCodeSchema>;

interface QrCodeData {
  id: string;
  communityId: number;
  eventId?: number;
  name: string;
  description?: string;
  location: string;
  isActive: boolean;
  maxUsesPerDay?: number;
  validFrom?: string;
  validUntil?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function QrManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQrCode, setEditingQrCode] = useState<QrCodeData | null>(null);
  const [viewingQrCode, setViewingQrCode] = useState<QrCodeData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for create
  const [createForm, setCreateForm] = useState<QrCodeFormData>({
    name: "",
    description: "",
    location: "",
    maxUsesPerDay: undefined,
    validFrom: "",
    validUntil: "",
  });

  // Form state for edit
  const [editForm, setEditForm] = useState<QrCodeFormData>({
    name: "",
    description: "",
    location: "",
    maxUsesPerDay: undefined,
    validFrom: "",
    validUntil: "",
  });

  // Generate QR code when viewingQrCode changes
  const generateQrCode = async (qrCodeId: string) => {
    try {
      const checkInUrl = `${window.location.origin}/check-in/${qrCodeId}`;
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code image",
        variant: "destructive",
      });
    }
  };

  // Handle viewing QR code
  const handleViewQrCode = (qrCode: QrCodeData) => {
    setViewingQrCode(qrCode);
    generateQrCode(qrCode.id);
  };

  // Download QR code
  const downloadQrCode = () => {
    if (!qrCodeDataUrl || !viewingQrCode) return;

    const link = document.createElement('a');
    link.download = `qr-code-${viewingQrCode.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  // Fetch QR codes
  const { data: qrCodes = [], isLoading, error: _error } = useQuery({
    queryKey: ['/api/qr-codes'],
    queryFn: async () => {
      return await apiRequest('/api/qr-codes', { method: 'GET' });
    },
  });

  // Create QR code mutation
  const createMutation = useMutation({
    mutationFn: (data: QrCodeFormData) => {
      return apiRequest('/api/qr-codes', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          maxUsesPerDay: data.maxUsesPerDay || null,
          validFrom: data.validFrom || null,
          validUntil: data.validUntil || null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: "",
        description: "",
        location: "",
        maxUsesPerDay: undefined,
        validFrom: "",
        validUntil: "",
      });
      toast({
        title: "QR Code Created",
        description: "The QR code has been created successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to create QR code";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update QR code mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QrCodeFormData> & { isActive?: boolean } }) =>
      apiRequest(`/api/qr-codes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      setEditingQrCode(null);
      toast({
        title: "QR Code Updated",
        description: "The QR code has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update QR code",
        variant: "destructive",
      });
    },
  });

  // Delete QR code mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/qr-codes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete QR code",
        variant: "destructive",
      });
    },
  });

  // Handle edit
  const handleEdit = (qrCode: QrCodeData) => {
    setEditingQrCode(qrCode);
    setEditForm({
      name: qrCode.name,
      description: qrCode.description || "",
      location: qrCode.location,
      maxUsesPerDay: qrCode.maxUsesPerDay || undefined,
      validFrom: qrCode.validFrom ? new Date(qrCode.validFrom).toISOString().slice(0, 16) : "",
      validUntil: qrCode.validUntil ? new Date(qrCode.validUntil).toISOString().slice(0, 16) : "",
    });
  };

  // Toggle active status
  const toggleActive = (qrCode: QrCodeData) => {
    updateMutation.mutate({
      id: qrCode.id,
      data: { isActive: !qrCode.isActive }
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQrCode) {
      updateMutation.mutate({ id: editingQrCode.id, data: editForm });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Code Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage QR codes for physical check-in locations
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create QR Code
        </Button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(qrCodes as QrCodeData[]).map((qrCode: QrCodeData) => (
          <Card key={qrCode.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {qrCode.location}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={qrCode.isActive}
                    onCheckedChange={() => toggleActive(qrCode)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  {qrCode.isActive ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {qrCode.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {qrCode.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                {qrCode.maxUsesPerDay && (
                  <div>Max uses per day: {qrCode.maxUsesPerDay}</div>
                )}
                {qrCode.validFrom && (
                  <div>Valid from: {new Date(qrCode.validFrom).toLocaleDateString()}</div>
                )}
                {qrCode.validUntil && (
                  <div>Valid until: {new Date(qrCode.validUntil).toLocaleDateString()}</div>
                )}
                <div>Created: {new Date(qrCode.createdAt).toLocaleDateString()}</div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewQrCode(qrCode)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  View QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(qrCode)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this QR code?")) {
                      deleteMutation.mutate(qrCode.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(qrCodes as QrCodeData[]).length === 0 && (
          <div className="col-span-full text-center py-12">
            <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No QR codes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first QR code for physical check-in locations
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
          </div>
        )}
      </div>

      {/* Create QR Code Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create QR Code</DialogTitle>
            <DialogDescription>
              Create a new QR code for a physical check-in location
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                placeholder="Main Sanctuary"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-location">Location *</Label>
              <Input
                id="create-location"
                placeholder="Building A, Room 101"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description (Optional)</Label>
              <Textarea
                id="create-description"
                placeholder="Description of this check-in location..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-maxUses">Max Uses Per Day (Optional)</Label>
              <Input
                id="create-maxUses"
                type="number"
                placeholder="Leave empty for unlimited"
                value={createForm.maxUsesPerDay || ""}
                onChange={(e) => setCreateForm({ ...createForm, maxUsesPerDay: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-validFrom">Valid From (Optional)</Label>
              <Input
                id="create-validFrom"
                type="datetime-local"
                value={createForm.validFrom || ""}
                onChange={(e) => setCreateForm({ ...createForm, validFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-validUntil">Valid Until (Optional)</Label>
              <Input
                id="create-validUntil"
                type="datetime-local"
                value={createForm.validUntil || ""}
                onChange={(e) => setCreateForm({ ...createForm, validUntil: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? "Creating..." : "Create QR Code"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit QR Code Dialog */}
      <Dialog open={!!editingQrCode} onOpenChange={() => setEditingQrCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit QR Code</DialogTitle>
            <DialogDescription>
              Update the QR code settings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-maxUses">Max Uses Per Day (Optional)</Label>
              <Input
                id="edit-maxUses"
                type="number"
                value={editForm.maxUsesPerDay || ""}
                onChange={(e) => setEditForm({ ...editForm, maxUsesPerDay: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-validFrom">Valid From (Optional)</Label>
              <Input
                id="edit-validFrom"
                type="datetime-local"
                value={editForm.validFrom || ""}
                onChange={(e) => setEditForm({ ...editForm, validFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-validUntil">Valid Until (Optional)</Label>
              <Input
                id="edit-validUntil"
                type="datetime-local"
                value={editForm.validUntil || ""}
                onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingQrCode(null)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? "Updating..." : "Update QR Code"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View QR Code Dialog */}
      <Dialog open={!!viewingQrCode} onOpenChange={() => setViewingQrCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingQrCode?.name}</DialogTitle>
            <DialogDescription>
              {viewingQrCode?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="text-center space-y-4">
            {qrCodeDataUrl && (
              <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto border rounded-lg" />
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Scan this QR code to check in at this location
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setViewingQrCode(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={downloadQrCode}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

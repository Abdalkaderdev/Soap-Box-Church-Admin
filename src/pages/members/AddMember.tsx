import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Check,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Available groups for selection
const availableGroups = [
  "Worship Team",
  "Men's Bible Study",
  "Women's Fellowship",
  "Youth Group",
  "Children's Ministry",
  "Choir",
  "Prayer Team",
  "Ushers",
  "Outreach Team",
  "Finance Committee",
  "Media Team",
  "Hospitality",
];

// Membership status options
const membershipStatuses = [
  { value: "pending", label: "Pending", description: "New member awaiting approval" },
  { value: "active", label: "Active", description: "Full active member" },
  { value: "inactive", label: "Inactive", description: "Currently inactive member" },
];

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

export default function AddMember() {
  const [, setLocation] = useLocation();
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    status: "pending",
    joinDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newFamilyMember, setNewFamilyMember] = useState({ name: "", relationship: "" });

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const addFamilyMember = () => {
    if (newFamilyMember.name && newFamilyMember.relationship) {
      setFamilyMembers(prev => [
        ...prev,
        { ...newFamilyMember, id: Date.now().toString() }
      ]);
      setNewFamilyMember({ name: "", relationship: "" });
    }
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(fm => fm.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      const memberData = {
        ...formData,
        groups: selectedGroups,
        familyMembers,
      };
      console.log("Creating member:", memberData);

      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to members list on success
      setLocation("/members");
    } catch (error) {
      console.error("Error creating member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setLocation("/members");
  };

  const hasUnsavedChanges = () => {
    return (
      formData.firstName ||
      formData.lastName ||
      formData.email ||
      formData.phone ||
      selectedGroups.length > 0 ||
      familyMembers.length > 0
    );
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      setDiscardDialogOpen(true);
    } else {
      setLocation("/members");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the information below to add a new member to your church.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </div>
            <CardDescription>Basic information about the member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleInputChange("joinDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </div>
            <CardDescription>How to reach this member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@email.com"
                    className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className={`pl-9 ${errors.phone ? "border-destructive" : ""}`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Address</CardTitle>
            </div>
            <CardDescription>Member's home address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Oak Street"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Springfield"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="IL"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="62701"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Membership Status</CardTitle>
            </div>
            <CardDescription>Set the initial membership status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {membershipStatuses.map((status) => (
                <div
                  key={status.value}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.status === status.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  onClick={() => handleInputChange("status", status.value)}
                >
                  {formData.status === status.value && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <p className="font-medium">{status.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{status.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Groups & Ministries</CardTitle>
            </div>
            <CardDescription>Select groups this member will join</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedGroups.includes(group)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {selectedGroups.includes(group) && (
                    <Check className="inline h-3 w-3 mr-1" />
                  )}
                  {group}
                </button>
              ))}
            </div>
            {selectedGroups.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                {selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Family Connections */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Family Connections</CardTitle>
            </div>
            <CardDescription>Link family members who are also part of the church</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Family Member Form */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Family member name"
                value={newFamilyMember.name}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1"
              />
              <Input
                placeholder="Relationship (e.g., Spouse, Child)"
                value={newFamilyMember.relationship}
                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, relationship: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addFamilyMember}
                disabled={!newFamilyMember.name || !newFamilyMember.relationship}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Family Members List */}
            {familyMembers.length > 0 && (
              <div className="space-y-2">
                <Separator />
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.relationship}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFamilyMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
            <CardDescription>Any additional information about this member</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Add any notes or special information about this member..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackClick}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Member
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Discard Changes Dialog */}
      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? All changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardDialogOpen(false)}>
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

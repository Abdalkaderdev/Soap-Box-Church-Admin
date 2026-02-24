import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Heart,
  DollarSign,
  Save,
  X,
  UserPlus,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock member data
const mockMemberData: Record<string, MemberData> = {
  "1": {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    status: "active",
    joinDate: "2020-03-15",
    birthDate: "1985-07-22",
    address: {
      street: "123 Oak Street",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
    groups: ["Worship Team", "Men's Bible Study"],
    avatarUrl: null,
    familyMembers: [
      { id: "2", name: "Sarah Smith", relationship: "Spouse" },
      { id: "10", name: "Emma Smith", relationship: "Daughter" },
    ],
    notes: "Long-time member, very active in the worship ministry.",
    givingHistory: [
      { date: "2024-01-15", amount: 500, type: "Tithe" },
      { date: "2024-01-01", amount: 100, type: "Building Fund" },
      { date: "2023-12-15", amount: 500, type: "Tithe" },
      { date: "2023-12-01", amount: 250, type: "Missions" },
    ],
    attendanceRate: 92,
  },
};

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
  birthDate: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  groups: string[];
  avatarUrl: string | null;
  familyMembers: Array<{ id: string; name: string; relationship: string }>;
  notes: string;
  givingHistory: Array<{ date: string; amount: number; type: string }>;
  attendanceRate: number;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function MemberDetails() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get member data (using mock data, defaulting to member "1" for demo)
  const member = mockMemberData[params.id ?? "1"] || mockMemberData["1"];

  // Form state for editing
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    birthDate: member.birthDate,
    street: member.address.street,
    city: member.address.city,
    state: member.address.state,
    zipCode: member.address.zipCode,
    status: member.status,
    notes: member.notes,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving member data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      birthDate: member.birthDate,
      street: member.address.street,
      city: member.address.city,
      state: member.address.state,
      zipCode: member.address.zipCode,
      status: member.status,
      notes: member.notes,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // In a real app, this would delete from the backend
    console.log("Deleting member:", member.id);
    setDeleteDialogOpen(false);
    setLocation("/members");
  };

  // Calculate total giving
  const totalGiving = member.givingHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Link href="/members">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Member Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">
                      {member.firstName} {member.lastName}
                    </h1>
                    {getStatusBadge(member.status)}
                  </div>
                  <p className="text-muted-foreground">
                    Member since {new Date(member.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {member.groups.map((group) => (
                  <Badge key={group} variant="outline">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Quick Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{member.attendanceRate}%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">${totalGiving.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Giving (YTD)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="giving">Giving History</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{member.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Birth Date</p>
                        <p>{new Date(member.birthDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Home Address</p>
                      <p>{member.address.street}</p>
                      <p>{member.address.city}, {member.address.state} {member.address.zipCode}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add notes about this member..."
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {member.notes || "No notes added."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Family Members</CardTitle>
                <CardDescription>Connected family members in the church</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Link Family Member
              </Button>
            </CardHeader>
            <CardContent>
              {member.familyMembers.length > 0 ? (
                <div className="space-y-4">
                  {member.familyMembers.map((familyMember) => (
                    <div
                      key={familyMember.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {familyMember.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{familyMember.name}</p>
                          <p className="text-sm text-muted-foreground">{familyMember.relationship}</p>
                        </div>
                      </div>
                      <Link href={`/members/${familyMember.id}`}>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No family members linked</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Link Family Member
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Group Membership</CardTitle>
                <CardDescription>Groups and ministries this member is part of</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Join Group
              </Button>
            </CardHeader>
            <CardContent>
              {member.groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.groups.map((group) => (
                    <div
                      key={group}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{group}</p>
                          <p className="text-sm text-muted-foreground">Active member</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Leave</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Not a member of any groups</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Users className="h-4 w-4 mr-2" />
                    Join a Group
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Giving History Tab */}
        <TabsContent value="giving" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Giving History</CardTitle>
                <CardDescription>Summary of donations and contributions</CardDescription>
              </div>
              <Link href="/donations/new">
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Donation
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {/* Giving Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total This Year</p>
                  <p className="text-2xl font-bold">${totalGiving.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Average Gift</p>
                  <p className="text-2xl font-bold">
                    ${(totalGiving / member.givingHistory.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Gifts</p>
                  <p className="text-2xl font-bold">{member.givingHistory.length}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Recent Transactions */}
              <div className="space-y-2">
                <h4 className="font-medium">Recent Transactions</h4>
                {member.givingHistory.length > 0 ? (
                  <div className="space-y-2">
                    {member.givingHistory.map((gift, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{gift.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(gift.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">+${gift.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No giving history</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {member.firstName} {member.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Phone, Mail,
  Heart, Building, Search,
  User, BookOpen,
  MoreVertical, Eye, MessageSquare, Edit, Trash2, Calendar
} from "lucide-react";

// Member Directory Component
function MemberDirectory({ selectedChurch: propSelectedChurch, isMinistryAdmin = false }: { selectedChurch?: number | null, isMinistryAdmin?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedChurch, setSelectedChurch] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const skipChurchLogic = isMinistryAdmin;

  // Get only churches where user has admin permissions
  const { data: userChurchesData } = useQuery<{ churches: Church[] }>({
    queryKey: ["/api/users/churches"],
    enabled: !skipChurchLogic,
  });

  const adminChurches = React.useMemo(() => {
    const userChurches = userChurchesData?.churches || [];
    if (skipChurchLogic) return [];
    const adminRoles = ['church_admin', 'admin', 'pastor', 'lead_pastor', 'system_admin', 'super_admin', 'soapbox_owner'];
    return userChurches.filter((uc: Church) => adminRoles.includes(uc.role));
  }, [skipChurchLogic, userChurchesData]);

  React.useEffect(() => {
    if (skipChurchLogic) return;

    if (adminChurches.length >= 1 && selectedChurch === "all") {
      const sgaChurch = adminChurches.find((church: Church) => church.churchId === 2807);
      const selectedChurchObj = sgaChurch || adminChurches[0];
      setSelectedChurch(selectedChurchObj.churchId.toString());
    }
  }, [adminChurches, selectedChurch, skipChurchLogic]);

  const effectiveSelectedChurch = skipChurchLogic ? null : (propSelectedChurch ? propSelectedChurch.toString() : selectedChurch);

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: skipChurchLogic ? ["/api/members", "ministry"] : ["/api/members", effectiveSelectedChurch],
    queryFn: async () => {
      if (skipChurchLogic) {
        return await apiRequest("GET", "/api/members?type=ministry");
      }
      const url = effectiveSelectedChurch === "all"
        ? "/api/members"
        : `/api/members?churchId=${effectiveSelectedChurch}`;
      return await apiRequest("GET", url);
    },
    staleTime: 0,
  });

  const filteredMembers = (members as Member[]).filter((member: Member) => {
    const matchesSearch = member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Member> }) => {
      return await apiRequest("PUT", `/api/members/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Member updated successfully" });
      setSelectedMember(null);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (data: { memberId: string; churchId: string }) => {
      return await apiRequest("DELETE", `/api/church/${data.churchId}/members/${data.memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: "Member removed",
        description: "The member has been removed from the directory"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove member",
        description: error?.message || "Please try again later",
        variant: "destructive"
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-blue-600 mb-4">
          <Users className="h-8 w-8 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Having trouble loading members</h3>
        </div>
        <p className="text-gray-600 mb-4">We're working to get your member directory back up and running.</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Member Directory</h3>
        <Badge variant="outline">{isNaN(filteredMembers?.length) ? 0 : filteredMembers?.length || 0} members</Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {!skipChurchLogic && (
          <Select value={selectedChurch} onValueChange={setSelectedChurch}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by church" />
            </SelectTrigger>
            <SelectContent>
              {adminChurches.length > 1 && (
                <SelectItem value="all">All My Churches</SelectItem>
              )}
              {adminChurches.map((userChurch: Church) => (
                <SelectItem key={userChurch.churchId} value={userChurch.churchId.toString()}>
                  {userChurch.churchName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="visitor">Visitors</SelectItem>
            <SelectItem value="new_member">New Members</SelectItem>
            <SelectItem value="active">Active Members</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No members match your current filters."
              : "No members found for the selected church."
            }
          </p>
        </div>
      )}

      {/* Member Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member: Member) => (
          <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMember(member)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{member.fullName}</h4>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}>
                    {member.membershipStatus}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({ title: "Opening messaging...", description: `Start a conversation with ${member.fullName}` });
                            }}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${member.email}`;
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (member.phoneNumber) {
                                window.location.href = `sms:${member.phoneNumber}`;
                              } else {
                                toast({ title: "No phone number", description: "This member doesn't have a phone number on file", variant: "destructive" });
                              }
                            }}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            SMS
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to remove ${member.fullName} from the directory?`)) {
                            const churchId = member.communityId || effectiveSelectedChurch;
                            if (churchId && churchId !== "all") {
                              deleteMemberMutation.mutate({
                                memberId: member.id,
                                churchId: churchId.toString()
                              });
                            } else {
                              toast({
                                title: "Unable to remove member",
                                description: "Please select a specific church first",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                        disabled={deleteMemberMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleteMemberMutation.isPending ? "Removing..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.churchAffiliation && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.churchAffiliation}</span>
                </div>
              )}
              {member.denomination && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{member.denomination}</span>
                </div>
              )}
              {member.interests && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.interests}</span>
                </div>
              )}
              {member.joinedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Member Detail Dialog */}
      {selectedMember && (
        <MemberDetailDialog
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={(updates) => updateMemberMutation.mutate({ id: selectedMember.id, updates })}
        />
      )}
    </div>
  );
}

interface Member {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  membershipStatus: string;
  churchAffiliation?: string;
  denomination?: string;
  interests?: string;
  joinedDate?: string;
  communityId?: string;
  notes?: string;
}

interface Church {
  churchId: number;
  churchName: string;
  role: string;
}

// Member Detail Dialog Component
function MemberDetailDialog({ member, onClose, onUpdate }: { member: Member; onClose: () => void; onUpdate: (updates: Partial<Member>) => void }) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: member.fullName || "",
      email: member.email || "",
      phoneNumber: member.phoneNumber || "",
      address: member.address || "",
      membershipStatus: member.membershipStatus || "visitor",
      notes: member.notes || "",
    },
  });

  const handleSave = (data: Partial<Member>) => {
    onUpdate(data);
    setIsEditing(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Member Profile</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="membershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="visitor">Visitor</SelectItem>
                        <SelectItem value="new_member">New Member</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-sm">{member.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm">{member.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                <p className="text-sm">{member.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}>
                  {member.membershipStatus}
                </Badge>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm">{member.address || "N/A"}</p>
              </div>
              {member.joinedDate && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Joined Date</Label>
                  <p className="text-sm">{new Date(member.joinedDate).toLocaleDateString()}</p>
                </div>
              )}
              {member.notes && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm">{member.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export function MemberManagementSystem({ selectedChurch, isMinistryAdmin = false }: { selectedChurch?: number | null, isMinistryAdmin?: boolean }) {
  return (
    <div className="space-y-6">
      <MemberDirectory selectedChurch={selectedChurch} isMinistryAdmin={isMinistryAdmin} />
    </div>
  );
}

export default MemberManagementSystem;

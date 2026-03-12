import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookUser,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LayoutGrid,
  List,
  User,
  UserCheck,
  UserX,
  Clock,
  Eye,
} from "lucide-react";
import { useChurch } from "@/hooks/useChurch";
import { membersApi } from "@/lib/api";
import { format, parseISO } from "date-fns";
import type { Member, MembershipStatus } from "@/types";

const STATUS_OPTIONS: { value: MembershipStatus | 'all'; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Members', color: 'text-gray-500', icon: <Users className="h-4 w-4" /> },
  { value: 'active', label: 'Active', color: 'text-green-500', icon: <UserCheck className="h-4 w-4" /> },
  { value: 'inactive', label: 'Inactive', color: 'text-gray-400', icon: <UserX className="h-4 w-4" /> },
  { value: 'pending', label: 'Pending', color: 'text-amber-500', icon: <Clock className="h-4 w-4" /> },
  { value: 'visitor', label: 'Visitor', color: 'text-blue-500', icon: <Eye className="h-4 w-4" /> },
];

function getStatusBadge(status: MembershipStatus) {
  const variants: Record<MembershipStatus, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
    active: { variant: "default", color: "bg-green-100 text-green-700 hover:bg-green-100" },
    inactive: { variant: "secondary", color: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
    pending: { variant: "outline", color: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
    visitor: { variant: "secondary", color: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    former: { variant: "destructive", color: "bg-red-100 text-red-700 hover:bg-red-100" },
  };
  const config = variants[status] || { variant: "secondary" as const, color: "" };
  return (
    <Badge variant={config.variant} className={`capitalize ${config.color}`}>
      {status}
    </Badge>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function MemberDirectory() {
  const { churchId } = useChurch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MembershipStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Query members
  const { data: membersResponse, isLoading } = useQuery({
    queryKey: ['members', churchId, statusFilter, searchQuery],
    queryFn: () => membersApi.list(churchId!, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined,
      pageSize: 100,
    }),
    enabled: !!churchId,
  });

  // Query member stats
  const { data: stats } = useQuery({
    queryKey: ['member-stats', churchId],
    queryFn: () => membersApi.getStats(churchId!),
    enabled: !!churchId,
  });

  const members = membersResponse?.data || [];

  // Filter members locally for search
  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.firstName.toLowerCase().includes(query) ||
      member.lastName.toLowerCase().includes(query) ||
      (member.email?.toLowerCase().includes(query)) ||
      (member.phone?.includes(query))
    );
  });

  function openMemberDetail(member: Member) {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  }

  if (!churchId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Please select a church to view the member directory.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookUser className="h-8 w-8 text-blue-500" />
            Member Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Search and browse your congregation members
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats?.total ?? members.length}</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats?.byStatus?.active ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{stats?.byStatus?.pending ?? 0}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold">{stats?.byStatus?.visitor ?? 0}</p>
              <p className="text-xs text-muted-foreground">Visitors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats?.newThisMonth ?? 0}</p>
              <p className="text-xs text-muted-foreground">New This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MembershipStatus | 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Members Display */}
      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Loading members...
          </CardContent>
        </Card>
      ) : filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No members found
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMembers.map(member => (
            <Card
              key={member.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openMemberDetail(member)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />
                    <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">
                    {member.firstName} {member.lastName}
                  </h3>
                  <div className="mt-2">
                    {getStatusBadge(member.membershipStatus)}
                  </div>
                  {member.email && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      {member.email}
                    </p>
                  )}
                  {member.phone && (
                    <p className="text-sm text-muted-foreground truncate">
                      {member.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map(member => (
                <TableRow key={member.id} className="cursor-pointer" onClick={() => openMemberDetail(member)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(member.firstName, member.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        {member.tags && member.tags.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {member.tags.slice(0, 2).join(', ')}
                            {member.tags.length > 2 && ` +${member.tags.length - 2}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.email ? (
                      <a
                        href={`mailto:${member.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline"
                      >
                        {member.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline"
                      >
                        {member.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(member.membershipStatus)}</TableCell>
                  <TableCell>
                    {member.memberSince
                      ? format(parseISO(member.memberSince), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMemberDetail(member);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMember.photoUrl} alt={`${selectedMember.firstName} ${selectedMember.lastName}`} />
                    <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                      {getInitials(selectedMember.firstName, selectedMember.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedMember.membershipStatus)}
                      {selectedMember.memberSince && (
                        <span className="text-sm">
                          Member since {format(parseISO(selectedMember.memberSince), 'MMM yyyy')}
                        </span>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="contact" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  {selectedMember.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${selectedMember.email}`} className="text-blue-600 hover:underline">
                          {selectedMember.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedMember.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${selectedMember.phone}`} className="text-blue-600 hover:underline">
                          {selectedMember.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedMember.address && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p>
                          {selectedMember.address.street}<br />
                          {selectedMember.address.city}, {selectedMember.address.state} {selectedMember.address.zipCode}
                        </p>
                      </div>
                    </div>
                  )}
                  {!selectedMember.email && !selectedMember.phone && !selectedMember.address && (
                    <p className="text-muted-foreground text-center py-8">No contact information available</p>
                  )}
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMember.dateOfBirth && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{format(parseISO(selectedMember.dateOfBirth), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                    {selectedMember.gender && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium capitalize">
                          {selectedMember.gender.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {selectedMember.memberSince
                          ? format(parseISO(selectedMember.memberSince), 'MMMM d, yyyy')
                          : 'Unknown'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{format(parseISO(selectedMember.updatedAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>

                  {selectedMember.tags && selectedMember.tags.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMember.notes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p className="whitespace-pre-wrap">{selectedMember.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Activity history coming soon</p>
                    <p className="text-sm">Event attendance, donations, and volunteer hours will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                {selectedMember.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedMember.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {selectedMember.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${selectedMember.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
                <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

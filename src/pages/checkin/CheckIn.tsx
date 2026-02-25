import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
  Baby,
  Shield,
  Printer,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Phone,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { checkInApi, membersApi } from '@/lib/api';
import type {
  Service,
  ServiceCheckIn,
  ChildCheckIn,
  CheckInStats,
  Member,
} from '@/types';

// Warm church color palette
const colors = {
  burgundy: {
    bg: 'bg-[#722F37]',
    bgLight: 'bg-[#722F37]/10',
    text: 'text-[#722F37]',
    border: 'border-[#722F37]',
    hover: 'hover:bg-[#722F37]/90',
  },
  sage: {
    bg: 'bg-[#87AE73]',
    bgLight: 'bg-[#87AE73]/10',
    text: 'text-[#87AE73]',
    border: 'border-[#87AE73]',
  },
  ivory: {
    bg: 'bg-[#FFFFF0]',
    bgLight: 'bg-[#FFFFF0]/50',
    text: 'text-[#FFFFF0]',
  },
  walnut: {
    bg: 'bg-[#5D432C]',
    bgLight: 'bg-[#5D432C]/10',
    text: 'text-[#5D432C]',
    border: 'border-[#5D432C]',
  },
};

// Transform API service to display format
interface DisplayService {
  id: string;
  name: string;
  time: string;
  location: string;
  checkedIn: number;
  expected: number;
  isActive: boolean;
}

// Family member for check-in display
interface FamilyMemberDisplay {
  id: string;
  name: string;
  age: number | null;
  isChild: boolean;
  allergies?: string;
  specialNeeds?: string;
  securityCode?: string;
  memberId?: string;
}

// Family display for search results
interface FamilyDisplay {
  id: string;
  name: string;
  phone: string;
  members: FamilyMemberDisplay[];
}

// Recent check-in display
interface RecentCheckInDisplay {
  id: string;
  name: string;
  time: string;
  service: string;
  isChild: boolean;
  securityCode?: string;
}

// Helper to calculate age from date of birth
function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper to format time from date string
function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Transform Service from API to display format
function transformService(service: Service): DisplayService {
  return {
    id: service.id,
    name: service.name,
    time: service.startTime,
    location: service.location || 'Main Campus',
    checkedIn: service.totalCheckIns + service.totalChildCheckIns,
    expected: 100, // This could come from historical data or capacity settings
    isActive: service.isCheckInOpen,
  };
}

// Transform Member to FamilyMemberDisplay
function transformMemberToFamilyMember(member: Member): FamilyMemberDisplay {
  const age = calculateAge(member.dateOfBirth);
  return {
    id: member.id,
    memberId: member.id,
    name: `${member.firstName} ${member.lastName}`,
    age,
    isChild: age !== null && age < 13,
  };
}

// Transform ServiceCheckIn to RecentCheckInDisplay
function transformCheckInToDisplay(
  checkIn: ServiceCheckIn,
  serviceName: string
): RecentCheckInDisplay {
  return {
    id: checkIn.id,
    name: checkIn.member
      ? `${checkIn.member.firstName} ${checkIn.member.lastName}`
      : checkIn.guestName || 'Guest',
    time: formatTime(checkIn.checkInTime),
    service: serviceName,
    isChild: false,
  };
}

// Transform ChildCheckIn to RecentCheckInDisplay
function transformChildCheckInToDisplay(
  checkIn: ChildCheckIn,
  serviceName: string
): RecentCheckInDisplay {
  return {
    id: checkIn.id,
    name: checkIn.childName,
    time: formatTime(checkIn.checkInTime),
    service: serviceName,
    isChild: true,
    securityCode: checkIn.securityCode,
  };
}

export default function CheckIn() {
  const { churchId } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<FamilyDisplay | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [showFamilyDialog, setShowFamilyDialog] = useState(false);
  const [showChildrenDialog, setShowChildrenDialog] = useState(false);
  const [childrenToCheckIn, setChildrenToCheckIn] = useState<FamilyMemberDisplay[]>([]);
  const [pendingChildCheckIns, setPendingChildCheckIns] = useState<FamilyMemberDisplay[]>([]);
  const [parentCheckInId, setParentCheckInId] = useState<string | null>(null);

  // Fetch today's services
  const {
    data: todaysServices,
    isLoading: servicesLoading,
    error: servicesError,
  } = useQuery({
    queryKey: ['checkIn', 'todaysServices', churchId],
    queryFn: () => checkInApi.getTodaysServices(churchId!),
    enabled: !!churchId,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch check-in stats
  const { data: stats } = useQuery<CheckInStats>({
    queryKey: ['checkIn', 'stats', churchId],
    queryFn: () => checkInApi.getStats(churchId!),
    enabled: !!churchId,
    refetchInterval: 30000,
  });

  // Fetch recent check-ins for the selected service
  const { data: recentCheckInsData } = useQuery({
    queryKey: ['checkIn', 'recent', churchId, selectedService],
    queryFn: () =>
      selectedService
        ? checkInApi.listCheckIns(churchId!, selectedService, { pageSize: 20 })
        : Promise.resolve({ data: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } }),
    enabled: !!churchId && !!selectedService,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feed
  });

  // Fetch child check-ins for the selected service
  const { data: childCheckIns } = useQuery({
    queryKey: ['checkIn', 'children', churchId, selectedService],
    queryFn: () =>
      selectedService
        ? checkInApi.getChildCheckIns(churchId!, selectedService)
        : Promise.resolve([]),
    enabled: !!churchId && !!selectedService,
    refetchInterval: 10000,
  });

  // Search members for check-in
  const {
    data: searchResults,
    isLoading: searchLoading,
  } = useQuery({
    queryKey: ['members', 'search', churchId, searchQuery],
    queryFn: () => membersApi.search(churchId!, searchQuery, 10),
    enabled: !!churchId && searchQuery.length >= 2,
    staleTime: 5000,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: { memberId?: string; guestName?: string; isFirstTime?: boolean }) =>
      checkInApi.checkIn(churchId!, selectedService, data),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['checkIn', 'todaysServices', churchId] });
      queryClient.invalidateQueries({ queryKey: ['checkIn', 'recent', churchId, selectedService] });
      queryClient.invalidateQueries({ queryKey: ['checkIn', 'stats', churchId] });

      // If there are children to check in, store the parent check-in ID
      if (pendingChildCheckIns.length > 0) {
        setParentCheckInId(data.id);
      }
    },
  });

  // Child check-in mutation
  const childCheckInMutation = useMutation({
    mutationFn: (data: {
      parentCheckInId: string;
      childName: string;
      dateOfBirth?: string;
      parentName: string;
      parentPhone: string;
      allergies?: string;
      specialNotes?: string;
    }) =>
      checkInApi.checkInChild(churchId!, selectedService, data.parentCheckInId, {
        childName: data.childName,
        dateOfBirth: data.dateOfBirth,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        allergies: data.allergies,
        specialNotes: data.specialNotes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIn', 'children', churchId, selectedService] });
      queryClient.invalidateQueries({ queryKey: ['checkIn', 'todaysServices', churchId] });
      queryClient.invalidateQueries({ queryKey: ['checkIn', 'stats', churchId] });
    },
  });

  // Transform services for display
  const services: DisplayService[] = (todaysServices || []).map(transformService);

  // Set default selected service
  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      const activeService = services.find((s) => s.isActive);
      setSelectedService(activeService?.id || services[0].id);
    }
  }, [services, selectedService]);

  // Calculate total attendance
  const totalAttendance = services.reduce((sum, service) => sum + service.checkedIn, 0);

  // Transform search results to family display format
  const familyResults: FamilyDisplay[] = searchQuery.length >= 2 && searchResults
    ? groupMembersIntoFamilies(searchResults)
    : [];

  // Group members by family (simplified - groups by last name and phone)
  function groupMembersIntoFamilies(members: Member[]): FamilyDisplay[] {
    const familyMap = new Map<string, FamilyDisplay>();

    members.forEach((member) => {
      const familyKey = member.familyId || `${member.lastName}-${member.phone || 'no-phone'}`;

      if (!familyMap.has(familyKey)) {
        familyMap.set(familyKey, {
          id: familyKey,
          name: `${member.lastName} Family`,
          phone: member.phone || '',
          members: [],
        });
      }

      const family = familyMap.get(familyKey)!;
      family.members.push(transformMemberToFamilyMember(member));
    });

    return Array.from(familyMap.values());
  }

  // Transform recent check-ins for display
  const recentCheckIns: RecentCheckInDisplay[] = (() => {
    const currentService = services.find((s) => s.id === selectedService);
    const serviceName = currentService?.name || 'Service';

    const adultCheckIns = (recentCheckInsData?.data || []).map((c) =>
      transformCheckInToDisplay(c, serviceName)
    );

    const childCheckInsList = (childCheckIns || []).map((c) =>
      transformChildCheckInToDisplay(c, serviceName)
    );

    // Combine and sort by time (most recent first)
    return [...adultCheckIns, ...childCheckInsList]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 20);
  })();

  const handleFamilySelect = useCallback((family: FamilyDisplay) => {
    setSelectedFamily(family);
    setSelectedMembers([]);
    setShowFamilyDialog(true);
  }, []);

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  const handleCheckIn = async () => {
    if (!selectedFamily || !churchId || !selectedService) return;

    const selectedMemberObjects = selectedFamily.members.filter((m) =>
      selectedMembers.includes(m.id)
    );

    const children = selectedMemberObjects.filter((m) => m.isChild);
    const adults = selectedMemberObjects.filter((m) => !m.isChild);

    if (children.length > 0) {
      // Store children for later check-in
      setPendingChildCheckIns(children);
      setChildrenToCheckIn(children);
      setShowFamilyDialog(false);
      setShowChildrenDialog(true);

      // Check in the first adult (or all adults)
      if (adults.length > 0) {
        for (const adult of adults) {
          await checkInMutation.mutateAsync({ memberId: adult.memberId });
        }
      } else {
        // If no adults, create a guest check-in for the parent
        const result = await checkInMutation.mutateAsync({
          guestName: selectedFamily.name,
        });
        setParentCheckInId(result.id);
      }
    } else {
      // No children, just check in adults
      for (const adult of adults) {
        await checkInMutation.mutateAsync({ memberId: adult.memberId });
      }
      completeCheckIn();
    }
  };

  const completeCheckIn = useCallback(() => {
    // Reset state
    setSelectedFamily(null);
    setSelectedMembers([]);
    setChildrenToCheckIn([]);
    setPendingChildCheckIns([]);
    setParentCheckInId(null);
    setShowFamilyDialog(false);
    setShowChildrenDialog(false);
    setSearchQuery('');
  }, []);

  const handleChildrenCheckIn = async () => {
    if (!parentCheckInId || !selectedFamily) return;

    // Check in all children
    for (const child of pendingChildCheckIns) {
      await childCheckInMutation.mutateAsync({
        parentCheckInId,
        childName: child.name,
        parentName: selectedFamily.name,
        parentPhone: selectedFamily.phone,
        allergies: child.allergies,
        specialNotes: child.specialNeeds,
      });
    }

    completeCheckIn();
  };

  const handlePrintNameTags = () => {
    // In a real app, this would trigger printing
    alert('Printing name tags for selected members...');
  };

  const handlePrintChildLabel = (child: FamilyMemberDisplay) => {
    alert(
      `Printing safety label for ${child.name}\nSecurity Code: ${child.securityCode || 'Generated on check-in'}\n${child.allergies ? `Allergies: ${child.allergies}` : ''}\n${child.specialNeeds ? `Special Needs: ${child.specialNeeds}` : ''}`
    );
  };

  // Error state
  if (servicesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Services</h2>
          <p className="text-gray-600">Unable to load today's services. Please try again.</p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['checkIn'] })}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-2xl ${colors.burgundy.bg} p-8 text-white`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif mb-2">Check-in System</h1>
          <p className="text-white/80 max-w-xl">
            Welcome members and track attendance for today's services and events.
          </p>
        </div>
      </div>

      {/* Real-time Attendance Counter */}
      <Card className={`${colors.walnut.border} border-2`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${colors.sage.bgLight}`}>
                <Users className={`h-8 w-8 ${colors.sage.text}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${colors.walnut.text}`}>Total Attendance Today</p>
                <p className="text-4xl font-bold font-serif">
                  {servicesLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    totalAttendance
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Live updating</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Search and Services */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Check-in Search */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Search className={`h-5 w-5 ${colors.burgundy.text}`} />
                Quick Check-in
              </CardTitle>
              <CardDescription>Search by name or phone number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Search Results */}
              {familyResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {familyResults.map((family) => (
                    <button
                      key={family.id}
                      onClick={() => handleFamilySelect(family)}
                      className={`w-full p-4 rounded-lg border ${colors.walnut.border} hover:${colors.sage.bgLight} transition-colors text-left flex items-center justify-between group`}
                    >
                      <div>
                        <p className="font-semibold">{family.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{family.phone || 'No phone'}</span>
                          <span className="mx-1">-</span>
                          <User className="h-3 w-3" />
                          <span>{family.members.length} members</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !searchLoading && familyResults.length === 0 && (
                <p className="mt-4 text-center text-muted-foreground py-4">
                  No families found matching "{searchQuery}"
                </p>
              )}
            </CardContent>
          </Card>

          {/* Today's Services */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Clock className={`h-5 w-5 ${colors.burgundy.text}`} />
                Today's Services & Events
              </CardTitle>
              <CardDescription>Select a service for check-in</CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No services scheduled for today</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedService === service.id
                          ? `${colors.burgundy.border} ${colors.burgundy.bgLight}`
                          : 'border-slate-200 hover:border-slate-300'
                      } ${!service.isActive ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.time}</p>
                          <p className="text-xs text-muted-foreground">{service.location}</p>
                        </div>
                        {service.isActive ? (
                          <Badge className={`${colors.sage.bg} text-white`}>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Upcoming</Badge>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Checked in</span>
                          <span className="font-semibold">
                            {service.checkedIn} / {service.expected}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`${colors.sage.bg} h-2 rounded-full transition-all`}
                            style={{
                              width: `${Math.min((service.checkedIn / service.expected) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Children's Ministry Quick Access */}
          <Card className={`${colors.sage.border} border-2`}>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Baby className={`h-5 w-5 ${colors.sage.text}`} />
                Children's Ministry Check-in
              </CardTitle>
              <CardDescription>
                Secure check-in with safety labels and security codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${colors.sage.bgLight} flex items-start gap-4`}>
                <Shield className={`h-6 w-6 ${colors.sage.text} mt-1`} />
                <div>
                  <p className="font-semibold mb-1">Child Safety First</p>
                  <p className="text-sm text-muted-foreground">
                    All children receive unique security codes. Parents must present matching codes
                    for pickup. Allergy alerts and special needs are printed on name tags.
                  </p>
                  {stats && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">{stats.totalChildren}</span> children checked in
                      today
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Check-ins */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <UserCheck className={`h-5 w-5 ${colors.burgundy.text}`} />
                Recent Check-ins
              </CardTitle>
              <CardDescription>Live feed of today's check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentCheckIns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No check-ins yet for this service
                  </p>
                ) : (
                  recentCheckIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className={`p-3 rounded-lg border ${
                        checkIn.isChild ? colors.sage.border : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{checkIn.name}</p>
                            {checkIn.isChild && (
                              <Badge className={`${colors.sage.bg} text-white text-xs`}>
                                <Baby className="h-3 w-3 mr-1" />
                                Child
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{checkIn.service}</p>
                          {checkIn.securityCode && (
                            <p className={`text-xs font-mono ${colors.burgundy.text} mt-1`}>
                              Code: {checkIn.securityCode}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{checkIn.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Family Check-in Dialog */}
      <Dialog open={showFamilyDialog} onOpenChange={setShowFamilyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{selectedFamily?.name}</DialogTitle>
            <DialogDescription>Select family members to check in</DialogDescription>
          </DialogHeader>

          {selectedFamily && (
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedFamily.members.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMembers.includes(member.id)
                        ? `${colors.burgundy.border} ${colors.burgundy.bgLight}`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.isChild && (
                          <Badge className={`${colors.sage.bg} text-white text-xs`}>
                            <Baby className="h-3 w-3 mr-1" />
                            Child
                          </Badge>
                        )}
                      </div>
                      {member.age !== null && (
                        <span className="text-sm text-muted-foreground">Age {member.age}</span>
                      )}
                      {member.allergies && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Allergy: {member.allergies}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <Label className="text-sm font-medium mb-2 block">Check-in Service</Label>
                <div className="grid grid-cols-2 gap-2">
                  {services
                    .filter((s) => s.isActive)
                    .map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          selectedService === service.id
                            ? `${colors.burgundy.border} ${colors.burgundy.bgLight}`
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {service.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowFamilyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCheckIn}
              disabled={selectedMembers.length === 0 || checkInMutation.isPending}
              className={`${colors.burgundy.bg} ${colors.burgundy.hover} text-white`}
            >
              {checkInMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Check In ({selectedMembers.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Children's Safety Label Dialog */}
      <Dialog open={showChildrenDialog} onOpenChange={setShowChildrenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Shield className={`h-5 w-5 ${colors.sage.text}`} />
              Children's Safety Labels
            </DialogTitle>
            <DialogDescription>Print security labels for each child</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {childrenToCheckIn.map((child) => (
              <div
                key={child.id}
                className={`p-4 rounded-lg border-2 ${colors.sage.border} ${colors.sage.bgLight}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className={`font-mono text-lg ${colors.burgundy.text} font-bold mt-1`}>
                      {child.securityCode || 'Code will be generated'}
                    </p>
                    {child.allergies && (
                      <div className="flex items-center gap-1 text-sm text-amber-600 mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Allergy: {child.allergies}</span>
                      </div>
                    )}
                    {child.specialNeeds && (
                      <p className="text-sm text-blue-600 mt-1">Note: {child.specialNeeds}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintChildLabel(child)}
                    className={`${colors.walnut.border}`}
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handlePrintNameTags}
              className={`${colors.walnut.border}`}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All Labels
            </Button>
            <Button
              onClick={handleChildrenCheckIn}
              disabled={childCheckInMutation.isPending}
              className={`${colors.sage.bg} hover:opacity-90 text-white`}
            >
              {childCheckInMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Complete Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

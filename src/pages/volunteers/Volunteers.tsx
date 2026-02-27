import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertCircle,
  Heart,
  Star,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  GraduationCap,
  Send,
  Music,
  Baby,
  Coffee,
  Monitor,
  HandHeart,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  Sparkles,
  Download,
} from 'lucide-react';
import { exportToCSV, generateExportFilename, type ExportColumn } from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useVolunteers,
  useMinistryTeams,
  useVolunteerSchedule,
  useVolunteerStats,
} from '@/hooks/useVolunteers';
import { useAuth } from '@/hooks/useAuth';
import type { BackgroundCheckStatus, Volunteer as ApiVolunteer, MinistryTeam as ApiMinistryTeam, VolunteerAssignment } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface VolunteerUI {
  id: string;
  name: string;
  email: string;
  phone: string;
  teams: string[];
  status: 'active' | 'inactive' | 'pending' | 'on_leave';
  hoursThisMonth: number;
  totalHours: number;
  joinedDate: string;
  skills: string[];
  availability: string[];
  backgroundCheckStatus?: BackgroundCheckStatus;
  trainingCompleted?: string[];
  photoUrl?: string;
}

interface MinistryTeamUI {
  id: string;
  name: string;
  description: string;
  leader: string;
  memberCount: number;
  color: string;
  icon: 'music' | 'baby' | 'coffee' | 'monitor' | 'heart';
}

// ============================================================================
// Constants & Configuration
// ============================================================================

const ministryTabs = [
  { id: 'all', name: 'All Teams', icon: Users },
  { id: 'worship', name: 'Worship', icon: Music },
  { id: 'children', name: 'Children', icon: Baby },
  { id: 'hospitality', name: 'Hospitality', icon: Coffee },
  { id: 'tech', name: 'Tech', icon: Monitor },
  { id: 'outreach', name: 'Outreach', icon: HandHeart },
];

const statusColors: Record<VolunteerUI['status'], string> = {
  active: 'bg-[hsl(150,25%,40%)] text-white',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-amber-100 text-amber-800',
  on_leave: 'bg-blue-100 text-blue-800',
};

const backgroundCheckConfig: Record<BackgroundCheckStatus, { color: string; icon: typeof Shield; label: string }> = {
  not_started: { color: 'bg-gray-100 text-gray-600', icon: Shield, label: 'Not Started' },
  pending: { color: 'bg-amber-100 text-amber-700', icon: ShieldAlert, label: 'Pending' },
  approved: { color: 'bg-[hsl(150,25%,40%)] text-white', icon: ShieldCheck, label: 'Approved' },
  denied: { color: 'bg-red-100 text-red-700', icon: ShieldX, label: 'Denied' },
  expired: { color: 'bg-orange-100 text-orange-700', icon: ShieldAlert, label: 'Expired' },
};

const availableTrainings = [
  'Child Safety',
  'First Aid/CPR',
  'Leadership Basics',
  'Hospitality Training',
  'Sound/AV Operations',
  'Worship Team Guidelines',
  'Conflict Resolution',
  'Privacy & Data Handling',
];

// Volunteer export columns
const volunteerExportColumns: ExportColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'teams', header: 'Ministry Teams', formatter: (value) => Array.isArray(value) ? value.join('; ') : String(value || '') },
  { key: 'status', header: 'Status' },
  { key: 'hoursThisMonth', header: 'Hours This Month' },
  { key: 'totalHours', header: 'Total Hours' },
  { key: 'joinedDate', header: 'Joined Date', formatter: (value) => {
    if (!value) return '';
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US');
  }},
  { key: 'skills', header: 'Skills', formatter: (value) => Array.isArray(value) ? value.join('; ') : String(value || '') },
  { key: 'backgroundCheckStatus', header: 'Background Check Status' },
  { key: 'trainingCompleted', header: 'Training Completed', formatter: (value) => Array.isArray(value) ? value.join('; ') : String(value || '') },
];

// ============================================================================
// Helper Functions
// ============================================================================

function mapApiVolunteerToUI(volunteer: ApiVolunteer): VolunteerUI {
  return {
    id: volunteer.id,
    name: volunteer.member ? `${volunteer.member.firstName} ${volunteer.member.lastName}` : 'Unknown',
    email: volunteer.member?.email ?? '',
    phone: volunteer.member?.phone ?? '',
    teams: volunteer.teams?.map((t) => t.name) ?? [],
    status: volunteer.status,
    hoursThisMonth: 0, // This would come from stats API in real implementation
    totalHours: volunteer.totalHours || 0,
    joinedDate: volunteer.createdAt,
    skills: volunteer.skills ?? [],
    availability: Object.values(volunteer.availability ?? {}).flat(),
    backgroundCheckStatus: volunteer.backgroundCheckStatus,
    trainingCompleted: volunteer.trainingCompleted ?? [],
  };
}

function mapApiTeamToUI(team: ApiMinistryTeam, index: number): MinistryTeamUI {
  const teamIcons = ['music', 'baby', 'coffee', 'monitor', 'heart'] as const;
  const teamColors = [
    'bg-[hsl(345,45%,32%)]',
    'bg-[hsl(150,25%,40%)]',
    'bg-amber-600',
    'bg-blue-600',
    'bg-purple-600',
  ];

  return {
    id: team.id,
    name: team.name,
    description: team.description ?? '',
    leader: team.leader ? `${team.leader.firstName} ${team.leader.lastName}` : 'No leader',
    memberCount: team.memberCount,
    color: teamColors[index % teamColors.length],
    icon: teamIcons[index % teamIcons.length],
  };
}

// ============================================================================
// Skeleton Components
// ============================================================================

function VolunteerCardSkeleton() {
  return (
    <Card className="church-glow border-[hsl(35,20%,88%)]">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function TeamCardSkeleton() {
  return (
    <Card className="church-glow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="church-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function SpotlightSkeleton() {
  return (
    <Card className="burgundy-gradient text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded bg-white/20" />
          <Skeleton className="h-5 w-32 bg-white/20" />
        </div>
        <Skeleton className="h-4 w-48 bg-white/20 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full bg-white/20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-4 w-48 bg-white/20" />
          </div>
        </div>
        <Skeleton className="h-16 w-full mt-4 rounded-lg bg-white/10" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function BackgroundCheckBadge({ status }: { status?: BackgroundCheckStatus }) {
  const config = backgroundCheckConfig[status || 'not_started'];
  const IconComponent = config.icon;
  return (
    <Badge className={`${config.color} gap-1 font-serif`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function TrainingProgress({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-serif">Training Progress</span>
        <span className="font-medium">{completed}/{total}</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

interface VolunteerCardProps {
  volunteer: VolunteerUI;
  onSendThankYou: (volunteer: VolunteerUI) => void;
  onViewDetails: (volunteer: VolunteerUI) => void;
}

function VolunteerCard({ volunteer, onSendThankYou, onViewDetails }: VolunteerCardProps) {
  const trainingsCompleted = volunteer.trainingCompleted?.length || 0;

  return (
    <Card className="church-glow hover:church-glow-lg transition-all duration-300 border-[hsl(35,20%,88%)] bg-gradient-to-br from-card to-[hsl(40,33%,96%)]">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Photo/Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-[hsl(345,45%,32%)/20]">
              <AvatarFallback className="bg-[hsl(345,45%,32%)] text-white font-serif text-lg">
                {volunteer.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {volunteer.status === 'active' && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[hsl(150,25%,40%)] border-2 border-white flex items-center justify-center">
                <Heart className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,15%)]">
                {volunteer.name}
              </h3>
              <Badge className={statusColors[volunteer.status]}>
                {volunteer.status}
              </Badge>
              <BackgroundCheckBadge status={volunteer.backgroundCheckStatus} />
            </div>

            {/* Ministries Served */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {volunteer.teams.length > 0 ? (
                volunteer.teams.map((team) => (
                  <Badge
                    key={team}
                    variant="outline"
                    className="text-xs border-[hsl(345,45%,32%)/30] text-[hsl(345,45%,32%)] font-serif"
                  >
                    {team}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No teams assigned</span>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {volunteer.email || 'No email'}
              </span>
              {volunteer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {volunteer.phone}
                </span>
              )}
            </div>

            {/* Hours & Training */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-[hsl(40,40%,97%)] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hours Logged</p>
                    <p className="font-semibold">
                      <span className="text-[hsl(345,45%,32%)]">{volunteer.hoursThisMonth}</span>
                      <span className="text-muted-foreground font-normal"> this month / </span>
                      <span>{volunteer.totalHours}</span>
                      <span className="text-muted-foreground font-normal"> total</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-[hsl(40,40%,97%)] rounded-lg p-3">
                <TrainingProgress completed={trainingsCompleted} total={availableTrainings.length} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[hsl(345,45%,32%)/10]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails(volunteer)}>
                <Edit className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4" />
                Log Hours
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSendThankYou(volunteer)}
                className="text-[hsl(345,45%,32%)]"
              >
                <Heart className="mr-2 h-4 w-4" />
                Send Thank You
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function VolunteerSpotlight({ volunteer, isLoading }: { volunteer: VolunteerUI | null; isLoading: boolean }) {
  if (isLoading) {
    return <SpotlightSkeleton />;
  }

  if (!volunteer) {
    return (
      <Card className="burgundy-gradient text-white overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <CardTitle className="text-lg font-serif">Volunteer Spotlight</CardTitle>
          </div>
          <CardDescription className="text-white/80">
            Celebrating our faithful servants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/70">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-serif">No volunteers to spotlight yet.</p>
            <p className="text-sm mt-1">Add volunteers to see them featured here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="burgundy-gradient text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <CardTitle className="text-lg font-serif">Volunteer Spotlight</CardTitle>
        </div>
        <CardDescription className="text-white/80">
          Celebrating our faithful servants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-3 border-white/30">
            <AvatarFallback className="bg-white/20 text-white font-serif text-xl">
              {volunteer.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
              <h3 className="font-serif text-xl font-semibold">{volunteer.name}</h3>
            </div>
            <p className="text-white/80 text-sm mt-1">
              {volunteer.teams.length > 0
                ? `Serving faithfully in ${volunteer.teams.join(', ')}`
                : 'Ready to serve our community'}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {volunteer.totalHours} hours served
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Since {new Date(volunteer.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm italic font-serif">
            "Thank you for your dedication and heart for service. Your commitment to our church family is a blessing to all."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ThankYouNoteDialog({
  volunteer,
  open,
  onOpenChange,
}: {
  volunteer: VolunteerUI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      onOpenChange(false);
      setMessage('');
    }, 1000);
  };

  const templates = [
    "Thank you so much for your faithful service! Your dedication makes such a difference in our church family.",
    "We are deeply grateful for the time and love you pour into our ministry. You are a blessing!",
    "Your servant heart shines through in everything you do. Thank you for being such a vital part of our team!",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <Heart className="h-5 w-5 text-[hsl(345,45%,32%)]" />
            Send Appreciation Note
          </DialogTitle>
          <DialogDescription>
            Let {volunteer?.name} know how much their service means to our church family.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-[hsl(40,33%,97%)] rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[hsl(345,45%,32%)] text-white font-serif">
                {volunteer?.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{volunteer?.name}</p>
              <p className="text-sm text-muted-foreground">{volunteer?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-serif">Quick Templates</Label>
            <div className="space-y-2">
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(template)}
                  className="w-full text-left p-2 text-sm rounded border hover:bg-[hsl(40,33%,97%)] transition-colors"
                >
                  {template.substring(0, 60)}...
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-serif">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a heartfelt message of appreciation..."
              className="min-h-[120px] font-serif"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)]"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Sending...' : 'Send Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleCalendar({
  scheduleData,
  isLoading,
  currentWeekStart,
  onPreviousWeek,
  onNextWeek,
}: {
  scheduleData: VolunteerAssignment[] | undefined;
  isLoading: boolean;
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  // Group assignments by date
  const assignmentsByDate = (scheduleData || []).reduce((acc, assignment) => {
    const dateKey = new Date(assignment.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(assignment);
    return acc;
  }, {} as Record<string, VolunteerAssignment[]>);

  const monthYear = currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="church-glow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[hsl(345,45%,32%)]" />
              Volunteer Schedule
            </CardTitle>
            <CardDescription>{monthYear}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDates.map((date, idx) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`text-center p-2 rounded-t-lg ${isToday ? 'bg-[hsl(345,45%,32%)] text-white' : 'bg-[hsl(40,33%,97%)]'}`}
                >
                  <div className="text-xs font-medium">{daysOfWeek[idx]}</div>
                  <div className={`text-lg font-serif ${isToday ? 'font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Day content */}
            {weekDates.map((date, idx) => {
              const dateAssignments = assignmentsByDate[date.toDateString()] || [];
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={`content-${idx}`}
                  className={`min-h-[100px] p-1 border rounded-b-lg ${isToday ? 'border-[hsl(345,45%,32%)]' : 'border-border'}`}
                >
                  {dateAssignments.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No scheduled
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {dateAssignments.slice(0, 3).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-1.5 bg-[hsl(150,25%,40%)/10] rounded text-xs"
                        >
                          <div className="font-medium text-[hsl(150,25%,40%)] truncate">
                            {assignment.role}
                          </div>
                          <div className="text-muted-foreground">
                            {assignment.startTime}
                          </div>
                        </div>
                      ))}
                      {dateAssignments.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground">
                          +{dateAssignments.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button variant="outline" className="font-serif">
            <Plus className="mr-2 h-4 w-4" />
            Add Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HoursReport({ volunteers, isLoading }: { volunteers: VolunteerUI[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="church-glow">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (volunteers.length === 0) {
    return (
      <Card className="church-glow">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(345,45%,32%)]" />
            Hours Report
          </CardTitle>
          <CardDescription>Track volunteer contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No volunteer hours recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalHoursThisMonth = volunteers.reduce((sum, v) => sum + v.hoursThisMonth, 0);
  const totalHoursAllTime = volunteers.reduce((sum, v) => sum + v.totalHours, 0);
  const topVolunteers = [...volunteers]
    .sort((a, b) => b.hoursThisMonth - a.hoursThisMonth)
    .slice(0, 5);

  return (
    <Card className="church-glow">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <FileText className="h-5 w-5 text-[hsl(345,45%,32%)]" />
          Hours Report
        </CardTitle>
        <CardDescription>Track volunteer contributions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[hsl(40,33%,97%)] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[hsl(345,45%,32%)]">{totalHoursThisMonth}</p>
            <p className="text-sm text-muted-foreground">Hours This Month</p>
          </div>
          <div className="bg-[hsl(40,33%,97%)] rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-[hsl(150,25%,40%)]">{totalHoursAllTime}</p>
            <p className="text-sm text-muted-foreground">Total Hours (All Time)</p>
          </div>
        </div>

        <div>
          <h4 className="font-serif font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[hsl(345,45%,32%)]" />
            Top Contributors This Month
          </h4>
          <div className="space-y-3">
            {topVolunteers.map((volunteer, idx) => (
              <div key={volunteer.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-amber-400 text-amber-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                  idx === 2 ? 'bg-amber-700 text-amber-100' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[hsl(345,45%,32%)/10] text-[hsl(345,45%,32%)] text-xs">
                    {volunteer.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{volunteer.name}</p>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {volunteer.hoursThisMonth} hrs
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full font-serif"
          onClick={() => {
            exportToCSV(
              volunteers as unknown as Record<string, unknown>[],
              generateExportFilename('volunteers'),
              volunteerExportColumns
            );
          }}
          disabled={volunteers.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV Report
        </Button>
      </CardContent>
    </Card>
  );
}

function TrainingManagement() {
  return (
    <Card className="church-glow">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[hsl(345,45%,32%)]" />
          Training Programs
        </CardTitle>
        <CardDescription>Equip volunteers for effective service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableTrainings.map((training) => (
            <div
              key={training}
              className="flex items-center justify-between p-3 bg-[hsl(40,33%,97%)] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[hsl(150,25%,40%)/10] flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-[hsl(150,25%,40%)]" />
                </div>
                <span className="font-medium">{training}</span>
              </div>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyVolunteersState() {
  return (
    <Card className="church-glow">
      <CardContent className="p-12 text-center">
        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-serif text-xl font-semibold mb-2">No Volunteers Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start building your volunteer community by welcoming new volunteers to serve in your church.
        </p>
        <Button className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] font-serif">
          <Plus className="mr-2 h-4 w-4" />
          Welcome First Volunteer
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyTeamsState() {
  return (
    <Card className="col-span-full church-glow">
      <CardContent className="p-12 text-center">
        <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-serif text-xl font-semibold mb-2">No Ministry Teams Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create ministry teams to organize your volunteers and coordinate service opportunities.
        </p>
        <Button variant="outline" className="font-serif">
          <Plus className="mr-2 h-4 w-4" />
          Create First Team
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function Volunteers() {
  // All hooks must be called at the top level, unconditionally
  const { churchId: _churchId } = useAuth();

  // Data fetching hooks
  const { data: volunteersResponse, isLoading: volunteersLoading, error: volunteersError } = useVolunteers();
  const { data: teamsData, isLoading: teamsLoading } = useMinistryTeams();
  const { data: statsData, isLoading: statsLoading } = useVolunteerStats();

  // Calendar state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });

  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(currentWeekStart.getDate() + 6);

  const { data: scheduleData, isLoading: scheduleLoading } = useVolunteerSchedule({
    startDate: currentWeekStart.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0],
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [thankYouVolunteer, setThankYouVolunteer] = useState<VolunteerUI | null>(null);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);

  // Map API volunteers to UI format
  const volunteers: VolunteerUI[] = (volunteersResponse?.data ?? []).map(mapApiVolunteerToUI);

  // Map API teams to UI format
  const teams: MinistryTeamUI[] = (teamsData ?? []).map((team, index) => mapApiTeamToUI(team, index));

  const isLoading = volunteersLoading || teamsLoading;

  // Filtering
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMinistry =
      ministryFilter === 'all' ||
      volunteer.teams.some((t) => t.toLowerCase().includes(ministryFilter.toLowerCase()));
    return matchesSearch && matchesMinistry;
  });

  // Stats from API or calculated
  const totalHoursThisMonth = statsData?.totalHoursThisMonth ?? volunteers.reduce((sum, v) => sum + v.hoursThisMonth, 0);
  const activeVolunteers = statsData?.activeVolunteers ?? volunteers.filter((v) => v.status === 'active').length;
  const pendingBackgroundChecks = statsData?.needsBackgroundCheck ?? volunteers.filter(
    (v) => v.backgroundCheckStatus === 'pending' || v.backgroundCheckStatus === 'not_started'
  ).length;

  // Spotlight volunteer (highest hours this month or first active)
  const spotlightVolunteer = volunteers.length > 0
    ? volunteers.reduce((max, v) => (v.totalHours > (max?.totalHours || 0) ? v : max), volunteers[0])
    : null;

  // Handlers
  const handleSendThankYou = (volunteer: VolunteerUI) => {
    setThankYouVolunteer(volunteer);
    setShowThankYouDialog(true);
  };

  const handleViewDetails = (volunteer: VolunteerUI) => {
    console.log('View details for:', volunteer.name);
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Error state
  if (volunteersError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load volunteers. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getTeamIcon = (iconName: MinistryTeamUI['icon']) => {
    const icons = {
      music: Music,
      baby: Baby,
      coffee: Coffee,
      monitor: Monitor,
      heart: HandHeart,
    };
    return icons[iconName];
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-[hsl(40,33%,97%)] to-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[hsl(20,25%,15%)]">
            Our Faithful Volunteers
          </h1>
          <p className="text-muted-foreground mt-1 font-serif italic">
            "Each of you should use whatever gift you have received to serve others" - 1 Peter 4:10
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] font-serif">
              <Plus className="mr-2 h-4 w-4" />
              Welcome New Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Welcome a New Volunteer</DialogTitle>
              <DialogDescription>
                Add a new member to our volunteer family
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-serif">Full Name</Label>
                  <Input id="name" placeholder="Enter name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-serif">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-serif">Phone</Label>
                  <Input id="phone" placeholder="(555) 000-0000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team" className="font-serif">Ministry Team</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-serif">Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Sunday Morning',
                    'Sunday Evening',
                    'Wednesday Evening',
                    'Friday Evening',
                    'Saturday',
                  ].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox id={time} />
                      <label htmlFor={time} className="text-sm">
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills" className="font-serif">Skills & Gifts</Label>
                <Input id="skills" placeholder="e.g., Music, Teaching, Hospitality" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)]"
                >
                  Welcome to the Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-serif">Total Volunteers</CardTitle>
                <div className="h-10 w-10 rounded-full bg-[hsl(345,45%,32%)/10] flex items-center justify-center">
                  <Users className="h-5 w-5 text-[hsl(345,45%,32%)]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[hsl(345,45%,32%)]">{volunteers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-[hsl(150,25%,40%)] font-medium">{activeVolunteers} active</span> servants
                </p>
              </CardContent>
            </Card>

            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-serif">Ministry Teams</CardTitle>
                <div className="h-10 w-10 rounded-full bg-[hsl(150,25%,40%)/10] flex items-center justify-center">
                  <Award className="h-5 w-5 text-[hsl(150,25%,40%)]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[hsl(150,25%,40%)]">{teams.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active ministry areas</p>
              </CardContent>
            </Card>

            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-serif">Hours This Month</CardTitle>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{totalHoursThisMonth}</div>
                <p className="text-xs text-muted-foreground mt-1">Hours of faithful service</p>
              </CardContent>
            </Card>

            <Card className="church-glow border-[hsl(35,20%,88%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium font-serif">Background Checks</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{pendingBackgroundChecks}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending verification</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Spotlight Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolunteerSpotlight volunteer={spotlightVolunteer} isLoading={volunteersLoading} />
        </div>
        <div>
          <HoursReport volunteers={volunteers} isLoading={volunteersLoading} />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="volunteers" className="space-y-4">
        <TabsList className="bg-[hsl(40,33%,97%)] p-1">
          <TabsTrigger value="volunteers" className="font-serif data-[state=active]:bg-white">
            <Users className="mr-2 h-4 w-4" />
            Volunteers
          </TabsTrigger>
          <TabsTrigger value="teams" className="font-serif data-[state=active]:bg-white">
            <Award className="mr-2 h-4 w-4" />
            Ministry Teams
          </TabsTrigger>
          <TabsTrigger value="schedule" className="font-serif data-[state=active]:bg-white">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="training" className="font-serif data-[state=active]:bg-white">
            <GraduationCap className="mr-2 h-4 w-4" />
            Training
          </TabsTrigger>
        </TabsList>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-4">
          {/* Ministry Team Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {ministryTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = ministryFilter === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMinistryFilter(tab.id)}
                  className={`font-serif ${isActive ? 'bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)]' : ''}`}
                >
                  <IconComponent className="mr-1.5 h-4 w-4" />
                  {tab.name}
                </Button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-serif"
              />
            </div>
            <Select value={ministryFilter} onValueChange={setMinistryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.name.toLowerCase()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volunteer Cards */}
          <div className="grid gap-4">
            {volunteersLoading ? (
              <>
                <VolunteerCardSkeleton />
                <VolunteerCardSkeleton />
                <VolunteerCardSkeleton />
              </>
            ) : volunteers.length === 0 ? (
              <EmptyVolunteersState />
            ) : filteredVolunteers.length === 0 ? (
              <Card className="church-glow">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-serif">
                    No volunteers found matching your search.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('');
                      setMinistryFilter('all');
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredVolunteers.map((volunteer) => (
                <VolunteerCard
                  key={volunteer.id}
                  volunteer={volunteer}
                  onSendThankYou={handleSendThankYou}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamsLoading ? (
              <>
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
              </>
            ) : teams.length === 0 ? (
              <EmptyTeamsState />
            ) : (
              teams.map((team) => {
                const IconComponent = getTeamIcon(team.icon);
                return (
                  <Card key={team.id} className="church-glow hover:church-glow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full ${team.color} flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-serif">{team.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">Led by {team.leader}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 font-serif">
                        {team.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="font-serif">
                          <Users className="h-3 w-3 mr-1" />
                          {team.memberCount} members
                        </Badge>
                        <Button variant="outline" size="sm" className="font-serif">
                          View Team
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {!teamsLoading && teams.length > 0 && (
            <div className="flex justify-center">
              <Button variant="outline" className="font-serif">
                <Plus className="mr-2 h-4 w-4" />
                Create New Ministry Team
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <ScheduleCalendar
            scheduleData={scheduleData}
            isLoading={scheduleLoading}
            currentWeekStart={currentWeekStart}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
          />
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrainingManagement />
            <Card className="church-glow">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Award className="h-5 w-5 text-[hsl(345,45%,32%)]" />
                  Training Completion Overview
                </CardTitle>
                <CardDescription>See who has completed required training</CardDescription>
              </CardHeader>
              <CardContent>
                {volunteersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : volunteers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No volunteers to display training progress.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {volunteers.slice(0, 5).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[hsl(345,45%,32%)/10] text-[hsl(345,45%,32%)] text-xs">
                            {volunteer.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{volunteer.name}</p>
                          <TrainingProgress
                            completed={volunteer.trainingCompleted?.length || 0}
                            total={availableTrainings.length}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Thank You Note Dialog */}
      <ThankYouNoteDialog
        volunteer={thankYouVolunteer}
        open={showThankYouDialog}
        onOpenChange={setShowThankYouDialog}
      />
    </div>
  );
}

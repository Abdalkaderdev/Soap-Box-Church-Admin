import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  AlertCircle,
  List,
  Grid3X3,
  Repeat,
  Heart,
  HandHelping,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Image,
  Church,
  Sparkles,
  BookOpen,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useEvents,
  useCalendarEvents,
  useCreateEvent,
  useCancelEvent,
  useDuplicateEvent,
  useRegisterAttendee,
  type EventFilters,
} from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import type { Event as ApiEvent, EventCategory, EventStatus, EventCreateInput } from '@/types';

// Warm church aesthetic category colors
const categoryColors: Record<EventCategory, { bg: string; text: string; icon: React.ReactNode }> = {
  worship: { bg: 'bg-[hsl(345,45%,32%)]/10', text: 'text-[hsl(345,45%,32%)]', icon: <Church className="h-3 w-3" /> },
  meeting: { bg: 'bg-[hsl(35,30%,45%)]/10', text: 'text-[hsl(35,30%,45%)]', icon: <BookOpen className="h-3 w-3" /> },
  outreach: { bg: 'bg-[hsl(150,25%,40%)]/10', text: 'text-[hsl(150,25%,40%)]', icon: <Heart className="h-3 w-3" /> },
  youth: { bg: 'bg-[hsl(35,60%,50%)]/10', text: 'text-[hsl(35,60%,50%)]', icon: <Sparkles className="h-3 w-3" /> },
  small_group: { bg: 'bg-[hsl(20,35%,35%)]/10', text: 'text-[hsl(20,35%,35%)]', icon: <Users className="h-3 w-3" /> },
  children: { bg: 'bg-[hsl(35,65%,55%)]/10', text: 'text-[hsl(35,65%,55%)]', icon: <GraduationCap className="h-3 w-3" /> },
  fellowship: { bg: 'bg-[hsl(150,30%,35%)]/10', text: 'text-[hsl(150,30%,35%)]', icon: <Heart className="h-3 w-3" /> },
  training: { bg: 'bg-[hsl(220,45%,45%)]/10', text: 'text-[hsl(220,45%,45%)]', icon: <BookOpen className="h-3 w-3" /> },
  other: { bg: 'bg-[hsl(20,10%,45%)]/10', text: 'text-[hsl(20,10%,45%)]', icon: <Calendar className="h-3 w-3" /> },
};

const statusColors: Record<EventStatus, string> = {
  draft: 'bg-[hsl(35,20%,88%)] text-[hsl(20,25%,35%)]',
  published: 'bg-[hsl(150,25%,40%)]/10 text-[hsl(150,25%,40%)]',
  completed: 'bg-[hsl(20,35%,35%)]/10 text-[hsl(20,35%,35%)]',
  cancelled: 'bg-[hsl(0,65%,50%)]/10 text-[hsl(0,65%,50%)]',
};

// Volunteer needs interface (from API)
interface VolunteerNeed {
  role: string;
  needed: number;
  filled: number;
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <Skeleton className="h-48 w-48 rounded-none" />
        <CardContent className="flex-1 p-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="church-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function CalendarGridSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}

// Event card component
interface EventCardProps {
  event: ApiEvent;
  seriesName?: string;
  onQuickRSVP: (eventId: string) => void;
  onEdit: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
  onCancel: (eventId: string) => void;
}

function EventCard({ event, seriesName, onQuickRSVP, onEdit, onDuplicate, onCancel }: EventCardProps) {
  // Extract volunteer needs from event if available
  const volunteerNeeds: VolunteerNeed[] = (event as ApiEvent & { volunteerNeeds?: VolunteerNeed[] }).volunteerNeeds || [];
  const registrationPercentage = event.maxAttendees
    ? Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)
    : 0;
  const isAlmostFull = registrationPercentage >= 80;
  const isFull = registrationPercentage >= 100;
  const totalVolunteersNeeded = volunteerNeeds?.reduce((sum, v) => sum + v.needed, 0) || 0;
  const totalVolunteersFilled = volunteerNeeds?.reduce((sum, v) => sum + v.filled, 0) || 0;

  const categoryStyle = categoryColors[event.category];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 church-glow group">
      <div className="flex flex-col sm:flex-row">
        {/* Image placeholder with date badge */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-gradient-to-br from-[hsl(35,20%,93%)] to-[hsl(40,33%,97%)] flex items-center justify-center">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-[hsl(20,10%,65%)]">
              <Image className="h-12 w-12 mb-2 opacity-50" />
              <span className="text-xs font-medium">Event Image</span>
            </div>
          )}
          {/* Date badge overlay */}
          <div className="absolute top-3 left-3 bg-[hsl(345,45%,32%)] text-white rounded-lg p-2 shadow-lg text-center min-w-[60px]">
            <div className="text-2xl font-serif font-bold leading-none">
              {new Date(event.startDate).getDate()}
            </div>
            <div className="text-xs uppercase tracking-wide opacity-90">
              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
          {/* Recurring indicator */}
          {event.recurrence && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
              <Repeat className="h-4 w-4 text-[hsl(150,25%,40%)]" />
            </div>
          )}
        </div>

        {/* Event content */}
        <CardContent className="flex-1 p-4 sm:p-5">
          <div className="flex flex-col h-full">
            {/* Header with category and series */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={`${categoryStyle.bg} ${categoryStyle.text} border-0 gap-1`}>
                {categoryStyle.icon}
                {event.category.replace('_', ' ')}
              </Badge>
              {seriesName && (
                <Badge variant="outline" className="text-xs border-[hsl(35,20%,80%)] text-[hsl(20,10%,45%)]">
                  {seriesName}
                </Badge>
              )}
              {event.recurrence && (
                <Badge variant="outline" className="text-xs border-[hsl(150,25%,40%)]/30 text-[hsl(150,25%,40%)]">
                  <Repeat className="h-3 w-3 mr-1" />
                  {event.recurrence.frequency}
                </Badge>
              )}
              <Badge className={statusColors[event.status]}>
                {event.status}
              </Badge>
            </div>

            {/* Title and description */}
            <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,15%)] mb-1 group-hover:text-[hsl(345,45%,32%)] transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-[hsl(20,10%,45%)] line-clamp-2 mb-3">
              {event.description || 'No description provided'}
            </p>

            {/* Time and location */}
            <div className="flex flex-wrap gap-4 text-sm text-[hsl(20,10%,45%)] mb-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {' - '}
                {new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[hsl(150,25%,40%)]" />
                {event.location || 'Location TBD'}
              </span>
            </div>

            {/* Registration progress */}
            {event.requiresRegistration && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5 text-[hsl(20,10%,45%)]">
                    <Users className="h-4 w-4" />
                    Registration
                  </span>
                  <span className={`font-medium ${isFull ? 'text-[hsl(0,65%,50%)]' : isAlmostFull ? 'text-[hsl(35,60%,50%)]' : 'text-[hsl(150,25%,40%)]'}`}>
                    {event.currentAttendees}/{event.maxAttendees || '\u221E'}
                    {isAlmostFull && !isFull && ' - Almost Full!'}
                    {isFull && ' - Full'}
                  </span>
                </div>
                <Progress
                  value={registrationPercentage}
                  className={`h-2 ${isFull ? '[&>div]:bg-[hsl(0,65%,50%)]' : isAlmostFull ? '[&>div]:bg-[hsl(35,60%,50%)]' : '[&>div]:bg-[hsl(150,25%,40%)]'}`}
                />
              </div>
            )}

            {/* Volunteer needs */}
            {volunteerNeeds && volunteerNeeds.length > 0 && (
              <div className="mb-3 p-2 rounded-lg bg-[hsl(35,20%,93%)]/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center gap-1.5 text-[hsl(20,10%,45%)] font-medium">
                    <HandHelping className="h-4 w-4 text-[hsl(345,45%,32%)]" />
                    Volunteer Needs
                  </span>
                  <span className="text-[hsl(20,10%,45%)]">
                    {totalVolunteersFilled}/{totalVolunteersNeeded} filled
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {volunteerNeeds.map((need) => (
                    <Badge
                      key={need.role}
                      variant="outline"
                      className={`text-xs ${
                        need.filled >= need.needed
                          ? 'border-[hsl(150,25%,40%)]/30 text-[hsl(150,25%,40%)] bg-[hsl(150,25%,40%)]/5'
                          : 'border-[hsl(35,60%,50%)]/30 text-[hsl(35,60%,50%)] bg-[hsl(35,60%,50%)]/5'
                      }`}
                    >
                      {need.role}: {need.filled}/{need.needed}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex gap-2">
                {event.requiresRegistration && !isFull && (
                  <Button
                    size="sm"
                    className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
                    onClick={() => onQuickRSVP(event.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Quick RSVP
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[hsl(35,20%,80%)] hover:bg-[hsl(35,20%,93%)]"
                >
                  View Details
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-[hsl(35,20%,93%)]">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit(event.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(event.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Attendees
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HandHelping className="mr-2 h-4 w-4" />
                    Manage Volunteers
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-[hsl(0,65%,50%)]"
                    onClick={() => onCancel(event.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

// Calendar event type from API
interface CalendarEventData {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  category: EventCategory;
  status: EventStatus;
}

// Calendar grid component
interface CalendarGridProps {
  events: CalendarEventData[];
  isLoading: boolean;
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectEvent: (eventId: string) => void;
}

function CalendarGrid({ events, isLoading, currentMonth, onPrevMonth, onNextMonth, onSelectEvent }: CalendarGridProps) {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl church-glow overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[hsl(35,20%,88%)] bg-gradient-to-r from-[hsl(35,20%,96%)] to-[hsl(40,33%,98%)]">
          <Button variant="ghost" size="icon" onClick={onPrevMonth} className="hover:bg-[hsl(35,20%,90%)]">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="font-serif text-xl font-semibold text-[hsl(20,25%,15%)]">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button variant="ghost" size="icon" onClick={onNextMonth} className="hover:bg-[hsl(35,20%,90%)]">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <CalendarGridSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl church-glow overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(35,20%,88%)] bg-gradient-to-r from-[hsl(35,20%,96%)] to-[hsl(40,33%,98%)]">
        <Button variant="ghost" size="icon" onClick={onPrevMonth} className="hover:bg-[hsl(35,20%,90%)]">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-serif text-xl font-semibold text-[hsl(20,25%,15%)]">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <Button variant="ghost" size="icon" onClick={onNextMonth} className="hover:bg-[hsl(35,20%,90%)]">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-[hsl(35,20%,96%)]">
        {days.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-[hsl(20,10%,45%)] border-b border-[hsl(35,20%,88%)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border-b border-r border-[hsl(35,20%,92%)] ${
                day ? 'bg-white hover:bg-[hsl(40,33%,98%)]' : 'bg-[hsl(35,15%,96%)]'
              } ${isToday(day || 0) ? 'bg-[hsl(345,45%,32%)]/5' : ''}`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(day)
                        ? 'bg-[hsl(345,45%,32%)] text-white'
                        : 'text-[hsl(20,25%,25%)]'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const categoryStyle = categoryColors[event.category];
                      return (
                        <button
                          key={event.id}
                          onClick={() => onSelectEvent(event.id)}
                          className={`w-full text-left text-xs p-1 rounded truncate ${categoryStyle.bg} ${categoryStyle.text} hover:opacity-80 transition-opacity`}
                        >
                          {event.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-[hsl(20,10%,45%)] pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Quick RSVP Dialog
interface QuickRSVPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ApiEvent | null;
  onRegister: (eventId: string, data: { firstName: string; lastName: string; email?: string; phone?: string; notes?: string }) => void;
  isRegistering: boolean;
}

function QuickRSVPDialog({ open, onOpenChange, event, onRegister, isRegistering }: QuickRSVPDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!event || !firstName.trim() || !lastName.trim()) return;

    onRegister(event.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
    onOpenChange(open);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Quick Registration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-[hsl(35,20%,96%)]">
            <h4 className="font-semibold text-[hsl(20,25%,15%)]">{event.title}</h4>
            <p className="text-sm text-[hsl(20,10%,45%)]">
              {new Date(event.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="rsvp-first-name">First Name *</Label>
                <Input
                  id="rsvp-first-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isRegistering}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rsvp-last-name">Last Name *</Label>
                <Input
                  id="rsvp-last-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isRegistering}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rsvp-email">Email</Label>
              <Input
                id="rsvp-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isRegistering}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rsvp-phone">Phone</Label>
              <Input
                id="rsvp-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isRegistering}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rsvp-notes">Notes (optional)</Label>
              <Textarea
                id="rsvp-notes"
                placeholder="Any additional information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isRegistering}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isRegistering}>
              Cancel
            </Button>
            <Button
              className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
              onClick={handleSubmit}
              disabled={isRegistering || !firstName.trim() || !lastName.trim()}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EventsList() {
  const { toast } = useToast();
  // Get churchId from auth - used by the hooks internally
  useAuth();

  // State for filters and view
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState<ApiEvent | null>(null);
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);

  // Create event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('other');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventCapacity, setNewEventCapacity] = useState('');
  const [newEventRequiresRegistration, setNewEventRequiresRegistration] = useState(false);
  const [newEventIsPublic, setNewEventIsPublic] = useState(true);

  // Build filters for API
  const filters: EventFilters = useMemo(() => ({
    search: searchQuery || undefined,
    category: typeFilter !== 'all' ? (typeFilter as EventCategory) : undefined,
    pageSize: 100,
  }), [searchQuery, typeFilter]);

  // API hooks for events list
  const { data: eventsResponse, isLoading, error } = useEvents(filters);
  const events: ApiEvent[] = eventsResponse?.data ?? [];

  // Calendar events hook
  const calendarMonthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const { data: calendarEvents, isLoading: isCalendarLoading } = useCalendarEvents(calendarMonthString);

  // Mutation hooks
  const createEventMutation = useCreateEvent();
  const cancelEventMutation = useCancelEvent();
  const duplicateEventMutation = useDuplicateEvent();
  const registerAttendeeMutation = useRegisterAttendee();

  const upcomingEvents = events.filter((e: ApiEvent) => e.status === 'published' || e.status === 'draft');
  const pastEvents = events.filter((e: ApiEvent) => e.status === 'completed');

  // Group events by series (using seriesId from event if available)
  const eventsBySeries = useMemo(() => {
    const grouped: Record<string, { seriesName: string; events: ApiEvent[] }> = {};
    const ungrouped: ApiEvent[] = [];

    upcomingEvents.forEach((event) => {
      const eventWithSeries = event as ApiEvent & { seriesId?: string; seriesName?: string };
      if (eventWithSeries.seriesId && eventWithSeries.seriesName) {
        if (!grouped[eventWithSeries.seriesId]) {
          grouped[eventWithSeries.seriesId] = { seriesName: eventWithSeries.seriesName, events: [] };
        }
        grouped[eventWithSeries.seriesId].events.push(event);
      } else {
        ungrouped.push(event);
      }
    });

    return { grouped, ungrouped };
  }, [upcomingEvents]);

  const getSeriesName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId) as ApiEvent & { seriesName?: string } | undefined;
    return event?.seriesName;
  };

  const handleQuickRSVP = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEventForRSVP(event);
      setIsRSVPDialogOpen(true);
    }
  };

  const handleRegisterAttendee = (eventId: string, data: { firstName: string; lastName: string; email?: string; phone?: string; notes?: string }) => {
    registerAttendeeMutation.mutate(
      { eventId, data },
      {
        onSuccess: () => {
          toast({
            title: 'Registration successful',
            description: 'You have been registered for this event.',
          });
          setIsRSVPDialogOpen(false);
          setSelectedEventForRSVP(null);
        },
        onError: (error) => {
          toast({
            title: 'Registration failed',
            description: error.message || 'Failed to register for this event. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCreateEvent = () => {
    if (!newEventTitle || !newEventDate || !newEventStartTime || !newEventEndTime) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const startDate = new Date(`${newEventDate}T${newEventStartTime}`);
    const endDate = new Date(`${newEventDate}T${newEventEndTime}`);

    const eventData: EventCreateInput = {
      title: newEventTitle,
      description: newEventDescription || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      category: newEventCategory,
      location: newEventLocation || undefined,
      maxAttendees: newEventCapacity ? parseInt(newEventCapacity, 10) : undefined,
      requiresRegistration: newEventRequiresRegistration,
      isPublic: newEventIsPublic,
      status: 'draft',
    };

    createEventMutation.mutate(eventData, {
      onSuccess: () => {
        toast({
          title: 'Event created',
          description: 'Your event has been created successfully.',
        });
        setIsCreateDialogOpen(false);
        resetCreateForm();
      },
      onError: (error) => {
        toast({
          title: 'Failed to create event',
          description: error.message || 'An error occurred while creating the event.',
          variant: 'destructive',
        });
      },
    });
  };

  const resetCreateForm = () => {
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventDate('');
    setNewEventStartTime('');
    setNewEventEndTime('');
    setNewEventCategory('other');
    setNewEventLocation('');
    setNewEventCapacity('');
    setNewEventRequiresRegistration(false);
    setNewEventIsPublic(true);
  };

  const handleEditEvent = (eventId: string) => {
    // Navigate to edit page or open edit modal
    // For now, show a toast indicating this would navigate to edit
    toast({
      title: 'Edit Event',
      description: `Navigating to edit event ${eventId}...`,
    });
  };

  const handleDuplicateEvent = (eventId: string) => {
    duplicateEventMutation.mutate(
      { eventId },
      {
        onSuccess: () => {
          toast({
            title: 'Event duplicated',
            description: 'A copy of the event has been created.',
          });
        },
        onError: (error) => {
          toast({
            title: 'Failed to duplicate event',
            description: error.message || 'An error occurred while duplicating the event.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCancelEvent = (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this event? Attendees will be notified.')) {
      return;
    }

    cancelEventMutation.mutate(
      { eventId, notifyAttendees: true },
      {
        onSuccess: () => {
          toast({
            title: 'Event cancelled',
            description: 'The event has been cancelled and attendees have been notified.',
          });
        },
        onError: (error) => {
          toast({
            title: 'Failed to cancel event',
            description: error.message || 'An error occurred while cancelling the event.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSelectCalendarEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEventForRSVP(event);
      setIsRSVPDialogOpen(true);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="border-[hsl(0,65%,50%)]/20 bg-[hsl(0,65%,50%)]/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-serif">Error</AlertTitle>
          <AlertDescription>
            Failed to load events. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[hsl(20,25%,15%)]">Events</h1>
          <p className="text-[hsl(20,10%,45%)] mt-1">
            Manage church events and gatherings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetCreateForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white church-glow">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Create New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  className="border-[hsl(35,20%,85%)]"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  disabled={createEventMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter event description"
                  className="border-[hsl(35,20%,85%)]"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  disabled={createEventMutation.isPending}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    className="border-[hsl(35,20%,85%)]"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    disabled={createEventMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Category</Label>
                  <Select
                    value={newEventCategory}
                    onValueChange={(value) => setNewEventCategory(value as EventCategory)}
                    disabled={createEventMutation.isPending}
                  >
                    <SelectTrigger className="border-[hsl(35,20%,85%)]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worship">Worship</SelectItem>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="outreach">Outreach</SelectItem>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                      <SelectItem value="small_group">Small Group</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="children">Children</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="border-[hsl(35,20%,85%)]"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    disabled={createEventMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="border-[hsl(35,20%,85%)]"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    disabled={createEventMutation.isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    className="border-[hsl(35,20%,85%)]"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    disabled={createEventMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Max attendees"
                    className="border-[hsl(35,20%,85%)]"
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(e.target.value)}
                    disabled={createEventMutation.isPending}
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresRegistration"
                    checked={newEventRequiresRegistration}
                    onCheckedChange={(checked) => setNewEventRequiresRegistration(checked as boolean)}
                    disabled={createEventMutation.isPending}
                  />
                  <Label htmlFor="requiresRegistration" className="text-sm font-normal cursor-pointer">
                    Requires Registration
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={newEventIsPublic}
                    onCheckedChange={(checked) => setNewEventIsPublic(checked as boolean)}
                    disabled={createEventMutation.isPending}
                  />
                  <Label htmlFor="isPublic" className="text-sm font-normal cursor-pointer">
                    Public Event
                  </Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetCreateForm();
                  }}
                  className="border-[hsl(35,20%,80%)]"
                  disabled={createEventMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  className="bg-[hsl(345,45%,32%)] hover:bg-[hsl(345,45%,28%)] text-white"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="church-glow bg-gradient-to-br from-white to-[hsl(40,33%,98%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(20,10%,45%)]">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-[hsl(345,45%,32%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-[hsl(20,25%,15%)]">{events.length}</div>
                <p className="text-xs text-[hsl(20,10%,45%)]">This month</p>
              </CardContent>
            </Card>
            <Card className="church-glow bg-gradient-to-br from-white to-[hsl(40,33%,98%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(20,10%,45%)]">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-[hsl(150,25%,40%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-[hsl(20,25%,15%)]">{upcomingEvents.length}</div>
                <p className="text-xs text-[hsl(20,10%,45%)]">Events scheduled</p>
              </CardContent>
            </Card>
            <Card className="church-glow bg-gradient-to-br from-white to-[hsl(40,33%,98%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(20,10%,45%)]">Total Registrations</CardTitle>
                <Users className="h-4 w-4 text-[hsl(35,60%,50%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-[hsl(20,25%,15%)]">
                  {events.reduce((sum: number, e: ApiEvent) => sum + e.currentAttendees, 0)}
                </div>
                <p className="text-xs text-[hsl(20,10%,45%)]">Expected this month</p>
              </CardContent>
            </Card>
            <Card className="church-glow bg-gradient-to-br from-white to-[hsl(40,33%,98%)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(20,10%,45%)]">Volunteers Needed</CardTitle>
                <HandHelping className="h-4 w-4 text-[hsl(345,45%,32%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold text-[hsl(20,25%,15%)]">
                  {events.reduce((sum: number, event: ApiEvent) => {
                    const eventWithVolunteers = event as ApiEvent & { volunteerNeeds?: VolunteerNeed[] };
                    const needs = eventWithVolunteers.volunteerNeeds || [];
                    return sum + needs.reduce((s, n) => s + Math.max(0, n.needed - n.filled), 0);
                  }, 0)}
                </div>
                <p className="text-xs text-[hsl(20,10%,45%)]">Open positions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(20,10%,55%)]" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[hsl(35,20%,85%)] focus:border-[hsl(345,45%,32%)] focus:ring-[hsl(345,45%,32%)]"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px] border-[hsl(35,20%,85%)]">
            <Filter className="mr-2 h-4 w-4 text-[hsl(20,10%,55%)]" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="worship">Worship</SelectItem>
            <SelectItem value="youth">Youth</SelectItem>
            <SelectItem value="outreach">Outreach</SelectItem>
            <SelectItem value="fellowship">Fellowship</SelectItem>
            <SelectItem value="small_group">Small Groups</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-[hsl(35,20%,85%)] p-1 bg-white">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-[hsl(345,45%,32%)] text-white hover:bg-[hsl(345,45%,28%)]' : 'hover:bg-[hsl(35,20%,93%)]'}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-[hsl(345,45%,32%)] text-white hover:bg-[hsl(345,45%,28%)]' : 'hover:bg-[hsl(35,20%,93%)]'}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <div>
          <CalendarGrid
            events={calendarEvents || []}
            isLoading={isCalendarLoading}
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectEvent={handleSelectCalendarEvent}
          />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="bg-[hsl(35,20%,93%)]">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(345,45%,32%)] data-[state=active]:shadow-sm"
            >
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger
              value="series"
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(345,45%,32%)] data-[state=active]:shadow-sm"
            >
              Event Series
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-white data-[state=active]:text-[hsl(345,45%,32%)] data-[state=active]:shadow-sm"
            >
              Past Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : upcomingEvents.length === 0 ? (
              <Card className="church-glow">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-[hsl(20,10%,70%)]" />
                  <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,25%)] mb-1">No Upcoming Events</h3>
                  <p className="text-[hsl(20,10%,45%)]">
                    Create your first event to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingEvents.map((event: ApiEvent) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    seriesName={getSeriesName(event.id)}
                    onQuickRSVP={handleQuickRSVP}
                    onEdit={handleEditEvent}
                    onDuplicate={handleDuplicateEvent}
                    onCancel={handleCancelEvent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="series" className="space-y-6">
            {isLoading ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : Object.keys(eventsBySeries.grouped).length === 0 ? (
              <Card className="church-glow">
                <CardContent className="p-8 text-center">
                  <Repeat className="h-12 w-12 mx-auto mb-3 text-[hsl(20,10%,70%)]" />
                  <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,25%)] mb-1">No Event Series</h3>
                  <p className="text-[hsl(20,10%,45%)]">
                    Group related events into series for better organization.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {Object.entries(eventsBySeries.grouped).map(([seriesId, { seriesName, events: seriesEvents }]) => (
                  <div key={seriesId}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-1 bg-[hsl(345,45%,32%)] rounded-full" />
                      <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,15%)]">
                        {seriesName}
                      </h3>
                      <Badge variant="outline" className="border-[hsl(35,20%,80%)] text-[hsl(20,10%,45%)]">
                        {seriesEvents.length} events
                      </Badge>
                    </div>
                    <div className="grid gap-4 ml-4">
                      {seriesEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onQuickRSVP={handleQuickRSVP}
                          onEdit={handleEditEvent}
                          onDuplicate={handleDuplicateEvent}
                          onCancel={handleCancelEvent}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {eventsBySeries.ungrouped.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-1 bg-[hsl(20,10%,70%)] rounded-full" />
                      <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,15%)]">
                        Standalone Events
                      </h3>
                      <Badge variant="outline" className="border-[hsl(35,20%,80%)] text-[hsl(20,10%,45%)]">
                        {eventsBySeries.ungrouped.length} events
                      </Badge>
                    </div>
                    <div className="grid gap-4 ml-4">
                      {eventsBySeries.ungrouped.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onQuickRSVP={handleQuickRSVP}
                          onEdit={handleEditEvent}
                          onDuplicate={handleDuplicateEvent}
                          onCancel={handleCancelEvent}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : pastEvents.length === 0 ? (
              <Card className="church-glow">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-[hsl(20,10%,70%)]" />
                  <h3 className="font-serif text-lg font-semibold text-[hsl(20,25%,25%)] mb-1">No Past Events</h3>
                  <p className="text-[hsl(20,10%,45%)]">
                    Completed events will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {pastEvents.map((event: ApiEvent) => (
                  <Card key={event.id} className="opacity-80 hover:opacity-100 transition-opacity church-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px] p-2 bg-[hsl(35,20%,93%)] rounded-lg">
                            <div className="text-lg font-serif font-semibold text-[hsl(20,10%,45%)]">
                              {new Date(event.startDate).getDate()}
                            </div>
                            <div className="text-xs text-[hsl(20,10%,55%)] uppercase">
                              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-serif font-medium text-[hsl(20,25%,25%)]">{event.title}</h3>
                              <Badge className={`${categoryColors[event.category].bg} ${categoryColors[event.category].text} border-0 text-xs`}>
                                {event.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-[hsl(20,10%,45%)]">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.currentAttendees} attended
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={statusColors[event.status]}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Quick RSVP Dialog */}
      <QuickRSVPDialog
        open={isRSVPDialogOpen}
        onOpenChange={setIsRSVPDialogOpen}
        event={selectedEventForRSVP}
        onRegister={handleRegisterAttendee}
        isRegistering={registerAttendeeMutation.isPending}
      />
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEvents } from '@/hooks/useEvents';

import type { Event as ApiEvent, EventCategory, EventStatus } from '@/types';

const categoryColors: Record<EventCategory, string> = {
  worship: 'bg-blue-100 text-blue-800',
  meeting: 'bg-purple-100 text-purple-800',
  outreach: 'bg-green-100 text-green-800',
  youth: 'bg-orange-100 text-orange-800',
  small_group: 'bg-pink-100 text-pink-800',
  children: 'bg-yellow-100 text-yellow-800',
  fellowship: 'bg-indigo-100 text-indigo-800',
  training: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-800',
};

const statusColors: Record<EventStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function EventCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
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

export default function EventsList() {
  const { data: eventsResponse, isLoading, error } = useEvents();
  const events: ApiEvent[] = eventsResponse?.data ?? [];
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredEvents = events.filter((event: ApiEvent) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || event.category === typeFilter;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents.filter((e: ApiEvent) => e.status === 'published' || e.status === 'draft');
  const pastEvents = filteredEvents.filter((e: ApiEvent) => e.status === 'completed');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load events. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage church events and activities
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" placeholder="Enter event title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter event description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="outreach">Outreach</SelectItem>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="special">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter location" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" placeholder="Max attendees" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                <p className="text-xs text-muted-foreground">Events scheduled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.reduce((sum: number, e: ApiEvent) => sum + e.currentAttendees, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Expected this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {events.length > 0
                    ? Math.round(
                        events.reduce((sum: number, e: ApiEvent) => sum + e.currentAttendees, 0) / events.length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">Per event</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="service">Services</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="outreach">Outreach</SelectItem>
            <SelectItem value="youth">Youth</SelectItem>
            <SelectItem value="special">Special Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        <div className="grid gap-4">
          {isLoading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No upcoming events found.
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event: ApiEvent) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="text-center min-w-[60px] p-2 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {new Date(event.startDate).getDate()}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {event.recurrence && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location || 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.currentAttendees}/{event.maxAttendees || '∞'} registered
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[event.category]}>{event.category}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Past Events */}
      {!isLoading && pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Events</h2>
          <div className="grid gap-4">
            {pastEvents.map((event: ApiEvent) => (
              <Card key={event.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-semibold text-muted-foreground">
                          {formatDate(event.startDate)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{event.location || 'N/A'}</span>
                          <span>{event.currentAttendees} attended</span>
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
        </div>
      )}
    </div>
  );
}

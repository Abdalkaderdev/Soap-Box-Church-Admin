import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Plus,
  Users,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

export default function MinistryAdminEvents() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewFilter, setViewFilter] = useState("all");

  // Mock events data
  const events = [
    {
      id: 1,
      title: "Ministry Leadership Meeting",
      description: "Monthly meeting for ministry leaders to discuss upcoming initiatives",
      date: "2024-08-25",
      time: "7:00 PM",
      duration: "2 hours",
      location: "Conference Room A",
      organizer: "Sarah Johnson",
      groups: ["Young Adults", "Bible Study"],
      attendees: 12,
      maxAttendees: 15,
      status: "confirmed",
      type: "meeting",
      recurring: "monthly",
      category: "leadership"
    },
    {
      id: 2,
      title: "Volunteer Training Session",
      description: "Training session for new volunteers across all ministry groups",
      date: "2024-08-27",
      time: "9:00 AM",
      duration: "4 hours",
      location: "Main Hall",
      organizer: "Mike Chen",
      groups: ["All Groups"],
      attendees: 25,
      maxAttendees: 30,
      status: "confirmed",
      type: "training",
      recurring: "quarterly",
      category: "volunteer"
    },
    {
      id: 3,
      title: "Community Outreach Event",
      description: "Ministry-wide community service project in downtown area",
      date: "2024-09-01",
      time: "8:00 AM",
      duration: "6 hours",
      location: "Downtown Community Center",
      organizer: "Emma Wilson",
      groups: ["Outreach", "Young Adults", "Family Fellowship"],
      attendees: 68,
      maxAttendees: 80,
      status: "confirmed",
      type: "outreach",
      recurring: "none",
      category: "service"
    }
  ];

  // Mock RSVP data
  const rsvpData = [
    { eventId: 1, attending: 12, maybe: 2, notAttending: 1 },
    { eventId: 2, attending: 25, maybe: 4, notAttending: 1 },
    { eventId: 3, attending: 68, maybe: 8, notAttending: 4 }
  ];

  const filteredEvents = events.filter(event => {
    if (viewFilter === "all") return true;
    return event.category === viewFilter;
  });

  const handleCreateEvent = () => {
    setCreateEventOpen(false);
  };

  const handleEditEvent = (_eventId: number) => {
  };

  const handleDeleteEvent = (_eventId: number) => {
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Events & Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage ministry-wide events and coordinate across all groups
          </p>
        </div>
        <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Ministry Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input id="eventTitle" placeholder="Enter event title" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Event description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" placeholder="2 hours" />
                </div>
                <div>
                  <Label htmlFor="maxAttendees">Max Attendees</Label>
                  <Input id="maxAttendees" type="number" placeholder="50" />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Event location" />
              </div>
              <div>
                <Label htmlFor="groups">Target Groups</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="young-adults">Young Adults</SelectItem>
                    <SelectItem value="bible-study">Bible Study</SelectItem>
                    <SelectItem value="prayer-group">Prayer Group</SelectItem>
                    <SelectItem value="outreach">Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Event category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="worship">Worship</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recurring">Recurring</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">One-time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  23
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total RSVPs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  156
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  8
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  87%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="rsvp">RSVPs</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="lg:col-span-2">
                  <h3 className="font-semibold mb-4">
                    Events for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}
                  </h3>
                  <div className="space-y-3">
                    {events
                      .filter(event => {
                        if (!selectedDate) return false;
                        return event.date === format(selectedDate, "yyyy-MM-dd");
                      })
                      .map(event => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.time} ({event.duration})
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </div>
                            </div>
                            <Badge variant="outline">{event.category}</Badge>
                          </div>
                        </div>
                      ))}
                    {events.filter(event => selectedDate && event.date === format(selectedDate, "yyyy-MM-dd")).length === 0 && (
                      <p className="text-gray-500 text-center py-8">No events scheduled for this date</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search events..." className="pl-10" />
                  </div>
                </div>
                <Select value={viewFilter} onValueChange={setViewFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge variant="outline">{event.category}</Badge>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                          {format(new Date(event.date), 'MMM d, yyyy')} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          {event.attendees}/{event.maxAttendees} attending
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Organizer: {event.organizer}</span>
                          <span>Groups: {event.groups.join(', ')}</span>
                          {event.recurring !== 'none' && <span>Recurring: {event.recurring}</span>}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditEvent(event.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteEvent(event.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rsvp">
          <Card>
            <CardHeader>
              <CardTitle>RSVP Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => {
                  const rsvp = rsvpData.find(r => r.eventId === event.id);
                  return (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge variant="outline">
                          {format(new Date(event.date), 'MMM d')}
                        </Badge>
                      </div>
                      {rsvp && (
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{rsvp.attending}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Attending</div>
                          </div>
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{rsvp.maybe}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Maybe</div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{rsvp.notAttending}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Can't Attend</div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end mt-3">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export List
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

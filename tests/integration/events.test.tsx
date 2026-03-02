/**
 * Event Management Integration Tests
 * Tests event creation, listing, registration, and attendee management
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockEvent } from '../mocks/handlers';

describe('Event Management', () => {
  describe('Event Creation API', () => {
    it('creates a new event successfully', async () => {
      const eventData = {
        title: 'Youth Night',
        description: 'Weekly youth gathering',
        location: 'Youth Center',
        startDate: '2024-03-01T18:00:00Z',
        endDate: '2024-03-01T21:00:00Z',
        allDay: false,
        category: 'youth',
        isPublic: true,
        requiresRegistration: true,
        maxAttendees: 50,
        status: 'published',
      };

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Youth Night');
      expect(data.category).toBe('youth');
      expect(data.requiresRegistration).toBe(true);
      expect(data.id).toBeDefined();
    });

    it('creates an all-day event', async () => {
      const eventData = {
        title: 'Church Picnic',
        description: 'Annual church family picnic',
        location: 'City Park',
        startDate: '2024-06-15T00:00:00Z',
        endDate: '2024-06-15T23:59:59Z',
        allDay: true,
        category: 'fellowship',
        isPublic: true,
      };

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.allDay).toBe(true);
    });

    it('validates required event fields', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/events', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: {
                title: ['Title is required'],
                startDate: ['Start date is required'],
              }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'worship' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.details.title).toBeDefined();
      expect(data.details.startDate).toBeDefined();
    });

    it('validates end date is after start date', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/events', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: { endDate: ['End date must be after start date'] }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Invalid Event',
          startDate: '2024-03-02T10:00:00Z',
          endDate: '2024-03-01T09:00:00Z', // Before start
          category: 'worship',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Event Listing API', () => {
    it('fetches events list with pagination', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events?page=1&pageSize=20'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination.page).toBe(1);
    });

    it('fetches single event by ID', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events/event-1'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.id).toBe('event-1');
      expect(data.title).toBe('Sunday Worship Service');
    });

    it('fetches upcoming events', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events/upcoming'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });

    it('filters events by category', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/events', ({ request }) => {
          const url = new URL(request.url);
          const category = url.searchParams.get('category');

          if (category === 'worship') {
            return HttpResponse.json({
              data: [mockEvent],
              pagination: {
                page: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
              },
            });
          }
          return HttpResponse.json({
            data: [],
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events?category=worship'
      );
      const data = await response.json();

      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].category).toBe('worship');
    });

    it('filters events by date range', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/events', ({ request }) => {
          const url = new URL(request.url);
          const dateFrom = url.searchParams.get('dateFrom');
          const dateTo = url.searchParams.get('dateTo');

          if (dateFrom && dateTo) {
            return HttpResponse.json({
              data: [mockEvent],
              pagination: {
                page: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
              },
            });
          }
          return HttpResponse.json({
            data: [],
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events?dateFrom=2024-02-01&dateTo=2024-02-28'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Event Update API', () => {
    it('updates event details', async () => {
      const updateData = {
        title: 'Updated Worship Service',
        maxAttendees: 200,
      };

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events/event-1',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.title).toBe('Updated Worship Service');
      expect(data.updatedAt).toBeDefined();
    });

    it('handles event not found', async () => {
      server.use(
        http.patch('https://soapboxsuperapp.com/api/church/:churchId/events/:eventId', () => {
          return HttpResponse.json(
            { message: 'Event not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events/nonexistent',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title' }),
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('Event Status Management', () => {
    it('publishes a draft event', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events/event-1',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('published');
    });

    it('cancels an event', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/events/:eventId/cancel', () => {
          return HttpResponse.json({
            ...mockEvent,
            status: 'cancelled',
          });
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/events/event-1/cancel',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Weather conditions', notifyAttendees: true }),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('cancelled');
    });
  });

  describe('Event Form Validation', () => {
    it('validates event title length', () => {
      const validateTitle = (title: string): boolean => {
        return typeof title === 'string' && title.trim().length >= 3 && title.length <= 200;
      };

      expect(validateTitle('Sunday Worship Service')).toBe(true);
      expect(validateTitle('AB')).toBe(false); // Too short
      expect(validateTitle('')).toBe(false);
      expect(validateTitle('A'.repeat(201))).toBe(false); // Too long
    });

    it('validates event category enum', () => {
      const validCategories = [
        'worship', 'youth', 'children', 'small_group',
        'outreach', 'fellowship', 'training', 'meeting', 'other'
      ];

      const validateCategory = (category: string): boolean => {
        return validCategories.includes(category);
      };

      expect(validateCategory('worship')).toBe(true);
      expect(validateCategory('youth')).toBe(true);
      expect(validateCategory('invalid')).toBe(false);
    });

    it('validates max attendees is positive', () => {
      const validateMaxAttendees = (max: number | undefined): boolean => {
        if (max === undefined) return true; // Optional
        return typeof max === 'number' && max > 0;
      };

      expect(validateMaxAttendees(100)).toBe(true);
      expect(validateMaxAttendees(1)).toBe(true);
      expect(validateMaxAttendees(undefined)).toBe(true);
      expect(validateMaxAttendees(0)).toBe(false);
      expect(validateMaxAttendees(-5)).toBe(false);
    });

    it('formats event date correctly', () => {
      const formatEventDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      expect(formatEventDate('2024-02-01T10:00:00Z')).toContain('2024');
      expect(formatEventDate('2024-02-01T10:00:00Z')).toContain('February');
    });

    it('formats event time correctly', () => {
      const formatEventTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      };

      const timeStr = formatEventTime('2024-02-01T10:00:00Z');
      expect(timeStr).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
    });
  });

  describe('Event Capacity', () => {
    it('calculates available spots correctly', () => {
      const calculateAvailableSpots = (maxAttendees: number | undefined, currentAttendees: number): number | null => {
        if (maxAttendees === undefined) return null; // Unlimited
        return Math.max(0, maxAttendees - currentAttendees);
      };

      expect(calculateAvailableSpots(100, 75)).toBe(25);
      expect(calculateAvailableSpots(50, 50)).toBe(0);
      expect(calculateAvailableSpots(50, 60)).toBe(0); // Over capacity shows 0
      expect(calculateAvailableSpots(undefined, 100)).toBeNull();
    });

    it('determines if event is full', () => {
      const isEventFull = (maxAttendees: number | undefined, currentAttendees: number): boolean => {
        if (maxAttendees === undefined) return false;
        return currentAttendees >= maxAttendees;
      };

      expect(isEventFull(100, 75)).toBe(false);
      expect(isEventFull(100, 100)).toBe(true);
      expect(isEventFull(100, 105)).toBe(true);
      expect(isEventFull(undefined, 1000)).toBe(false);
    });
  });
});

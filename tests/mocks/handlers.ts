/**
 * MSW Request Handlers
 * Mock API endpoints for integration testing
 */

import { http, HttpResponse, delay } from 'msw';

const API_BASE = 'https://soapboxsuperapp.com/api';

// Mock data factories
export const mockUser = {
  id: 'user-1',
  email: 'admin@church.org',
  firstName: 'John',
  lastName: 'Pastor',
  role: 'admin' as const,
  churchId: 'church-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockChurch = {
  id: 'church-1',
  name: 'First Community Church',
  slug: 'first-community-church',
  address: {
    street: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
  },
  phone: '555-123-4567',
  email: 'info@firstcommunitychurch.org',
  website: 'https://firstcommunitychurch.org',
  timezone: 'America/Chicago',
  settings: {
    allowOnlineDonations: true,
    allowEventRegistration: true,
    allowVolunteerSignup: true,
    defaultCurrency: 'USD',
    fiscalYearStart: 1,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockMember = {
  id: 'member-1',
  churchId: 'church-1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@email.com',
  phone: '555-987-6543',
  membershipStatus: 'active' as const,
  memberSince: '2023-06-15',
  tags: ['volunteer', 'choir'],
  createdAt: '2023-06-15T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockDonation = {
  id: 'donation-1',
  churchId: 'church-1',
  memberId: 'member-1',
  amount: 100.00,
  currency: 'USD',
  date: '2024-01-15',
  method: 'card' as const,
  fund: 'General Fund',
  fundId: 'fund-1',
  status: 'completed' as const,
  isRecurring: false,
  isAnonymous: false,
  receiptSent: true,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

export const mockEvent = {
  id: 'event-1',
  churchId: 'church-1',
  title: 'Sunday Worship Service',
  description: 'Weekly worship service',
  location: 'Main Sanctuary',
  startDate: '2024-02-01T10:00:00Z',
  endDate: '2024-02-01T11:30:00Z',
  allDay: false,
  category: 'worship' as const,
  isPublic: true,
  requiresRegistration: false,
  currentAttendees: 150,
  createdBy: 'user-1',
  status: 'published' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockFund = {
  id: 'fund-1',
  churchId: 'church-1',
  name: 'General Fund',
  description: 'Main operating fund',
  currentAmount: 50000,
  isDefault: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockDashboardStats = {
  membership: {
    total: 500,
    active: 450,
    newThisMonth: 12,
    growthPercentage: 8,
  },
  giving: {
    thisMonth: 25000,
    lastMonth: 23000,
    yearToDate: 150000,
    growthPercentage: 12,
  },
  attendance: {
    lastWeek: 320,
    averageAttendance: 300,
    growthPercentage: 5,
  },
  volunteers: {
    total: 75,
    active: 60,
    hoursThisMonth: 240,
  },
  upcomingEvents: [mockEvent],
  recentDonations: [mockDonation],
};

export const mockChurchInfo = {
  id: 'church-1',
  name: 'First Community Church',
  denomination: 'Non-denominational',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zipCode: '62701',
  country: 'USA',
  phone: '555-123-4567',
  email: 'info@firstcommunitychurch.org',
  website: 'https://firstcommunitychurch.org',
  timezone: 'America/Chicago',
  locale: 'en-US',
};

export const mockUserPreferences = {
  theme: 'light' as const,
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h' as const,
  emailNotifications: {
    newMemberAlerts: true,
    donationReceipts: true,
    eventReminders: true,
    volunteerReminders: true,
    weeklyDigest: true,
    systemAlerts: true,
  },
  pushNotifications: {
    newMemberAlerts: false,
    donationReceipts: false,
    eventReminders: true,
    volunteerReminders: true,
    weeklyDigest: false,
    systemAlerts: true,
  },
};

// API Handlers
export const handlers = [
  // Auth handlers
  http.get(`${API_BASE}/auth/me`, async () => {
    await delay(50);
    return HttpResponse.json({
      user: mockUser,
      church: mockChurch,
    });
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),

  // Members handlers
  http.get(`${API_BASE}/church/:churchId/members`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    return HttpResponse.json({
      data: [mockMember],
      pagination: {
        page,
        pageSize,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get(`${API_BASE}/church/:churchId/members/:memberId`, async () => {
    await delay(50);
    return HttpResponse.json(mockMember);
  }),

  http.post(`${API_BASE}/church/:churchId/members`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    const newMember = {
      ...mockMember,
      id: `member-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newMember, { status: 201 });
  }),

  http.patch(`${API_BASE}/church/:churchId/members/:memberId`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockMember,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_BASE}/church/:churchId/members/:memberId`, async () => {
    await delay(50);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE}/church/:churchId/members/stats`, async () => {
    await delay(50);
    return HttpResponse.json({
      total: 500,
      byStatus: {
        active: 450,
        inactive: 30,
        pending: 10,
        visitor: 8,
        former: 2,
      },
      newThisMonth: 12,
      newThisYear: 85,
    });
  }),

  // Donations handlers
  http.get(`${API_BASE}/church/:churchId/donations`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    return HttpResponse.json({
      data: [mockDonation],
      pagination: {
        page,
        pageSize,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.post(`${API_BASE}/church/:churchId/donations`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    const newDonation = {
      ...mockDonation,
      id: `donation-${Date.now()}`,
      ...body,
      status: 'completed',
      receiptSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newDonation, { status: 201 });
  }),

  http.get(`${API_BASE}/church/:churchId/donations/stats`, async () => {
    await delay(50);
    return HttpResponse.json({
      totalAmount: 150000,
      totalCount: 1200,
      averageAmount: 125,
      byFund: {
        'General Fund': { amount: 100000, count: 800 },
        'Missions': { amount: 30000, count: 300 },
        'Building Fund': { amount: 20000, count: 100 },
      },
      byMethod: {
        card: { amount: 80000, count: 700 },
        check: { amount: 40000, count: 300 },
        cash: { amount: 20000, count: 150 },
        ach: { amount: 10000, count: 50 },
      },
      trend: [
        { date: '2024-01', amount: 25000, count: 200 },
        { date: '2024-02', amount: 27000, count: 220 },
      ],
    });
  }),

  http.get(`${API_BASE}/church/:churchId/funds`, async () => {
    await delay(50);
    return HttpResponse.json([
      mockFund,
      { ...mockFund, id: 'fund-2', name: 'Missions Fund', isDefault: false },
      { ...mockFund, id: 'fund-3', name: 'Building Fund', isDefault: false },
    ]);
  }),

  // Events handlers
  http.get(`${API_BASE}/church/:churchId/events`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    return HttpResponse.json({
      data: [mockEvent],
      pagination: {
        page,
        pageSize,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get(`${API_BASE}/church/:churchId/events/:eventId`, async () => {
    await delay(50);
    return HttpResponse.json(mockEvent);
  }),

  http.post(`${API_BASE}/church/:churchId/events`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    const newEvent = {
      ...mockEvent,
      id: `event-${Date.now()}`,
      ...body,
      currentAttendees: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.patch(`${API_BASE}/church/:churchId/events/:eventId`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockEvent,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE}/church/:churchId/events/upcoming`, async () => {
    await delay(50);
    return HttpResponse.json([mockEvent]);
  }),

  // Reports handlers
  http.get(`${API_BASE}/church/:churchId/reports/dashboard`, async () => {
    await delay(50);
    return HttpResponse.json(mockDashboardStats);
  }),

  http.get(`${API_BASE}/church/:churchId/reports/attendance`, async () => {
    await delay(50);
    return HttpResponse.json({
      period: '6months',
      totalEvents: 50,
      totalAttendance: 15000,
      averageAttendance: 300,
      byCategory: {
        worship: { events: 24, totalAttendance: 7200, averageAttendance: 300 },
        youth: { events: 12, totalAttendance: 600, averageAttendance: 50 },
      },
      trend: [
        { date: '2024-01-01', attendance: 300, events: 4 },
        { date: '2024-02-01', attendance: 320, events: 4 },
      ],
      topEvents: [{ event: mockEvent, attendance: 350 }],
    });
  }),

  http.get(`${API_BASE}/church/:churchId/reports/giving`, async () => {
    await delay(50);
    return HttpResponse.json({
      period: '6months',
      totalAmount: 150000,
      totalDonations: 1200,
      totalDonors: 300,
      averageDonation: 125,
      newDonors: 25,
      recurringAmount: 50000,
      byFund: [
        { fund: mockFund, amount: 100000, percentage: 66.67 },
      ],
      byMethod: {
        card: { amount: 80000, count: 700 },
        check: { amount: 40000, count: 300 },
      },
      trend: [
        { date: '2024-01', amount: 25000, count: 200 },
        { date: '2024-02', amount: 27000, count: 220 },
      ],
      yearOverYearGrowth: 12,
    });
  }),

  http.get(`${API_BASE}/church/:churchId/reports/membership`, async () => {
    await delay(50);
    return HttpResponse.json({
      totalMembers: 500,
      activeMembers: 450,
      newMembers: 85,
      formerMembers: 15,
      byStatus: {
        active: 450,
        inactive: 30,
        pending: 10,
        visitor: 8,
        former: 2,
      },
      byAge: {
        '0-18': 100,
        '19-35': 150,
        '36-55': 150,
        '56+': 100,
      },
      byGender: {
        male: 220,
        female: 260,
        other: 20,
      },
      growthTrend: [
        { date: '2024-01', total: 480, new: 10, left: 2 },
        { date: '2024-02', total: 500, new: 12, left: 0 },
      ],
      retentionRate: 95,
    });
  }),

  http.get(`${API_BASE}/church/:churchId/reports/saved`, async () => {
    await delay(50);
    return HttpResponse.json([
      {
        id: 'report-1',
        name: 'Monthly Giving Report - January 2024',
        type: 'giving',
        date: '2024-02-01',
        size: '245 KB',
        url: '/reports/report-1.pdf',
      },
    ]);
  }),

  // Settings handlers
  http.get(`${API_BASE}/church/:churchId/settings/info`, async () => {
    await delay(50);
    return HttpResponse.json(mockChurchInfo);
  }),

  http.patch(`${API_BASE}/church/:churchId/settings/info`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockChurchInfo,
      ...body,
    });
  }),

  http.get(`${API_BASE}/church/:churchId/settings/preferences`, async () => {
    await delay(50);
    return HttpResponse.json(mockUserPreferences);
  }),

  http.patch(`${API_BASE}/church/:churchId/settings/preferences`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockUserPreferences,
      ...body,
    });
  }),

  http.get(`${API_BASE}/church/:churchId/settings/notifications`, async () => {
    await delay(50);
    return HttpResponse.json(mockUserPreferences.emailNotifications);
  }),

  http.patch(`${API_BASE}/church/:churchId/settings/notifications`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      ...mockUserPreferences.emailNotifications,
      ...body,
    });
  }),

  http.get(`${API_BASE}/church/:churchId/settings/security`, async () => {
    await delay(50);
    return HttpResponse.json({
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-15T00:00:00Z',
      activeSessions: [
        {
          id: 'session-1',
          device: 'Chrome on Windows',
          browser: 'Chrome 120',
          location: 'Springfield, IL',
          lastActive: new Date().toISOString(),
          current: true,
        },
      ],
    });
  }),

  http.get(`${API_BASE}/church/:churchId/settings/staff`, async () => {
    await delay(50);
    return HttpResponse.json([
      {
        id: 'staff-1',
        userId: 'user-1',
        name: 'John Pastor',
        email: 'admin@church.org',
        role: 'admin',
        permissions: ['all'],
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]);
  }),
];

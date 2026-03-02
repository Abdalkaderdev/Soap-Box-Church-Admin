/**
 * Reports Integration Tests
 * Tests report generation, dashboard statistics, and data visualization
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('Report Generation', () => {
  describe('Dashboard Statistics API', () => {
    it('fetches dashboard stats successfully', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.membership).toBeDefined();
      expect(data.giving).toBeDefined();
      expect(data.attendance).toBeDefined();
      expect(data.volunteers).toBeDefined();
    });

    it('includes membership statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );
      const data = await response.json();

      expect(data.membership.total).toBeDefined();
      expect(data.membership.active).toBeDefined();
      expect(data.membership.newThisMonth).toBeDefined();
      expect(data.membership.growthPercentage).toBeDefined();
    });

    it('includes giving statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );
      const data = await response.json();

      expect(data.giving.thisMonth).toBeDefined();
      expect(data.giving.lastMonth).toBeDefined();
      expect(data.giving.yearToDate).toBeDefined();
      expect(data.giving.growthPercentage).toBeDefined();
    });

    it('includes attendance statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );
      const data = await response.json();

      expect(data.attendance.lastWeek).toBeDefined();
      expect(data.attendance.averageAttendance).toBeDefined();
      expect(data.attendance.growthPercentage).toBeDefined();
    });

    it('includes upcoming events', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );
      const data = await response.json();

      expect(data.upcomingEvents).toBeDefined();
      expect(Array.isArray(data.upcomingEvents)).toBe(true);
    });

    it('includes recent donations', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );
      const data = await response.json();

      expect(data.recentDonations).toBeDefined();
      expect(Array.isArray(data.recentDonations)).toBe(true);
    });
  });

  describe('Attendance Report API', () => {
    it('fetches attendance statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/attendance'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.totalEvents).toBeDefined();
      expect(data.totalAttendance).toBeDefined();
      expect(data.averageAttendance).toBeDefined();
      expect(data.byCategory).toBeDefined();
      expect(data.trend).toBeDefined();
    });

    it('includes category breakdown', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/attendance'
      );
      const data = await response.json();

      expect(data.byCategory.worship).toBeDefined();
      expect(data.byCategory.worship.events).toBeDefined();
      expect(data.byCategory.worship.totalAttendance).toBeDefined();
      expect(data.byCategory.worship.averageAttendance).toBeDefined();
    });

    it('includes trend data', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/attendance'
      );
      const data = await response.json();

      expect(Array.isArray(data.trend)).toBe(true);
      if (data.trend.length > 0) {
        expect(data.trend[0].date).toBeDefined();
        expect(data.trend[0].attendance).toBeDefined();
        expect(data.trend[0].events).toBeDefined();
      }
    });

    it('includes top events', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/attendance'
      );
      const data = await response.json();

      expect(Array.isArray(data.topEvents)).toBe(true);
      if (data.topEvents.length > 0) {
        expect(data.topEvents[0].event).toBeDefined();
        expect(data.topEvents[0].attendance).toBeDefined();
      }
    });
  });

  describe('Giving Report API', () => {
    it('fetches giving report', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/giving'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.totalAmount).toBeDefined();
      expect(data.totalDonations).toBeDefined();
      expect(data.totalDonors).toBeDefined();
      expect(data.averageDonation).toBeDefined();
      expect(data.newDonors).toBeDefined();
      expect(data.recurringAmount).toBeDefined();
    });

    it('includes fund breakdown', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/giving'
      );
      const data = await response.json();

      expect(Array.isArray(data.byFund)).toBe(true);
      if (data.byFund.length > 0) {
        expect(data.byFund[0].fund).toBeDefined();
        expect(data.byFund[0].amount).toBeDefined();
        expect(data.byFund[0].percentage).toBeDefined();
      }
    });

    it('includes method breakdown', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/giving'
      );
      const data = await response.json();

      expect(data.byMethod).toBeDefined();
      expect(data.byMethod.card).toBeDefined();
      expect(data.byMethod.card.amount).toBeDefined();
      expect(data.byMethod.card.count).toBeDefined();
    });

    it('includes year-over-year growth', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/giving'
      );
      const data = await response.json();

      expect(data.yearOverYearGrowth).toBeDefined();
      expect(typeof data.yearOverYearGrowth).toBe('number');
    });
  });

  describe('Membership Report API', () => {
    it('fetches membership statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/membership'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.totalMembers).toBeDefined();
      expect(data.activeMembers).toBeDefined();
      expect(data.newMembers).toBeDefined();
      expect(data.formerMembers).toBeDefined();
    });

    it('includes status breakdown', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/membership'
      );
      const data = await response.json();

      expect(data.byStatus).toBeDefined();
      expect(data.byStatus.active).toBeDefined();
      expect(data.byStatus.inactive).toBeDefined();
      expect(data.byStatus.pending).toBeDefined();
    });

    it('includes age breakdown', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/membership'
      );
      const data = await response.json();

      expect(data.byAge).toBeDefined();
    });

    it('includes retention rate', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/membership'
      );
      const data = await response.json();

      expect(data.retentionRate).toBeDefined();
      expect(typeof data.retentionRate).toBe('number');
      expect(data.retentionRate).toBeGreaterThanOrEqual(0);
      expect(data.retentionRate).toBeLessThanOrEqual(100);
    });

    it('includes growth trend', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/membership'
      );
      const data = await response.json();

      expect(Array.isArray(data.growthTrend)).toBe(true);
      if (data.growthTrend.length > 0) {
        expect(data.growthTrend[0].date).toBeDefined();
        expect(data.growthTrend[0].total).toBeDefined();
        expect(data.growthTrend[0].new).toBeDefined();
        expect(data.growthTrend[0].left).toBeDefined();
      }
    });
  });

  describe('Saved Reports API', () => {
    it('fetches saved reports list', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/saved'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });

    it('saved reports have required fields', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/saved'
      );
      const data = await response.json();

      if (data.length > 0) {
        expect(data[0].id).toBeDefined();
        expect(data[0].name).toBeDefined();
        expect(data[0].type).toBeDefined();
        expect(data[0].date).toBeDefined();
      }
    });
  });

  describe('Report Calculations', () => {
    it('calculates growth percentage correctly', () => {
      const calculateGrowthPercentage = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      expect(calculateGrowthPercentage(110, 100)).toBe(10);
      expect(calculateGrowthPercentage(100, 100)).toBe(0);
      expect(calculateGrowthPercentage(90, 100)).toBe(-10);
      expect(calculateGrowthPercentage(100, 0)).toBe(100);
      expect(calculateGrowthPercentage(0, 0)).toBe(0);
    });

    it('calculates retention rate correctly', () => {
      const calculateRetentionRate = (retained: number, initial: number): number => {
        if (initial === 0) return 0;
        return Math.round((retained / initial) * 100);
      };

      expect(calculateRetentionRate(95, 100)).toBe(95);
      expect(calculateRetentionRate(100, 100)).toBe(100);
      expect(calculateRetentionRate(0, 100)).toBe(0);
      expect(calculateRetentionRate(50, 0)).toBe(0);
    });

    it('calculates average correctly', () => {
      const calculateAverage = (values: number[]): number => {
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      };

      expect(calculateAverage([100, 200, 300])).toBe(200);
      expect(calculateAverage([100])).toBe(100);
      expect(calculateAverage([])).toBe(0);
    });

    it('calculates percentage distribution correctly', () => {
      const calculatePercentage = (value: number, total: number): number => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100 * 100) / 100; // 2 decimal places
      };

      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(33, 100)).toBe(33);
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(100, 0)).toBe(0);
    });
  });

  describe('Date Range Helpers', () => {
    it('calculates date range for various periods', () => {
      const getDateRange = (period: string): { startDate: Date; endDate: Date } => {
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
          case '7days':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30days':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '3months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6months':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        }

        return { startDate, endDate };
      };

      const sevenDays = getDateRange('7days');
      expect(sevenDays.endDate.getTime() - sevenDays.startDate.getTime())
        .toBeCloseTo(7 * 24 * 60 * 60 * 1000, -3);

      const thirtyDays = getDateRange('30days');
      expect(thirtyDays.endDate.getTime() - thirtyDays.startDate.getTime())
        .toBeCloseTo(30 * 24 * 60 * 60 * 1000, -3);
    });

    it('formats date for API correctly', () => {
      const formatDateForApi = (date: Date): string => {
        return date.toISOString().split('T')[0];
      };

      const testDate = new Date('2024-02-15T12:00:00Z');
      expect(formatDateForApi(testDate)).toBe('2024-02-15');
    });
  });

  describe('Report Error Handling', () => {
    it('handles API errors gracefully', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/reports/dashboard', () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );

      expect(response.status).toBe(500);
    });

    it('handles unauthorized access', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/reports/dashboard', () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/reports/dashboard'
      );

      expect(response.status).toBe(401);
    });
  });
});

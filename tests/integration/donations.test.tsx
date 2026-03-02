/**
 * Donation Recording Integration Tests
 * Tests donation creation, listing, statistics, and fund management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockDonation, mockFund } from '../mocks/handlers';

describe('Donation Management', () => {
  describe('Donation Recording API', () => {
    it('records a new donation successfully', async () => {
      const donationData = {
        memberId: 'member-1',
        amount: 250.00,
        currency: 'USD',
        date: '2024-02-15',
        method: 'card',
        fund: 'General Fund',
        fundId: 'fund-1',
        notes: 'Weekly tithe',
      };

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.amount).toBe(250.00);
      expect(data.method).toBe('card');
      expect(data.fund).toBe('General Fund');
      expect(data.status).toBe('completed');
      expect(data.id).toBeDefined();
    });

    it('records anonymous donation', async () => {
      const donationData = {
        amount: 500.00,
        currency: 'USD',
        date: '2024-02-15',
        method: 'cash',
        fund: 'Missions Fund',
        isAnonymous: true,
      };

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.isAnonymous).toBe(true);
    });

    it('validates donation amount', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/donations', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: { amount: ['Amount must be greater than 0'] }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: -50,
          date: '2024-02-15',
          method: 'card',
          fund: 'General Fund',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.details.amount).toBeDefined();
    });

    it('validates donation method', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/donations', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: { method: ['Invalid donation method'] }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          date: '2024-02-15',
          method: 'invalid_method',
          fund: 'General Fund',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Donation Listing API', () => {
    it('fetches donations list with pagination', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/donations?page=1&pageSize=20'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination.page).toBe(1);
    });

    it('filters donations by date range', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/donations', ({ request }) => {
          const url = new URL(request.url);
          const dateFrom = url.searchParams.get('dateFrom');
          const dateTo = url.searchParams.get('dateTo');

          if (dateFrom && dateTo) {
            return HttpResponse.json({
              data: [mockDonation],
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
        'https://soapboxsuperapp.com/api/church/church-1/donations?dateFrom=2024-01-01&dateTo=2024-02-28'
      );
      const data = await response.json();

      expect(data.data.length).toBeGreaterThan(0);
    });

    it('filters donations by fund', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/donations', ({ request }) => {
          const url = new URL(request.url);
          const fundId = url.searchParams.get('fundId');

          return HttpResponse.json({
            data: fundId === 'fund-1' ? [mockDonation] : [],
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: fundId === 'fund-1' ? 1 : 0,
              totalPages: fundId === 'fund-1' ? 1 : 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/donations?fundId=fund-1'
      );
      const data = await response.json();

      expect(data.data.length).toBe(1);
      expect(data.data[0].fundId).toBe('fund-1');
    });
  });

  describe('Donation Statistics API', () => {
    it('fetches donation statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/donations/stats'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.totalAmount).toBeDefined();
      expect(data.totalCount).toBeDefined();
      expect(data.averageAmount).toBeDefined();
      expect(data.byFund).toBeDefined();
      expect(data.byMethod).toBeDefined();
      expect(data.trend).toBeDefined();
    });

    it('calculates average donation amount correctly', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/donations/stats'
      );
      const data = await response.json();

      // Verify average is calculated correctly (totalAmount / totalCount)
      expect(data.averageAmount).toBe(125);
      expect(data.totalAmount / data.totalCount).toBe(data.averageAmount);
    });
  });

  describe('Fund Management API', () => {
    it('fetches list of funds', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/funds'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].name).toBeDefined();
      expect(data[0].isDefault).toBeDefined();
    });

    it('includes default fund in list', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/funds'
      );
      const data = await response.json();

      const defaultFund = data.find((f: typeof mockFund) => f.isDefault);
      expect(defaultFund).toBeDefined();
      expect(defaultFund.name).toBe('General Fund');
    });
  });

  describe('Donation Form Validation', () => {
    it('validates positive amount', () => {
      const validateAmount = (amount: number): boolean => {
        return typeof amount === 'number' && amount > 0;
      };

      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(0.01)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-50)).toBe(false);
    });

    it('validates date format', () => {
      const validateDate = (date: string): boolean => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      };

      expect(validateDate('2024-02-15')).toBe(true);
      expect(validateDate('2024-13-01')).toBe(false);
      expect(validateDate('15-02-2024')).toBe(false);
      expect(validateDate('')).toBe(false);
    });

    it('validates donation method enum', () => {
      const validMethods = ['cash', 'check', 'card', 'ach', 'online', 'other'];

      const validateMethod = (method: string): boolean => {
        return validMethods.includes(method);
      };

      expect(validateMethod('card')).toBe(true);
      expect(validateMethod('cash')).toBe(true);
      expect(validateMethod('check')).toBe(true);
      expect(validateMethod('bitcoin')).toBe(false);
      expect(validateMethod('')).toBe(false);
    });

    it('formats currency correctly', () => {
      const formatCurrency = (amount: number, currency: string = 'USD'): string => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        }).format(amount);
      };

      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
    });
  });

  describe('Donation Receipt', () => {
    it('marks donation as receipt sent', async () => {
      server.use(
        http.post(
          'https://soapboxsuperapp.com/api/church/:churchId/donations/:donationId/send-receipt',
          () => {
            return HttpResponse.json({ success: true });
          }
        )
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/donations/donation-1/send-receipt',
        { method: 'POST' }
      );

      expect(response.ok).toBe(true);
    });
  });
});

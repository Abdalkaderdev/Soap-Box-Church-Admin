/**
 * Member Management Integration Tests
 * Tests member creation, listing, updating, and deletion flows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockMember } from '../mocks/handlers';

describe('Member Management', () => {
  describe('Member Creation API', () => {
    it('creates a new member successfully', async () => {
      const newMemberData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@email.com',
        phone: '555-123-4567',
        membershipStatus: 'pending',
      };

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemberData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.firstName).toBe('Jane');
      expect(data.lastName).toBe('Doe');
      expect(data.email).toBe('jane.doe@email.com');
      expect(data.id).toBeDefined();
    });

    it('validates required fields for member creation', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/members', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: { firstName: ['First name is required'] }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName: 'Doe' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.details.firstName).toBeDefined();
    });

    it('handles duplicate email error', async () => {
      server.use(
        http.post('https://soapboxsuperapp.com/api/church/:churchId/members', () => {
          return HttpResponse.json(
            { message: 'A member with this email already exists' },
            { status: 409 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/church/church-1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
        }),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('Member Listing API', () => {
    it('fetches members list with pagination', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members?page=1&pageSize=20'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.pageSize).toBe(20);
    });

    it('fetches members with status filter', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/church/:churchId/members', ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');

          if (status === 'active') {
            return HttpResponse.json({
              data: [mockMember],
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
        'https://soapboxsuperapp.com/api/church/church-1/members?status=active'
      );
      const data = await response.json();

      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].membershipStatus).toBe('active');
    });

    it('fetches single member by ID', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members/member-1'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.id).toBe('member-1');
      expect(data.firstName).toBe('Jane');
      expect(data.lastName).toBe('Smith');
    });
  });

  describe('Member Update API', () => {
    it('updates member details successfully', async () => {
      const updateData = {
        phone: '555-999-8888',
        membershipStatus: 'active',
      };

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members/member-1',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.phone).toBe('555-999-8888');
      expect(data.updatedAt).toBeDefined();
    });

    it('handles member not found error', async () => {
      server.use(
        http.patch('https://soapboxsuperapp.com/api/church/:churchId/members/:memberId', () => {
          return HttpResponse.json(
            { message: 'Member not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members/nonexistent',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '555-111-2222' }),
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('Member Deletion API', () => {
    it('deletes member successfully', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members/member-1',
        { method: 'DELETE' }
      );

      expect(response.status).toBe(204);
    });

    it('handles unauthorized deletion', async () => {
      server.use(
        http.delete('https://soapboxsuperapp.com/api/church/:churchId/members/:memberId', () => {
          return HttpResponse.json(
            { message: 'You do not have permission to delete members' },
            { status: 403 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members/member-1',
        { method: 'DELETE' }
      );

      expect(response.status).toBe(403);
    });
  });

  describe('Member Statistics API', () => {
    it('fetches member statistics', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/members/stats'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.byStatus).toBeDefined();
      expect(data.byStatus.active).toBeDefined();
      expect(data.newThisMonth).toBeDefined();
      expect(data.newThisYear).toBeDefined();
    });
  });

  describe('Member Form Validation', () => {
    it('validates email format', () => {
      const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('valid@email.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('name@domain')).toBe(false);
    });

    it('validates phone format', () => {
      const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        return phoneRegex.test(phone);
      };

      expect(validatePhone('555-123-4567')).toBe(true);
      expect(validatePhone('5551234567')).toBe(false);
      expect(validatePhone('555-12-4567')).toBe(false);
    });

    it('validates required name fields', () => {
      const validateName = (name: string | undefined): boolean => {
        return typeof name === 'string' && name.trim().length > 0;
      };

      expect(validateName('John')).toBe(true);
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
      expect(validateName(undefined)).toBe(false);
    });
  });
});

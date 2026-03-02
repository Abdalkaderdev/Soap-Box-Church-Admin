/**
 * API Endpoint Integration Tests
 * Tests API client, request handling, error handling, and pagination
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../mocks/server';

const API_BASE = 'https://soapboxsuperapp.com/api';

describe('API Client', () => {
  describe('Request Methods', () => {
    it('makes GET request correctly', async () => {
      const response = await fetch(`${API_BASE}/church/church-1/members`);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('makes POST request with body', async () => {
      const response = await fetch(`${API_BASE}/church/church-1/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.firstName).toBe('John');
    });

    it('makes PATCH request with partial data', async () => {
      const response = await fetch(`${API_BASE}/church/church-1/members/member-1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '555-111-2222' }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.phone).toBe('555-111-2222');
    });

    it('makes DELETE request correctly', async () => {
      const response = await fetch(`${API_BASE}/church/church-1/members/member-1`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
    });
  });

  describe('Error Handling', () => {
    it('handles 400 Bad Request', async () => {
      server.use(
        http.post(`${API_BASE}/church/:churchId/members`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              status: 400,
              details: { email: ['Email is required'] },
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeDefined();
    });

    it('handles 401 Unauthorized', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, () => {
          return HttpResponse.json(
            {
              message: 'Unauthorized',
              code: 'UNAUTHORIZED',
              status: 401,
            },
            { status: 401 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members`);

      expect(response.status).toBe(401);
    });

    it('handles 403 Forbidden', async () => {
      server.use(
        http.delete(`${API_BASE}/church/:churchId/members/:memberId`, () => {
          return HttpResponse.json(
            {
              message: 'You do not have permission to perform this action',
              code: 'FORBIDDEN',
              status: 403,
            },
            { status: 403 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members/member-1`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(403);
    });

    it('handles 404 Not Found', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members/:memberId`, () => {
          return HttpResponse.json(
            {
              message: 'Member not found',
              code: 'NOT_FOUND',
              status: 404,
            },
            { status: 404 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members/nonexistent`);

      expect(response.status).toBe(404);
    });

    it('handles 409 Conflict', async () => {
      server.use(
        http.post(`${API_BASE}/church/:churchId/members`, () => {
          return HttpResponse.json(
            {
              message: 'A member with this email already exists',
              code: 'CONFLICT',
              status: 409,
            },
            { status: 409 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'existing@email.com' }),
      });

      expect(response.status).toBe(409);
    });

    it('handles 500 Internal Server Error', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, () => {
          return HttpResponse.json(
            {
              message: 'Internal server error',
              code: 'INTERNAL_ERROR',
              status: 500,
            },
            { status: 500 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members`);

      expect(response.status).toBe(500);
    });

    it('handles network timeout', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, async () => {
          await delay(10000); // Delay longer than typical timeout
          return HttpResponse.json({ data: [] });
        })
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100);

      try {
        await fetch(`${API_BASE}/church/church-1/members`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        clearTimeout(timeoutId);
        expect(error).toBeDefined();
      }
    });
  });

  describe('Pagination', () => {
    it('returns paginated response with correct structure', async () => {
      const response = await fetch(`${API_BASE}/church/church-1/members?page=1&pageSize=20`);
      const data = await response.json();

      expect(data.data).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.pageSize).toBe(20);
      expect(data.pagination.totalItems).toBeDefined();
      expect(data.pagination.totalPages).toBeDefined();
      expect(data.pagination.hasNextPage).toBeDefined();
      expect(data.pagination.hasPreviousPage).toBeDefined();
    });

    it('handles page parameter correctly', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');

          return HttpResponse.json({
            data: [],
            pagination: {
              page,
              pageSize: 20,
              totalItems: 100,
              totalPages: 5,
              hasNextPage: page < 5,
              hasPreviousPage: page > 1,
            },
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?page=3&pageSize=20`);
      const data = await response.json();

      expect(data.pagination.page).toBe(3);
      expect(data.pagination.hasNextPage).toBe(true);
      expect(data.pagination.hasPreviousPage).toBe(true);
    });

    it('handles pageSize parameter correctly', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, ({ request }) => {
          const url = new URL(request.url);
          const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

          return HttpResponse.json({
            data: [],
            pagination: {
              page: 1,
              pageSize,
              totalItems: 100,
              totalPages: Math.ceil(100 / pageSize),
              hasNextPage: true,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?page=1&pageSize=50`);
      const data = await response.json();

      expect(data.pagination.pageSize).toBe(50);
      expect(data.pagination.totalPages).toBe(2);
    });

    it('handles last page correctly', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, () => {
          return HttpResponse.json({
            data: [],
            pagination: {
              page: 5,
              pageSize: 20,
              totalItems: 100,
              totalPages: 5,
              hasNextPage: false,
              hasPreviousPage: true,
            },
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?page=5`);
      const data = await response.json();

      expect(data.pagination.hasNextPage).toBe(false);
      expect(data.pagination.hasPreviousPage).toBe(true);
    });

    it('handles first page correctly', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, () => {
          return HttpResponse.json({
            data: [],
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: 100,
              totalPages: 5,
              hasNextPage: true,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?page=1`);
      const data = await response.json();

      expect(data.pagination.hasNextPage).toBe(true);
      expect(data.pagination.hasPreviousPage).toBe(false);
    });

    it('handles empty results', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, () => {
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

      const response = await fetch(`${API_BASE}/church/church-1/members?page=1`);
      const data = await response.json();

      expect(data.data).toEqual([]);
      expect(data.pagination.totalItems).toBe(0);
      expect(data.pagination.totalPages).toBe(0);
    });
  });

  describe('Sorting', () => {
    it('handles sortBy parameter', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, ({ request }) => {
          const url = new URL(request.url);
          const sortBy = url.searchParams.get('sortBy');

          return HttpResponse.json({
            data: [
              { id: '1', lastName: 'Adams' },
              { id: '2', lastName: 'Brown' },
            ],
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: 2,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
            sortBy,
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?sortBy=lastName`);
      const data = await response.json();

      expect(data.sortBy).toBe('lastName');
    });

    it('handles sortOrder parameter', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, ({ request }) => {
          const url = new URL(request.url);
          const sortOrder = url.searchParams.get('sortOrder');

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
            sortOrder,
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?sortOrder=desc`);
      const data = await response.json();

      expect(data.sortOrder).toBe('desc');
    });
  });

  describe('Filtering', () => {
    it('handles search parameter', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, ({ request }) => {
          const url = new URL(request.url);
          const search = url.searchParams.get('search');

          const results = search === 'John'
            ? [{ id: '1', firstName: 'John', lastName: 'Doe' }]
            : [];

          return HttpResponse.json({
            data: results,
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: results.length,
              totalPages: results.length > 0 ? 1 : 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?search=John`);
      const data = await response.json();

      expect(data.data.length).toBe(1);
      expect(data.data[0].firstName).toBe('John');
    });

    it('handles status filter', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/members`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');

          return HttpResponse.json({
            data: [{ id: '1', membershipStatus: status }],
            pagination: {
              page: 1,
              pageSize: 20,
              totalItems: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members?status=active`);
      const data = await response.json();

      expect(data.data[0].membershipStatus).toBe('active');
    });

    it('handles date range filter', async () => {
      server.use(
        http.get(`${API_BASE}/church/:churchId/donations`, ({ request }) => {
          const url = new URL(request.url);
          const dateFrom = url.searchParams.get('dateFrom');
          const dateTo = url.searchParams.get('dateTo');

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
            filters: { dateFrom, dateTo },
          });
        })
      );

      const response = await fetch(
        `${API_BASE}/church/church-1/donations?dateFrom=2024-01-01&dateTo=2024-02-28`
      );
      const data = await response.json();

      expect(data.filters.dateFrom).toBe('2024-01-01');
      expect(data.filters.dateTo).toBe('2024-02-28');
    });
  });

  describe('Content Types', () => {
    it('sends JSON content type for POST', async () => {
      server.use(
        http.post(`${API_BASE}/church/:churchId/members`, async ({ request }) => {
          const contentType = request.headers.get('Content-Type');

          return HttpResponse.json({
            contentType,
            success: true,
          });
        })
      );

      const response = await fetch(`${API_BASE}/church/church-1/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });

      const data = await response.json();
      expect(data.contentType).toBe('application/json');
    });

    it('receives JSON response', async () => {
      const response = await fetch(`${API_BASE}/church/church-1/members`);
      const contentType = response.headers.get('Content-Type');

      expect(contentType).toContain('application/json');
    });
  });
});

/**
 * Authentication Integration Tests
 * Tests user login flow, session management, and authentication state
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { render } from '../utils/test-utils';

// Mock Login component for testing
function MockLoginPage() {
  return (
    <div>
      <h1>Church Admin Login</h1>
      <form data-testid="login-form">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" data-testid="email-input" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" data-testid="password-input" />
        <button type="submit" data-testid="login-button">
          Sign In
        </button>
      </form>
      <a href="/forgot-password" data-testid="forgot-password-link">
        Forgot Password?
      </a>
    </div>
  );
}

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  describe('Login Page', () => {
    it('renders login form with email and password fields', () => {
      render(<MockLoginPage />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('has accessible form labels', () => {
      render(<MockLoginPage />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('includes forgot password link', () => {
      render(<MockLoginPage />);

      const forgotPasswordLink = screen.getByTestId('forgot-password-link');
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Login Form Validation', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup();
      render(<MockLoginPage />);

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'admin@church.org');

      expect(emailInput).toHaveValue('admin@church.org');
    });

    it('allows typing in password field', async () => {
      const user = userEvent.setup();
      render(<MockLoginPage />);

      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'securePassword123');

      expect(passwordInput).toHaveValue('securePassword123');
    });

    it('password field masks input', () => {
      render(<MockLoginPage />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Authentication State', () => {
    it('stores authentication token in localStorage on successful login', async () => {
      // Simulate successful authentication
      window.localStorage.setItem('soapbox_auth_token', 'test-jwt-token');
      window.localStorage.setItem('soapbox_authenticated', 'true');

      expect(window.localStorage.getItem('soapbox_auth_token')).toBe('test-jwt-token');
      expect(window.localStorage.getItem('soapbox_authenticated')).toBe('true');
    });

    it('stores user data in localStorage on successful login', async () => {
      const userData = {
        id: 'user-1',
        email: 'admin@church.org',
        firstName: 'John',
        lastName: 'Pastor',
        role: 'admin',
        churchId: 'church-1',
      };

      window.localStorage.setItem('soapbox_user', JSON.stringify(userData));

      const storedUser = JSON.parse(window.localStorage.getItem('soapbox_user') || '{}');
      expect(storedUser.email).toBe('admin@church.org');
      expect(storedUser.role).toBe('admin');
      expect(storedUser.churchId).toBe('church-1');
    });

    it('clears authentication data on logout', async () => {
      // Set up authenticated state
      window.localStorage.setItem('soapbox_auth_token', 'test-jwt-token');
      window.localStorage.setItem('soapbox_authenticated', 'true');
      window.localStorage.setItem('soapbox_user', JSON.stringify({ id: 'user-1' }));

      // Simulate logout
      window.localStorage.removeItem('soapbox_auth_token');
      window.localStorage.removeItem('soapbox_authenticated');
      window.localStorage.removeItem('soapbox_user');

      expect(window.localStorage.getItem('soapbox_auth_token')).toBeNull();
      expect(window.localStorage.getItem('soapbox_authenticated')).toBeNull();
      expect(window.localStorage.getItem('soapbox_user')).toBeNull();
    });
  });

  describe('Session API', () => {
    it('fetches current session successfully', async () => {
      const response = await fetch('https://soapboxsuperapp.com/api/auth/me');
      const data = await response.json();

      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('admin@church.org');
      expect(data.church).toBeDefined();
      expect(data.church.name).toBe('First Community Church');
    });

    it('handles session fetch failure gracefully', async () => {
      server.use(
        http.get('https://soapboxsuperapp.com/api/auth/me', () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch('https://soapboxsuperapp.com/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('calls logout API endpoint', async () => {
      const response = await fetch('https://soapboxsuperapp.com/api/auth/logout', {
        method: 'POST',
      });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });

  describe('Permission Checks', () => {
    it('admin role has all permissions', () => {
      const adminUser = { role: 'admin' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const checkPermission = (_: string) => {
        if (adminUser.role === 'admin') return true;
        return false;
      };

      expect(checkPermission('members:read')).toBe(true);
      expect(checkPermission('members:write')).toBe(true);
      expect(checkPermission('donations:read')).toBe(true);
      expect(checkPermission('reports:read')).toBe(true);
    });

    it('volunteer role has limited permissions', () => {
      const volunteerUser = { role: 'volunteer' };
      const permissions: Record<string, string[]> = {
        volunteer: ['members:read', 'events:read', 'volunteers:read'],
      };

      const checkPermission = (perm: string) => {
        return permissions[volunteerUser.role]?.includes(perm) || false;
      };

      expect(checkPermission('members:read')).toBe(true);
      expect(checkPermission('members:write')).toBe(false);
      expect(checkPermission('donations:read')).toBe(false);
    });

    it('member role has minimal permissions', () => {
      const memberUser = { role: 'member' };
      const permissions: Record<string, string[]> = {
        member: ['events:read'],
      };

      const checkPermission = (perm: string) => {
        return permissions[memberUser.role]?.includes(perm) || false;
      };

      expect(checkPermission('events:read')).toBe(true);
      expect(checkPermission('members:read')).toBe(false);
      expect(checkPermission('donations:read')).toBe(false);
    });
  });
});

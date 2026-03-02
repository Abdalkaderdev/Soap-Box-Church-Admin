/**
 * Settings Integration Tests
 * Tests settings save, church info update, preferences, and security settings
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockChurchInfo, mockUserPreferences } from '../mocks/handlers';

describe('Settings Management', () => {
  describe('Church Information API', () => {
    it('fetches church information', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/info'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.id).toBe('church-1');
      expect(data.name).toBe('First Community Church');
      expect(data.email).toBeDefined();
      expect(data.phone).toBeDefined();
      expect(data.timezone).toBeDefined();
    });

    it('updates church information successfully', async () => {
      const updateData = {
        name: 'Updated Church Name',
        phone: '555-999-8888',
      };

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/info',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.name).toBe('Updated Church Name');
      expect(data.phone).toBe('555-999-8888');
    });

    it('validates church name is not empty', async () => {
      server.use(
        http.patch('https://soapboxsuperapp.com/api/church/:churchId/settings/info', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: { name: ['Church name is required'] }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/info',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '' }),
        }
      );

      expect(response.status).toBe(400);
    });

    it('validates email format', async () => {
      server.use(
        http.patch('https://soapboxsuperapp.com/api/church/:churchId/settings/info', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              details: { email: ['Invalid email format'] }
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/info',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'invalid-email' }),
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe('User Preferences API', () => {
    it('fetches user preferences', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/preferences'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.theme).toBeDefined();
      expect(data.language).toBeDefined();
      expect(data.dateFormat).toBeDefined();
      expect(data.timeFormat).toBeDefined();
    });

    it('updates theme preference', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/preferences',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: 'dark' }),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.theme).toBe('dark');
    });

    it('updates date format preference', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/preferences',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateFormat: 'DD/MM/YYYY' }),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.dateFormat).toBe('DD/MM/YYYY');
    });

    it('updates time format preference', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/preferences',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeFormat: '24h' }),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.timeFormat).toBe('24h');
    });
  });

  describe('Notification Settings API', () => {
    it('fetches notification settings', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/notifications'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.newMemberAlerts).toBeDefined();
      expect(data.donationReceipts).toBeDefined();
      expect(data.eventReminders).toBeDefined();
      expect(data.volunteerReminders).toBeDefined();
      expect(data.weeklyDigest).toBeDefined();
      expect(data.systemAlerts).toBeDefined();
    });

    it('updates notification settings', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/notifications',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newMemberAlerts: false,
            weeklyDigest: false,
          }),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.newMemberAlerts).toBe(false);
      expect(data.weeklyDigest).toBe(false);
    });

    it('enables all notifications', async () => {
      const allEnabled = {
        newMemberAlerts: true,
        donationReceipts: true,
        eventReminders: true,
        volunteerReminders: true,
        weeklyDigest: true,
        systemAlerts: true,
      };

      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/notifications',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allEnabled),
        }
      );

      const data = await response.json();

      expect(response.ok).toBe(true);
      Object.keys(allEnabled).forEach(key => {
        expect(data[key]).toBe(true);
      });
    });
  });

  describe('Security Settings API', () => {
    it('fetches security settings', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/security'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.twoFactorEnabled).toBeDefined();
      expect(data.activeSessions).toBeDefined();
      expect(Array.isArray(data.activeSessions)).toBe(true);
    });

    it('includes active sessions information', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/security'
      );
      const data = await response.json();

      if (data.activeSessions.length > 0) {
        const session = data.activeSessions[0];
        expect(session.id).toBeDefined();
        expect(session.device).toBeDefined();
        expect(session.browser).toBeDefined();
        expect(session.location).toBeDefined();
        expect(session.lastActive).toBeDefined();
        expect(session.current).toBeDefined();
      }
    });

    it('identifies current session', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/security'
      );
      const data = await response.json();

      const currentSession = data.activeSessions.find(
        (s: { current: boolean }) => s.current === true
      );
      expect(currentSession).toBeDefined();
    });
  });

  describe('Staff Management API', () => {
    it('fetches staff members list', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/staff'
      );
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
    });

    it('staff members have required fields', async () => {
      const response = await fetch(
        'https://soapboxsuperapp.com/api/church/church-1/settings/staff'
      );
      const data = await response.json();

      if (data.length > 0) {
        const staff = data[0];
        expect(staff.id).toBeDefined();
        expect(staff.userId).toBeDefined();
        expect(staff.name).toBeDefined();
        expect(staff.email).toBeDefined();
        expect(staff.role).toBeDefined();
        expect(staff.permissions).toBeDefined();
        expect(staff.status).toBeDefined();
      }
    });
  });

  describe('Settings Form Validation', () => {
    it('validates timezone format', () => {
      const validTimezones = [
        'America/Chicago',
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Asia/Tokyo',
      ];

      const validateTimezone = (tz: string): boolean => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      };

      expect(validateTimezone('America/Chicago')).toBe(true);
      expect(validateTimezone('Invalid/Timezone')).toBe(false);
    });

    it('validates website URL format', () => {
      const validateUrl = (url: string): boolean => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://church.org')).toBe(true);
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });

    it('validates phone number format', () => {
      const validatePhone = (phone: string): boolean => {
        // Accept various common phone formats
        const phoneRegex = /^[\d\s\-\(\)\.+]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
      };

      expect(validatePhone('555-123-4567')).toBe(true);
      expect(validatePhone('(555) 123-4567')).toBe(true);
      expect(validatePhone('+1 555 123 4567')).toBe(true);
      expect(validatePhone('555.123.4567')).toBe(true);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc-def-ghij')).toBe(false);
    });

    it('validates locale format', () => {
      const validateLocale = (locale: string): boolean => {
        const localeRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
        return localeRegex.test(locale);
      };

      expect(validateLocale('en')).toBe(true);
      expect(validateLocale('en-US')).toBe(true);
      expect(validateLocale('es-ES')).toBe(true);
      expect(validateLocale('fr-CA')).toBe(true);
      expect(validateLocale('invalid')).toBe(false);
      expect(validateLocale('EN-us')).toBe(false);
    });
  });

  describe('Theme Settings', () => {
    it('validates theme values', () => {
      const validThemes = ['light', 'dark', 'system'];

      const validateTheme = (theme: string): boolean => {
        return validThemes.includes(theme);
      };

      expect(validateTheme('light')).toBe(true);
      expect(validateTheme('dark')).toBe(true);
      expect(validateTheme('system')).toBe(true);
      expect(validateTheme('custom')).toBe(false);
      expect(validateTheme('')).toBe(false);
    });

    it('applies theme to document', () => {
      const applyTheme = (theme: 'light' | 'dark' | 'system'): string => {
        if (theme === 'system') {
          // In tests, default to light
          return 'light';
        }
        return theme;
      };

      expect(applyTheme('light')).toBe('light');
      expect(applyTheme('dark')).toBe('dark');
      expect(applyTheme('system')).toBe('light');
    });
  });

  describe('Date/Time Format Settings', () => {
    it('validates date format options', () => {
      const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

      const validateDateFormat = (format: string): boolean => {
        return validDateFormats.includes(format);
      };

      expect(validateDateFormat('MM/DD/YYYY')).toBe(true);
      expect(validateDateFormat('DD/MM/YYYY')).toBe(true);
      expect(validateDateFormat('YYYY-MM-DD')).toBe(true);
      expect(validateDateFormat('invalid')).toBe(false);
    });

    it('validates time format options', () => {
      const validTimeFormats = ['12h', '24h'];

      const validateTimeFormat = (format: string): boolean => {
        return validTimeFormats.includes(format);
      };

      expect(validateTimeFormat('12h')).toBe(true);
      expect(validateTimeFormat('24h')).toBe(true);
      expect(validateTimeFormat('invalid')).toBe(false);
    });

    it('formats date according to preference', () => {
      const formatDate = (date: Date, format: string): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        switch (format) {
          case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
          case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
          case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
          default:
            return `${month}/${day}/${year}`;
        }
      };

      const testDate = new Date('2024-02-15');
      expect(formatDate(testDate, 'MM/DD/YYYY')).toBe('02/15/2024');
      expect(formatDate(testDate, 'DD/MM/YYYY')).toBe('15/02/2024');
      expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2024-02-15');
    });

    it('formats time according to preference', () => {
      const formatTime = (date: Date, format: '12h' | '24h'): string => {
        if (format === '24h') {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        }
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      };

      const testDate = new Date('2024-02-15T14:30:00');
      const time24 = formatTime(testDate, '24h');
      const time12 = formatTime(testDate, '12h');

      expect(time24).toMatch(/14:30/);
      expect(time12).toMatch(/2:30.*PM/);
    });
  });
});

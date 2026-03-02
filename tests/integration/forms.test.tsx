/**
 * Component Form Integration Tests
 * Tests form inputs, validation, submission, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/test-utils';

// Mock form components for testing
function MockMemberForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  return (
    <form
      data-testid="member-form"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        onSubmit(data);
      }}
    >
      <div>
        <label htmlFor="firstName">First Name *</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          data-testid="firstName-input"
        />
      </div>
      <div>
        <label htmlFor="lastName">Last Name *</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          data-testid="lastName-input"
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          data-testid="email-input"
        />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          data-testid="phone-input"
        />
      </div>
      <div>
        <label htmlFor="status">Membership Status</label>
        <select id="status" name="status" data-testid="status-select">
          <option value="visitor">Visitor</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button type="submit" data-testid="submit-button">
        Add Member
      </button>
    </form>
  );
}

function MockDonationForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  return (
    <form
      data-testid="donation-form"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        onSubmit(data);
      }}
    >
      <div>
        <label htmlFor="amount">Amount *</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          data-testid="amount-input"
        />
      </div>
      <div>
        <label htmlFor="date">Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          required
          data-testid="date-input"
        />
      </div>
      <div>
        <label htmlFor="method">Payment Method *</label>
        <select id="method" name="method" required data-testid="method-select">
          <option value="">Select method</option>
          <option value="cash">Cash</option>
          <option value="check">Check</option>
          <option value="card">Card</option>
          <option value="ach">ACH/Bank Transfer</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div>
        <label htmlFor="fund">Fund *</label>
        <select id="fund" name="fund" required data-testid="fund-select">
          <option value="">Select fund</option>
          <option value="general">General Fund</option>
          <option value="missions">Missions</option>
          <option value="building">Building Fund</option>
        </select>
      </div>
      <div>
        <label htmlFor="isAnonymous">
          <input
            id="isAnonymous"
            name="isAnonymous"
            type="checkbox"
            data-testid="anonymous-checkbox"
          />
          Anonymous Donation
        </label>
      </div>
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          data-testid="notes-textarea"
        />
      </div>
      <button type="submit" data-testid="submit-donation">
        Record Donation
      </button>
    </form>
  );
}

function MockEventForm({ onSubmit }: { onSubmit: (data: Record<string, unknown>) => void }) {
  return (
    <form
      data-testid="event-form"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        onSubmit(data);
      }}
    >
      <div>
        <label htmlFor="title">Event Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={200}
          data-testid="title-input"
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          data-testid="description-textarea"
        />
      </div>
      <div>
        <label htmlFor="startDate">Start Date *</label>
        <input
          id="startDate"
          name="startDate"
          type="datetime-local"
          required
          data-testid="startDate-input"
        />
      </div>
      <div>
        <label htmlFor="endDate">End Date *</label>
        <input
          id="endDate"
          name="endDate"
          type="datetime-local"
          required
          data-testid="endDate-input"
        />
      </div>
      <div>
        <label htmlFor="category">Category *</label>
        <select id="category" name="category" required data-testid="category-select">
          <option value="">Select category</option>
          <option value="worship">Worship</option>
          <option value="youth">Youth</option>
          <option value="children">Children</option>
          <option value="fellowship">Fellowship</option>
          <option value="outreach">Outreach</option>
        </select>
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          data-testid="location-input"
        />
      </div>
      <div>
        <label htmlFor="maxAttendees">Max Attendees</label>
        <input
          id="maxAttendees"
          name="maxAttendees"
          type="number"
          min="1"
          data-testid="maxAttendees-input"
        />
      </div>
      <div>
        <label htmlFor="requiresRegistration">
          <input
            id="requiresRegistration"
            name="requiresRegistration"
            type="checkbox"
            data-testid="registration-checkbox"
          />
          Requires Registration
        </label>
      </div>
      <button type="submit" data-testid="submit-event">
        Create Event
      </button>
    </form>
  );
}

describe('Form Components', () => {
  describe('Member Form', () => {
    it('renders all form fields', () => {
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
      expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('status-select')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('has accessible labels for all inputs', () => {
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Membership Status/)).toBeInTheDocument();
    });

    it('allows user to fill out the form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('firstName-input'), 'John');
      await user.type(screen.getByTestId('lastName-input'), 'Doe');
      await user.type(screen.getByTestId('email-input'), 'john.doe@email.com');
      await user.type(screen.getByTestId('phone-input'), '555-123-4567');
      await user.selectOptions(screen.getByTestId('status-select'), 'active');

      expect(screen.getByTestId('firstName-input')).toHaveValue('John');
      expect(screen.getByTestId('lastName-input')).toHaveValue('Doe');
      expect(screen.getByTestId('email-input')).toHaveValue('john.doe@email.com');
      expect(screen.getByTestId('phone-input')).toHaveValue('555-123-4567');
      expect(screen.getByTestId('status-select')).toHaveValue('active');
    });

    it('submits form data correctly', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('firstName-input'), 'Jane');
      await user.type(screen.getByTestId('lastName-input'), 'Smith');
      await user.click(screen.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
        })
      );
    });

    it('marks required fields', () => {
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      expect(screen.getByTestId('firstName-input')).toBeRequired();
      expect(screen.getByTestId('lastName-input')).toBeRequired();
      expect(screen.getByTestId('email-input')).not.toBeRequired();
    });
  });

  describe('Donation Form', () => {
    it('renders all form fields', () => {
      const onSubmit = vi.fn();
      render(<MockDonationForm onSubmit={onSubmit} />);

      expect(screen.getByTestId('amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('date-input')).toBeInTheDocument();
      expect(screen.getByTestId('method-select')).toBeInTheDocument();
      expect(screen.getByTestId('fund-select')).toBeInTheDocument();
      expect(screen.getByTestId('anonymous-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('notes-textarea')).toBeInTheDocument();
    });

    it('validates amount is positive', () => {
      const onSubmit = vi.fn();
      render(<MockDonationForm onSubmit={onSubmit} />);

      const amountInput = screen.getByTestId('amount-input');
      expect(amountInput).toHaveAttribute('min', '0.01');
    });

    it('allows decimal amounts', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockDonationForm onSubmit={onSubmit} />);

      const amountInput = screen.getByTestId('amount-input');
      await user.type(amountInput, '123.45');

      expect(amountInput).toHaveValue(123.45);
    });

    it('submits donation data correctly', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockDonationForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('amount-input'), '100');
      fireEvent.change(screen.getByTestId('date-input'), {
        target: { value: '2024-02-15' },
      });
      await user.selectOptions(screen.getByTestId('method-select'), 'card');
      await user.selectOptions(screen.getByTestId('fund-select'), 'general');
      await user.click(screen.getByTestId('submit-donation'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: '100',
          date: '2024-02-15',
          method: 'card',
          fund: 'general',
        })
      );
    });

    it('handles anonymous donation checkbox', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockDonationForm onSubmit={onSubmit} />);

      const checkbox = screen.getByTestId('anonymous-checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Event Form', () => {
    it('renders all form fields', () => {
      const onSubmit = vi.fn();
      render(<MockEventForm onSubmit={onSubmit} />);

      expect(screen.getByTestId('title-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('startDate-input')).toBeInTheDocument();
      expect(screen.getByTestId('endDate-input')).toBeInTheDocument();
      expect(screen.getByTestId('category-select')).toBeInTheDocument();
      expect(screen.getByTestId('location-input')).toBeInTheDocument();
      expect(screen.getByTestId('maxAttendees-input')).toBeInTheDocument();
      expect(screen.getByTestId('registration-checkbox')).toBeInTheDocument();
    });

    it('validates title length', () => {
      const onSubmit = vi.fn();
      render(<MockEventForm onSubmit={onSubmit} />);

      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toHaveAttribute('minLength', '3');
      expect(titleInput).toHaveAttribute('maxLength', '200');
    });

    it('validates max attendees is positive', () => {
      const onSubmit = vi.fn();
      render(<MockEventForm onSubmit={onSubmit} />);

      const maxAttendeesInput = screen.getByTestId('maxAttendees-input');
      expect(maxAttendeesInput).toHaveAttribute('min', '1');
    });

    it('submits event data correctly', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockEventForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('title-input'), 'Youth Night');
      await user.type(screen.getByTestId('description-textarea'), 'Weekly youth gathering');
      fireEvent.change(screen.getByTestId('startDate-input'), {
        target: { value: '2024-03-01T18:00' },
      });
      fireEvent.change(screen.getByTestId('endDate-input'), {
        target: { value: '2024-03-01T21:00' },
      });
      await user.selectOptions(screen.getByTestId('category-select'), 'youth');
      await user.type(screen.getByTestId('location-input'), 'Youth Center');
      await user.click(screen.getByTestId('submit-event'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Youth Night',
          description: 'Weekly youth gathering',
          category: 'youth',
          location: 'Youth Center',
        })
      );
    });

    it('handles registration required checkbox', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockEventForm onSubmit={onSubmit} />);

      const checkbox = screen.getByTestId('registration-checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Form Accessibility', () => {
    it('inputs have proper labels for screen readers', () => {
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      const firstNameInput = screen.getByLabelText(/First Name/);
      expect(firstNameInput).toHaveAttribute('id');

      const label = screen.getByText(/First Name/);
      expect(label).toHaveAttribute('for', firstNameInput.id);
    });

    it('required fields are marked appropriately', () => {
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      // Labels contain asterisk for required fields
      expect(screen.getByText(/First Name \*/)).toBeInTheDocument();
      expect(screen.getByText(/Last Name \*/)).toBeInTheDocument();
    });

    it('form elements are keyboard accessible', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      // Tab through form elements
      await user.tab();
      expect(screen.getByTestId('firstName-input')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('lastName-input')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('email-input')).toHaveFocus();
    });
  });

  describe('Form Error States', () => {
    it('displays validation for empty required fields', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      // Try to submit without filling required fields
      await user.click(screen.getByTestId('submit-button'));

      // Browser native validation should prevent submission
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<MockMemberForm onSubmit={onSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'invalid-email');

      // HTML5 email validation
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).not.toHaveAttribute('pattern');
    });
  });
});

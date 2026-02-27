/**
 * CSV Export Utility for Church Admin
 *
 * Provides functionality to export data arrays to CSV files
 * with proper handling of special characters, dates, and custom column headers.
 */

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

/**
 * Escapes a value for CSV format
 * Handles quotes, commas, and newlines
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Formats a date value for CSV export
 */
function formatDateValue(value: unknown): string {
  if (!value) return '';

  try {
    const date = new Date(value as string);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return String(value);
  }
}

/**
 * Formats a currency value for CSV export
 */
function formatCurrencyValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(2);
}

/**
 * Gets a nested value from an object using dot notation
 * e.g., getNestedValue(obj, 'member.firstName') returns obj.member.firstName
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Converts an array of objects to CSV string format
 */
function convertToCSV(data: Record<string, unknown>[], columns: ExportColumn[]): string {
  // Create header row
  const headers = columns.map(col => escapeCSVValue(col.header)).join(',');

  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = getNestedValue(row, col.key);

      if (col.formatter) {
        return escapeCSVValue(col.formatter(value, row));
      }

      return escapeCSVValue(value);
    }).join(',');
  });

  return [headers, ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main export function - exports data array to CSV file
 *
 * @param data - Array of objects to export
 * @param filename - Name of the file to download (without extension)
 * @param columns - Optional column configuration. If not provided, will auto-generate from first row
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: ExportColumn[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // If no columns provided, auto-generate from first row keys
  const exportColumns = columns || Object.keys(data[0]).map(key => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
  }));

  const csvContent = convertToCSV(data, exportColumns);
  downloadCSV(csvContent, filename);
}

/**
 * Pre-configured column definitions for Members export
 */
export const memberExportColumns: ExportColumn[] = [
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'membershipStatus', header: 'Status' },
  { key: 'memberSince', header: 'Member Since', formatter: formatDateValue },
  { key: 'dateOfBirth', header: 'Date of Birth', formatter: formatDateValue },
  { key: 'gender', header: 'Gender' },
  { key: 'address.street', header: 'Street Address' },
  { key: 'address.city', header: 'City' },
  { key: 'address.state', header: 'State' },
  { key: 'address.zipCode', header: 'Zip Code' },
  { key: 'tags', header: 'Tags', formatter: (value) => Array.isArray(value) ? value.join('; ') : String(value || '') },
  { key: 'notes', header: 'Notes' },
];

/**
 * Pre-configured column definitions for Donations export
 */
export const donationExportColumns: ExportColumn[] = [
  { key: 'date', header: 'Date', formatter: formatDateValue },
  {
    key: 'member.firstName',
    header: 'Donor Name',
    formatter: (_value, row) => {
      if (row.isAnonymous) return 'Anonymous';
      const member = row.member as Record<string, unknown> | undefined;
      if (member) {
        return `${member.firstName || ''} ${member.lastName || ''}`.trim();
      }
      return 'Unknown Donor';
    }
  },
  { key: 'member.email', header: 'Donor Email' },
  { key: 'amount', header: 'Amount', formatter: formatCurrencyValue },
  { key: 'currency', header: 'Currency' },
  { key: 'fund', header: 'Fund' },
  { key: 'method', header: 'Payment Method' },
  { key: 'status', header: 'Status' },
  { key: 'isRecurring', header: 'Recurring', formatter: (value) => value ? 'Yes' : 'No' },
  { key: 'transactionId', header: 'Transaction ID' },
  { key: 'notes', header: 'Notes' },
  { key: 'receiptSent', header: 'Receipt Sent', formatter: (value) => value ? 'Yes' : 'No' },
];

/**
 * Pre-configured column definitions for Attendance/Service export
 */
export const attendanceExportColumns: ExportColumn[] = [
  { key: 'name', header: 'Service Name' },
  { key: 'serviceDate', header: 'Date', formatter: formatDateValue },
  { key: 'startTime', header: 'Start Time' },
  { key: 'endTime', header: 'End Time' },
  { key: 'serviceType', header: 'Service Type' },
  { key: 'actualAttendance', header: 'Actual Attendance' },
  { key: 'expectedAttendance', header: 'Expected Attendance' },
  { key: 'childrenAttendance', header: 'Children Attendance' },
  { key: 'firstTimeVisitors', header: 'First-Time Visitors' },
  { key: 'status', header: 'Status' },
];

/**
 * Utility to generate filename with current date
 */
export function generateExportFilename(prefix: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}-${date}`;
}

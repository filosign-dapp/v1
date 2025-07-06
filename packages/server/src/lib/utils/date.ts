import moment from "moment";

// Format date for display
export function formatDate(date: string | Date, format = "MMM D, YYYY"): string {
  return moment(date).format(format);
}

// Format date with time
export function formatDateTime(date: string | Date, format = "MMM D, YYYY [at] h:mm A"): string {
  return moment(date).format(format);
}

// Get relative time (e.g., "2 hours ago", "in 3 days")
export function getRelativeTime(date: string | Date): string {
  return moment(date).fromNow();
}

// Check if date is overdue
export function isOverdue(date: string | Date): boolean {
  return moment(date).isBefore(moment());
}

// Check if date is today
export function isToday(date: string | Date): boolean {
  return moment(date).isSame(moment(), 'day');
}

// Check if date is tomorrow
export function isTomorrow(date: string | Date): boolean {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
}

// Get smart date display (Today, Tomorrow, or formatted date)
export function getSmartDateDisplay(date: string | Date): string {
  const momentDate = moment(date);
  const now = moment();
  
  if (momentDate.isSame(now, 'day')) {
    return `Today at ${momentDate.format('h:mm A')}`;
  }
  
  if (momentDate.isSame(now.clone().add(1, 'day'), 'day')) {
    return `Tomorrow at ${momentDate.format('h:mm A')}`;
  }
  
  if (Math.abs(momentDate.diff(now, 'days')) <= 7) {
    return momentDate.format('dddd [at] h:mm A');
  }
  
  return momentDate.format('MMM D, YYYY [at] h:mm A');
}

// Create date at end of day (23:59:59)
export function createEndOfDay(date?: string | Date): Date {
  return moment(date).endOf('day').toDate();
}

// Create date at start of day (00:00:00)
export function createStartOfDay(date?: string | Date): Date {
  return moment(date).startOf('day').toDate();
}

// Calculate seconds from now to a future date
export function getSecondsFromNow(futureDate: string | Date): number {
  const now = moment();
  const future = moment(futureDate);
  const diffInSeconds = future.diff(now, 'seconds');
  return Math.max(0, diffInSeconds); // Ensure non-negative
}

// Format date for datetime-local input
export function formatForDateTimeInput(date: string | Date): string {
  return moment(date).format('YYYY-MM-DDTHH:mm');
}

// Create date from datetime-local input
export function createDateFromInput(dateTimeString: string): Date {
  return moment(dateTimeString).toDate();
}

// Get minimum datetime for input (current time)
export function getMinDateTime(): string {
  return moment().format('YYYY-MM-DDTHH:mm');
}

// Get default expiry datetime (1 hour from now)
export function getDefaultExpiryDateTime(): string {
  return moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm');
} 
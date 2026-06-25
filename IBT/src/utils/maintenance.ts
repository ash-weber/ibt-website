/**
 * Utility functions for maintenance page
 */

/**
 * Format remaining time as human-readable string
 * e.g., "2 hours 30 minutes" or "45 minutes" or "30 seconds"
 */
export const formatTimeRemaining = (seconds: number | null): string => {
  if (!seconds || seconds <= 0) return 'Calculating...';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }

  if (secs > 0 && hours === 0 && minutes < 2) {
    parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) return 'Less than a minute';

  if (parts.length === 1) return parts[0];

  return parts.slice(0, 2).join(' and ');
};

/**
 * Format display date/time
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return 'Invalid date';
  }
};

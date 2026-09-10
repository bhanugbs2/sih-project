/**
 * Safely parses any timestamp format (Unix epoch seconds, Unix epoch milliseconds, or ISO string)
 * into milliseconds since epoch.
 */
export function parseTimestampMs(timestamp: string | number | null | undefined): number | null {
  if (timestamp === null || timestamp === undefined || timestamp === '') return null;

  if (typeof timestamp === 'number') {
    // Unix epoch seconds are typically ~1.7e9 (10 digits).
    // Milliseconds are ~1.7e12 (13 digits). Threshold: 100,000,000,000 (100 billion).
    return timestamp < 100000000000 ? timestamp * 1000 : timestamp;
  }

  if (typeof timestamp === 'string') {
    const trimmed = timestamp.trim();
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      const num = Number(trimmed);
      return num < 100000000000 ? num * 1000 : num;
    }
    const parsed = new Date(trimmed).getTime();
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

/**
 * Returns relative time string ("X seconds ago", "X minutes ago", "X hours ago", "X days ago").
 */
export function formatRelativeTime(timestamp: string | number | null | undefined): string {
  const ms = parseTimestampMs(timestamp);
  if (ms === null) return 'Unknown time';

  const diffMs = Date.now() - ms;
  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return seconds <= 1 ? '1 second ago' : `${seconds} seconds ago`;
  }
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

/**
 * Safely formats timestamp to local time string e.g. "10:25:48 PM".
 */
export function formatTimeOfDay(timestamp: string | number | null | undefined): string {
  const ms = parseTimestampMs(timestamp);
  if (ms === null) return 'N/A';
  return new Date(ms).toLocaleTimeString();
}

/**
 * Returns Date object or null for a given timestamp.
 */
export function toValidDate(timestamp: string | number | null | undefined): Date | null {
  const ms = parseTimestampMs(timestamp);
  return ms !== null ? new Date(ms) : null;
}

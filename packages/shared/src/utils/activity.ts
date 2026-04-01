/**
 * Calculate activity level (0-100) from input metrics over a 1-minute interval.
 *
 * Weights: keystrokes 50%, mouse clicks 30%, mouse movement 20%.
 * Caps each metric at a reasonable per-minute maximum.
 */
export function calculateActivityLevel(
  keystrokes: number,
  mouseClicks: number,
  mouseDistancePx: number,
): number {
  const MAX_KEYSTROKES_PER_MIN = 600;
  const MAX_CLICKS_PER_MIN = 120;
  const MAX_MOUSE_DISTANCE_PER_MIN = 50_000;

  const keystrokeScore = Math.min(keystrokes / MAX_KEYSTROKES_PER_MIN, 1);
  const clickScore = Math.min(mouseClicks / MAX_CLICKS_PER_MIN, 1);
  const movementScore = Math.min(
    mouseDistancePx / MAX_MOUSE_DISTANCE_PER_MIN,
    1,
  );

  const raw = keystrokeScore * 0.5 + clickScore * 0.3 + movementScore * 0.2;
  return Math.round(raw * 100);
}

/**
 * Format a duration in seconds to a human-readable string.
 * e.g. 3661 -> "1h 1m 1s"
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
 * Format seconds into decimal hours (e.g. 5400 -> 1.5).
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}

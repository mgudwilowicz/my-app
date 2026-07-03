export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(date) {
  if (!DATE_REGEX.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export const CLIENT_AI_DAILY_MESSAGE_LIMIT = 10;

export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

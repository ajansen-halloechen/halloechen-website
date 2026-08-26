/** First day of the month for a date, using local calendar components. */
export function monthStartFromIsoDate(date: string | Date): Date {
  if (typeof date === 'string') {
    const [y, m] = date.slice(0, 10).split('-').map(Number);
    return new Date(y!, m! - 1, 1);
  }
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

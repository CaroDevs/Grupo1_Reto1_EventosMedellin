const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatStartDate(startDate?: string | null): string | null {
  if (!startDate) return null;
  return dateFormatter.format(new Date(startDate));
}

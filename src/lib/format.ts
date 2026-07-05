/** Locale-aware date/number formatting helpers. */

const INTL_LOCALES: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' };

export function formatDate(locale: string, iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}

export function formatDateTime(locale: string, iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

export function formatMoney(locale: string, value: number | string, currency: string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(INTL_LOCALES[locale] ?? locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(num);
}

export function formatCompact(locale: string, value: number): string {
  return new Intl.NumberFormat(INTL_LOCALES[locale] ?? locale, {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

export function isOverdue(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() < Date.now();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

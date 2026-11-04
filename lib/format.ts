export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value >= 10 || unit === 0 ? 0 : 1;
  return `${value.toFixed(digits).replace('.0', '')} ${units[unit]}`;
}

const MONTHS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export function formatDate(input: string | null | undefined): string {
  if (!input) return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '—';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function relativeDate(input: string | null | undefined): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '';
  const diff = Date.now() - date.getTime();
  const day = 86_400_000;
  if (diff < day) return 'сегодня';
  if (diff < 2 * day) return 'вчера';
  if (diff < 30 * day) return `${Math.floor(diff / day)} дн. назад`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} мес. назад`;
  return `${Math.floor(diff / (365 * day))} г. назад`;
}

export function shortVersion(version: string): string {
  return version.replace(/\s+/g, '');
}

/** Русские склонения: plural(1, ['приложение', 'приложения', 'приложений']). */
export function plural(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function appsCount(count: number): string {
  return `${count} ${plural(count, ['приложение', 'приложения', 'приложений'])}`;
}

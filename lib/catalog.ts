import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AppRecord, AppSummary, Release } from './types';
import { parseSimpleYaml } from './yaml';
import { readRemoteCatalog, REPO, REF } from './remote';

/** Каталог с приложениями внутри репозитория (используется как локальный источник). */
export const PROJECTS_DIR = path.join(process.cwd(), 'projects');

/** RAW-ссылка на файлы репозитория (резерв, если файла нет в сборке). */
export const RAW_BASE =
  process.env.CSTORE_RAW_BASE ?? `https://raw.githubusercontent.com/${REPO}/${REF}`;

const META_NAMES = ['app.json', 'metadata.json', 'app.yml', 'app.yaml'];
const ICON_CANDIDATES = [
  'icon.png',
  'icon.jpg',
  'icon.jpeg',
  'icon.webp',
  'icon.svg',
  'ic_launcher.png',
];

/**
 * Читать каталог напрямую из GitHub (чтобы новые приложения из репозитория
 * появлялись на сайте без пересборки). Отключается переменной CSTORE_REMOTE_CATALOG=0.
 */
function remoteEnabled(): boolean {
  if (process.env.CSTORE_REMOTE_CATALOG === '0') return false;
  return Boolean(process.env.VERCEL) || process.env.CSTORE_REMOTE_CATALOG === '1';
}

// ---------- нормализация значений ----------

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function bool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return /^(true|yes|1|да)$/i.test(value.trim());
  return false;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => str(v) || String(v)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[;,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

// ---------- локальные файлы ----------

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readMetaFromDir(dir: string): Promise<Record<string, unknown> | null> {
  for (const file of META_NAMES) {
    try {
      const raw = await fs.readFile(path.join(dir, file), 'utf8');
      return file.endsWith('.json')
        ? (JSON.parse(raw) as Record<string, unknown>)
        : parseSimpleYaml(raw);
    } catch {
      /* пробуем следующий файл */
    }
  }
  return null;
}

type LocalApp = { slug: string; meta: Record<string, unknown>; dir: string };

async function readLocalApps(): Promise<LocalApp[]> {
  let entries: import('node:fs').Dirent[] = [];
  try {
    entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const apps: LocalApp[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    const dir = path.join(PROJECTS_DIR, entry.name);
    const meta = await readMetaFromDir(dir);
    if (meta) apps.push({ slug: entry.name, meta, dir });
  }
  return apps;
}

// ---------- сборка записи приложения ----------

function assetUrl(slug: string, value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  const clean = value.replace(/^\.?\//, '');
  const encoded = clean.split('/').map(encodeURIComponent).join('/');
  return `/projects/${encodeURIComponent(slug)}/${encoded}`;
}

function normalizeRelease(raw: unknown, slug: string): Release | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  const version = str(value.version) || str(value.versionName) || '—';
  const file = str(value.file) || str(value.apk) || str(value.path) || null;
  const url = str(value.url);

  return {
    version,
    versionCode: num(value.versionCode) ?? num(value.version_code) ?? 0,
    date: str(value.date) || str(value.released) || null,
    size: num(value.size),
    file,
    url: url ? assetUrl(slug, url) : null,
    sha256: str(value.sha256) || null,
    minSdk: num(value.minSdk),
    targetSdk: num(value.targetSdk),
    changelog: str(value.changelog) || str(value.notes) || null,
    downloadUrl: url ? assetUrl(slug, url) : file ? assetUrl(slug, file) : null,
  };
}

async function buildApp(
  slug: string,
  meta: Record<string, unknown>,
  dir: string | null,
): Promise<AppRecord> {
  const packageId = str(meta.packageId) || str(meta.package) || str(meta.id) || slug;
  const name = str(meta.name) || str(meta.title) || slug;

  const rawReleases = Array.isArray(meta.releases) ? meta.releases : [];
  const releases = rawReleases
    .map((item) => normalizeRelease(item, slug))
    .filter((item): item is Release => Boolean(item))
    .sort((a, b) => b.versionCode - a.versionCode);

  // Иконка: сначала явная ссылка, затем поиск файла рядом с приложением
  let iconUrl = '';
  const explicitIcon = str(meta.icon) || str(meta.logo) || str(meta.image);
  if (explicitIcon) {
    iconUrl = assetUrl(slug, explicitIcon);
  } else if (dir) {
    for (const candidate of ICON_CANDIDATES) {
      if (await exists(path.join(dir, candidate))) {
        iconUrl = assetUrl(slug, candidate);
        break;
      }
    }
  }
  if (!iconUrl) iconUrl = assetUrl(slug, 'icon.png');

  const screenshots = list(meta.screenshots).map((shot) => assetUrl(slug, shot)).filter(Boolean);

  const latest = releases[0];
  let size = latest?.size ?? null;
  if (size === null && dir && latest?.file) {
    try {
      size = (await fs.stat(path.join(dir, latest.file.replace(/^\.?\//, '')))).size;
    } catch {
      size = null;
    }
  }

  const description =
    str(meta.description) ||
    str(meta.longDescription) ||
    str(meta.summary) ||
    'Описание пока не добавлено.';

  return {
    id: slug,
    packageId,
    name,
    summary: str(meta.summary) || description.split('\n')[0].slice(0, 160),
    description,
    version: latest?.version ?? str(meta.version) ?? '—',
    versionCode: latest?.versionCode ?? num(meta.versionCode) ?? 0,
    developer: str(meta.developer) || str(meta.author) || 'Неизвестный разработчик',
    developerUrl: str(meta.developerUrl) || null,
    license: str(meta.license) || 'Не указана',
    website: str(meta.website) || null,
    sourceCode: str(meta.sourceCode) || str(meta.source) || null,
    issueTracker: str(meta.issueTracker) || str(meta.issues) || null,
    donate: str(meta.donate) || null,
    categories: list(meta.categories).length ? list(meta.categories) : list(meta.category),
    tags: list(meta.tags),
    iconUrl,
    screenshots,
    addedAt: str(meta.addedAt) || str(meta.date) || null,
    updatedAt:
      latest?.date || str(meta.updatedAt) || str(meta.lastUpdated) || new Date(0).toISOString(),
    featured: bool(meta.featured),
    free: meta.free === undefined ? true : bool(meta.free),
    antiFeatures: list(meta.antiFeatures),
    permissions: list(meta.permissions),
    releases,
    size,
    sha256: latest?.sha256 ?? str(meta.sha256) ?? null,
    minSdk: latest?.minSdk ?? num(meta.minSdk),
    targetSdk: latest?.targetSdk ?? num(meta.targetSdk),
  };
}

// ---------- публичное API модуля ----------

export async function loadApps(): Promise<AppRecord[]> {
  const local = await readLocalApps();
  const localBySlug = new Map(local.map((app) => [app.slug, app]));

  let entries: { slug: string; meta: Record<string, unknown>; dir: string | null }[] = [];

  const remote = remoteEnabled() ? await readRemoteCatalog() : null;
  if (remote && remote.length > 0) {
    entries = remote.map((app) => ({
      slug: app.slug,
      meta: app.meta,
      dir: localBySlug.get(app.slug)?.dir ?? null,
    }));
  }

  // Пусто или удалённый источник недоступен — берём файлы из сборки
  if (entries.length === 0) {
    entries = local.map((app) => ({ slug: app.slug, meta: app.meta, dir: app.dir }));
  }

  const apps = await Promise.all(entries.map((entry) => buildApp(entry.slug, entry.meta, entry.dir)));
  return apps.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function toSummary(app: AppRecord): AppSummary {
  const { description, releases, permissions, antiFeatures, ...rest } = app;
  return { ...rest, releaseCount: releases.length };
}

export async function getCatalog(): Promise<{
  apps: AppRecord[];
  categories: { name: string; count: number }[];
}> {
  const apps = await loadApps();
  const counts = new Map<string, number>();
  for (const app of apps) {
    for (const category of app.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  const categories = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'));
  return { apps, categories };
}

export async function getApp(id: string): Promise<AppRecord | null> {
  const apps = await loadApps();
  return apps.find((app) => app.id === id) ?? null;
}

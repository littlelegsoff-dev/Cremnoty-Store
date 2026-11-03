import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AppRecord, AppSummary, Release } from './types';

/** Каталог с приложениями внутри репозитория. */
export const PROJECTS_DIR = path.join(process.cwd(), 'projects');

/** RAW-ссылка на файлы репозитория (используется, если файл не найден локально). */
const RAW_BASE =
  process.env.CSTORE_RAW_BASE ??
  'https://raw.githubusercontent.com/littlelegsoff-dev/Cremnoty-Store/main';

const ICON_CANDIDATES = [
  'icon.png',
  'icon.jpg',
  'icon.jpeg',
  'icon.webp',
  'icon.svg',
  'ic_launcher.png',
];

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

/** Простой фронтматтер YAML-подобного вида (key: value) — подстраховка, если нет JSON. */
function parseSimpleYaml(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let currentKey: string | null = null;
  const listBuffer: string[] = [];

  const flush = () => {
    if (currentKey && listBuffer.length) {
      out[currentKey] = [...listBuffer];
      listBuffer.length = 0;
    }
  };

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const itemMatch = line.match(/^\s*-\s+(.*)$/);
    if (itemMatch && currentKey) {
      listBuffer.push(itemMatch[1].replace(/^["']|["']$/g, '').trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    flush();
    currentKey = kv[1];
    const value = kv[2].replace(/^["']|["']$/g, '').trim();
    if (value === '') {
      out[currentKey] = [];
    } else if (value.startsWith('[')) {
      out[currentKey] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((v) => v.replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
      currentKey = null;
    } else {
      out[currentKey] = value;
      currentKey = null;
    }
  }
  flush();
  return out;
}

async function readMeta(dir: string): Promise<Record<string, unknown> | null> {
  for (const file of ['app.json', 'metadata.json', 'app.yml', 'app.yaml']) {
    try {
      const raw = await fs.readFile(path.join(dir, file), 'utf8');
      if (file.endsWith('.json')) {
        return JSON.parse(raw) as Record<string, unknown>;
      }
      return parseSimpleYaml(raw);
    } catch {
      /* пробуем следующий файл */
    }
  }
  return null;
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function encodeAssetPath(relative: string): string {
  return relative
    .split(path.sep)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

function resolveAsset(appId: string, value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  const clean = value.replace(/^\.?\//, '');
  return `/projects/${encodeURIComponent(appId)}/${encodeAssetPath(clean)}`;
}

function pickIconCandidates(meta: Record<string, unknown>): string[] {
  const direct = [str(meta.icon), str(meta.logo), str(meta.image)].filter(Boolean);
  return [...direct, ...ICON_CANDIDATES];
}

function normalizeRelease(raw: any, appId: string): Release | null {
  if (!raw || typeof raw !== 'object') return null;
  const version = str(raw.version) || str(raw.versionName) || '—';
  const file = str(raw.file) || str(raw.apk) || str(raw.path) || null;
  return {
    version,
    versionCode: num(raw.versionCode) ?? num(raw.version_code) ?? 0,
    date: str(raw.date) || str(raw.released) || null,
    size: num(raw.size),
    file,
    url: str(raw.url) ? resolveAsset(appId, str(raw.url)) : null,
    sha256: str(raw.sha256) || null,
    minSdk: num(raw.minSdk),
    targetSdk: num(raw.targetSdk),
    changelog: str(raw.changelog) || str(raw.notes) || null,
    downloadUrl: null,
  };
}

async function readFileSize(appDir: string, file: string | null): Promise<number | null> {
  if (!file) return null;
  try {
    const stat = await fs.stat(path.join(appDir, file.replace(/^\.?\//, '')));
    return stat.size;
  } catch {
    return null;
  }
}

export async function loadApps(): Promise<AppRecord[]> {
  let entries: import('node:fs').Dirent[] = [];
  try {
    entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const apps: AppRecord[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

    const appDir = path.join(PROJECTS_DIR, entry.name);
    const meta = await readMeta(appDir);
    if (!meta) continue;

    const packageId = str(meta.packageId) || str(meta.package) || str(meta.id) || entry.name;
    const name = str(meta.name) || str(meta.title) || entry.name;

    const rawReleases = Array.isArray(meta.releases) ? meta.releases : [];
    const releases = rawReleases
      .map((r) => normalizeRelease(r, entry.name))
      .filter((r): r is Release => Boolean(r))
      .sort((a, b) => b.versionCode - a.versionCode);

    // Иконка
    let iconUrl = '';
    for (const candidate of pickIconCandidates(meta)) {
      const rel = candidate.replace(/^\.?\//, '');
      if (/^https?:\/\//i.test(candidate)) {
        iconUrl = candidate;
        break;
      }
      if (rel && (await exists(path.join(appDir, rel)))) {
        iconUrl = resolveAsset(entry.name, rel);
        break;
      }
    }
    if (!iconUrl) {
      iconUrl = `/projects/${encodeURIComponent(entry.name)}/icon.png`;
    }

    // Скриншоты
    const screenshots = list(meta.screenshots)
      .map((s) => resolveAsset(entry.name, s))
      .filter(Boolean);

    const latest = releases[0];
    const fileSize = latest?.size ?? (await readFileSize(appDir, latest?.file ?? null));

    for (const release of releases) {
      if (release.url) release.downloadUrl = release.url;
      else if (release.file) release.downloadUrl = resolveAsset(entry.name, release.file);
      else if (str(meta.apk)) release.downloadUrl = resolveAsset(entry.name, str(meta.apk));
    }

    const description =
      str(meta.description) ||
      str(meta.longDescription) ||
      str(meta.summary) ||
      'Описание пока не добавлено.';

    apps.push({
      id: entry.name,
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
      size: fileSize,
      sha256: latest?.sha256 ?? str(meta.sha256) ?? null,
      minSdk: latest?.minSdk ?? num(meta.minSdk),
      targetSdk: latest?.targetSdk ?? num(meta.targetSdk),
    });
  }

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

export { RAW_BASE };

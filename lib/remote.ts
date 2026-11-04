import { parseSimpleYaml } from './yaml';

const REPO = process.env.CSTORE_REPO ?? 'littlelegsoff-dev/Cremnoty-Store';
const REF = process.env.CSTORE_REF ?? 'main';

const JSDELIVR_LIST = `https://data.jsdelivr.com/v1/packages/gh/${REPO}@${REF}?structure=flat`;
const JSDELIVR_CDN = `https://cdn.jsdelivr.net/gh/${REPO}@${REF}`;
const RAW_CDN = `https://raw.githubusercontent.com/${REPO}/${REF}`;

const META_NAMES = ['app.json', 'metadata.json', 'app.yml', 'app.yaml'];

export type RemoteMeta = { slug: string; meta: Record<string, unknown> };

type JsDelivrFile = { name?: string; type?: string };

/** Список файлов репозитория через jsDelivr (без лимитов GitHub API). */
async function listFilesViaJsDelivr(): Promise<string[] | null> {
  try {
    const response = await fetch(JSDELIVR_LIST, {
      headers: { 'User-Agent': 'cstore-catalog' },
      next: { revalidate: 120 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { files?: JsDelivrFile[] };
    return (payload.files ?? [])
      .map((file) => file.name ?? '')
      .filter((name) => name.startsWith('/projects/'));
  } catch {
    return null;
  }
}

/** Резервный список файлов через GitHub API (одна попытка). */
async function listFilesViaGithub(): Promise<string[] | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cstore-catalog',
    };
    if (process.env.CSTORE_GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.CSTORE_GITHUB_TOKEN}`;
    }
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/git/trees/${REF}?recursive=1`,
      { headers, next: { revalidate: 120 } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { tree?: { path?: string; type?: string }[] };
    return (payload.tree ?? [])
      .filter((node) => node.type === 'blob' && node.path)
      .map((node) => `/${node.path}`);
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string | null> {
  for (const candidate of [url, url.replace(JSDELIVR_CDN, RAW_CDN)]) {
    try {
      const response = await fetch(candidate, { next: { revalidate: 120 } });
      if (response.ok) return await response.text();
    } catch {
      /* пробуем следующий источник */
    }
  }
  return null;
}

/**
 * Читает метаданные приложений прямо из репозитория.
 * Работает без токена: сначала jsDelivr, затем GitHub API.
 */
export async function readRemoteCatalog(): Promise<RemoteMeta[] | null> {
  const files = (await listFilesViaJsDelivr()) ?? (await listFilesViaGithub());
  if (!files) return null;

  const metaBySlug = new Map<string, string>();
  for (const fullPath of files) {
    const match = fullPath.match(/^\/projects\/([^/]+)\/([^/]+)$/);
    if (!match) continue;
    const [, slug, file] = match;
    if (slug.startsWith('_') || slug.startsWith('.')) continue;
    if (!META_NAMES.includes(file)) continue;
    const current = metaBySlug.get(slug);
    if (!current || META_NAMES.indexOf(file) < META_NAMES.indexOf(current)) {
      metaBySlug.set(slug, file);
    }
  }

  const apps = await Promise.all(
    [...metaBySlug.entries()].map(async ([slug, file]) => {
      const text = await fetchText(`${JSDELIVR_CDN}/projects/${slug}/${file}`);
      if (!text) return null;
      try {
        const meta = file.endsWith('.json')
          ? (JSON.parse(text) as Record<string, unknown>)
          : parseSimpleYaml(text);
        return { slug, meta } satisfies RemoteMeta;
      } catch {
        return null;
      }
    }),
  );

  return apps.filter((app): app is RemoteMeta => Boolean(app));
}

export { REPO, REF, RAW_CDN };

import { parseSimpleYaml } from './yaml';

const REPO = process.env.CSTORE_REPO ?? 'littlelegsoff-dev/Cremnoty-Store';
const REF = process.env.CSTORE_REF ?? 'main';

const META_NAMES = ['app.json', 'metadata.json', 'app.yml', 'app.yaml'];

/** Кэш ответов GitHub — 60 секунд, чтобы не упираться в лимит запросов. */
const REVALIDATE = Number(process.env.CSTORE_REVALIDATE ?? 60);

export type RemoteMeta = { slug: string; meta: Record<string, unknown> };

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'cstore-catalog',
  };
  if (process.env.CSTORE_GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.CSTORE_GITHUB_TOKEN}`;
  }
  return headers;
}

/** Актуальный SHA ветки — чтобы читать файлы по неизменяемому адресу. */
async function resolveSha(): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/commits/${REF}`, {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { sha?: string };
    return payload.sha ?? null;
  } catch {
    return null;
  }
}

async function listMetaFiles(sha: string): Promise<string[] | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}/git/trees/${sha}?recursive=1`,
      { headers: githubHeaders(), next: { revalidate: REVALIDATE } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { tree?: { path?: string; type?: string }[] };
    return (payload.tree ?? [])
      .filter((node) => node.type === 'blob' && node.path?.startsWith('projects/'))
      .map((node) => node.path as string);
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'cstore-catalog' },
      next: { revalidate: REVALIDATE },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Читает метаданные приложений прямо из репозитория, поэтому новые приложения
 * появляются на сайте без передеплоя. Если GitHub недоступен — вернёт null,
 * и каталог соберётся из файлов сборки.
 */
export async function readRemoteCatalog(): Promise<RemoteMeta[] | null> {
  const sha = await resolveSha();
  if (!sha) return null;

  const files = await listMetaFiles(sha);
  if (!files) return null;

  const metaBySlug = new Map<string, string>();
  for (const fullPath of files) {
    const match = fullPath.match(/^projects\/([^/]+)\/([^/]+)$/);
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
      const raw = await fetchText(
        `https://raw.githubusercontent.com/${REPO}/${sha}/projects/${slug}/${file}`,
      );
      if (!raw) return null;
      try {
        const meta = file.endsWith('.json')
          ? (JSON.parse(raw) as Record<string, unknown>)
          : parseSimpleYaml(raw);
        return { slug, meta } satisfies RemoteMeta;
      } catch {
        return null;
      }
    }),
  );

  return apps.filter((app): app is RemoteMeta => Boolean(app));
}

export { REPO, REF };

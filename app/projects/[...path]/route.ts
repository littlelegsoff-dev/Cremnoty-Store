import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PROJECTS_DIR } from '@/lib/catalog';

/**
 * Базовый адрес репозитория на GitHub: если файла нет рядом с приложением
 * (например, APK лежит в Releases или сборка развёрнута без медиа),
 * запрос перенаправляется в raw-хранилище репозитория.
 */
const RAW_BASE =
  process.env.CSTORE_RAW_BASE ??
  'https://raw.githubusercontent.com/littlelegsoff-dev/Cremnoty-Store/main/projects';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.apk': 'application/vnd.android.package-archive',
  '.zip': 'application/zip',
};

/**
 * Раздаёт файлы из папок приложений (/projects/<slug>/...).
 * Нужно, чтобы иконки, скриншоты и APK-файлы были доступны из веб-каталога.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments = [] } = await params;
  const relative = segments.map((s) => decodeURIComponent(s)).join('/');
  const resolved = path.resolve(PROJECTS_DIR, relative);

  if (!resolved.startsWith(path.resolve(PROJECTS_DIR))) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) return new Response('Not found', { status: 404 });

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] ?? 'application/octet-stream';
    const cache = ext === '.apk' ? 'public, max-age=3600' : 'public, max-age=86400, immutable';

    const file = await fs.readFile(resolved);
    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(file.byteLength),
        'Cache-Control': cache,
      },
    });
  } catch {
    if (relative && !relative.includes('..')) {
      const fallback = `${RAW_BASE}/${relative.split('/').map(encodeURIComponent).join('/')}`;
      return new Response(null, {
        status: 302,
        headers: { Location: fallback, 'Cache-Control': 'public, max-age=60' },
      });
    }
    return new Response('Not found', { status: 404 });
  }
}

import { NextResponse } from 'next/server';
import { readRemoteCatalog } from '@/lib/remote';
import { loadApps } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/**
 * Диагностика источника каталога: доступен ли GitHub, сколько приложений
 * он видит и что получилось собрать в итоге. Полезно при отладке публикации.
 */
export async function GET() {
  const started = Date.now();
  const steps: Record<string, unknown> = {
    vercel: Boolean(process.env.VERCEL),
    remoteCatalogEnabled: process.env.CSTORE_REMOTE_CATALOG ?? null,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const remote = await readRemoteCatalog();
    steps.remoteApps = remote ? remote.map((app) => app.slug) : null;
    steps.remoteError = remote ? null : 'readRemoteCatalog вернул null';
  } catch (error) {
    steps.remoteError = error instanceof Error ? error.message : String(error);
  }

  try {
    const apps = await loadApps();
    steps.loadedApps = apps.map((app) => app.id);
  } catch (error) {
    steps.loadError = error instanceof Error ? error.message : String(error);
  }

  steps.durationMs = Date.now() - started;

  return NextResponse.json(steps, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

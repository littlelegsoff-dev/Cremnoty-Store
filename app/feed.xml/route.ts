import { getCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: Request) {
  const { apps } = await getCatalog();
  const origin = new URL(request.url).origin;

  const items = apps
    .slice()
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, 50)
    .map(
      (app) => `    <item>
      <title>${escapeXml(app.name)} ${escapeXml(app.version)}</title>
      <link>${origin}/?app=${encodeURIComponent(app.id)}</link>
      <guid isPermaLink="false">${escapeXml(app.packageId)}-${escapeXml(app.version)}</guid>
      <description>${escapeXml(app.summary)}</description>
      <pubDate>${new Date(app.updatedAt).toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CStore — обновления каталога</title>
    <link>${origin}/</link>
    <description>Новые и обновлённые приложения в CremnityStore</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}

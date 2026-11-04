import { NextResponse } from 'next/server';
import { getCatalog, toSummary } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { apps, categories } = await getCatalog();
  return NextResponse.json(
    {
      apps: apps.map(toSummary),
      categories,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}

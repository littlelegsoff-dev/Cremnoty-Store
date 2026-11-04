import { NextResponse } from 'next/server';
import { getApp } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const app = await getApp(decodeURIComponent(id));
  if (!app) {
    return NextResponse.json({ error: 'Приложение не найдено' }, { status: 404 });
  }
  return NextResponse.json(app, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

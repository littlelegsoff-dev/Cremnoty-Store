import { Suspense } from 'react';
import { getCatalog, toSummary } from '@/lib/catalog';
import { CatalogClient } from '@/components/CatalogClient';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const { apps, categories } = await getCatalog();

  return (
    <Suspense fallback={<div className="h-[60vh]" />}>
      <CatalogClient apps={apps.map(toSummary)} categories={categories} />
    </Suspense>
  );
}

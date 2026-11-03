import Link from 'next/link';
import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { AppCard } from '@/components/AppCard';
import { toSummary } from '@/lib/catalog';
import { LayoutGrid } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Категории',
  description: 'Все категории приложений в каталоге CStore.',
};

export default async function CategoriesPage() {
  const { apps, categories } = await getCatalog();

  return (
    <div className="pt-12 sm:pt-16">
      <div className="flex items-center gap-2 text-[12px] text-violet-300/45">
        <Link href="/" className="hover:text-violet-200">
          Каталог
        </Link>
        <span>/</span>
        <span className="text-violet-200/80">Категории</span>
      </div>

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
        Категории
      </h1>
      <p className="mt-2 max-w-xl text-[14px] text-violet-100/55">
        Приложения сгруппированы по назначению. Каждая карточка ведёт прямо в отфильтрованный
        каталог.
      </p>

      {categories.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-10 text-center text-violet-200/60">
          Пока нет ни одного приложения — добавьте проект в <code>projects/</code>.
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/?category=${encodeURIComponent(category.name)}`}
              className="glass card-hover flex items-center gap-3 rounded-2xl p-4"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                <LayoutGrid className="size-5" />
              </span>
              <span className="text-[14px] font-medium text-violet-50">{category.name}</span>
              <span className="ml-auto rounded-full bg-white/[0.05] px-2 py-0.5 text-[11.5px] text-violet-200/60">
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-14 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-violet-50">
        Все приложения
      </h2>
      <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apps.map((app) => (
          <AppCard key={app.id} app={toSummary(app)} />
        ))}
      </div>
    </div>
  );
}

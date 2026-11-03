'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AppRecord, AppSummary } from '@/lib/types';
import { AppCard } from './AppCard';
import { AppIcon } from './AppIcon';
import { AppDetail } from './AppDetail';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  Package,
  X,
  Flame,
  Clock,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

type Sort = 'popular' | 'newest' | 'updated' | 'name';

const SORTS: { id: Sort; label: string; icon: React.ReactNode }[] = [
  { id: 'popular', label: 'Популярные', icon: <Flame className="size-3.5" /> },
  { id: 'newest', label: 'Новинки', icon: <Sparkles className="size-3.5" /> },
  { id: 'updated', label: 'Недавно обновлённые', icon: <RefreshCw className="size-3.5" /> },
  { id: 'name', label: 'По алфавиту', icon: <ArrowUpDown className="size-3.5" /> },
];

export function CatalogClient({
  apps,
  categories,
}: {
  apps: AppSummary[];
  categories: { name: string; count: number }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? 'all');
  const [sort, setSort] = useState<Sort>((searchParams.get('sort') as Sort) || 'popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [licenceOnly, setLicenceOnly] = useState(false);
  const [detail, setDetail] = useState<AppRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const openApp = useCallback(
    async (id: string) => {
      const preview = apps.find((app) => app.id === id);
      if (preview) {
        setLoadingDetail(id);
      }
      try {
        const response = await fetch(`/api/apps/${encodeURIComponent(id)}`);
        if (response.ok) {
          setDetail((await response.json()) as AppRecord);
        }
      } finally {
        setLoadingDetail(null);
      }
      router.push(`/?app=${encodeURIComponent(id)}`, { scroll: false });
    },
    [apps, router],
  );

  const closeDetail = useCallback(() => {
    setDetail(null);
    router.push('/', { scroll: false });
  }, [router]);

  // Открытие по прямой ссылке /?app=slug
  useEffect(() => {
    const id = searchParams.get('app');
    if (!id || detail || loadingDetail) return;
    if (apps.some((app) => app.id === id)) {
      void openApp(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let result = apps.filter((app) => {
      if (category !== 'all' && !app.categories.includes(category)) return false;
      if (licenceOnly && /не указана/i.test(app.license)) return false;
      if (!needle) return true;
      const haystack = [
        app.name,
        app.packageId,
        app.developer,
        app.summary,
        ...app.categories,
        ...app.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return (b.addedAt ?? '').localeCompare(a.addedAt ?? '');
        case 'updated':
          return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
        case 'name':
          return a.name.localeCompare(b.name, 'ru');
        default:
          return (
            Number(b.featured) - Number(a.featured) ||
            b.versionCode - a.versionCode ||
            a.name.localeCompare(b.name, 'ru')
          );
      }
    });

    return result;
  }, [apps, category, licenceOnly, query, sort]);

  const featured = useMemo(() => apps.filter((app) => app.featured).slice(0, 3), [apps]);
  const fresh = useMemo(
    () =>
      [...apps]
        .sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''))
        .slice(0, 4),
    [apps],
  );

  return (
    <>
      <Hero appsCount={apps.length} categoriesCount={categories.length} featured={featured} />

      <section className="mt-16 scroll-mt-24" id="catalog">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-violet-50">
                Каталог приложений
              </h2>
              <p className="mt-1 text-[13.5px] text-violet-200/50">
                {filtered.length} из {apps.length} приложений · данные из открытого репозитория
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-violet-400/15 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="Сетка"
                className={`grid size-8 place-items-center rounded-full transition ${
                  view === 'grid' ? 'bg-violet-500/25 text-violet-100' : 'text-violet-300/50'
                }`}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="Список"
                className={`grid size-8 place-items-center rounded-full transition ${
                  view === 'list' ? 'bg-violet-500/25 text-violet-100' : 'text-violet-300/50'
                }`}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Поиск и сортировка */}
          <div className="glass flex flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-violet-300/50" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по названию, пакету, разработчику…"
                className="h-11 w-full rounded-2xl border border-violet-400/12 bg-ink-950/60 pl-10 pr-9 text-sm text-violet-50 placeholder:text-violet-300/35 focus:border-violet-400/40 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-violet-300/60 hover:bg-white/10"
                  aria-label="Очистить"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-violet-300/50" />
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as Sort)}
                  className="h-11 appearance-none rounded-2xl border border-violet-400/12 bg-ink-950/60 pl-9 pr-8 text-[13px] text-violet-100/80 focus:border-violet-400/40 focus:outline-none"
                >
                  {SORTS.map((option) => (
                    <option key={option.id} value={option.id} className="bg-ink-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setLicenceOnly((v) => !v)}
                className={`h-11 whitespace-nowrap rounded-2xl border px-3.5 text-[13px] font-medium transition ${
                  licenceOnly
                    ? 'border-violet-400/45 bg-violet-500/20 text-violet-100'
                    : 'border-violet-400/12 bg-ink-950/60 text-violet-100/60 hover:text-violet-100'
                }`}
              >
                С лицензией
              </button>
            </div>
          </div>

          {/* Категории */}
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Chip active={category === 'all'} onClick={() => setCategory('all')}>
              Все · {apps.length}
            </Chip>
            {categories.map((item) => (
              <Chip
                key={item.name}
                active={category === item.name}
                onClick={() => setCategory(item.name)}
              >
                {item.name} · {item.count}
              </Chip>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState query={query} onReset={() => { setQuery(''); setCategory('all'); setLicenceOnly(false); }} />
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-3'
              }
            >
              {filtered.map((app) => (
                <AppCard key={app.id} app={app} view={view} onOpen={openApp} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Новинки */}
      {fresh.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-violet-400" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-violet-50">
              Недавно добавленные
            </h2>
          </div>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {fresh.map((app) => (
              <AppCard key={`fresh-${app.id}`} app={app} onOpen={openApp} />
            ))}
          </div>
        </section>
      )}

      {detail && <AppDetail app={detail} onClose={closeDetail} />}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
        active
          ? 'border-violet-400/50 bg-violet-500/20 text-violet-50'
          : 'border-violet-400/12 bg-white/[0.02] text-violet-100/55 hover:border-violet-400/30 hover:text-violet-100'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="glass flex flex-col items-center rounded-3xl px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
        <Package className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-violet-50">
        {query ? 'Ничего не нашлось' : 'В каталоге пока пусто'}
      </h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] text-violet-200/50">
        {query
          ? `По запросу «${query}» приложений нет. Попробуйте другое слово или сбросьте фильтры.`
          : 'Добавьте первый проект в папку projects/ — следуйте шаблону из документации.'}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-full bg-violet-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-violet-400"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}

function Hero({
  appsCount,
  categoriesCount,
  featured,
}: {
  appsCount: number;
  categoriesCount: number;
  featured: AppSummary[];
}) {
  return (
    <section className="relative pt-12 sm:pt-16">
      <div className="relative overflow-hidden rounded-4xl border border-violet-400/15 bg-gradient-to-br from-violet-600/25 via-ink-900/60 to-ink-950 px-6 py-10 sm:px-10 sm:py-14">
        <div
          className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-violet-500/30 blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 right-0 size-80 rounded-full bg-fuchsia-500/20 blur-[120px]"
          aria-hidden
        />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11.5px] font-medium text-violet-200">
            <Sparkles className="size-3.5" />
            Открытый каталог · сборки из репозитория
          </span>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">CremnityStore</span>
            <br />
            <span className="text-violet-100/90">приложения без лишнего</span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-violet-100/60">
            CStore — свободный каталог Android-приложений. Открытые лицензии, прозрачные
            метаданные, прямые ссылки на APK и никаких трекеров. Всё хранится в одном
            репозитории.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(143,87,247,1)] transition hover:bg-violet-400"
            >
              <LayoutGrid className="size-4" />
              Смотреть каталог
            </a>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-violet-100/80 transition hover:bg-white/[0.08]"
            >
              <Download className="size-4" />
              Опубликовать приложение
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[12.5px] text-violet-200/50">
            <span>
              <strong className="text-violet-50">{appsCount}</strong> приложений
            </span>
            <span>
              <strong className="text-violet-50">{categoriesCount}</strong> категорий
            </span>
            <span>
              <strong className="text-violet-50">100%</strong> открытые метаданные
            </span>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="relative mt-10 grid gap-3 sm:grid-cols-3">
            {featured.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 rounded-2xl border border-violet-400/12 bg-white/[0.04] p-3"
              >
                <AppIconLite app={app} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-violet-50">{app.name}</p>
                  <p className="truncate text-[11.5px] text-violet-300/50">{app.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AppIconLite({ app }: { app: AppSummary }) {
  return <AppIcon src={app.iconUrl} name={app.name} size={40} rounded="rounded-xl" />;
}

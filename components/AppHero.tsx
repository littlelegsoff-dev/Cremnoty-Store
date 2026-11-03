import type { AppRecord } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/format';
import { AppIcon } from './AppIcon';
import { Download, Star, ShieldCheck, CalendarDays, HardDrive, Smartphone } from 'lucide-react';

export function AppHero({ app }: { app: AppRecord }) {
  const downloadUrl = app.releases[0]?.downloadUrl ?? undefined;

  return (
    <section className="relative overflow-hidden rounded-4xl border border-violet-400/15 bg-gradient-to-br from-violet-600/20 via-ink-900/70 to-ink-950 p-6 sm:p-9">
      <div
        className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-violet-500/25 blur-[100px]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        <AppIcon src={app.iconUrl} name={app.name} size={104} rounded="rounded-[26px]" className="shadow-2xl" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {app.categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-violet-400/25 bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-violet-200"
              >
                {category}
              </span>
            ))}
            {app.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/20 px-2.5 py-0.5 text-[11px] font-medium text-violet-100">
                <Star className="size-3 fill-violet-200 text-violet-200" /> Выбор редакции
              </span>
            )}
          </div>

          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-gradient sm:text-4xl">
            {app.name}
          </h1>
          <p className="mt-1 text-sm text-violet-200/70">
            {app.developer} · <span className="font-mono text-[12.5px]">{app.packageId}</span>
          </p>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-violet-100/65">
            {app.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <a
              href={downloadUrl ?? '#'}
              download
              className={`inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgba(143,87,247,1)] transition hover:bg-violet-400 ${
                downloadUrl ? '' : 'pointer-events-none opacity-50'
              }`}
            >
              <Download className="size-4" />
              Скачать {formatBytes(app.size) !== '—' ? formatBytes(app.size) : 'APK'}
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-white/[0.03] px-4 py-2.5 text-sm text-violet-100/70">
              <ShieldCheck className="size-4 text-violet-300" />
              {app.license}
            </span>
          </div>
        </div>
      </div>

      <dl className="relative mt-7 grid grid-cols-2 gap-3 border-t border-violet-400/10 pt-6 sm:grid-cols-4">
        <Stat icon={<CalendarDays className="size-4" />} label="Обновлено" value={formatDate(app.updatedAt)} />
        <Stat icon={<HardDrive className="size-4" />} label="Размер" value={formatBytes(app.size)} />
        <Stat icon={<Smartphone className="size-4" />} label="Android" value={app.minSdk ? `${app.minSdk}+` : '—'} />
        <Stat icon={<Download className="size-4" />} label="Версия" value={app.version} />
      </dl>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-violet-300/55">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-violet-50">{value}</dd>
    </div>
  );
}

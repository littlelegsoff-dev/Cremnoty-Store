import type { AppSummary } from '@/lib/types';
import { formatBytes, relativeDate } from '@/lib/format';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { AppIcon } from './AppIcon';

export function AppCard({
  app,
  onOpen,
  view = 'grid',
}: {
  app: AppSummary;
  onOpen?: (id: string) => void;
  view?: 'grid' | 'list';
}) {
  const primary = app.categories[0];

  const className = `group glass card-hover block w-full rounded-3xl p-4 text-left ${
    view === 'grid' ? 'sm:p-5' : 'sm:p-4'
  }`;

  const body = (
    <>
      <div className="flex items-start gap-3.5">
        <AppIcon src={app.iconUrl} name={app.name} size={view === 'grid' ? 56 : 48} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-violet-50 group-hover:text-white">
            {app.name}
          </h3>
          <p className="mt-0.5 truncate text-[12.5px] text-violet-300/55">{app.developer}</p>
        </div>
        <span className="shrink-0 rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-200">
          v{app.version}
        </span>
      </div>

      <p
        className={`mt-3 text-[13px] leading-relaxed text-violet-100/55 ${
          view === 'grid' ? 'line-clamp-2 min-h-[38px]' : 'line-clamp-1'
        }`}
      >
        {app.summary}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11.5px] text-violet-200/45">
        {primary && (
          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-violet-200/70">
            {primary}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="size-3.5 text-violet-400/70" />
          {app.license}
        </span>
        <span aria-hidden>·</span>
        <span>{formatBytes(app.size)}</span>
        <span className="ml-auto whitespace-nowrap">
          {relativeDate(app.updatedAt) || 'не обновлялось'}
        </span>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button type="button" onClick={() => onOpen(app.id)} className={className}>
        {body}
      </button>
    );
  }

  return (
    <Link href={`/?app=${encodeURIComponent(app.id)}`} className={className}>
      {body}
    </Link>
  );
}
